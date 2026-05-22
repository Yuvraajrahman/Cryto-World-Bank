# Thesis diagrams & PDF build (Mac M4 / Apple Silicon)

## Where Mermaid source is preserved

| Location | Contents |
|----------|----------|
| **`Diagrams/All diagrams.md`** | **Master archive** — all 46 diagrams (CSE471 + thesis). Regenerate: `python3 tools/rebuild_all_diagrams_md.py` |
| **`Diagrams/new-diagrams-build.md`** | Editable staging for Ch.1–5 / AI / blockchain extensions (25 diagrams) |
| **`Diagrams/mermaid-src/*.mmd`** | Per-diagram copy written on each `build_mermaid_pdfs.py` run |
| **`Pre-thesis_v11.tex`** | **PNG only** (`\FigureImageMaxFit{...png}`) — no Mermaid in LaTeX |

## PNG replacement in `Pre-thesis_v11.tex`

**All 21 CSE471 diagram PNGs are replaced** with vector PDFs from Mermaid:

| Still PNG | Purpose |
|-----------|---------|
| `bracu_logo_12-0-2022.png` | Title-page logo only (you must supply this file) |
| Table screenshots | If any use `Tables/*.png` via `\TableImageMaxFit` (unchanged) |

**Not PNG — already TikZ in the `.tex`:** core system graph, ERD, EER, four-tier flow, methodology charts.

**Text-only mention (no figure):** `oracle_architecture.png` placeholder in prose.

Diagram figures now use `Diagrams/mermaid-pdf/*.pdf` (e.g. `component-diagram.pdf`).

---

## Best-quality pipeline (recommended on M4)

**mmdc → PNG** (Chromium screenshot at 2.5–3× scale). Do **not** use SVG→PDF (`rsvg-convert`): Mermaid still puts HTML labels in SVG, and rsvg drops them → **blank boxes**.

```bash
# One-time (no sudo)
npm install -g @mermaid-js/mermaid-cli
brew install librsvg    # provides rsvg-convert

# Each time diagrams change
cd Documentation
python3 tools/build_mermaid_pdfs.py

# Compile thesis (twice)
pdflatex -interaction=nonstopmode Pre-thesis_v11.tex
pdflatex -interaction=nonstopmode Pre-thesis_v11.tex
```

Output: `Documentation/Pre-thesis_v11.pdf`

---

## What needs `sudo` (optional, for LaTeX only — not for diagrams)

| Install | sudo? | Why |
|---------|-------|-----|
| `npm install -g @mermaid-js/mermaid-cli` | No | Diagram rendering |
| `brew install librsvg` | No* | High-DPI SVG→PDF |
| `brew install --cask mactex` | No* | Full TeX distribution |
| `sudo tlmgr install fontawesome5` | **Yes** | Only if you restore Font Awesome icons in tables |
| `sudo tlmgr install <package>` | **Yes** | Only when `pdflatex` reports a missing `.sty` |

\*Homebrew may ask for your Mac password once; that is not the same as `sudo tlmgr`.

The repo uses simple table marks (`✓`, `×`) so **fontawesome5 is not required** for a successful build.

---

## Verify tools

```bash
python3 tools/build_mermaid_pdfs.py --check
```

---

## ARM notes

- **mmdc** on M4 uses bundled Chromium (arm64); works normally.
- If mmdc fails with a browser error: `brew install chromium` and retry.
- Avoid `--pdfFit` on huge diagrams (can hang); the script uses SVG + rsvg instead.

---

## Logo file

Copy `bracu_logo_12-0-2022.png` into `Documentation/` before compiling, or the title page shows a missing-file box.
