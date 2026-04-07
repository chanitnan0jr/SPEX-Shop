from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
SCRAPER_DIR = ROOT_DIR / "scraper"
DATA_DIR = ROOT_DIR / "data"
RAW_DATA_PATH = DATA_DIR / "specs_raw.json"
CLEAN_DATA_PATH = DATA_DIR / "specs_clean.json"

DEFAULT_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
DEFAULT_DELAY_MS = 1000
SITE_NAME = "specphone"
BASE_URL = "https://specphone.com"
SEARCH_API_URL = f"{BASE_URL}/api/search"
USER_AGENT = "SpecBot/0.1 (educational scraper; contact repo owner if needed)"


def load_scraper_env() -> None:
    load_dotenv(SCRAPER_DIR / ".env")
    load_dotenv(ROOT_DIR / "backend" / ".env", override=False)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def to_path(path: Path | str) -> Path:
    return path if isinstance(path, Path) else Path(path)


def ensure_parent(path: Path | str) -> None:
    to_path(path).parent.mkdir(parents=True, exist_ok=True)


def read_json(path: Path | str) -> Any:
    with to_path(path).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path | str, payload: Any) -> None:
    ensure_parent(path)
    with to_path(path).open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def compact_text(value: str | None, preserve_newlines: bool = False) -> str:
    if value is None:
        return ""

    value = value.replace("\xa0", " ").replace("\r", "\n")
    if preserve_newlines:
        lines = [re.sub(r"\s+", " ", line).strip() for line in value.split("\n")]
        return "\n".join(line for line in lines if line)

    return re.sub(r"\s+", " ", value).strip()


def parse_price_to_int(value: Any) -> int | None:
    if value is None:
        return None

    digits = re.findall(r"\d+", str(value))
    if not digits:
        return None

    try:
        return int("".join(digits))
    except ValueError:
        return None


def first_non_empty(*values: Any) -> str | None:
    """
    Returns the first non-empty value, converting non-string values to strings.
    WARNING: This applies type coercion silently.
    """
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            candidate = compact_text(value, preserve_newlines=True)
            if candidate:
                return candidate
            continue
        return str(value)
    return None


def flatten_pairs(mapping: dict[str, Any]) -> Iterable[str]:
    for key, value in mapping.items():
        if isinstance(value, dict):
            for nested in flatten_pairs(value):
                yield f"{key}: {nested}"
        elif isinstance(value, list):
            joined = ", ".join(compact_text(str(item)) for item in value if compact_text(str(item)))
            if joined:
                yield f"{key}: {joined}"
        else:
            candidate = compact_text(str(value), preserve_newlines=True)
            if candidate:
                yield f"{key}: {candidate}"


def iso_to_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def build_detail_url(slug: str) -> str:
    return f"{BASE_URL}/{slug}.html"
