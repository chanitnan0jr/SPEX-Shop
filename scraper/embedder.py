from __future__ import annotations

import argparse
import os
from typing import Any

from pythainlp.util import normalize as thai_normalize
from pymongo import MongoClient, UpdateOne

from common import CLEAN_DATA_PATH, DEFAULT_MODEL, iso_to_datetime, load_scraper_env, read_json, utc_now_iso


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate sentence-transformer embeddings and update MongoDB docs.")
    parser.add_argument("--input", default=str(CLEAN_DATA_PATH), help="Path to specs_clean.json.")
    parser.add_argument("--database", default="specbot", help="MongoDB database name.")
    parser.add_argument("--collection", default="specs", help="MongoDB collection name.")
    parser.add_argument("--batch-size", type=int, default=32, help="Embedding batch size.")
    return parser.parse_args()


def load_documents(path: str) -> list[dict[str, Any]]:
    payload = read_json(os.path.abspath(path))
    if isinstance(payload, list):
        return payload
    return payload.get("items") or []


def normalize_search_text(document: dict[str, Any]) -> str:
    search_text = document.get("search_text") or ""
    return thai_normalize(search_text).strip()


def main() -> None:
    from sentence_transformers import SentenceTransformer

    load_scraper_env()
    args = parse_args()
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required in scraper/.env to run embedder.py")

    model_name = os.getenv("HF_MODEL", DEFAULT_MODEL)
    documents = load_documents(args.input)
    if not documents:
        print("[embedder] no documents found to embed")
        return

    texts = [normalize_search_text(document) for document in documents]
    model = SentenceTransformer(model_name)
    vectors = model.encode(
        texts,
        batch_size=args.batch_size,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    client = MongoClient(mongodb_uri)
    try:
        collection = client[args.database][args.collection]

        operations: list[UpdateOne] = []
        updated_at = iso_to_datetime(utc_now_iso())
        for document, vector, search_text in zip(documents, vectors, texts):
            source = document.get("source") or {}
            slug = source.get("slug")
            if not slug:
                continue
            operations.append(
                UpdateOne(
                    {
                        "source.site": source.get("site", "specphone"),
                        "source.slug": slug,
                    },
                    {
                        "$set": {
                            "search_text": search_text,
                            "embedding": vector.tolist(),
                            "updated_at": updated_at,
                        }
                    },
                    upsert=False,
                )
            )

        if not operations:
            print("[embedder] no valid documents found to update")
            return

        result = collection.bulk_write(operations, ordered=False)
        print(
            "[embedder] embedding update complete "
            f"(matched={result.matched_count}, modified={result.modified_count}, vector_size={len(vectors[0])})"
        )
        if result.matched_count < len(operations):
            print(f"[embedder] WARNING: matched {result.matched_count} documents but had {len(operations)} operations. Some embeddings were dropped because the documents don't exist in MongoDB yet.")
    finally:
        client.close()


if __name__ == "__main__":
    main()
