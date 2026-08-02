# WorldBankReserve — Design System

**Purpose of this document:** companion to `frontend-development-plan.md`. That
document is the content-and-functionality spec for all 47 pages with
deliberately *no* visual direction. This document is the other half: every
visual, material, motion, and layout decision, so any page in the plan can be
built consistently without re-deciding the fundamentals each time. Where the
plan says *what* a page needs to show and let a person do, this says *how it
should look and feel* doing it.

**Source of truth:** `/wbr-frontend/src/styles/tokens.css` and `global.css` in
the accompanying reference build implement everything below exactly — if this
document and the CSS ever disagree, the CSS is probably stale and should be
updated to match, not the other way around.

**Status:** Page A.1 (Landing / Home) is built end-to-end against this system,
mobile-first, and is the reference for the other 46. See the companion
`wbr-frontend` React source for the working implementation.

---

## Table of Contents

1. Design north star
2. Mobile-first principle & breakpoints
3. Layout, grid & spacing
4. Color system
5. Typography system
6. The liquid-glass material system
7. Iconography
8. Motion & interaction system
9. Navigation patterns
10. Component inventory
11. Page templates, mapped to the plan's page groups
12. Accessibility & performance
13. File & naming conventions
14. Do's and don'ts

---

## 1. Design north star

**"Capital, held in the open — on a phone in your hand."**

WorldBankReserve is an on-chain, tiered banking system. The thing that makes
it trustworthy is *transparency*: every balance, rate, and decision is
inspectable. The thing that makes it usable is that most people will use it
from a phone, one-handed, in short sessions — checking a balance, approving a
loan step, glancing at reserve health.

Those two facts point at the same material: **glass**. Glass is transparent —
it shows what's behind it, which is the whole trust story of the product —
and it's also the literal design language Apple standardized across iOS,
iPadOS, and macOS as "Liquid Glass": a translucent material that refracts and
reflects its surroundings, reacts to touch and motion, and adapts between
light and dark contexts. We're borrowing that material honestly, not just its
name — same reasons to use it (content-forward, contextual, tactile), applied
to a dark, premium fintech palette instead of Apple's default light one.

The existing landing-page mockup already found the right voice: void-black
canvas, warm gold for action and trust, cool signal-blue for data and system
state, Fraunces serif for moments that should feel considered, Inter for
everything functional, JetBrains Mono for anything that's a number, a label,
or a fact. **Nothing about that voice changes in this document** — this
document is about disciplining it for a phone screen and giving it the
motion language to feel like a native app instead of a scrolled webpage.

## 2. Mobile-first principle & breakpoints

Every rule in the stylesheet is written for a base (mobile) viewport first,
then progressively enhanced with `min-width` media queries. Nothing is
written desktop-first and shrunk down — that's the single biggest reason
"responsive" sites still feel like a website on a phone instead of an app.

| Token | Width | Represents |
|---|---|---|
| *(base, no query)* | 0–639px | Phones, portrait — the primary target |
| `sm` | ≥640px | Large phones landscape / small tablets |
| `md` | ≥768px | Tablets |
| `lg` | ≥1024px | Small laptops and up — desktop nav pattern switches on here |
| `xl` | ≥1280px | Wide desktop — content hits its max-width, nothing new happens |

Two behaviors specifically gate on `lg` (1024px), not just layout:
- **Navigation pattern** — compact glass bar + full-screen menu sheet below
  1024px; full inline pill nav with links + CTA at 1024px and above (§9).
- **3D pointer tilt** — the liquid-glass hover lean only activates on
  `(hover: hover) and (pointer: fine)` devices, which in practice means
  desktop trackpads/mice. It never fires from a touch event (§8).

## 3. Layout, grid & spacing

- **Spacing scale** (4px base): `4·8·12·16·20·24·32·40·48·64·80·96px`
  (`--sp-1` … `--sp-12`). Pick from this scale; don't invent one-off values.
- **Section rhythm**: `--section-pad-y` is `88px` on mobile, `150px` from
  `768px` up. Horizontal padding is `20px` mobile, `24px` desktop.
- **Container max-width**: `1120px` (`--container-max`), centered. Nothing
  needs to be wider than this even on ultrawide monitors — banking UI
  benefits from a readable measure, not full-bleed data.
- **Touch targets**: every tappable element is **44×44px minimum**
  (`--tap-min`), per Apple's Human Interface Guidelines. Icon-only buttons
  (menu, close) use the `.icon-btn` class, which enforces this by default —
  never ship a smaller custom tap target.
- **Safe areas**: fixed elements (navbar, sticky CTA, sheets, toast stack,
  tab bar) all pad against `env(safe-area-inset-*)` so nothing sits under a
  notch, Dynamic Island, or the home-indicator gesture bar. Tokens:
  `--safe-top / --safe-bottom / --safe-left / --safe-right`.

## 4. Color system

Dark mode is the *only* mode — there is no light theme. A banking product
built around a void-black canvas with glass surfaces is the brand; a light
variant would need its own design pass, not a token swap. Note this
explicitly if a future page ever proposes a light mode.

### Canvas
| Token | Value | Use |
|---|---|---|
| `--bg-void` | `#05070c` | Page background |
| `--bg-deep` / `--bg-deep-2` | `#080c15` / `#0b111e` | Reserved for depth washes behind dense data screens (admin dashboards, tables) — not used on marketing pages |

### Glass fills
| Token | Value | Use |
|---|---|---|
| `--glass-fill` | `rgba(255,255,255,.045)` | Surface-1, resting cards |
| `--glass-fill-strong` | `rgba(255,255,255,.085)` | Hover/active fill, icon wells |
| `--glass-fill-elevated` | `rgba(13,17,27,.72)` | Surface-3, sheets/menus/overlays |
| `--glass-border` / `--glass-border-strong` | `rgba(255,255,255,.10)` / `.20` | Resting / hovered-or-elevated border |
| `--glass-highlight` | `rgba(255,255,255,.55)` | The specular top hairline every glass surface gets |

### Brand accents
| Token | Value | Meaning |
|---|---|---|
| `--gold` / `--gold-bright` | `#c9a86a` / `#eed6a3` | **Primary action & trust.** Every CTA, every emphasized word in a headline, every "this is the important number" moment. |
| `--signal` / `--signal-bright` | `#6fa3ff` / `#a6c7ff` | **System & data.** Network badges, the tier-cascade pulse's second half, focus rings, links inside data contexts. Gold means "do this"; signal-blue means "here is a fact." Don't cross the streams — a blue button reads as informational, not actionable. |

### Semantic (added in this pass, for transaction/status states)
| Token | Value | Use |
|---|---|---|
| `--success` / `--success-bright` | `#6fd6ab` / `#a8ecc9` | Tx confirmed, KYC approved, audit passed |
| `--pending` / `--pending-bright` | `#f0ab3e` / `#f7c876` | Tx signing/pending, review in progress, "watch" health-factor state |
| `--danger` / `--danger-bright` | `#ff8585` / `#ffb0b0` | Tx failed, validation error, liquidation-actionable state |

Each semantic color also has a `-dim` variant at `.30` alpha for glow/shadow
use, matching the existing `--gold-dim` / `--signal-dim` pattern. These three
didn't exist in the original landing-page mockup — it never needed them,
having no transactional flows. They're required starting with Onboarding
(Group B) and every on-chain action after that (§10, Status Stepper).

### Text
| Token | Value | Use |
|---|---|---|
| `--text-1` | `#f4f5f8` | Primary content |
| `--text-2` | `#9aa3b8` | Secondary / supporting copy |
| `--text-3` | `#5c6479` | Tertiary / labels / timestamps |
| `--text-inverse` | `#1a1406` | Text on gold fills |

## 5. Typography system

Three families, three jobs. Never blur the line between them — the type
choice itself tells the person what kind of content they're looking at.

| Family | Role | Weight range | Where |
|---|---|---|---|
| **Fraunces** (serif) | Display — headlines, section titles, tier names, big stat numerals, sheet titles | 300–600, mostly 400 | Anything that should feel considered, not functional |
| **Inter** (sans) | UI — body copy, button labels, card titles, nav links, form labels | 400–700 | Everything a person reads to understand or acts on |
| **JetBrains Mono** | Data/utility — eyebrows, stat labels, badges, timestamps, addresses, tx hashes | 400–500 | Anything that's a fact, a label, or a code-like value |

### Scale (mobile → desktop, via `clamp()`)
| Role | Mobile min | Desktop max | Notes |
|---|---|---|---|
| Hero H1 | `2.35rem` (~38px) | `5.4rem` (~86px) | `clamp(2.35rem, 10vw, 5.4rem)` |
| Section title | `1.65rem` (~26px) | `2.75rem` (~44px) | `clamp(1.65rem, 6.2vw, 2.75rem)` |
| Stat numeral | `1.9rem` | `2.8rem` | `clamp(1.9rem, 7vw, 2.8rem)` |
| Body / lede | `15px` | `16–17px` | Fixed steps at breakpoints, not clamped |
| Eyebrow / mono label | `11–11.5px` | `12px` | Always uppercase, `.14–.16em` tracking |

Line-height stays tight on display type (`1.05–1.18`) and open on body copy
(`1.6–1.7`) at every size — this contrast is part of what makes Fraunces feel
editorial rather than decorative.

## 6. The liquid-glass material system

Three elevation levels. Everything in the UI is one of these three, or the
void canvas underneath all of them.

| Level | Class | Fill | Border | Blur | Used for |
|---|---|---|---|---|---|
| Canvas | — | `--bg-void` | — | — | The page itself |
| Surface-1 | `.glass` | `--glass-fill` | `--glass-border` | `26px` (`--blur-lg`), `saturate(180%)` | Resting cards: product cards, tier cards, stat tiles, badges, the navbar pill |
| Surface-2 | *(state, not a class)* | `--glass-fill-strong` | `--glass-border-strong` | same as parent | Hover/active/focused state of a surface-1 element — never a resting state on its own |
| Surface-3 | `.glass-elevated` | `--glass-fill-elevated` | `--glass-border-strong` | `40px` (`--blur-xl`), `saturate(190%)` | Anything that floats *above* page content: the mobile menu sheet, bottom sheets, toasts, the tab bar |

**Rules that make this read as "glass" instead of "translucent gray box":**
1. Every glass surface gets the top specular hairline (`.glass::before`) — a
   1px horizontal gradient highlight, inset 6% from each edge. This is what
   sells "curved refractive surface catching light" instead of "opacity: 90%
   div." Never remove it.
2. Surface-3 always sits *above* surface-1 content, never beside it at the
   same time in the same view unless one is a backdrop-dimmed overlay (a
   sheet's scrim). Don't stack two surface-3 layers.
3. **Blur budget on mobile**: `backdrop-filter` is expensive on phone GPUs.
   Cap concurrent blurred layers on screen at once to roughly 4–6 (navbar +
   visible cards). The ambient background orbs are *not* glass — they're
   pre-blurred gradients, cheaper — so they don't count against this budget.
4. Never use pure black or pure white anywhere in a glass fill or border —
   everything is alpha-over-`--bg-void`, which is how the material stays
   "translucent" instead of "flat dark gray."

### Radius language
Rounded, but not uniformly pill-shaped — different radii signal different
object types, loosely following Apple's continuous-corner ("squircle")
sensibility even though CSS can't do true superellipses:

| Token | Value | Use |
|---|---|---|
| `--r-xs` | 10px | Small chips, icon wells |
| `--r-sm` | 14px | Form fields, small controls |
| `--r-md` | 20px | Mid-size cards |
| `--r-lg` | 28px | Default card radius (`.glass`) |
| `--r-xl` | 36px | Large sheets, the top corners of a bottom sheet |
| `--r-pill` | 999px | Buttons, badges, the navbar, the tab bar |

## 7. Iconography

Single set (`components/ui/Icon.jsx`), one visual language, added to as
pages need new icons rather than inlined per-component:
- 24×24 viewBox, `stroke-width: 1.8`, round line caps/joins, `fill: none`.
- Never mix in a filled/solid icon style — everything is a line icon.
- Sizes in practice: `12px` (badge glyphs), `16–18px` (buttons, nav chevrons),
  `20px` (product icons, tab bar), `44px` tap target wrapping any icon button.

## 8. Motion & interaction system

Motion should feel like the interface has physical weight and settles into
place — never like elements are just fading in and out. Two easing curves
cover almost everything:

| Token | Curve | Feel | Used for |
|---|---|---|---|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Decisive deceleration, no overshoot | Scroll reveals, hover states, glass settling into a hover fill |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | Slight overshoot, like a released spring | Press-release feedback, sheet presentation, tab-bar indicator morph |

Duration scale: `120ms` (press feedback) → `220ms` (hover/small state) →
`420ms` (card reveal, standard) → `650ms` (sheet presentation, hero entrance).
Ambient background drift (the orbs) runs on its own 30–40s loop, intentionally
outside this scale — it should be barely perceptible, not "animated."

### The core motion patterns
1. **Scroll reveal** (`useScrollReveal`) — sections and cards fade up
   `20px → 0` as they enter the viewport, staggered by up to ~180ms across a
   row. This is the baseline entrance for almost every content block.
2. **Press feedback** — every tappable surface (`.btn`, `.icon-btn`,
   `.glass-interactive`) scales to `0.96–0.98` on `:active` with the spring
   ease. This is the single most important mobile-motion detail: without it,
   a touch interface feels unresponsive no matter how nice the hover states
   are, because touch devices don't have hover states.
3. **Liquid-glass 3D tilt** (`useGlassTilt`) — desktop-hover-only pointer
   tracking that leans a card toward the cursor (`perspective(800px)
   rotateX/rotateY`, max ~6°) and eases back flat on leave. **Deliberately a
   no-op on touch** — a tilt driven by touch coordinates just feels like
   input lag, not glass, and fights with scrolling. Touch gets press-feedback
   and scroll-reveal instead; that's its own motion language, not a lesser
   version of the desktop one.
4. **Horizontal snap carousels** — the mobile pattern for anything that was
   a grid on desktop (product cards, stat tiles): `scroll-snap-type: x
   mandatory`, each card ~72–82% of viewport width so the next card peeks,
   momentum scrolling enabled, dot pagination synced via `useCarouselIndex`.
5. **Sheet presentation** — bottom sheets and the full-screen mobile menu
   both animate in with the spring ease over `--dur-slow` (650ms): translate
   + slight scale, never a plain fade. Backdrop fades independently and
   faster.
6. **Toast** — slides up + scales in (`toast-in` keyframe, spring ease),
   auto-dismisses, colored left border by variant (success/pending/error).
7. **Status stepper pulse** — the *active* step in a transaction stepper
   gets a soft pulsing ring (`pulse-ring`, 1.6s ease-in-out loop) so
   "something is happening" reads at a glance without needing a spinner.

All of the above respects `prefers-reduced-motion: reduce` globally — every
animation and transition is disabled at the `*` level when that preference is
set (see the bottom of `global.css`). This is not optional per page; it's
handled once, globally.

## 9. Navigation patterns

Two distinct nav patterns exist in this system, for two distinct contexts.
**Don't mix them** — a page is either "public" or "authenticated app," and
the plan's Table of Contents (Groups A/B vs. C onward) tells you which.

### Public / marketing pages (Groups A, and parts of B before login)
- **Mobile (<1024px)**: a compact floating glass pill — logo + a single
  44×44 menu button. Tapping it opens `MobileMenuSheet`, a full-screen glass
  overlay (not a bottom sheet — navigation takes the whole screen, the way
  App Store/Safari nav overlays do) with large Fraunces link rows and the
  primary CTA pinned above the safe-area bottom inset.
- **Desktop (≥1024px)**: the full pill — logo, inline text links, primary
  CTA — all in one bar, unchanged from the original mockup.
- **Sticky mobile CTA**: on pages with a strong primary action (Landing),
  a floating pill CTA appears once the hero scrolls out of view, so the
  action stays in thumb reach without hunting back up to the nav. Hidden on
  desktop, where the nav's own CTA is already always visible.

### Authenticated app shell (Groups C onward — Client Dashboard, Loans, etc.)
- **Mobile**: a floating glass **tab bar** (`components/layout/TabBar.jsx`),
  4–5 items max, each an icon + label, with a single pill-shaped "liquid"
  indicator that slides and settles under the active tab using the spring
  ease — not a static underline. This is a *reference component*, not wired
  into the landing page (which has no authenticated shell), but is the
  pattern the first authenticated page should adopt.
- **Desktop**: the equivalent is a persistent sidebar or the existing top
  pill nav extended with role-based links — not specified further here since
  no authenticated page has been built yet; decide when Group C starts and
  add that decision to this document.

Both patterns share the same underlying primitives (`Glass`, `Icon`,
`Button`) — the difference is entirely structural, not material.

## 10. Component inventory

Everything below lives in `components/ui/` or `components/layout/`. Built
components are marked **built**; everything else is a documented pattern to
implement when the page that needs it comes up, using the same tokens.

| Component | Status | Notes |
|---|---|---|
| `Glass` | **Built** | The one surface primitive. `level={1\|3}`, `interactive`, `tilt` props. |
| `Button` | **Built** | Polymorphic `<a>`/`<button>`. `variant="primary\|ghost"`, `size="md\|sm"`, `block` for full-width mobile CTAs. |
| `Icon` | **Built** | Central line-icon set. |
| `LogoMark` | **Built** | Four descending bars = the tier hierarchy. |
| `Badge` | **Built** | Small glass pill; base for future status chips (KYC level, loan status). |
| `StatCard` | **Built** | Big-numeral + mono-label tile; reusable for dashboard balance tiles later. |
| `CarouselDots` | **Built** | Pagination for mobile snap-carousels. |
| `StateMessage` | **Built** | Shared error/empty state shape (icon + title + description + optional retry action) — every data-driven page needs this per the plan's Shared/Global Elements. |
| `Toast` / `ToastProvider` / `useToast` | **Built** | Global toast/alert system, mount once near the app root. Demonstrated live on the landing page (wallet-connect success). |
| `Sheet` | **Built** | Generic bottom sheet — the modal pattern for every future confirm/filter/review flow. Not used on the landing page itself. |
| `Input` | **Built** | Glass text field with label/hint/error. Not used on the landing page (no forms there); required starting at Registration (page 5). |
| `StatusStepper` | **Built** | Visual reference for the mandatory 5-state tx machine (idle→signing→pending→success→error). Required on every on-chain action page. |
| `Navbar` / `MobileMenuSheet` | **Built** | Public-page nav, §9. |
| `Footer` | **Built** | Mobile-first stacked → desktop 4-column grid. |
| `StickyMobileCTA` | **Built** | Conversion-focused mobile pattern, §9. |
| `TabBar` | **Built (reference)** | Authenticated-shell nav, §9. Not rendered on any built page yet. |
| Session/auth guard | **Documented only** | Logic, not a visual component — implement per the plan's Shared/Global Elements when routing exists. |
| Role-based nav | **Documented only** | Extend `Navbar`/`TabBar` with a `role` prop once an authenticated shell exists; don't fork them. |
| Access-denied page | **Documented only** | Should reuse `StateMessage` at full-page scale plus the standard page chrome. |
| Skeleton loader | **Built (pattern)** | `.stat-skeleton` shimmer today; generalize the shimmer gradient into a reusable `Skeleton` component once a second page needs it (dashboard balance tiles, table rows). |

## 11. Page templates, mapped to the plan's page groups

Rough guidance for which existing patterns a new page should start from.
Update this table as real pages get built and templates solidify.

| Plan group | Template starting point |
|---|---|
| **A. Public** (Landing built; About, Reserve Dashboard, Login) | Public nav pattern (§9), `.section` rhythm, glass cards, scroll-reveal. Reserve Dashboard reuses `StatCard` + `Badge` heavily. |
| **B. Onboarding** (Registration → KYC → Consent → Complete) | A step-flow template: progress indicator up top (reuse `StatusStepper`'s visual language, relabeled per step name rather than tx state), one `Sheet` or full-page `Input` form per step, primary CTA pinned bottom (`.btn-block`), public nav suppressed in favor of a minimal back/step-count header. |
| **C. Client core** (Dashboard, Settings, Notifications) | Authenticated shell: `TabBar` + a top bar showing wallet/notification state (per plan's Shared/Global Elements). Dashboard leads with `StatCard` tiles in a mobile snap-row, same pattern as the landing page's transparency section. |
| **D–F. Lending, Group Lending, Deposits** | Form pages use `Input` + `Sheet` for confirmation; any submission uses `StatusStepper`. List pages (Loan History, transactions) are stacked glass list rows on mobile — don't reach for a literal `<table>` below 1024px. |
| **G. Credit Passport** | A single hero-style glass card (like `.final-cta-card`) presenting the SBT as an identity object, not a data table. |
| **H. Agent & Support** | Chat UI is its own pattern, not yet specified — build it against the same glass/motion tokens (message bubbles as `.glass` at two fill weights for self/other) and add it here once built. |
| **I–L. Bank operator / admin / regulator** | These are data-table-heavy and desktop-primary by nature of the audience (bank staff at a workstation), but must still degrade to stacked glass list rows on mobile rather than a horizontally-scrolling table with no affordance. Use `StateMessage` for empty queues. Regulator's read-only banner is a persistent `Badge`-style strip, not a modal. |
| **M. Stretch modules** | FX/swap/tranche pages reuse `Input` (amount fields), `StatusStepper` (settlement), and `StatCard` (balances) — no new primitives anticipated. |

## 12. Accessibility & performance

- **Contrast**: `--text-1` on `--bg-void` exceeds WCAG AAA; `--text-2` on
  glass fills meets AA for body text. Never drop to `--text-3` for anything
  that isn't a label or timestamp.
- **Focus states**: global `:focus-visible` outline in `--signal-bright`,
  offset 3px, on every interactive element — never suppressed.
- **Touch targets**: 44×44px minimum everywhere, enforced by `--tap-min` and
  the `.icon-btn` class (§3).
- **Reduced motion**: handled globally, not per-component (§8).
- **`backdrop-filter` performance**: mobile orb sizes/blur radii are reduced
  vs. desktop specifically for GPU/battery budget (§2); keep concurrent
  blurred surfaces on any single mobile screen to a handful.
- **Screen readers**: carousels use `role="tablist"`/`role="tab"` on their
  dot pagination; sheets use `role="dialog" aria-modal="true"`; toasts use
  `aria-live="polite"`; the read-only regulator banner (when built) should be
  announced, not just visually styled.

## 13. File & naming conventions

Extends the conventions already established in the reference build's README:

- New page-specific sections go in `components/<page-name>/`, following the
  existing `components/landing/` example.
- Anything reused across 3+ pages moves up into `components/ui/` — this is
  exactly how `Badge` and `StatCard` got extracted out of what was originally
  landing-page-only markup.
- `Navbar`/`MobileMenuSheet`/`Footer` (public) and `TabBar` (authenticated)
  stay in `components/layout/` and get reused as-is — don't fork per page.
- Every new data need gets its own hook in `hooks/`, following
  `useReserveSummary.js`'s pattern: mock data + `status`-based states + a
  `BACKEND TODO` comment marking the real endpoint.
- Every transaction-submitting hook should model the same five-state
  machine `StatusStepper` visualizes — `idle → signing → pending → success →
  error` — the same way `useWalletConnection` models `disconnected →
  connecting → connected → error`.
- New design tokens (a new semantic color, a new spacing value) go in
  `tokens.css` first, and get a row added to the relevant table in this
  document in the same change — the two files must never drift apart.

## 14. Do's and don'ts

**Do**
- Build every new page mobile-first: write the base rule for a phone, then
  add `min-width` enhancements.
- Reuse `Glass` for every surface — never write a one-off
  `background + border + backdrop-filter` combination inline.
- Give every tappable element real press feedback (`:active` scale) even if
  it also has a hover state.
- Keep gold = action/trust, signal-blue = system/data. Don't invent a third
  "primary" color for a new page.
- Route new interactive surfaces through the existing motion tokens
  (`--ease`, `--ease-spring`, the duration scale) rather than picking a new
  timing value per component.

**Don't**
- Don't stack two `.glass-elevated` (surface-3) layers on screen at once —
  pick one thing to be "above" the page at a time.
- Don't apply the pointer-tilt effect to anything on a touch device, and
  don't build a touch-coordinate equivalent — touch gets press-feedback and
  scroll-reveal instead (§8).
- Don't use a literal `<table>` as the only mobile layout for list/detail
  data (Groups I–L) — always provide a stacked-card fallback below 1024px.
- Don't introduce pure black/white fills or borders — everything is alpha
  over `--bg-void`.
- Don't ship a custom tap target smaller than 44×44px, even for a "small"
  icon button.
- Don't add a fourth typeface, a new accent hue, or a new easing curve for a
  single page's sake — extend this document first if a real gap shows up
  across multiple pages, rather than solving it locally.
