from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

from common import ROOT_DIR, load_scraper_env


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create or inspect the Atlas Vector Search index for specbot.specs.")
    parser.add_argument("--database", default="specbot", help="MongoDB database name.")
    parser.add_argument("--collection", default="specs", help="MongoDB collection name.")
    parser.add_argument(
        "--config",
        default=str(ROOT_DIR / "scraper" / "vector_index.json"),
        help="Path to the vector index configuration JSON.",
    )
    parser.add_argument("--inspect-only", action="store_true", help="List current search indexes without creating one.")
    return parser.parse_args()


def load_index_config(path: str) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> None:
    load_scraper_env()
    args = parse_args()

    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required to run create_vector_index.py")

    config = load_index_config(args.config)
    index_name = config["name"]

    client = MongoClient(mongodb_uri)
    try:
        collection = client[args.database][args.collection]

        existing = list(collection.list_search_indexes())
        print(f"[vector_index] existing indexes: {[item.get('name') for item in existing]}")
        for item in existing:
            if item.get("name") == index_name:
                print(f"[vector_index] {index_name} already exists with status={item.get('status')}")
                return

        if args.inspect_only:
            return

        model = SearchIndexModel(
            definition=config["definition"],
            name=index_name,
            type=config.get("type", "vectorSearch"),
        )
        result = collection.create_search_index(model)
        print(f"[vector_index] create requested for {index_name}: {result}")
    finally:
        client.close()


if __name__ == "__main__":
    main()
