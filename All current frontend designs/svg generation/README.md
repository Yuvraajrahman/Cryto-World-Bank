# SVG generation (live page captures)

These scripts screenshot the running WBR app and write **SVGs with embedded PNGs** into the phase folders one level up (`All current frontend designs/…`).

## Method

1. Playwright opens each route on `http://127.0.0.1:5173` (headless Chrome).
2. Auth pages get a session via `POST /api/auth/dev-login` + `localStorage` inject.
3. Viewport screenshot → base64 PNG inside an SVG shell.
4. Footer strip shows the localhost URL (for defence slides).
5. Stretch pages 44–47 write a placeholder SVG (`stretch: true` in `pages.mjs`).

## Naming

`NN-slug_{desktop|phone}_{daymode|darkmode}.svg`

Examples:

- `01-landing_desktop_daymode.svg`
- `01-landing_desktop_darkmode.svg`
- `01-landing_phone_daymode.svg`
- `01-landing_phone_darkmode.svg`

| Piece | Spec |
|-------|------|
| Desktop | 1440×864 CSS → 1440×900 SVG (with footer) |
| Phone | iPhone 17 Pro **1206×2622** (@3×, CSS 402×874) + footer |
| Day | `data-theme="light"` |
| Dark | `data-theme="dark"` |

## Prerequisites

- Root deps installed (`npm install` at repo root — needs `playwright`)
- System Chrome available (or set `CWB_PW_CHANNEL`)
- Backend API on `:4000`
- Frontend Vite on `:5173`

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

## Regenerate

From repo root:

```bash
./"All current frontend designs/svg generation/regenerate.sh"              # both × both
./"All current frontend designs/svg generation/regenerate.sh" both darkmode
./"All current frontend designs/svg generation/regenerate.sh" phone daymode
```

Or:

```bash
CWB_PROFILE=both CWB_THEME=both node "All current frontend designs/svg generation/capture-page-svgs.mjs"
```

Optional env:

| Var | Default | Purpose |
|-----|---------|---------|
| `CWB_FE_URL` | `http://127.0.0.1:5173` | Frontend base |
| `CWB_API_URL` | `http://127.0.0.1:4000` | API base |
| `CWB_PW_CHANNEL` | `chrome` | Playwright browser channel |
| `CWB_PROFILE` | `both` | `desktop` \| `phone` \| `both` |
| `CWB_THEME` | `both` | `daymode` \| `darkmode` \| `both` |

## After changing pages / routes

Edit **`pages.mjs`**: add/remove entries, update `route`, `persona`, `dir`, or set `stretch: true`. Then re-run regenerate.

Personas map to Hardhat-style demo wallets used by `/api/auth/dev-login`.

## Files

| File | Role |
|------|------|
| `capture-page-svgs.mjs` | Capture + SVG wrap + `00-index.md` |
| `pages.mjs` | Page list + personas |
| `regenerate.sh` | Health-check then run capture |

Legacy alias: `node scripts/capture-page-svgs.mjs` forwards here.
