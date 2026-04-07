from __future__ import annotations

import argparse
import os
from typing import Any

from pymongo import MongoClient, UpdateOne

from common import CLEAN_DATA_PATH, iso_to_datetime, load_scraper_env, read_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bulk upsert cleaned Specphone documents into MongoDB Atlas.")
    parser.add_argument("--input", default=str(CLEAN_DATA_PATH), help="Path to specs_clean.json.")
    parser.add_argument("--database", default="specbot", help="MongoDB database name.")
    parser.add_argument("--collection", default="specs", help="MongoDB collection name.")
    return parser.parse_args()


def load_documents(path: str) -> list[dict[str, Any]]:
    payload = read_json(os.path.abspath(path))
    if isinstance(payload, list):
        return payload
    return payload.get("items") or []


def prepare_document(document: dict[str, Any]) -> dict[str, Any]:
    prepared = dict(document)
    prepared["scraped_at"] = iso_to_datetime(prepared.get("scraped_at"))
    prepared["updated_at"] = iso_to_datetime(prepared.get("updated_at"))
    return prepared


def build_operations(documents: list[dict[str, Any]]) -> list[UpdateOne]:
    operations: list[UpdateOne] = []
    for document in documents:
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
                {"$set": prepare_document(document)},
                upsert=True,
            )
        )
    return operations


def main() -> None:
    load_scraper_env()
    args = parse_args()
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required in scraper/.env to run db.py")

    documents = load_documents(args.input)
    operations = build_operations(documents)
    if not operations:
        print("[db] no documents found to import")
        return

    client = MongoClient(mongodb_uri)
    try:
        collection = client[args.database][args.collection]
        result = collection.bulk_write(operations, ordered=False)

        print(
            "[db] import complete "
            f"(matched={result.matched_count}, modified={result.modified_count}, upserted={len(result.upserted_ids)})"
        )
    finally:
        client.close()


if __name__ == "__main__":
    main()

