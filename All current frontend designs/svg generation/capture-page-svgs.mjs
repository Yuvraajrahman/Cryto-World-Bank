/**
 * Capture WBR pages → SVG (embedded PNG + footer URL) for defence slides.
 *
 * Usage (from repo root):
 *   node "All current frontend designs/svg generation/capture-page-svgs.mjs"
 *
 * Or:
 *   ./All\ current\ frontend\ designs/svg\ generation/regenerate.sh
 *
 * Requires: API on :4000, Vite on :5173, Playwright + Chrome.
 * Edit page list in ./pages.mjs after UI route changes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PERSONAS, PAGES } from "./pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Parent of this folder = All current frontend designs */
const OUT = path.resolve(__dirname, "..");
/** Repo root (two levels up from svg generation) */
const ROOT = path.resolve(__dirname, "../..");

const FE = process.env.CWB_FE_URL || "http://127.0.0.1:5173";
const API = process.env.CWB_API_URL || "http://127.0.0.1:4000";

const W = 1440;
const H = 900;
const FOOTER = 36;

function escXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapSvg({ pngBase64, url, title, pageNum }) {
  const imgH = H - FOOTER;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${escXml(`${pageNum}. ${title}`)}</title>
  <rect width="100%" height="100%" fill="#05070c"/>
  <image x="0" y="0" width="${W}" height="${imgH}" preserveAspectRatio="xMidYMin slice" xlink:href="data:image/png;base64,${pngBase64}"/>
  <rect x="0" y="${imgH}" width="${W}" height="${FOOTER}" fill="#0a0e18"/>
  <text x="24" y="${imgH + 23}" font-family="JetBrains Mono, ui-monospace, monospace" font-size="13" fill="#c9a227">${escXml(url)}</text>
  <text x="${W - 24}" y="${imgH + 23}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#8b93a7">${escXml(`p.${pageNum} · ${title}`)}</text>
</svg>
`;
}

function placeholderSvg({ url, title, pageNum, note = "Stretch / not in defence demo (Section M)" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#05070c"/>
      <stop offset="100%" stop-color="#121826"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="120" y="220" width="1200" height="420" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.45)"/>
  <text x="720" y="320" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="36" fill="#f3f5f9">${escXml(title)}</text>
  <text x="720" y="370" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#c9a227">${escXml(note)}</text>
  <text x="720" y="420" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#8b93a7">See footer for local route</text>
  <rect x="0" y="${H - FOOTER}" width="${W}" height="${FOOTER}" fill="#0a0e18"/>
  <text x="24" y="${H - 13}" font-family="JetBrains Mono, ui-monospace, monospace" font-size="13" fill="#c9a227">${escXml(url)}</text>
  <text x="${W - 24}" y="${H - 13}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#8b93a7">${escXml(`p.${pageNum}`)}</text>
</svg>
`;
}

async function login(personaKey, attempt = 0) {
  const p = PERSONAS[personaKey];
  if (!p) return null;
  try {
    const r = await fetch(`${API}/api/auth/dev-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: p.wallet, role: p.role }),
    });
    if (!r.ok) throw new Error(`dev-login failed for ${personaKey}: ${r.status}`);
    return r.json();
  } catch (err) {
    if (attempt < 6) {
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
      return login(personaKey, attempt + 1);
    }
    throw err;
  }
}

async function resolveLoanId() {
  const sess = await login("borrower");
  const r = await fetch(`${API}/api/loans/mine`, {
    headers: { Authorization: `Bearer ${sess.token}` },
  });
  const j = await r.json();
  const loans = j.loans || [];
  return loans.find((l) => l.status === "ACTIVE")?.id || loans[0]?.id || "loan_1024";
}

async function waitForApi() {
  for (let i = 0; i < 30; i++) {
    try {
      const h = await fetch(`${API}/health`);
      if (h.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("API not reachable on " + API);
}

async function waitForFrontend() {
  for (let i = 0; i < 30; i++) {
    try {
      const h = await fetch(FE);
      if (h.ok || h.status === 304) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Frontend not reachable on " + FE);
}

async function main() {
  console.log("OUT →", OUT);
  console.log("ROOT →", ROOT);
  fs.mkdirSync(OUT, { recursive: true });
  await waitForApi();
  await waitForFrontend();

  const pages = PAGES.map((p) => ({ ...p }));
  const loanId = await resolveLoanId();
  console.log("using loanId", loanId);
  for (const page of pages) {
    if (page.route.includes("__LOAN_ID__")) {
      page.route = page.route.replaceAll("__LOAN_ID__", loanId);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.CWB_PW_CHANNEL || "chrome",
  });
  const sessionCache = new Map();
  const indexRows = [];

  for (const page of pages) {
    const dir = path.join(OUT, page.dir);
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${String(page.n).padStart(2, "0")}-${page.slug}.svg`;
    const outPath = path.join(dir, fileName);
    const url = `${FE}${page.route}`;

    if (page.stretch) {
      fs.writeFileSync(outPath, placeholderSvg({ url, title: page.title, pageNum: page.n }));
      indexRows.push(`| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | Stretch placeholder |`);
      console.log("placeholder", fileName);
      continue;
    }

    try {
      let session = null;
      if (page.persona !== "anon") {
        if (!sessionCache.has(page.persona)) {
          sessionCache.set(page.persona, await login(page.persona));
        }
        session = sessionCache.get(page.persona);
      }

      const ctx = await browser.newContext({
        viewport: { width: W, height: H - FOOTER },
        deviceScaleFactor: 1,
        colorScheme: "light",
      });
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem("wbr-theme-pref", "light");
        } catch {
          /* ignore */
        }
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
      });
      if (session) {
        await ctx.addInitScript(
          ({ token, user }) => {
            localStorage.setItem(
              "cwb-session",
              JSON.stringify({
                state: { token, role: user.role, user },
                version: 0,
              }),
            );
          },
          { token: session.token, user: session.user },
        );
      }
      const p = await ctx.newPage();
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.waitForTimeout(1500);
      const overlayCount = await p.locator("vite-error-overlay").count();
      if (overlayCount > 0) {
        const msg = await p
          .locator("vite-error-overlay")
          .first()
          .innerText()
          .catch(() => "vite-error-overlay");
        throw new Error(`Vite overlay on ${page.route}: ${String(msg).slice(0, 180)}`);
      }
      const bodyText = await p.locator("body").innerText();
      if (/Failed to resolve import|plugin:vite:import-analysis/.test(bodyText)) {
        throw new Error("Vite overlay text still present on " + page.route);
      }
      const buf = await p.screenshot({ type: "png", fullPage: false });
      fs.writeFileSync(
        outPath,
        wrapSvg({
          pngBase64: buf.toString("base64"),
          url,
          title: page.title,
          pageNum: page.n,
        }),
      );
      await ctx.close();
      indexRows.push(`| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | Captured |`);
      console.log("ok", fileName);
    } catch (err) {
      console.error("FAIL", fileName, err.message);
      fs.writeFileSync(
        outPath,
        placeholderSvg({
          url,
          title: page.title,
          pageNum: page.n,
          note: `Capture failed: ${err.message}`,
        }),
      );
      indexRows.push(`| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | Capture failed → placeholder |`);
    }
  }

  await browser.close();

  const index = `# Frontend design SVG index

Local app base: \`${FE}\`

Generated: ${new Date().toISOString()}

Regenerator: \`All current frontend designs/svg generation/\`

| # | Page | Route | SVG | Notes |
|---|------|-------|-----|-------|
${indexRows.join("\n")}

## Folder map (thesis phases)

- \`Phase-I-Foundation/\` — public shell (Examples A)
- \`Phase-II-Core-Banking/\` — onboarding, retail, groups, deposits, bank ops (B–G, I–K)
- \`Phase-III-AI-and-Agent/\` — agent + chat (H)
- \`Phase-IV-Verification/\` — regulator audit (L)
- \`Stretch-M-Not-In-Demo/\` — pages 44–47 placeholders
- \`Legacy-Extra-Routes/\` — old AppLayout chrome (not in Examples 1–43)
- \`svg generation/\` — capture scripts (this tooling)

Each SVG embeds a static desktop capture and shows the **localhost URL** in the footer strip.
`;
  fs.writeFileSync(path.join(OUT, "00-index.md"), index);
  console.log("Wrote", path.join(OUT, "00-index.md"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
