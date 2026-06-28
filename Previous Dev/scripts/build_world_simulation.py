#!/usr/bin/env python3
"""
Build `frontend/public/data/world_simulation.json` for the Crypto World Bank demo.

Inputs (repo root):
  - Documentation/banklist.md — ISO country list bullets: `- Name (ISO3, ISO2)`
  - Optional: Documentation/world_banking_data.json — researched bundle
      { "world_bank": {...}, "countries": [ { "id", "name", "capital", "currency",
        "national_bank", "major_cities", "local_banks" }, ... ] }
  - Optional: Documentation/banklist.md if it begins with `{` (JSON export); trailing `JSONEOF` is stripped.

Merges REST Countries (capital, currency) for gaps, enforces ≥10 local banks, and assigns
at least one local-bank branch per city (round-robin across banks).

REST Countries is loaded from a bundled cache under scripts/data/ so builds work offline.
Optional live refresh updates that cache when the network is available.

Usage:
  python3 scripts/build_world_simulation.py              # try live API (15s), else cache
  python3 scripts/build_world_simulation.py --offline    # cache only, no network
  python3 scripts/build_world_simulation.py --refresh    # force download, rewrite cache
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "Documentation" / "banklist.md"
RESEARCH_PATH = ROOT / "Documentation" / "world_banking_data.json"
OUT_PATH = ROOT / "frontend" / "public" / "data" / "world_simulation.json"
REST_COUNTRIES_CACHE = ROOT / "scripts" / "data" / "rest_countries_by_cca2.json"
REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca2,capital,currencies"
LIVE_TIMEOUT_SEC = 15

COUNTRY_LINE = re.compile(r"^- (.+) \(([A-Z]{3}), ([A-Z]{2})\)\s*$")
MIN_LOCAL_BANKS = 10
MIN_CITIES = 4  # pad with labelled simulation hubs if research/API gives only capital


def parse_markdown_countries(text: str) -> list[tuple[str, str, str]]:
    rows: list[tuple[str, str, str]] = []
    for line in text.splitlines():
        m = COUNTRY_LINE.match(line.strip())
        if m:
            rows.append((m.group(1).strip(), m.group(2), m.group(3)))
    return rows


def try_load_research() -> dict | None:
    if not RESEARCH_PATH.is_file():
        return None
    raw = RESEARCH_PATH.read_text(encoding="utf-8").strip()
    if not raw:
        return None
    raw = re.sub(r"\s*JSONEOF\s*$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def try_load_json_banklist(text: str) -> dict | None:
    t = text.strip()
    if not t.startswith("{"):
        return None
    t = re.sub(r"\s*JSONEOF\s*$", "", t)
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        return None


def load_rest_countries_cache() -> dict[str, dict] | None:
    if not REST_COUNTRIES_CACHE.is_file():
        return None
    try:
        raw = json.loads(REST_COUNTRIES_CACHE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if not isinstance(raw, dict):
        return None
    return raw  # type: ignore[return-value]


def save_rest_countries_cache(by_cca2: dict[str, dict]) -> None:
    REST_COUNTRIES_CACHE.parent.mkdir(parents=True, exist_ok=True)
    REST_COUNTRIES_CACHE.write_text(
        json.dumps(by_cca2, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def fetch_rest_countries_live(timeout_sec: float = LIVE_TIMEOUT_SEC) -> dict[str, dict]:
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        REST_COUNTRIES_URL,
        headers={"User-Agent": "CryptoWorldBank/1.0"},
    )
    with urllib.request.urlopen(req, timeout=timeout_sec, context=ctx) as r:
        data = json.loads(r.read().decode())
    by_cca2: dict[str, dict] = {}
    for row in data:
        c2 = row.get("cca2")
        if c2:
            by_cca2[c2] = row
    return by_cca2


def resolve_rest_index(*, offline: bool, refresh: bool) -> tuple[dict[str, dict], str]:
    """
    Returns (index by ISO2, provenance label for logging).
    """
    if offline:
        cached = load_rest_countries_cache()
        if not cached:
            print(
                f"--offline but no cache at {REST_COUNTRIES_CACHE}",
                file=sys.stderr,
            )
            return {}, "offline_no_cache"
        return cached, "bundled_cache"

    if refresh:
        try:
            live = fetch_rest_countries_live()
            save_rest_countries_cache(live)
            print(f"Updated REST Countries cache ({len(live)} entries).", file=sys.stderr)
            return live, "live_refresh"
        except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as e:
            print(f"Live refresh failed: {e}; using cache.", file=sys.stderr)
            cached = load_rest_countries_cache()
            return (cached or {}), "refresh_failed_fallback"

    try:
        live = fetch_rest_countries_live()
        return live, "live"
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as e:
        print(f"REST Countries live fetch failed ({e}); using bundled cache.", file=sys.stderr)
        cached = load_rest_countries_cache()
        if cached:
            return cached, "bundled_cache_fallback"
        return {}, "no_cache"


def currency_label(rc: dict | None) -> str:
    if not rc:
        return "—"
    cur = rc.get("currencies") or {}
    if not cur:
        return "—"
    code, meta = next(iter(cur.items()))
    name = (meta or {}).get("name") or code
    sym = (meta or {}).get("symbol") or ""
    if sym:
        return f"{name} ({code}, {sym})"
    return f"{name} ({code})"


def capital_name(rc: dict | None, fallback: str) -> str:
    if rc and rc.get("capital"):
        return rc["capital"][0]
    return fallback


def pad_cities(
    base: list[str],
    country_name: str,
    capital: str,
) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for c in base:
        c = (c or "").strip()
        if c and c not in seen:
            seen.add(c)
            out.append(c)
    if capital and capital not in seen:
        out.insert(0, capital)
        seen.add(capital)
    i = 1
    while len(out) < MIN_CITIES:
        hub = f"{country_name} — regional hub {i} (simulation)"
        if hub not in seen:
            out.append(hub)
            seen.add(hub)
        i += 1
    return out


def pad_local_banks(names: list[str], iso2: str, country_name: str) -> tuple[list[str], bool]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for n in names:
        n = (n or "").strip()
        if n and n not in seen:
            seen.add(n)
            cleaned.append(n)
    synthetic = False
    k = 1
    while len(cleaned) < MIN_LOCAL_BANKS:
        synthetic = True
        cleaned.append(f"Simulated local bank {k} — {country_name} ({iso2})")
        k += 1
    return cleaned, synthetic


def main() -> int:
    ap = argparse.ArgumentParser(description="Build world_simulation.json for the frontend.")
    ap.add_argument(
        "--offline",
        action="store_true",
        help="Do not call the network; use scripts/data/rest_countries_by_cca2.json only.",
    )
    ap.add_argument(
        "--refresh",
        action="store_true",
        help="Force-download REST Countries and update the bundled cache.",
    )
    args = ap.parse_args()
    if args.offline and args.refresh:
        print("Use only one of --offline or --refresh.", file=sys.stderr)
        return 2

    md_text = MD_PATH.read_text(encoding="utf-8")
    spec_rows = parse_markdown_countries(md_text)
    if not spec_rows:
        print("No country bullets found in Documentation/banklist.md", file=sys.stderr)
        return 1

    research = try_load_research()
    if research is None:
        research = try_load_json_banklist(md_text)

    research_by_iso: dict[str, dict] = {}
    wb_meta = None
    if research and isinstance(research.get("countries"), list):
        wb_meta = research.get("world_bank")
        for c in research["countries"]:
            cid = c.get("id")
            if cid:
                research_by_iso[str(cid).upper()] = c

    rc_index, _rc_source = resolve_rest_index(offline=args.offline, refresh=args.refresh)

    world_bank = {
        "id": "WBR-0001",
        "name": "Crypto World Bank Reserve",
        "role": "universal_world_bank",
        "headquarters": "Washington D.C., USA (modelled on World Bank Group)",
        "connects_to": "all_national_banks",
    }
    if isinstance(wb_meta, dict):
        world_bank.update({k: v for k, v in wb_meta.items() if k not in world_bank})

    countries_out: list[dict] = []
    stats = {
        "markdown_countries": len(spec_rows),
        "research_hits": 0,
        "local_banks_total": 0,
        "branches_total": 0,
        "synthetic_bank_padding": 0,
        "rest_countries_source": _rc_source,
        "rest_countries_entries": len(rc_index),
    }

    for name, iso3, iso2 in spec_rows:
        rc = rc_index.get(iso2)
        r = research_by_iso.get(iso2)

        capital = (
            (r or {}).get("capital")
            or capital_name(rc, f"Capital — {name}")
        )
        currency = (r or {}).get("currency") or currency_label(rc)
        national_name = (r or {}).get("national_bank") or (
            f"National monetary authority — {name} ({iso2})"
        )

        cities_src = list((r or {}).get("major_cities") or [])
        if not cities_src:
            cities_src = [capital]
        cities = pad_cities(cities_src, name, capital)

        lb_src = list((r or {}).get("local_banks") or [])
        local_names, padded = pad_local_banks(lb_src, iso2, name)
        if padded:
            stats["synthetic_bank_padding"] += 1
        if r:
            stats["research_hits"] += 1

        local_banks: list[dict] = []
        for bi, bank_name in enumerate(local_names):
            bid = f"LB-{iso2}-{bi+1:04d}"
            local_banks.append(
                {
                    "id": bid,
                    "name": bank_name,
                    "synthetic": bank_name.startswith("Simulated local bank"),
                    "parent_national_bank_id": f"NB-{iso2}-0001",
                    "branches": [],
                }
            )

        n_b = len(local_banks)
        for ci, city in enumerate(cities):
            bi = ci % n_b
            bid = local_banks[bi]["id"]
            local_banks[bi]["branches"].append(
                {
                    "branch_id": f"{bid}-B-{ci+1:03d}",
                    "city": city,
                    "label": f"Branch — {city}",
                }
            )

        for bi, bank in enumerate(local_banks):
            if not bank["branches"]:
                city = cities[bi % len(cities)]
                bank["branches"].append(
                    {
                        "branch_id": f"{bank['id']}-B-000",
                        "city": city,
                        "label": f"Head office — {city}",
                    }
                )

        stats["local_banks_total"] += len(local_banks)
        stats["branches_total"] += sum(len(b["branches"]) for b in local_banks)

        countries_out.append(
            {
                "id": iso2,
                "iso3": iso3,
                "name": name,
                "capital": capital,
                "currency": currency,
                "national_bank": {
                    "id": f"NB-{iso2}-0001",
                    "name": national_name,
                    "parent_world_bank_id": world_bank["id"],
                },
                "major_cities": cities,
                "local_banks": local_banks,
                "data_provenance": {
                    "from_research_json": bool(r),
                    "rest_countries": bool(rc),
                },
            }
        )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "world_bank": world_bank,
        "countries": countries_out,
        "stats": stats,
        "build_notes": (
            "Cities include simulation hubs when the dataset only lists the capital. "
            "Save researched banks as Documentation/world_banking_data.json and re-run "
            "this script to replace synthetic names. "
            "Branch assignment is algorithmic (not from regulator filings)."
        ),
    }
    OUT_PATH.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(countries_out)} countries).")
    print(json.dumps(stats, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
