# Aljazira Bank — Design System

> *"Wealth Grows Here."*

This is the working design system for **Bank Aljazira** (`ajb` / aljazira bank / بنك الجزيرة), a Saudi Arabian Shariah-compliant retail and corporate bank. The system codifies the brand's visual identity — logotype, color, typography, imagery, the proprietary "J shape" key visual, and layout rules — into reusable tokens, assets, components, and example UI surfaces.

---

## Sources

All foundational rules come from the **Visual Identity** chapter of the brand book (uploaded PDFs):

| File | Section |
|---|---|
| `uploads/2_1Visual Identity_Logotype.pdf` | 2.1 Logotype |
| `uploads/2_2Visual Identity_Color_Palette.pdf` | 2.2 Color Palette |
| `uploads/2_3Visual Identity_Typography.pdf` | 2.3 Typography |
| `uploads/2_4Visual Identity_Icons_And_Photography.pdf` | 2.4 Icons, 2.5 Photography |
| `uploads/2_6Visual Identity_Key_Visuals.pdf` | 2.6 Key Visual ("J shape") |
| `uploads/2_7Visual Identity_Layout.pdf` | 2.7 Layout (incl. OOH, PowerPoint) |
| `uploads/2_8Visual Identity_Corporate_Materials.pdf` | 2.8 Stationery |
| `uploads/2_9Visual Identity_Digital_Enviroments.pdf` | 2.9 Digital (social media) |

PDF page renders used as a working reference are kept in `pdf_renders/`. Cleaned brand assets — logos, photography, key-visual swatches — live in `assets/`.

---

## Brand at a glance

Bank Aljazira's identity is built on three ideas:

1. **The "J shape"** — a parallelogram-with-curved-corner derived from the *j* in `ajb`. It functions as a diagonal cut in layouts (text panel on the left, imagery on the right) and as a standalone graphic mark. Always rendered at 45° with a Midnight Blue → Black → Dark Sand gradient fill and a Dark Sand → Sand → Pearl gradient outline.
2. **The brand gradient** — a deep, predominantly-black backdrop with Midnight Blue glowing from one corner. Used as the dominant background (≈65% of compositions).
3. **Restrained Sand accents** — Sand (`#b27f59`) is reserved for *highlight words* inside a headline ("Wealth `Grows Here`"). It is never used for full sentences and never as a background fill.

The brand tone is mature, confident, regional. It speaks the language of journey, growth, trust, and bespoke financial care. Voice is warm but never casual. Arabic-first when bilingual.

---

## Index

| Path | What's there |
|---|---|
| `README.md` | This document — read first |
| `SKILL.md` | Agent Skill manifest (for Claude Code compatibility) |
| `colors_and_type.css` | All design tokens — color, type, spacing, radii, motion |
| `components.css` | **Canonical component layer** — reusable token-driven classes (`.ajb-btn`, `.ajb-card`, `.ajb-badge`…). Build from these, never re-style inline. |
| `COMPONENTS.md` | Component dictionary — copy-paste snippet + variants/states for every class |
| `dictionary.html` | Browsable component gallery — live previews, copy button, theme/RTL toggles |
| `fonts/` | Tajawal `.ttf` font files (ExtraLight → Black, supplied by the brand team) |
| `assets/` | Master SVG logos (`logo.svg`, `logo-black.svg`, `logo-white.svg`), the J shape in three variants (`j-shape.svg`, `j-shape-outline.svg`, `j-shape-fill.svg`), brand photography, page renders |
| `pdf_renders/` | Working reference: PDF pages rendered to PNG. Skim, don't copy from here. |
| `preview/` | Tokens-as-cards for the Design System tab (one card per concept) |
| `ui_kits/aljazira-app/` | Mobile banking app UI kit — interactive prototype + JSX components |
| `ui_kits/aljazira-website/` | Marketing website UI kit — interactive prototype + JSX components |
| `slides/` | 16:9 deck templates (Title, Section divider, Content, Comparison, Quote, Image, Chart, Closing) |

---

## Content fundamentals

**Voice.** Aljazira speaks like a *steady, established advisor* — measured, warm, with regional pride. The pronoun stance is "with you" / "for you": copy positions the bank alongside the customer, not above them. The tagline-level moments are short, almost koan-like — *"Wealth Grows Here."*, *"Your financial journey"*, *"Building tomorrows wealth"*, *"Banking beyond expectations"*, *"With you, every step"*, *"Growth starts today"*, *"Trust & Progress"*.

**Casing.**
- The brand name is always written `aljazira bank` in flowing lowercase, with the abbreviation `ajb` lowercase too. Capital A and B (`Aljazira Bank`) are only acceptable in running prose. **Never** `ALJAZIRA BANK`, `Al Jazira`, `AlJazira`, `AJB`, or `Ajb`. Never separate "al" and "jazira".
- Headlines use sentence case ("Wealth grows here.") or carefully-cased two-line constructions where the second word starts capitalized for rhythm ("Wealth · Grows · Here"). Avoid ALL-CAPS — Tajawal Light loses its elegance.
- Body copy uses sentence case throughout.

**Tense and pronouns.** Present tense first ("Your wealth grows here"), occasionally aspirational future ("Building tomorrows wealth"). Address the reader as "you" and refer to the bank as "we". Avoid "us", "the bank", or third-person references.

**Length.** Headlines should resolve in 2–6 words. Sub-headlines extend the idea in one calm sentence. Long-form is rare on hero surfaces; reserve it for product pages and disclosures.

**Examples — pulled directly from the brand book:**

| Surface | Headline | Sub-headline |
|---|---|---|
| Billboard | `Wealth` Grows Here | Bespoke financial solutions |
| Social — X | 10% cashback `in style` | Exchange instantly for miles and fly higher |
| Social — X | Education first, `payments later` | With our exclusive payment plans |
| Facebook cover | Building `tomorrows wealth` | — |
| YouTube hero | `Trust` & Progress | Banking beyond expectations |
| Profile bio | Your financial journey | — |

Backticked words above are the **Sand-color highlights** — the typographic equivalent of a single brush-stroke of brand accent inside an otherwise calm sentence. Never highlight more than one phrase per headline.

**Don't.** Avoid emoji entirely — the brand is luxury, mature, and emoji break the register. Avoid finance jargon ("APR", "IBAN", "tier") in marketing copy; save it for product disclosure. Avoid exclamation marks. Avoid "amazing", "incredible", "game-changing".

**Vibe in one line.** *Wadi at sunrise* — calm, golden, vast, unhurried. Saudi-rooted, globally legible.

---

## Visual foundations

### Color

Five **primary** colors carry the brand. The 65/10/10/10/5 usage ratio in the book maps to:

- **65% — the brand gradient** (Midnight Blue → Black, plus Midnight Blue → Dark Sand for J-shape highlights). Dominant background across every surface.
- **10% — Pearl** for body type and UI on dark.
- **10% — Black** for type when the canvas is light (rare; mostly print).
- **10% — Dark Sand** for secondary accents and chart bars.
- **5% — Sand** for *highlight words only* in headlines.

Secondary colors (Silvers, Sky Blue, Emerald, Rust) are restricted: Silvers and Sky Blue may appear on social-media backgrounds; Emerald and Rust are UX-only for success/error states. Sand and Dark Sand **must never** be used as background fills — they read as decorative metals, not surfaces.

### Type

**Tajawal** — single family, Latin and Arabic. Weights used: Light (300), Regular (400), Medium (500), Bold (700).

| Role | Weight | Leading |
|---|---|---|
| Headline | Light | 105% |
| Sub-headline | Medium | 115% |
| Body | Regular & Bold | 120% |
| Small body | Medium & Bold | 120% |

Light is the workhorse for display — its low x-height and open apertures give the brand its airy, mature feel. Switch to Regular for sub-display sizes where Light loses legibility. Bold is for emphasis inside body, *never* for headlines.

System fallback: `'Helvetica Neue', Arial, sans-serif`.

The full set of Tajawal weights (ExtraLight 200 → Black 900) ships in `/fonts/` as `.ttf` and is wired up via `@font-face` in `colors_and_type.css`. All design surfaces — preview cards, the deck, both UI kits — use them automatically.

### Theming — light & dark

The system is **dark-by-default** (the gradient backdrop is the brand's home turf, ~65% of compositions) but ships a complete **light theme** for forms, statements, KYC flows, documents, and any reading-heavy surface.

- Drive every surface, foreground, and stroke through the **semantic tokens** (`--ajb-bg`, `--ajb-surface`, `--ajb-surface-2`, `--ajb-fg`, `--ajb-fg-muted`, `--ajb-fg-subtle`, `--ajb-accent`, `--ajb-on-accent`, `--ajb-stroke`, `--ajb-stroke-strong`). Never hard-code a hex for chrome.
- Switch themes by setting `data-theme="light"` or `data-theme="dark"` on `<html>`, `<body>`, or **any subtree** — a single attribute re-skins everything beneath it. You can nest a dark island inside a light page.
- The **brand primaries never change** between themes. Only surfaces/fg/strokes flip, plus one deliberate accent shift: **Sand → Dark Sand** on light, because Sand washes out on pale surfaces (this matches §2.3 "color usage", where highlight words darken on light backgrounds). Text/icons sitting *on* an accent fill use `--ajb-on-accent`.
- Add `class="ajb-themed"` to a container to opt into theme-driven `background`/`color`/`font` automatically.
- The page backdrop is exposed as `--ajb-bg-grad`: the dramatic dark radial gradient in dark theme, a whisper-warm light radial in light theme.

```html
<body data-theme="light" class="ajb-themed"> … </body>
```

### Bidirectionality — Arabic & RTL

Aljazira is an **Arabic-first** bank; bilingual Arabic/English is a baseline requirement, not an afterthought. Tajawal is one family covering both scripts, so type "just works" in either direction.

- Set `dir="rtl"` (and ideally `lang="ar"`) on the root or any subtree to **mirror the entire layout**. Set `dir="ltr"` for English.
- **Lay out with logical properties** — `margin-inline-start/end`, `padding-inline`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`, flex/grid `gap` — so one `dir` flip mirrors the composition with zero extra CSS. Avoid `left`/`right` for anything that should mirror.
- The token sheet makes the type system **script-aware automatically**: in RTL/Arabic it removes `text-transform: uppercase` and resets letter-spacing to `0` on labels/micro (Arabic has no case and tracking breaks the joins), and relaxes display leading to `1.18` for Arabic's taller extenders. Negative display tracking is reset (it's Latin-only).
- Keep **latin runs upright inside RTL** — numerals, IBANs, the latin logo, latin product names — by wrapping them in `class="ajb-ltr"` (sets `direction: ltr; unicode-bidi: isolate`). Currency figures like `28,492 SAR` stay LTR even in an Arabic block.
- See the **Arabic · RTL bidirectional** card in the Design System tab for the same UI mirrored in both directions.

### Layout

- A **14-column** vertical grid is the canonical print layout — logo sits inside `1/14` of the long edge, with `1/14` margins.
- For digital, treat the J-shape as a **diagonal divider** between a text panel and an image panel. Text goes on the dark side; imagery slips behind the gradient on the light/photo side.
- Compositions are vertical-first (mobile, OOH portrait, social stories), but adapt cleanly to widescreen.
- Logo placement: bottom-right on print/OOH, top-left on UI navigation, centered on splash/loading.

### Backgrounds

- **Dominant treatment:** the brand gradient — black with Midnight Blue glow rising from the bottom-left or bottom-right corner. Implemented in CSS as `var(--ajb-bg-gradient)`.
- **Photography overlay:** photos sit behind the J shape and are *gradient-masked* into the dark canvas — they never appear on white. Photo edges fade into black/Midnight Blue via the J shape's diagonal.
- **Light surfaces:** white (Pearl) and a warm off-white `#f4f1ec` for print stationery. Light surfaces are rare in digital; reserve them for forms, statements, KYC flows.
- **No repeating patterns. No textures. No noise.** The brand's "texture" is the gradient itself.

### Imagery vibe

Warm, golden-hour, natural light. **People:** authentic Saudi/Gulf individuals — natural, friendly, confident, never staged. Use wide angles, close-up details, lens flares. **Scenery:** desert landscapes (AlUla, Empty Quarter), Riyadh skyline at night (Kingdom Centre, Al Faisaliah), architectural facades, palm shadows. The whole bank looks like it was photographed at 6:45am or 6:30pm.

### J shape — the brand's signature graphic

The master file lives at `assets/j-shape.svg` (with `j-shape-outline.svg` and `j-shape-fill.svg` as variants), supplied directly by the brand team. Geometry:

- A parallelogram skewed at 45° with the bottom-left corner curved (echoing the lowercase `j`).
- **Inner fill:** linear gradient at 135° — Midnight Blue (0%) → Black (42–54%) → Dark Sand (100%).
- **Outline:** linear gradient at 135° — Dark Sand (0%) → Sand (85%) → Pearl (100%). Approx 1px on small surfaces, 2–3px on hero.
- May be **stepped** — duplicated 1× or 2× in a staircase to the right or upward, with `x` step spacing.
- Sometimes used **zoomed in** so only the diagonal edge is visible (this is what creates the "diagonal photo cut" effect).
- Never inverted, recolored outside the Sand/Midnight family, or used flat (gradients are essential).

### Animation

The brand book does not document motion, but the visual logic prescribes it:

- **Easing:** confident, never bouncy. Standard cubic-bezier `(0.2, 0.7, 0.2, 1)`.
- **Durations:** press 120ms, hover 220ms, panel enter 420ms, hero reveal 800ms.
- **Transitions:** crossfades and reveals — never slides or pops. The J shape can sweep in from the right as a wipe.
- **No bounces, no scale-overshoots, no playful springs.**

### Hover & press states

- **Buttons** — hover: lift opacity by ~8%, optionally a soft sand glow (`var(--ajb-glow-sand)`). Press: scale to 0.98 over 120ms, no color flash.
- **Cards** — hover: border opacity rises from 0.12 → 0.28. Press: deepen the inner gradient by 4%.
- **Links** — hover: Sand color underline appears (currentColor at 60%). Never blue.
- **Icons** — hover: stroke color shifts from Pearl @ 72% to Pearl @ 100%.

### Borders, strokes, radii

- Strokes are **always thin** — 1px, sometimes 0.5px on retina. Color: `rgba(255,255,255,0.12)` on dark, `rgba(0,0,0,0.10)` on light.
- Radii: `4 / 8 / 12 / 16 / 24` plus `pill` for actions. The logotype itself is squared, but UI surfaces lean toward `12–16px`. Pill buttons for primary CTAs.
- **Shadows are minimal.** Surfaces sit flat on the gradient. Use elevation only for raised cards, sheets, dropdowns.

### Transparency & blur

Used sparingly. Acceptable cases:
- **Glass tab bars** on mobile UI — Midnight Blue at 70% opacity with `backdrop-filter: blur(20px)`.
- **Image protection scrims** — a Midnight Blue→transparent gradient over photos where text sits on top.
- **Disabled controls** — 40% opacity.

Avoid frosted-glass overlay tropes (centered card-on-blurred-bg). The J-shape *is* the brand's "frame."

### Cards

A card is a `--ajb-surface` rectangle with a 12–16px radius, a 1px hairline border at `--ajb-stroke`, no shadow (unless elevated), and 24–32px of internal padding. On hover, the border brightens to `--ajb-stroke-strong`. No left-border accent stripes; no colored top borders. If a card needs an accent, set the entire surface to a darker `--ajb-surface-2` or apply the J-shape behind it.

### Component library

The Design System tab carries a working component set, each demonstrated as a live card (see `preview/`). All are built from the semantic tokens, so they respond to `data-theme` and `dir` automatically.

> **Source of truth:** the reusable classes live in **`components.css`**, documented in **`COMPONENTS.md`** and browsable in **`dictionary.html`** (live previews + copy button + theme/RTL toggles). When building any screen, reuse these classes — don't re-style a component inline. The `preview/*.html` cards are visual specimens; `components.css` is what you actually build with.

| Group | Components |
|---|---|
| **Actions** | Buttons (pill primary / sand / ghost / tertiary / icon / disabled) |
| **Forms** | Text/underline inputs, selection controls (radio · checkbox incl. indeterminate · toggle), select fields, date field & calendar (single + range) |
| **Selection & nav** | Tabs, segmented control, dropdown menu, breadcrumb, pagination |
| **Feedback** | Alerts/inline messages (success · error · warning · info), toasts/snackbars, dialog/modal, progress bar, spinner, skeleton, empty state |
| **Data display** | Surfaces/cards, list rows, data table, badges & status pills, chips/tags, tooltip, avatars (initials · photo · ajb-symbol · stack) |

**Conventions, applied consistently across the set:**
- **Actions are pills** (`--ajb-r-pill`); **containers** use 12–16px radii. Inputs sit at 12px.
- **State colors are semantic-only:** Emerald = success, Rust = danger/error, Sky Blue = info, Dune/Dark-Sand = warning/caution. They appear as ~12–18% alpha tints behind a solid-color icon + text — never as full-bleed fills.
- **Sand is the single interactive accent** (selected, focused, active, primary). On light theme it resolves to Dark Sand via the token. Text on a Sand fill uses `--ajb-on-accent`.
- **Hairline borders** (`--ajb-stroke`) define every surface; elevation (`--ajb-shadow-*`) is reserved for things that float — menus, dialogs, toasts.
- **Icons** are Lucide, 1.5–1.7px stroke, never filled. Hit targets ≥ 44px on mobile.
- **No emoji, no Unicode dingbats** anywhere in components.


---

## Iconography

The Aljazira icon family is a **linear, single-stroke** set: ~1.5–2px stroke on a **48×48 grid** with a keyline circle/square. Icons are drawn in **Sand or Pearl** depending on the background, never filled.

### Coverage in the brand book

The PDF specimen includes ~35 icons across banking (wallet, card, dollar-refresh, bank building), navigation (home, search, arrows), comms (bell, message, mail), profile (person, people, gear), and lifestyle (plane, car, gift, ticket, calendar, star, heart, sparkles, document, image). All are linear, no fills, gentle rounded line-ends.

### Asset status

The supplied PDFs ship the icons as *flattened bitmap rasters* (not editable SVG). The closest CDN-available set that matches the stroke-weight and geometry is **[Lucide](https://lucide.dev/)** — linear, 24px-grid with 2px stroke, rounded line-caps. **Tabler Icons** is an acceptable alternate. We use Lucide via CDN as the working icon set:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="wallet"></i>
<script>lucide.createIcons();</script>
```

> ⚠️ **Icon substitution flag:** We are using Lucide as a stand-in for the proprietary Aljazira icon set. If your team has the master SVG/AI files, drop them into `assets/icons/` and we'll swap out the Lucide references for native components.

### Rules

- **Stroke weight:** 1.5–2px at 24px, scales linearly. Never filled.
- **Color:** `var(--ajb-pearl)` on dark surfaces, `var(--ajb-sand)` for marketing/feature highlights, `var(--ajb-fg-on-light)` on light surfaces. Never gradient.
- **Sizing:** 16 / 20 / 24 / 32 / 48 grid sizes. Marketing pages can go to 64–96 for feature icons.
- **No emoji.** Not in copy, not in UI, not in chat. The brand is too quiet for emoji.
- **No Unicode dingbats** (✓ ★ ▶︎ etc.) — always use an icon component.

---

## Spelling & nomenclature rules (from §2.1)

Common mistakes to avoid:

| ❌ Wrong | ✅ Right |
|---|---|
| `AJB`, `Ajb` | `ajb` (always lowercase) |
| `ALJAZIRA BANK` | `aljazira bank` or `Aljazira Bank` |
| `AlJazira` | `Aljazira` (one word, capital A only) |
| `Al Jazira` | `Aljazira` (no space) |
| `a j b`, `a l j a z i r a` | no letter-spacing |

The full Arabic name is **بنك الجزيرة** — always written right-to-left as a unit, never letter-spaced.
