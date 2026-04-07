from __future__ import annotations

import argparse
import csv
import re
import shutil
import unicodedata
from pathlib import Path
from typing import Any

from pythainlp.util import normalize as thai_normalize

from common import CLEAN_DATA_PATH, ROOT_DIR, compact_text, parse_price_to_int, utc_now_iso, write_json

DATASET_SITE = "csv_smartphones_2015_2025"
DEFAULT_INPUT = ROOT_DIR / "smartphones(2015-2025).csv"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert smartphone CSV datasets into SpecBot clean JSON documents.")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Path to the CSV dataset.")
    parser.add_argument("--output", default=str(CLEAN_DATA_PATH), help="Output path for clean JSON documents.")
    parser.add_argument("--limit", type=int, default=None, help="Optional max number of rows to convert.")
    return parser.parse_args()


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    normalized = normalized.lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return normalized or "unknown"


def compact_optional(value: str | None) -> str | None:
    candidate = compact_text(value)
    return candidate or None


def format_number(value: str | None, suffix: str = "") -> str | None:
    candidate = compact_optional(value)
    if not candidate:
        return None
    try:
        number = float(candidate)
    except ValueError:
        return f"{candidate}{suffix}"

    if number.is_integer():
        return f"{int(number)}{suffix}"
    return f"{number:g}{suffix}"


def yes_no_text(value: str | None) -> str | None:
    candidate = compact_optional(value)
    if not candidate:
        return None
    lowered = candidate.lower()
    if lowered in {"yes", "true", "1"}:
        return "Yes"
    if lowered in {"no", "false", "0"}:
        return "No"
    return candidate


def first_non_empty(*values: str | None) -> str | None:
    for value in values:
        candidate = compact_optional(value)
        if candidate:
            return candidate
    return None


def build_highlights(row: dict[str, str]) -> dict[str, str]:
    display = " | ".join(
        part
        for part in [
            format_number(row.get("screen_size"), " นิ้ว"),
            format_number(row.get("refresh_rate"), "Hz"),
        ]
        if part
    )
    camera = " | ".join(
        part
        for part in [
            f"กล้องหลัง {format_number(row.get('camera_mp'), ' MP')}" if format_number(row.get("camera_mp"), " MP") else "",
            f"กล้องหน้า {format_number(row.get('front_camera_mp'), ' MP')}" if format_number(row.get("front_camera_mp"), " MP") else "",
        ]
        if part
    )
    battery = " | ".join(
        part
        for part in [
            format_number(row.get("battery_capacity"), " mAh"),
            f"ชาร์จไว {format_number(row.get('fast_charging'), 'W')}" if format_number(row.get("fast_charging"), "W") else "",
        ]
        if part
    )
    chipset = " | ".join(part for part in [compact_optional(row.get("chipset")), compact_optional(row.get("gpu"))] if part)

    highlights = {
        "display": display or None,
        "ram": format_number(row.get("ram"), " GB"),
        "storage": format_number(row.get("storage"), " GB"),
        "camera": camera or None,
        "battery": battery or None,
        "chipset": chipset or None,
        "os": compact_optional(row.get("operating_system")),
    }
    return {key: value for key, value in highlights.items() if value}


def build_spec_sections(row: dict[str, str], dataset_name: str) -> dict[str, dict[str, str]]:
    sections = {
        "Dataset Info": {
            "Dataset row id": compact_optional(row.get("id")),
            "Dataset file": dataset_name,
            "Release year": compact_optional(row.get("release_year")),
        },
        "Display": {
            "Screen size": format_number(row.get("screen_size"), " inches"),
            "Refresh rate": format_number(row.get("refresh_rate"), "Hz"),
        },
        "Performance": {
            "Operating system": compact_optional(row.get("operating_system")),
            "Chipset": compact_optional(row.get("chipset")),
            "GPU": compact_optional(row.get("gpu")),
            "RAM": format_number(row.get("ram"), " GB"),
            "Storage": format_number(row.get("storage"), " GB"),
        },
        "Camera": {
            "Rear camera": format_number(row.get("camera_mp"), " MP"),
            "Front camera": format_number(row.get("front_camera_mp"), " MP"),
        },
        "Battery": {
            "Battery capacity": format_number(row.get("battery_capacity"), " mAh"),
            "Fast charging": format_number(row.get("fast_charging"), "W"),
        },
        "Connectivity": {
            "Network": compact_optional(row.get("network_support")),
            "Dual SIM": yes_no_text(row.get("dual_sim")),
            "Bluetooth": compact_optional(row.get("bluetooth_version")),
            "Wi-Fi": compact_optional(row.get("wifi_version")),
            "USB": compact_optional(row.get("usb_type")),
        },
        "Build": {
            "Weight": format_number(row.get("weight"), " g"),
            "Thickness": format_number(row.get("thickness"), " mm"),
            "Body material": compact_optional(row.get("body_material")),
            "Fingerprint sensor": yes_no_text(row.get("fingerprint_sensor")),
        },
    }

    normalized_sections: dict[str, dict[str, str]] = {}
    for section_name, fields in sections.items():
        normalized_fields = {key: value for key, value in fields.items() if value}
        if normalized_fields:
            normalized_sections[section_name] = normalized_fields
    return normalized_sections


def build_search_text(document: dict[str, Any], row: dict[str, str]) -> str:
    parts = [
        f"แบรนด์ {document['brand']}",
        f"รุ่น {document['model']}",
        f"brand {document['brand']}",
        f"model {document['model']}",
        f"ปีเปิดตัว {row.get('release_year')}",
        f"release year {row.get('release_year')}",
        f"ระบบปฏิบัติการ {row.get('operating_system')}",
        f"operating system {row.get('operating_system')}",
        f"ราคา {document['price_thb']} บาท" if document.get("price_thb") is not None else None,
        f"price {document['price_thb']} THB" if document.get("price_thb") is not None else None,
        f"หน้าจอ {document.get('highlights', {}).get('display')}",
        f"แรม {document.get('highlights', {}).get('ram')}",
        f"ความจุ {document.get('highlights', {}).get('storage')}",
        f"กล้อง {document.get('highlights', {}).get('camera')}",
        f"แบตเตอรี่ {document.get('highlights', {}).get('battery')}",
        f"ชิปเซ็ต {document.get('highlights', {}).get('chipset')}",
        f"network {row.get('network_support')}",
        f"usb {row.get('usb_type')}",
        f"wifi {row.get('wifi_version')}",
        f"bluetooth {row.get('bluetooth_version')}",
        f"dual sim {row.get('dual_sim')}",
        f"fingerprint {row.get('fingerprint_sensor')}",
    ]

    for section_name, fields in (document.get("spec_sections") or {}).items():
        for field_name, field_value in fields.items():
            parts.append(f"{section_name} {field_name} {field_value}")

    joined = "\n".join(part for part in parts if compact_optional(part))
    return compact_text(thai_normalize(joined), preserve_newlines=True)


def build_document(row: dict[str, str], dataset_name: str) -> dict[str, Any]:
    row_id = compact_optional(row.get("id")) or "0"
    brand = compact_optional(row.get("brand_name")) or "Unknown"
    model = compact_optional(row.get("model")) or f"Unknown Model {row_id}"
    release_year = compact_optional(row.get("release_year")) or "unknown-year"
    slug = f"{slugify(brand)}-{slugify(model)}-{slugify(release_year)}"
    highlights = build_highlights(row)
    spec_sections = build_spec_sections(row, dataset_name)

    raw_price = parse_price_to_int(row.get("price"))
    price_thb = round(raw_price * 0.2625) if raw_price is not None else None

    document = {
        "brand": brand,
        "model": model,
        "category": "smartphone",
        "price_thb": price_thb,
        "source_url": f"dataset://{dataset_name}#{row_id}",
        "thumbnail_url": None,
        "source": {
            "site": DATASET_SITE,
            "specphone_id": int(row_id) if row_id.isdigit() else None,
            "slug": slug,
        },
        "highlights": highlights,
        "spec_sections": spec_sections,
        "scraped_at": utc_now_iso(),
        "updated_at": utc_now_iso(),
    }
    document["search_text"] = build_search_text(document, row)
    return document


def backup_existing_output(path: Path) -> None:
    if not path.exists():
        return
    backup_path = path.with_name(f"{path.stem}.backup{path.suffix}")
    shutil.copy2(path, backup_path)
    print(f"[import_csv_dataset] backed up existing output to {backup_path}")


def read_rows(path: Path, limit: int | None = None) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for index, row in enumerate(reader, start=1):
            rows.append(row)
            if limit and index >= limit:
                break
    return rows


def dedupe_key(row: dict[str, str]) -> tuple[str, str]:
    brand = compact_optional(row.get("brand_name")) or "Unknown"
    model = compact_optional(row.get("model")) or "Unknown Model"
    return (brand, model)


def row_completeness_score(row: dict[str, str]) -> int:
    return sum(1 for value in row.values() if compact_optional(value))


def dedupe_rows(rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], int]:
    chosen: dict[tuple[str, str], dict[str, str]] = {}
    duplicate_count = 0

    for row in rows:
        key = dedupe_key(row)
        existing = chosen.get(key)
        if existing is None:
            chosen[key] = row
            continue

        duplicate_count += 1
        if row_completeness_score(row) >= row_completeness_score(existing):
            chosen[key] = row

    return list(chosen.values()), duplicate_count


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"CSV dataset not found: {input_path}")

    rows = read_rows(input_path, args.limit)
    deduped_rows, duplicate_count = dedupe_rows(rows)
    dataset_name = input_path.name
    documents = [build_document(row, dataset_name) for row in deduped_rows]

    backup_existing_output(output_path)
    payload = {
        "generated_at": utc_now_iso(),
        "source": {
            "site": DATASET_SITE,
            "dataset_file": dataset_name,
        },
        "raw_count": len(rows),
        "duplicate_rows_removed": duplicate_count,
        "count": len(documents),
        "items": documents,
    }
    write_json(output_path, payload)
    print(
        f"[import_csv_dataset] wrote {len(documents)} deduped documents to {output_path} "
        f"(raw_rows={len(rows)}, duplicates_removed={duplicate_count})"
    )


if __name__ == "__main__":
    main()
