# Pre-thesis v13 — DEPRECATED

**Use `Pre-thesis_v11.tex` + Mermaid → PNG pipeline instead.** v13 auto-TikZ layout was not suitable.

---

# Pre-thesis v13 — TikZ-coded diagrams (no PNG figures)

## Files

| File | Role |
|------|------|
| `Pre-thesis_v13.tex` | Same content as v11; figures use `\CWBIncludeDiagram{stem}` |
| `Diagrams/tikz/*.tex` | **Vector TikZ source** for each diagram (46 files) |
| `Diagrams/tikz/cwb-tikz-styles.tex` | Shared colours and arrow styles |
| `Diagrams/mermaid-src/*.mmd` | Original Mermaid (archive) |
| `tools/mmd_to_tikz.py` | Regenerate TikZ from `.mmd` |
| `tools/create_v13.py` | Regenerate `Pre-thesis_v13.tex` from v11 |

## Build

```bash
cd Documentation
python3 tools/mmd_to_tikz.py      # after editing .mmd or to refresh TikZ
python3 tools/create_v13.py       # after editing v11 content
pdflatex -interaction=nonstopmode Pre-thesis_v13.tex
pdflatex -interaction=nonstopmode Pre-thesis_v13.tex
```

## Edit a diagram

1. Edit `Diagrams/mermaid-src/<name>.mmd` **or** edit `Diagrams/tikz/<name>.tex` directly (preferred for polish).
2. Run `python3 tools/mmd_to_tikz.py` only if you changed `.mmd` (overwrites `.tex`).
3. Recompile v13.

## Notes

- **Title-page logo** (`bracu_logo_12-0-2022.png`) still PNG — only figure asset.
- **ERD/EER** in Ch.3 remain **native TikZ** in the main `.tex` (unchanged).
- Auto-generated TikZ is a **baseline**; complex diagrams (use case, cross-tier) may need manual layout in `Diagrams/tikz/`.
- v11 + PNG pipeline remains valid for comparison.
