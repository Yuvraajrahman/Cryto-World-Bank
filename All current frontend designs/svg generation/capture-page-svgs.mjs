/**
 * Capture WBR pages → SVG (embedded PNG + footer URL) for defence slides.
 *
 * Usage (from repo root):
 *   ./All\ current\ frontend\ designs/svg\ generation/regenerate.sh
 *   ./All\ current\ frontend\ designs/svg\ generation/regenerate.sh both both
 *   CWB_PROFILE=phone CWB_THEME=darkmode node ".../capture-page-svgs.mjs"
 *
 * Requires: API on :4000, Vite on :5173, Playwright + Chrome.
 * Edit page list in ./pages.mjs after UI route changes.
 *
 * Filenames: `NN-slug_{desktop|phone}_{daymode|darkmode}.svg`
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

/** iPhone 17 Pro: 1206×2622 @ 460 ppi (3×) → 402×874 CSS points */
const DEVICES = {
  desktop: {
    id: "desktop",
    label: "Desktop",
    cssW: 1440,
    cssH: 864,
    dpr: 1,
    footer: 36,
    isMobile: false,
    fileSuffix: "_desktop",
    userAgent: undefined,
  },
  phone: {
    id: "phone",
    label: "iPhone 17 Pro",
    cssW: 402,
    cssH: 874,
    dpr: 3,
    footer: 72,
    isMobile: true,
    fileSuffix: "_phone",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1",
  },
};

/** Maps to `wbr-theme-pref` / `data-theme` (light | dark) */
const THEMES = {
  daymode: {
    id: "daymode",
    label: "Day",
    fileSuffix: "_daymode",
    pref: "light",
    colorScheme: "light",
  },
  darkmode: {
    id: "darkmode",
    label: "Dark",
    fileSuffix: "_darkmode",
    pref: "dark",
    colorScheme: "dark",
  },
};

function resolveDevices() {
  const raw = (process.env.CWB_PROFILE || "both").toLowerCase().trim();
  if (raw === "phone" || raw === "iphone" || raw === "mobile") return [DEVICES.phone];
  if (raw === "desktop") return [DEVICES.desktop];
  return [DEVICES.desktop, DEVICES.phone];
}

function resolveThemes() {
  const raw = (process.env.CWB_THEME || "both").toLowerCase().trim();
  if (raw === "day" || raw === "daymode" || raw === "light") return [THEMES.daymode];
  if (raw === "dark" || raw === "darkmode" || raw === "night") return [THEMES.darkmode];
  return [THEMES.daymode, THEMES.darkmode];
}

function escXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgSize(device) {
  const W = Math.round(device.cssW * device.dpr);
  const imgH = Math.round(device.cssH * device.dpr);
  const H = imgH + device.footer;
  return { W, H, imgH };
}

function wrapSvg(device, theme, { pngBase64, url, title, pageNum }) {
  const { W, H, imgH } = svgSize(device);
  const fontMain = device.isMobile ? 28 : 13;
  const fontMeta = device.isMobile ? 24 : 12;
  const padX = device.isMobile ? 36 : 24;
  const textY = imgH + Math.round(device.footer * 0.62);
  const meta = [device.isMobile ? "iPhone 17 Pro" : "Desktop", theme.label].filter(Boolean).join(" · ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${escXml(`${pageNum}. ${title} · ${meta}`)}</title>
  <rect width="100%" height="100%" fill="#05070c"/>
  <image x="0" y="0" width="${W}" height="${imgH}" preserveAspectRatio="xMidYMin slice" xlink:href="data:image/png;base64,${pngBase64}"/>
  <rect x="0" y="${imgH}" width="${W}" height="${device.footer}" fill="#0a0e18"/>
  <text x="${padX}" y="${textY}" font-family="JetBrains Mono, ui-monospace, monospace" font-size="${fontMain}" fill="#c9a227">${escXml(url)}</text>
  <text x="${W - padX}" y="${textY}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="${fontMeta}" fill="#8b93a7">${escXml(`p.${pageNum} · ${title} · ${meta}`)}</text>
</svg>
`;
}

function placeholderSvg(device, theme, { url, title, pageNum, note = "Stretch / not in defence demo (Section M)" }) {
  const { W, H } = svgSize(device);
  const cx = W / 2;
  const titleSize = device.isMobile ? 42 : 36;
  const noteSize = device.isMobile ? 28 : 18;
  const subSize = device.isMobile ? 24 : 15;
  const boxW = Math.min(W - 80, device.isMobile ? W - 64 : 1200);
  const boxX = (W - boxW) / 2;
  const boxY = H * 0.28;
  const boxH = H * 0.32;
  const meta = [device.isMobile ? "iPhone 17 Pro" : "Desktop", theme.label].join(" · ");
  const fontMain = device.isMobile ? 28 : 13;
  const fontMeta = device.isMobile ? 24 : 12;
  const padX = device.isMobile ? 36 : 24;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#05070c"/>
      <stop offset="100%" stop-color="#121826"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.45)"/>
  <text x="${cx}" y="${boxY + boxH * 0.35}" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="${titleSize}" fill="#f3f5f9">${escXml(title)}</text>
  <text x="${cx}" y="${boxY + boxH * 0.52}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${noteSize}" fill="#c9a227">${escXml(note)}</text>
  <text x="${cx}" y="${boxY + boxH * 0.68}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${subSize}" fill="#8b93a7">${escXml(meta)}</text>
  <rect x="0" y="${H - device.footer}" width="${W}" height="${device.footer}" fill="#0a0e18"/>
  <text x="${padX}" y="${H - Math.round(device.footer * 0.35)}" font-family="JetBrains Mono, ui-monospace, monospace" font-size="${fontMain}" fill="#c9a227">${escXml(url)}</text>
  <text x="${W - padX}" y="${H - Math.round(device.footer * 0.35)}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="${fontMeta}" fill="#8b93a7">${escXml(`p.${pageNum} · ${meta}`)}</text>
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

async function capturePages(browser, device, theme, pages, sessionCache) {
  const indexRows = [];
  const runLabel = `${device.label} · ${theme.label}`;
  console.log(
    `\n── ${runLabel} (${device.cssW}×${device.cssH} CSS @${device.dpr}×, theme=${theme.pref}) ──`,
  );

  for (const page of pages) {
    const dir = path.join(OUT, page.dir);
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${String(page.n).padStart(2, "0")}-${page.slug}${device.fileSuffix}${theme.fileSuffix}.svg`;
    const outPath = path.join(dir, fileName);
    const url = `${FE}${page.route}`;

    if (page.stretch) {
      fs.writeFileSync(outPath, placeholderSvg(device, theme, { url, title: page.title, pageNum: page.n }));
      indexRows.push(
        `| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | ${runLabel} stretch placeholder |`,
      );
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

      const ctxOpts = {
        viewport: { width: device.cssW, height: device.cssH },
        deviceScaleFactor: device.dpr,
        colorScheme: theme.colorScheme,
        isMobile: device.isMobile,
        hasTouch: device.isMobile,
      };
      if (device.userAgent) ctxOpts.userAgent = device.userAgent;

      const ctx = await browser.newContext(ctxOpts);
      await ctx.addInitScript(
        ({ pref }) => {
          try {
            localStorage.setItem("wbr-theme-pref", pref);
          } catch {
            /* ignore */
          }
          document.documentElement.setAttribute("data-theme", pref);
          document.documentElement.style.colorScheme = pref;
        },
        { pref: theme.pref },
      );
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
      const buf = await p.screenshot({ type: "png", fullPage: false, timeout: 60000 });
      fs.writeFileSync(
        outPath,
        wrapSvg(device, theme, {
          pngBase64: buf.toString("base64"),
          url,
          title: page.title,
          pageNum: page.n,
        }),
      );
      await ctx.close();
      indexRows.push(
        `| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | ${runLabel} captured |`,
      );
      console.log("ok", fileName);
    } catch (err) {
      console.error("FAIL", fileName, err.message);
      fs.writeFileSync(
        outPath,
        placeholderSvg(device, theme, {
          url,
          title: page.title,
          pageNum: page.n,
          note: `Capture failed: ${err.message}`,
        }),
      );
      indexRows.push(
        `| ${page.n} | ${page.title} | \`${page.route}\` | \`${page.dir}/${fileName}\` | ${runLabel} capture failed → placeholder |`,
      );
    }
  }

  return indexRows;
}

async function main() {
  const devices = resolveDevices();
  const themes = resolveThemes();
  console.log("OUT →", OUT);
  console.log("ROOT →", ROOT);
  console.log(
    "Devices →",
    devices.map((d) => d.id).join(", "),
  );
  console.log(
    "Themes →",
    themes.map((t) => t.id).join(", "),
  );
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
  const allRows = [];

  for (const device of devices) {
    for (const theme of themes) {
      const rows = await capturePages(browser, device, theme, pages, sessionCache);
      allRows.push(...rows);
    }
  }

  await browser.close();

  const runNote = `${devices.map((d) => d.label).join(" + ")} × ${themes.map((t) => t.label).join(" + ")}`;
  const index = `# Frontend design SVG index

Local app base: \`${FE}\`

Generated: ${new Date().toISOString()}

Regenerator: \`All current frontend designs/svg generation/\`

This run: **${runNote}**

| # | Page | Route | SVG | Notes |
|---|------|-------|-----|-------|
${allRows.join("\n")}

## Naming

\`NN-slug_{desktop|phone}_{daymode|darkmode}.svg\`

| Piece | Values |
|-------|--------|
| Device | \`desktop\` (1440×864 CSS) · \`phone\` (iPhone 17 Pro 402×874 @3× → 1206×2622) |
| Theme | \`daymode\` (light) · \`darkmode\` (dark) |

## Env

| Var | Default | Purpose |
|-----|---------|---------|
| \`CWB_PROFILE\` | \`both\` | \`desktop\` \| \`phone\` \| \`both\` |
| \`CWB_THEME\` | \`both\` | \`daymode\` \| \`darkmode\` \| \`both\` |
| \`CWB_FE_URL\` | \`http://127.0.0.1:5173\` | Frontend |
| \`CWB_API_URL\` | \`http://127.0.0.1:4000\` | API |

## Folder map (thesis phases)

- \`Phase-I-Foundation/\` — public shell (Examples A)
- \`Phase-II-Core-Banking/\` — onboarding, retail, groups, deposits, bank ops (B–G, I–K)
- \`Phase-III-AI-and-Agent/\` — agent + chat (H)
- \`Phase-IV-Verification/\` — regulator audit (L)
- \`Stretch-M-Not-In-Demo/\` — pages 44–47 placeholders
- \`Legacy-Extra-Routes/\` — old AppLayout chrome (not in Examples 1–43)
- \`svg generation/\` — capture scripts (this tooling)

Each SVG embeds a static capture and shows the **localhost URL** in the footer strip.
`;
  fs.writeFileSync(path.join(OUT, "00-index.md"), index);
  console.log("Wrote", path.join(OUT, "00-index.md"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
