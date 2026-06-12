# Figure constructions — ERD, EER, and normalization (v31)

Editable diagram sources for Chapter 3. Use these to replace or improve Figures 3.5–3.7 and add 1NF / 2NF / 3NF figures.

## Can I move boxes and arrange them?

**Yes.** Use the **`.drawio`** files:

1. Open [diagrams.net](https://app.diagrams.net) (or the **Draw.io Integration** extension in VS Code / Cursor).
2. **File → Open** → pick any `*.drawio` file in this folder.
3. **Drag** any entity box; **resize** with handles; **reroute** connectors by dragging edge waypoints.
4. **File → Export as → PDF** or **SVG** for the thesis (`Diagrams/` bundle).

| File | Contents |
|------|----------|
| `erd-core-improved.drawio` | 20 core PostgreSQL entities + relationships |
| `erd-extended-improved.drawio` | 14 extended banking / multi-entity entities |
| `eer-improved.drawio` | Specialization, weak entity, multi-valued, aggregation |
| `normalization-1nf-2nf-3nf.drawio` | **4 tabs:** 0NF problems, 1NF, 2NF, 3NF |

To regenerate draw.io layouts from script (after editing entity lists):

```bash
python3 generate-drawio.py
```

## Mermaid sources (text-based, less drag-and-drop)

| File | Use |
|------|-----|
| `erd-core-improved.mmd` | Preview at [mermaid.live](https://mermaid.live) or export via `mmdc` |
| `erd-extended-improved.mmd` | Extended ERD |
| `eer-improved.mmd` | EER constructs |
| `normalization-pipeline.mmd` | 0NF → 1NF → 2NF → 3NF flowchart |

Mermaid is good for version control; **draw.io is better for manual layout** in the thesis.

## Written specifications

| File | Contents |
|------|-----|
| `ERD-FULL-SPEC.md` | All entities, attributes, PK/FK, cardinalities (core + extended) |
| `NORMALIZATION-GUIDE.md` | 1NF / 2NF / 3NF violations, fixes, functional dependencies, BCNF note |

## Thesis export workflow

1. Arrange diagrams in draw.io.
2. Export PDF (300 DPI) or SVG.
3. Copy into `../Diagrams/` with thesis names, e.g. `fig-erd-core.pdf`, `fig-erd-extended.pdf`, `fig-eer-model.pdf`.
4. Add normalization figures as new labels in `Pre-thesis_v31_heavily_compress.tex` if needed.

## Entity counts

- **Core ERD:** 20 PostgreSQL entities (+ `CREDIT_PASSPORT` shown as on-chain SBT overlay).
- **Extended ERD:** 14 additional entities (Phase II–III).
- **Full system:** 34 relational entities when core + extended are combined.
