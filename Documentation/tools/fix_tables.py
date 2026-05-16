#!/usr/bin/env python3
"""Fix Pre-thesis_v11.tex tables: remove TableScreenshotEnd, booktabs, tabularx."""

from __future__ import annotations

import re
from pathlib import Path

TEX = Path(__file__).resolve().parents[1] / "Pre-thesis_v11.tex"

SPEC_MAP: dict[str, str] = {
    "p{2.8cm}p{2.8cm}p{2.8cm}p{3cm}p{3cm}": "@{}L{2.0cm}L{2.1cm}L{2.1cm}Y Y@{}",
    "p{1.5cm}p{10cm}p{1.5cm}": "@{}L{1.6cm}Y C{1.0cm}@{}",
    "p{3.5cm}p{10cm}": "@{}L{3.2cm}Y@{}",
    "p{3.5cm}p{6.5cm}p{3cm}": "@{}L{3.0cm}Y C{2.4cm}@{}",
    "p{3.5cm}p{3.5cm}p{2.5cm}p{4cm}": "@{}L{2.8cm}L{2.8cm}C{2.2cm}Y@{}",
    "p{3.5cm}p{4.5cm}p{5.5cm}": "@{}L{3.0cm}Y Y@{}",
    "p{3.5cm}p{3.5cm}p{6.5cm}": "@{}L{3.0cm}L{3.0cm}Y@{}",
    "p{4cm}p{9.5cm}": "@{}L{3.6cm}Y@{}",
    "p{4cm}p{3cm}p{6.5cm}": "@{}L{3.2cm}L{2.6cm}Y@{}",
    "p{3cm}p{5.5cm}p{5cm}": "@{}L{2.6cm}Y Y@{}",
    "p{4.5cm}p{2.5cm}p{6.5cm}": "@{}L{3.6cm}C{2.2cm}Y@{}",
    "p{4.5cm}p{9cm}": "@{}L{3.8cm}Y@{}",
    "p{3.2cm}p{6.2cm}p{6.2cm}": "@{}L{2.8cm}Y Y@{}",
    "p{0.5cm}p{2.5cm}p{4.5cm}p{5cm}": "@{}C{0.55cm}L{2.4cm}Y Y@{}",
    "p{3cm}p{3cm}p{3cm}p{4.5cm}": "@{}L{2.4cm}L{2.4cm}L{2.4cm}Y@{}",
    "p{2.5cm}p{2.5cm}p{2.5cm}p{2.5cm}p{3.5cm}": "@{}L{2.1cm}L{2.1cm}L{2.1cm}L{2.1cm}Y@{}",
    "p{4cm}p{5cm}p{4.5cm}": "@{}L{3.2cm}Y Y@{}",
    "p{3cm}p{4cm}p{1.5cm}p{5cm}": "@{}L{2.6cm}Y C{1.0cm}Y@{}",
    "p{3cm}p{3cm}p{7.5cm}": "@{}L{2.6cm}L{2.6cm}Y@{}",
    "p{4cm}p{2.5cm}p{7cm}": "@{}L{3.2cm}C{2.2cm}Y@{}",
    "p{6cm}p{7.5cm}": "@{}L{4.8cm}Y@{}",
    "p{5cm}p{3.5cm}p{4cm}": "@{}L{4.0cm}L{3.0cm}Y@{}",
    "p{4cm}p{3.5cm}p{6cm}": "@{}L{3.2cm}L{2.8cm}Y@{}",
    "p{2.5cm}p{6.5cm}p{4.5cm}": "@{}L{2.2cm}Y Y@{}",
    "p{3cm}p{4cm}p{6.5cm}": "@{}L{2.6cm}L{3.2cm}Y@{}",
    "p{6cm}p{1cm}p{6cm}": "@{}L{5.5cm}C{1.0cm}L{5.5cm}@{}",
}

KEEP_TABULAR = {
    "@{}p{4.2cm}ccccc>{\\bfseries}c@{}",
    "@{}p{7.5cm}c@{}",
    "@{}lccp{5.5cm}@{}",
    "@{}llp{5.5cm}@{}",
}


def match_brace_group(text: str, start: int) -> tuple[str, int]:
    """Return content inside {...} starting at text[start]=='{'."""
    assert text[start] == "{"
    depth = 0
    i = start
    while i < len(text):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[start + 1 : i], i + 1
        i += 1
    raise ValueError("Unbalanced braces")


def iter_tabular_blocks(text: str):
    """Yield (start, end, block, spec, env) for each tabular/tabularx environment."""
    i = 0
    while True:
        m = re.search(r"\\begin\{(tabularx?)\}", text[i:])
        if not m:
            break
        start = i + m.start()
        env = m.group(1)
        pos = i + m.end()
        if env == "tabularx":
            _, pos = match_brace_group(text, pos)  # \linewidth
        spec, pos = match_brace_group(text, pos)
        end_m = re.search(rf"\\end\{{{env}\}}", text[pos:])
        if not end_m:
            break
        end = pos + end_m.end()
        yield start, end, text[start:end], spec, env
        i = end


def extract_labels_from_screenshot_end(text: str) -> dict[int, str]:
    labels: dict[int, str] = {}
    for m in re.finditer(
        r"\\TableScreenshotEnd\[([^\]]+)\]\{[^}]*\}", text
    ):
        pos = m.start()
        table_start = text.rfind(r"\begin{table}", 0, pos)
        if table_start >= 0:
            labels[table_start] = m.group(1)
    return labels


def remove_table_screenshot_end(text: str) -> str:
    return re.sub(r"\n\\TableScreenshotEnd(?:\[[^\]]*\])?\{[^}]*\}", "", text)


def add_missing_labels(text: str, labels_by_table: dict[int, str]) -> str:
    for table_start, label in sorted(labels_by_table.items(), reverse=True):
        chunk_end = text.find(r"\end{table}", table_start)
        if chunk_end < 0:
            continue
        chunk = text[table_start:chunk_end]
        if f"\\label{{{label}}}" in chunk:
            continue
        cap = re.search(r"(\\caption\{[^}]*(?:\{[^}]*\}[^}]*)*\})", chunk)
        if not cap:
            continue
        old = cap.group(1)
        new = old + f"\n\\label{{{label}}}"
        text = text[:table_start] + chunk.replace(old, new, 1) + text[chunk_end:]
    return text


def convert_tabular_spec(block: str, spec: str, env: str) -> str:
    if spec in KEEP_TABULAR:
        return block
    new_spec = SPEC_MAP.get(spec)
    if not new_spec:
        if "p{" in spec:
            new_spec = re.sub(
                r"p\{(\d+(?:\.\d+)?)cm\}",
                lambda mo: f"L{{{mo.group(1)}cm}}",
                spec,
            )
        else:
            return block
    if env == "tabular":
        old_begin = f"\\begin{{tabular}}{{{spec}}}"
        new_begin = f"\\begin{{tabularx}}{{\\linewidth}}{{{new_spec}}}"
        block = block.replace(old_begin, new_begin, 1)
        block = block.replace("\\end{tabular}", "\\end{tabularx}", 1)
    elif env == "tabularx":
        # replace inner spec only
        block = re.sub(
            r"(\\begin\{tabularx\}\{\\linewidth\})\{[^}]+\}",
            rf"\1{{{new_spec}}}",
            block,
            count=1,
        )
    return block


def convert_hlines_to_booktabs(block: str) -> str:
    if "\\toprule" in block:
        lines = [ln for ln in block.split("\n") if ln.strip() != "\\hline"]
        block = "\n".join(lines)
    else:
        lines = block.split("\n")
        out: list[str] = []
        seen_header = False
        for idx, line in enumerate(lines):
            if line.strip() == "\\hline":
                nxt = ""
                for j in range(idx + 1, len(lines)):
                    if lines[j].strip():
                        nxt = lines[j].strip()
                        break
                if not seen_header and "\\textbf" in nxt:
                    out.append("\\toprule")
                elif not seen_header:
                    out.append("\\toprule")
                elif nxt.startswith("\\end{tabular"):
                    out.append("\\bottomrule")
                elif "\\textbf" in (out[-1] if out else ""):
                    out.append("\\midrule")
                    seen_header = True
                elif nxt.startswith("\\end{tabular"):
                    out.append("\\bottomrule")
                else:
                    if not seen_header:
                        out.append("\\midrule")
                        seen_header = True
                continue
            if "\\textbf" in line and "&" in line:
                seen_header = True
            out.append(line)
        block = "\n".join(out)
        if "\\bottomrule" not in block and "\\toprule" in block:
            block = re.sub(
                r"(\\end\{tabularx?\})",
                r"\\bottomrule\n\1",
                block,
                count=1,
            )

    # Fix standalone \tablerowshade lines -> prefix next data row
    lines = block.split("\n")
    fixed: list[str] = []
    skip_shade = False
    data_idx = 0
    for line in lines:
        if line.strip() == "\\tablerowshade":
            skip_shade = True
            continue
        if skip_shade and line.strip() and "&" in line and "\\textbf" not in line:
            if "\\rowcolor" not in line:
                line = "\\tablerowshade " + line.lstrip()
            skip_shade = False
            data_idx += 1
        elif line.strip() and "&" in line and "\\textbf" not in line and "\\toprule" not in line and "\\midrule" not in line and "\\bottomrule" not in line:
            data_idx += 1
        fixed.append(line)
    return "\n".join(fixed)


def fix_table_spacing(text: str) -> str:
    text = re.sub(
        r"\\begin\{table\}\[H\]\s*\n\s*\n\\setlength\{\\tabcolsep\}\{5pt\}\\centering",
        r"\\begin{table}[H]\n\\centering\n\\setlength{\\tabcolsep}{5pt}",
        text,
    )
    return text


def process_all_tabulars(text: str) -> str:
    blocks = list(iter_tabular_blocks(text))
    for start, end, block, spec, env in reversed(blocks):
        new_block = convert_tabular_spec(block, spec, env)
        new_block = convert_hlines_to_booktabs(new_block)
        text = text[:start] + new_block + text[end:]
    return text


def main() -> None:
    text = TEX.read_text(encoding="utf-8")
    labels = extract_labels_from_screenshot_end(text)
    text = remove_table_screenshot_end(text)
    text = add_missing_labels(text, labels)
    text = process_all_tabulars(text)
    text = fix_table_spacing(text)
    TEX.write_text(text, encoding="utf-8")
    n_tabularx = len(re.findall(r"\\begin\{tabularx\}", text))
    n_tabular = len(re.findall(r"\\begin\{tabular\}", text))
    print(f"tabularx: {n_tabularx}, tabular: {n_tabular}")


if __name__ == "__main__":
    main()
