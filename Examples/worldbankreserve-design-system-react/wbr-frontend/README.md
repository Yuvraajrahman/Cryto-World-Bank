# WorldBankReserve — Frontend Design System (Page A.1, mobile-first)

React reference build implementing `/design.md` — the mobile-first, liquid-glass
design system for the whole 47-page platform. This package supersedes the
earlier landing-only conversion: same visual identity (dark void canvas, gold
+ signal-blue duotone, Fraunces/Inter/JetBrains Mono), rebuilt mobile-first
with the native-app motion language `design.md` specifies, plus a set of
shared primitives (toast system, bottom sheet, tx status stepper, form field,
tab bar) ready for the remaining 46 pages.

Not a scaffolded app on its own (no `package.json`/build config) — drop the
`src/` folder into an existing Vite or Next.js project.

## Read this first

**`/design.md`** (one level up from this README, alongside
`frontend-development-plan.md`) is the actual design spec: color system,
type scale, the glass elevation model, motion tokens, navigation patterns,
and a full component inventory. This README is just the "where things live
and how to wire them up" companion — build decisions belong in `design.md`,
not here.

## Structure

```
src/
├── styles/
│   ├── tokens.css           # every design token: color, type, spacing, motion, breakpoints
│   └── global.css           # mobile-first base styles + shared component classes, imports tokens.css
├── hooks/
│   ├── useReserveSummary.js     # placeholder data hook → swap for real API call
│   ├── useWalletConnection.js   # placeholder wallet hook → swap for wagmi/RainbowKit
│   ├── useScrollReveal.js       # shared scroll-in animation, used on every page
│   ├── useMediaQuery.js         # matchMedia helper (useIsDesktop, useHasHover)
│   ├── useGlassTilt.js          # desktop-only 3D "liquid glass" pointer tilt
│   ├── useLockBodyScroll.js     # locks background scroll while a sheet/menu is open
│   └── useCarouselIndex.js      # dot-pagination sync for mobile snap-carousels
├── data/
│   └── mockReserveSummary.js    # mock data shaped like the real API response
├── components/
│   ├── ui/          # Glass, Button, Icon, LogoMark, Badge, StatCard, CarouselDots,
│   │                 # StateMessage, Toast/ToastProvider/useToast, Sheet, Input, StatusStepper
│   ├── layout/       # Navbar, MobileMenuSheet, Footer, StickyMobileCTA, TabBar
│   └── landing/      # Hero, TierCascade, ProductGrid, TransparencySection, FinalCTA — page-A.1-only
└── pages/
    └── LandingPage.jsx      # composes the above → maps to route `/`
```

## What's page-specific vs. reusable

Everything in `components/ui/` and `components/layout/` is meant to outlive
this one page — it's the shared vocabulary `design.md` §10 documents.
`components/landing/` is Page A.1 only. When you build page A.2 (About), its
sections go in a new `components/about/` folder; anything from it that turns
out to be reused 3+ times moves up into `ui/`, per the convention in
`design.md` §13.

### Components built but not rendered on the landing page

A few primitives exist because `frontend-development-plan.md`'s
"Shared / Global Elements" section calls for them everywhere, even though
Page A.1 itself doesn't need them yet. They're included so the *next* page
that needs them doesn't have to invent the pattern:

- **`ui/Sheet.jsx`** — generic bottom sheet, for the first confirm/filter
  flow (loan confirmation, KYC document picker, etc).
- **`ui/Input.jsx`** — glass text field, for Registration/KYC (pages 5–7).
- **`ui/StatusStepper.jsx`** — the mandatory 5-state tx machine
  (idle→signing→pending→success→error), for the first on-chain action.
- **`layout/TabBar.jsx`** — the authenticated-app-shell bottom nav, for the
  first page after login (Client Home Dashboard, page 10).

`ui/Toast.jsx` *is* wired in and demonstrated live: connecting a wallet from
either the navbar or the mobile menu fires a success toast.

## Mobile-first, specifically

This isn't "responsive" in the shrink-the-desktop-layout sense — every rule
in `global.css` is written for a phone viewport first and enhanced upward.
Concretely, on the landing page:

- **Nav**: mobile gets a compact glass bar (logo + menu button) that opens a
  full-screen `MobileMenuSheet`; desktop (1024px+) gets the full inline pill
  nav with links + CTA.
- **Hero**: CTAs stack full-width on mobile, sit side-by-side from 640px up.
- **Tier cascade**: the "capital narrows through four tiers" funnel reads via
  inset margins in a single column on mobile, and via explicit card widths
  in the original desktop layout — see `design.md` §10.
- **Product grid & stat row**: horizontal scroll-snap carousels with dot
  pagination on mobile, static grids on desktop (1024px+).
- **Sticky mobile CTA**: a floating "Connect Wallet" pill appears once the
  hero scrolls out of view, mobile/tablet only.
- **3D tilt**: the liquid-glass pointer lean on cards only runs on devices
  with real hover + a precise pointer — it's a no-op on touch by design, not
  an oversight (`useGlassTilt`, gated by `useHasHover`).

## Wiring in real data (unchanged from the previous build)

**`hooks/useReserveSummary.js`** — replace the mock `setTimeout` block with:
```js
const res = await fetch('/api/public/reserve-summary');
if (!res.ok) throw new Error('reserve summary unavailable');
const data = await res.json();
```
Keep the response shape aligned with `data/mockReserveSummary.js` —
`TransparencySection.jsx` already handles loading/error/success and needs no
changes.

**`hooks/useWalletConnection.js`** — replace the mock `connect`/internals with
wagmi (or your connector of choice):
```js
import { useAccount, useConnect, useDisconnect } from 'wagmi';
```
Keep the returned shape (`status`, `address`, `connect`, `disconnect`)
identical — `Navbar.jsx`, `MobileMenuSheet.jsx`, and every future page that
reads wallet state won't need to change. `connect()` resolves to
`{ ok, error? }`, which `Navbar` already uses to fire the success toast —
keep that resolution shape too.

## Fonts

Add these to your app's root `<head>` (`index.html` for Vite, or
`app/layout.js` for Next's App Router) — component files can't inject into
`<head>` on their own:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

For a true native-app feel in a installed/PWA context, also set a
`viewport-fit=cover` meta tag so the safe-area-inset env() variables this
system relies on (navbar, sheets, sticky CTA, tab bar) actually resolve
against the device's notch/home-indicator geometry:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Routing

```jsx
// React Router
<Route path="/" element={<LandingPage />} />

// Next.js App Router — app/page.js
export { default } from '../src/pages/LandingPage';
```

## Building the next 46 pages

1. Read `design.md` in full once — it's the spec for every decision below.
2. Check `design.md` §11 for which existing template/pattern the page's
   plan-group starts from.
3. Reuse everything in `ui/`/`layout/` as-is. Only add a new primitive there
   if `design.md` §10 doesn't already have one that fits.
4. If a page needs a genuinely new pattern (the AI Agent chat UI is the
   clearest example — nothing here covers chat bubbles yet), design it
   against the existing tokens (`tokens.css`) and *add it back into
   `design.md`* so the next page benefits too. This document and the design
   system should grow together, not drift apart.
