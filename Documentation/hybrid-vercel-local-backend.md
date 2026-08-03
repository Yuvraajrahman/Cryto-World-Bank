# Vercel frontend + local backend (laptop-only stack)

Use the **hosted UI** at https://cryto-world-bank.vercel.app while **Postgres, API, ML, and LLM/agent** run on your Mac when it is on. When the Mac is off, the app **automatically falls back** to the cloud API + Neon.

## Failover (Mac primary → Neon backup)

The frontend checks your Mac tunnel with `GET /health` on load. If it responds, all API calls go to your laptop. If not, they go to `https://cryto-world-bank-api.vercel.app` (Neon).

| Mode | When | Users in admin panel |
|------|------|----------------------|
| **Local (Mac)** | Laptop on + tunnel + backend running | ~28,747 (testing seed) |
| **Cloud (Neon)** | Mac off or tunnel down | ~9 (demo seed) |

**Note:** These are two separate databases — not live-synced by default. Enable auto-sync below so Neon updates when your Mac is on.

### Auto-sync Mac → Neon (when laptop server starts)

Add to `backend/.env`:

```env
SYNC_NEON_ON_START=1
NEON_SYNC_URL=postgresql://...   # Neon direct/unpooled URL
SYNC_NEON_INTERVAL_MS=1800000    # optional: re-sync every 30 min while Mac is on
```

Get the Neon URL: `cd backend && vercel env pull .env.vercel --environment=production` → use `DATABASE_URL_UNPOOLED`.

When you run `npm run dev`, the API pushes local Postgres → Neon in the background after ~5s. Manual: `NEON_SYNC_URL='...' npm run db:sync:neon`.

**Synced:** Postgres (users, banks, institutions, capital, …). **Not synced:** in-memory demo loans, Hardhat chain, Ollama/ML (Mac-only).

First full sync (~28k users) may take **10–20+ minutes**.

### Vercel environment variables

| Name | Example | Purpose |
|------|---------|---------|
| `VITE_API_PRIMARY_URL` | `https://abc123.ngrok-free.app` | HTTPS tunnel → Mac `:4000` |
| `VITE_API_FALLBACK_URL` | `https://cryto-world-bank-api.vercel.app` | Cloud API (optional; this is the default) |

Redeploy frontend after changing tunnel URL (`git push main` or `vercel deploy --prod`).

---

## Why you cannot point Vercel directly at `localhost`

The browser blocks `https://cryto-world-bank.vercel.app` → `http://localhost:4000` (Private Network Access / loopback). That is the CORS/loopback error you saw earlier.

**Fix:** expose your local API with an **HTTPS tunnel** (ngrok or Cloudflare Tunnel). The Vercel site calls the tunnel URL; the tunnel forwards to `:4000` on your laptop.

```
Browser → cryto-world-bank.vercel.app (UI)
       → https://YOUR-TUNNEL.example.com/api/... (HTTPS)
       → your laptop :4000 (Express)
       → Docker Postgres :5432
       → ml-service :8000, Ollama :11434 (agent)
```

Neon / `cryto-world-bank-api.vercel.app` are **not used** in this mode.

---

## 1. Start local stack (every time you demo)

```bash
# Terminal 1 — Postgres
docker compose up -d

# Terminal 2 — API (uses backend/.env → local DATABASE_URL)
cd backend && npm run dev

# Terminal 3 — optional ML scoring
npm run ml:dev

# Terminal 4 — optional LLM for /api/agent (Ollama)
# ollama serve && ollama pull qwen3:8b
```

Ensure local DB is seeded (full testing world):

```bash
cd backend && npm run db:seed:testing
```

---

## 2. Expose API with a tunnel

### Option A — ngrok (quick; URL changes on free tier)

```bash
ngrok http 4000
```

Copy the **HTTPS** URL, e.g. `https://abc123.ngrok-free.app`

### Option B — Cloudflare Tunnel (stable URL; recommended for repeat demos)

```bash
brew install cloudflared
cloudflared tunnel --url http://127.0.0.1:4000
```

Use the printed `*.trycloudflare.com` HTTPS URL (or configure a named tunnel for a fixed hostname).

---

## 3. Point Vercel frontend at your tunnel

In [Vercel → cryto-world-bank → Settings → Environment Variables](https://vercel.com):

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_API_BASE_URL` | `https://YOUR-TUNNEL-URL` (no trailing slash) | Production (and Preview if needed) |

**Important:** `VITE_*` vars are baked in at **build time**. After changing the tunnel URL:

```bash
cd /path/to/Cryto-World-Bank
vercel deploy --prod --yes
```

Or push any commit to `main` to trigger a Git deploy.

When `VITE_API_BASE_URL` is set, the app calls your tunnel directly (CORS is already allowed for `*.vercel.app` on the local API).

You can ignore or disconnect the **cryto-world-bank-api** Vercel project and Neon for this workflow.

---

## 4. Verify

1. Tunnel running, backend shows `listening on :4000`
2. `curl https://YOUR-TUNNEL/health` → `{"status":"ok",...}`
3. Open https://cryto-world-bank.vercel.app/login
4. Super Admin: `admin@gmail.com` / `i_am_admin` (local seed)
5. Admin panel should show **~28k users** (local Postgres)

---

## 5. Helper script

From repo root:

```bash
./scripts/local-hybrid-demo.sh
```

Starts Postgres check + reminds you to run backend, ngrok, and Vercel env steps.

---

## Limitations

| Topic | Note |
|--------|------|
| Laptop must be on | API/DB/agent stop when you shut down |
| Tunnel URL | Free ngrok URL changes each restart → update Vercel env + redeploy |
| Security | Tunnel exposes your API to the internet — demo/dev only |
| Other devices | Any device can use the Vercel UI if tunnel is up (not only localhost) |
| Hardhat | Local chain `:8547` only on your machine unless you tunnel it too |

---

## Switch back to full cloud (Neon + Vercel API)

1. Remove or clear `VITE_API_BASE_URL` on Vercel
2. Restore `frontend/vercel.json` rewrites to `https://cryto-world-bank-api.vercel.app`
3. Redeploy frontend
4. Use Neon `DATABASE_URL` on the API project
