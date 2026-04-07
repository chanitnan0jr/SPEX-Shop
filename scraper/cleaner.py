from __future__ import annotations

import argparse
import os
from typing import Any

from pythainlp.util import normalize as thai_normalize

from common import (
    CLEAN_DATA_PATH,
    RAW_DATA_PATH,
    compact_text,
    first_non_empty,
    flatten_pairs,
    load_scraper_env,
    parse_price_to_int,
    read_json,
    utc_now_iso,
    write_json,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize raw Specphone data into Mongo-ready documents.")
    parser.add_argument("--input", default=str(RAW_DATA_PATH), help="Path to specs_raw.json.")
    parser.add_argument("--output", default=str(CLEAN_DATA_PATH), help="Path to specs_clean.json.")
    return parser.parse_args()


def nested_get(mapping: dict[str, Any] | None, *keys: str) -> Any:
    current: Any = mapping or {}
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def get_section_value(spec_sections: dict[str, dict[str, str]], section_name: str, field_name: str) -> str | None:
    section = spec_sections.get(section_name, {})
    return first_non_empty(section.get(field_name))


def build_chipset(api_record: dict[str, Any], spec_sections: dict[str, dict[str, str]]) -> str | None:
    brand = nested_get(api_record, "cpu_spec", "phone_cpu", "brand", "name")
    name = nested_get(api_record, "cpu_spec", "phone_cpu", "cpu_name")
    model = nested_get(api_record, "cpu_spec", "phone_cpu", "cpu_model")
    api_value = compact_text(" ".join(part for part in [brand, name, model] if compact_text(str(part or ""))))
    section_value = get_section_value(spec_sections, "ระบบปฏิบัติการ (OS, CPU)", "ชิปประมวลผล")
    return first_non_empty(api_value, section_value)


def build_os(spec_sections: dict[str, dict[str, str]]) -> str | None:
    name = get_section_value(spec_sections, "ระบบปฏิบัติการ (OS, CPU)", "ระบบปฏิบัติการ")
    version = get_section_value(spec_sections, "ระบบปฏิบัติการ (OS, CPU)", "เวอร์ชัน")
    combined = compact_text(" ".join(part for part in [name, version] if part))
    return first_non_empty(combined, name)


def build_display(api_record: dict[str, Any], spec_sections: dict[str, dict[str, str]]) -> str | None:
    size = first_non_empty(api_record.get("display_size"))
    display_type = first_non_empty(nested_get(api_record, "phone_display_type", "name"))
    api_display = compact_text(" ".join(part for part in [f"{size} นิ้ว" if size else "", display_type or ""] if part))

    section_size = get_section_value(spec_sections, "หน้าจอแสดงผล", "ขนาดหน้าจอ")
    section_type = get_section_value(spec_sections, "หน้าจอแสดงผล", "ประเภท")
    section_display = compact_text(" ".join(part for part in [section_size or "", section_type or ""] if part))
    return first_non_empty(api_display, section_display)


def build_camera(spec_sections: dict[str, dict[str, str]]) -> str | None:
    primary = get_section_value(spec_sections, "ข้อมูลกล้อง", "กล้องหลัก")
    selfie = get_section_value(spec_sections, "ข้อมูลกล้อง", "กล้องหน้า")
    if primary and selfie:
        return f"กล้องหลัก {primary} | กล้องหน้า {selfie}"
    return first_non_empty(primary, selfie)


def build_battery(api_record: dict[str, Any], spec_sections: dict[str, dict[str, str]]) -> str | None:
    capacity = api_record.get("battery_capacity")
    api_value = f"{capacity} mAh" if capacity else ""
    return first_non_empty(api_value, get_section_value(spec_sections, "แบตเตอรี่", "ความจุ"))


def build_ram(api_record: dict[str, Any], spec_sections: dict[str, dict[str, str]]) -> str | None:
    ram_map = api_record.get("phone_ram_map") or []
    api_value = first_non_empty(*(nested_get(entry, "phone_ram", "name") for entry in ram_map))
    return first_non_empty(api_value, get_section_value(spec_sections, "หน่วยความจำ", "หน่วยความจำ"))


def build_storage(api_record: dict[str, Any], spec_sections: dict[str, dict[str, str]]) -> str | None:
    return first_non_empty(
        api_record.get("rom"),
        get_section_value(spec_sections, "หน่วยความจำ", "ความจุตัวเครื่อง"),
        get_section_value(spec_sections, "ระบบปฏิบัติการ (OS, CPU)", "ความจุ"),
    )


def normalize_spec_sections(spec_sections: dict[str, dict[str, str]]) -> dict[str, dict[str, str]]:
    normalized: dict[str, dict[str, str]] = {}
    for section_name, fields in (spec_sections or {}).items():
        clean_section_name = compact_text(section_name)
        if not clean_section_name:
            continue

        clean_fields: dict[str, str] = {}
        for field_name, field_value in fields.items():
            clean_field_name = compact_text(field_name)
            clean_field_value = compact_text(thai_normalize(field_value), preserve_newlines=True)
            if clean_field_name and clean_field_value:
                clean_fields[clean_field_name] = clean_field_value

        if clean_fields:
            normalized[clean_section_name] = clean_fields

    return normalized


def build_search_text(document: dict[str, Any]) -> str:
    parts = [
        document.get("brand"),
        document.get("model"),
        document.get("category"),
        f"ราคา {document['price_thb']} บาท" if document.get("price_thb") is not None else None,
    ]

    for key, value in (document.get("highlights") or {}).items():
        if value:
            parts.append(f"{key}: {value}")

    parts.extend(flatten_pairs(document.get("spec_sections") or {}))
    joined = "\n".join(compact_text(str(part), preserve_newlines=True) for part in parts if part)
    return compact_text(thai_normalize(joined), preserve_newlines=True)


def build_document(raw_record: dict[str, Any]) -> dict[str, Any]:
    api_record = raw_record.get("api_record") or {}
    detail = raw_record.get("detail") or {}
    json_ld = detail.get("json_ld") or {}
    spec_sections = normalize_spec_sections(detail.get("spec_sections") or {})
    json_ld_brand = json_ld.get("brand")
    if isinstance(json_ld_brand, dict):
        json_ld_brand = json_ld_brand.get("name")

    brand = first_non_empty(
        nested_get(api_record, "brand", "name"),
        json_ld_brand,
        get_section_value(spec_sections, "ยี่ห้อและรุ่น", "แบรนด์"),
    )
    model = first_non_empty(
        api_record.get("model"),
        detail.get("product_name"),
        json_ld.get("name"),
        get_section_value(spec_sections, "ยี่ห้อและรุ่น", "ชื่อรุ่น"),
    )
    price_thb = parse_price_to_int(
        first_non_empty(
            detail.get("product_price_text"),
            api_record.get("price"),
            nested_get(json_ld, "offers", "lowPrice"),
            get_section_value(spec_sections, "ยี่ห้อและรุ่น", "ราคา"),
        )
    )

    highlights = {
        "display": build_display(api_record, spec_sections),
        "ram": build_ram(api_record, spec_sections),
        "storage": build_storage(api_record, spec_sections),
        "camera": build_camera(spec_sections),
        "battery": build_battery(api_record, spec_sections),
        "chipset": build_chipset(api_record, spec_sections),
        "os": build_os(spec_sections),
    }
    highlights = {key: value for key, value in highlights.items() if value}

    document = {
        "brand": brand,
        "model": model,
        "category": "smartphone",
        "price_thb": price_thb,
        "source_url": raw_record.get("source_url"),
        "thumbnail_url": first_non_empty(api_record.get("thumbnail_url"), api_record.get("thumbnail")),
        "source": {
            "site": "specphone",
            "specphone_id": raw_record.get("source", {}).get("specphone_id") or api_record.get("id"),
            "slug": raw_record.get("source", {}).get("slug") or api_record.get("slug"),
        },
        "highlights": highlights,
        "spec_sections": spec_sections,
        "scraped_at": raw_record.get("scraped_at") or utc_now_iso(),
        "updated_at": utc_now_iso(),
    }
    document["search_text"] = build_search_text(document)
    return document


def load_raw_records(path: str) -> list[dict[str, Any]]:
    payload = read_json(os.path.abspath(path))
    if isinstance(payload, list):
        return payload
    return payload.get("items") or []


def dedupe_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen = {}
    for i, record in enumerate(records):
        slug = record.get("source", {}).get("slug") or nested_get(record, "api_record", "slug")
        if slug:
            seen[slug] = i  # last one wins

    if not seen:
        return []

    indices = sorted(seen.values())
    return [records[i] for i in indices]


def main() -> None:
    load_scraper_env()
    args = parse_args()
    raw_records = load_raw_records(args.input)
    deduped_records = dedupe_records(raw_records)
    cleaned_documents = [build_document(record) for record in deduped_records]

    payload = {
        "generated_at": utc_now_iso(),
        "source": {"site": "specphone"},
        "count": len(cleaned_documents),
        "items": cleaned_documents,
    }
    write_json(os.path.abspath(args.output), payload)
    print(f"[cleaner] wrote {len(cleaned_documents)} cleaned documents to {os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
