from __future__ import annotations

import argparse
import os

from pythainlp.util import normalize as thai_normalize
from pymongo import MongoClient

from common import DEFAULT_MODEL, load_scraper_env


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run an Atlas vector search query against specbot.specs.")
    parser.add_argument("--query", required=True, help="Thai search query to test.")
    parser.add_argument("--database", default="specbot", help="MongoDB database name.")
    parser.add_argument("--collection", default="specs", help="MongoDB collection name.")
    parser.add_argument("--index", default="vector_index", help="Atlas Vector Search index name.")
    parser.add_argument("--limit", type=int, default=5, help="Number of results to return.")
    parser.add_argument("--num-candidates", type=int, default=50, help="Atlas vectorSearch numCandidates.")
    return parser.parse_args()


def main() -> None:
    from sentence_transformers import SentenceTransformer

    load_scraper_env()
    args = parse_args()

    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required to run query_vector.py")

    model_name = os.getenv("HF_MODEL", DEFAULT_MODEL)
    model = SentenceTransformer(model_name)
    query_text = thai_normalize(args.query).strip()
    vector = model.encode(query_text, normalize_embeddings=True).tolist()

    client = MongoClient(mongodb_uri)
    try:
        collection = client[args.database][args.collection]
        pipeline = [
            {
                "$vectorSearch": {
                    "index": args.index,
                    "path": "embedding",
                    "queryVector": vector,
                    "numCandidates": args.num_candidates,
                    "limit": args.limit,
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "brand": 1,
                    "model": 1,
                    "price_thb": 1,
                    "source_url": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]

        results = list(collection.aggregate(pipeline))
        if not results:
            print("[query_vector] no results returned")
            return

        for index, item in enumerate(results, start=1):
            print(
                f"{index}. {item.get('brand')} {item.get('model')} "
                f"(score={item.get('score'):.4f}, price={item.get('price_thb')}, url={item.get('source_url')})"
            )
    finally:
        client.close()


if __name__ == "__main__":
    main()
