from __future__ import annotations

import argparse
import json
import os
import shutil
import time
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup
from requests import Response, Session
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

REQUEST_STOP_AFTER_ATTEMPT = 6
REQUEST_WAIT_MULTIPLIER = 2
REQUEST_WAIT_MIN_SECONDS = 2
REQUEST_WAIT_MAX_SECONDS = 120

from common import (
    BASE_URL,
    DEFAULT_DELAY_MS,
    RAW_DATA_PATH,
    SEARCH_API_URL,
    SITE_NAME,
    USER_AGENT,
    build_detail_url,
    compact_text,
    load_scraper_env,
    read_json,
    utc_now_iso,
    write_json,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape Specphone phone listings and detail pages.")
    parser.add_argument("--per-page", type=int, default=20, help="Listing page size for /api/search.")
    parser.add_argument("--max-pages", type=int, default=None, help="Stop after this many listing pages.")
    parser.add_argument("--limit", type=int, default=None, help="Stop after this many phones.")
    parser.add_argument("--output", default=str(RAW_DATA_PATH), help="Raw JSON output path.")
    parser.add_argument("--fresh", action="store_true", help="Ignore any existing raw output and start from page 1.")
    return parser.parse_args()


def build_session() -> Session:
    session = requests.Session()
    search_page_url = f"{BASE_URL}/{quote('ค้นหา-มือถือ')}"
    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": search_page_url,
        }
    )
    return session


@retry(
    reraise=True,
    stop=stop_after_attempt(REQUEST_STOP_AFTER_ATTEMPT),
    wait=wait_exponential(
        multiplier=REQUEST_WAIT_MULTIPLIER,
        min=REQUEST_WAIT_MIN_SECONDS,
        max=REQUEST_WAIT_MAX_SECONDS,
    ),
    retry=retry_if_exception_type(requests.RequestException),
)
def get_json(session: Session, url: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    response = session.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


@retry(
    reraise=True,
    stop=stop_after_attempt(REQUEST_STOP_AFTER_ATTEMPT),
    wait=wait_exponential(
        multiplier=REQUEST_WAIT_MULTIPLIER,
        min=REQUEST_WAIT_MIN_SECONDS,
        max=REQUEST_WAIT_MAX_SECONDS,
    ),
    retry=retry_if_exception_type(requests.RequestException),
)
def get_text(session: Session, url: str) -> str:
    response: Response = session.get(url, timeout=30)
    response.raise_for_status()
    response.encoding = response.encoding or "utf-8"
    return response.text


def extract_product_json_ld(soup: BeautifulSoup) -> dict[str, Any]:
    def walk(node: Any) -> list[dict[str, Any]]:
        if isinstance(node, dict):
            candidates = [node]
            if "@graph" in node and isinstance(node["@graph"], list):
                for item in node["@graph"]:
                    candidates.extend(walk(item))
            return candidates
        if isinstance(node, list):
            items: list[dict[str, Any]] = []
            for child in node:
                items.extend(walk(child))
            return items
        return []

    for script in soup.select('script[type="application/ld+json"]'):
        raw = script.string or script.get_text(strip=True)
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        for candidate in walk(payload):
            if candidate.get("@type") == "Product":
                return candidate
    return {}


def parse_spec_sections(soup: BeautifulSoup) -> dict[str, dict[str, str]]:
    sections: dict[str, dict[str, str]] = {}

    for info_row in soup.select(".info-row"):
        header_node = info_row.select_one(".info-header")
        header = compact_text(header_node.get_text(" ", strip=True) if header_node else "")
        if not header:
            continue

        rows: dict[str, str] = {}
        for item in info_row.select(".info-list-wrapper .list-wrapper li"):
            caption_node = item.select_one(".caption")
            detail_node = item.select_one(".detail")
            caption = compact_text(caption_node.get_text(" ", strip=True) if caption_node else "")
            detail = compact_text(detail_node.get_text("\n", strip=True) if detail_node else "", preserve_newlines=True)
            if not caption or not detail:
                continue

            if caption in rows:
                rows[caption] = f"{rows[caption]} | {detail}"
            else:
                rows[caption] = detail

        if rows:
            sections[header] = rows

    return sections


def parse_detail_page(html: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")

    product_static = [
        text
        for item in soup.select(".product-static li")
        if (text := compact_text(item.get_text(" ", strip=True)))
    ]

    node_name = soup.select_one(".product-name")
    node_price = soup.select_one(".product-price")

    return {
        "product_name": compact_text(node_name.get_text(" ", strip=True) if node_name else ""),
        "product_price_text": compact_text(node_price.get_text(" ", strip=True) if node_price else ""),
        "product_static": product_static,
        "spec_sections": parse_spec_sections(soup),
        "json_ld": extract_product_json_ld(soup),
    }


def fetch_listing_page(session: Session, page: int, per_page: int) -> dict[str, Any]:
    return get_json(
        session,
        SEARCH_API_URL,
        params={
            "paged": page,
            "perpage": per_page,
            "showAll": "Y",
        },
    )


def scrape_phone(session: Session, api_record: dict[str, Any]) -> dict[str, Any]:
    slug = api_record["slug"]
    source_url = build_detail_url(slug)

    detail_payload: dict[str, Any]
    try:
        detail_payload = parse_detail_page(get_text(session, source_url))
        detail_error = None
    except Exception as exc:  # noqa: BLE001
        detail_payload = {
            "product_name": "",
            "product_price_text": "",
            "product_static": [],
            "spec_sections": {},
            "json_ld": {},
        }
        detail_error = str(exc)

    return {
        "source": {
            "site": SITE_NAME,
            "specphone_id": api_record.get("id"),
            "slug": slug,
        },
        "source_url": source_url,
        "api_record": api_record,
        "detail": detail_payload,
        "detail_error": detail_error,
        "scraped_at": utc_now_iso(),
    }


def load_existing_payload(output_path: Path) -> dict[str, Any] | None:
    if not output_path.exists():
        return None

    payload = read_json(output_path)
    if not isinstance(payload, dict):
        return None

    payload.setdefault("items", [])
    return payload


def save_payload(
    output_path: Path,
    items: list[dict[str, Any]],
    per_page: int,
    total_expected: int | None,
    last_completed_page: int,
) -> None:
    payload = {
        "source": {
            "site": SITE_NAME,
            "listing_api": SEARCH_API_URL,
        },
        "fetched_at": utc_now_iso(),
        "per_page": per_page,
        "pages_fetched": last_completed_page,
        "last_completed_page": last_completed_page,
        "total_expected": total_expected,
        "total_fetched": len(items),
        "items": items,
    }
    write_json(output_path, payload)


def backup_existing_output(output_path: Path) -> Path | None:
    if not output_path.exists():
        return None

    backup_path = output_path.with_name(f"{output_path.stem}.backup.json")
    shutil.copy2(output_path, backup_path)
    return backup_path


def main() -> None:
    load_scraper_env()
    args = parse_args()
    delay_ms = int(os.getenv("SCRAPE_DELAY_MS", str(DEFAULT_DELAY_MS)))
    output_path = Path(os.path.abspath(args.output))

    session = build_session()
    items: list[dict[str, Any]] = []
    scraped_slugs: set[str] = set()
    page = 1
    total_expected: int | None = None
    last_completed_page = 0
    backup_path: Path | None = None

    if args.fresh:
        backup_path = backup_existing_output(output_path)
        if backup_path:
            print(f"[scraper] backed up existing raw file to {backup_path}")

    if not args.fresh:
        existing_payload = load_existing_payload(output_path)
        if existing_payload:
            items = existing_payload.get("items") or []
            scraped_slugs = {
                item.get("source", {}).get("slug")
                for item in items
                if item.get("source", {}).get("slug")
            }
            total_expected = existing_payload.get("total_expected") or None
            last_completed_page = int(existing_payload.get("last_completed_page") or existing_payload.get("pages_fetched") or 0)
            page = last_completed_page + 1
            if items:
                print(f"[scraper] resuming from page {page} with {len(items)} saved records")

    while True:
        try:
            listing_payload = fetch_listing_page(session, page=page, per_page=args.per_page)
        except Exception:
            if last_completed_page > 0 or items:
                save_payload(output_path, items, args.per_page, total_expected, last_completed_page)
            elif backup_path and backup_path.exists():
                shutil.copy2(backup_path, output_path)
                print(f"[scraper] restored backup after fetch failure: {backup_path}")
            raise

        results = listing_payload.get("result") or []
        if total_expected is None:
            total_expected = int(listing_payload.get("total") or 0)
        current_page = int(listing_payload.get("paged") or page)
        current_limit = int(listing_payload.get("limit") or args.per_page)

        if not results:
            break

        for api_record in results:
            if args.limit is not None and len(items) >= args.limit:
                break

            slug = api_record.get("slug")
            if not slug or slug in scraped_slugs:
                continue

            record = scrape_phone(session, api_record)
            items.append(record)
            scraped_slugs.add(record["source"]["slug"])
            print(f"[scraper] scraped {record['source']['slug']} ({len(items)}/{total_expected or '?'})")

            if delay_ms > 0:
                time.sleep(delay_ms / 1000)

        last_completed_page = current_page
        save_payload(output_path, items, args.per_page, total_expected, last_completed_page)

        if args.limit is not None and len(items) >= args.limit:
            break
        if args.max_pages is not None and current_page >= args.max_pages:
            break
        if current_page * current_limit >= total_expected:
            break

        page += 1

    save_payload(output_path, items, args.per_page, total_expected, last_completed_page)
    print(f"[scraper] wrote {len(items)} raw records to {output_path}")


if __name__ == "__main__":
    main()
