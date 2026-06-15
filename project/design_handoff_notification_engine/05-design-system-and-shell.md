# 05 · Design system & the shared console shell

**Docs version:** `1.1.0` · **Last updated:** 15 Jun 2026

The console is built entirely on the **Aljazira Bank Design System**. This doc
lists the tokens used, the design-system components consumed, and the **shared
side-nav shell** that is duplicated across every journey (with its CLAUDE.md
consistency rule).

> **Rule (from project CLAUDE.md):** build UI from the design-system component
> specimens; drive everything through `var(--ajb-*)` tokens; never hard-code
> colours/type/spacing; never invent a component when a design-system one exists.

---

## 1. Design tokens (`colors_and_type.css`)

All chrome resolves from semantic tokens so a single `data-theme` swap re-skins
the tree. Source values:

### Brand primaries (constant across themes)
| token | value | use |
|---|---|---|
| `--ajb-midnight-blue` | `#001421` | base bg / `on-accent` text |
| `--ajb-black` | `#000000` | gradient only |
| `--ajb-dark-sand` | `#8c684a` | accent on light |
| `--ajb-sand` | `#b27f59` | accent on dark / highlight words |
| `--ajb-pearl` | `#ffffff` | type on dark, light surfaces |

### Semantic tokens (flip by theme)
| token | dark | light |
|---|---|---|
| `--ajb-bg` | midnight-blue | `#faf7f2` warm pearl |
| `--ajb-bg-grad` | dramatic dark radial | whisper-warm light radial |
| `--ajb-surface` | `#0a1c2b` | `#ffffff` |
| `--ajb-surface-2` | `#11283a` | `#f4efe7` |
| `--ajb-fg` | pearl | `#1a140e` |
| `--ajb-fg-muted` | white 72% | `#1a140e` 66% |
| `--ajb-fg-subtle` | white 48% | `#1a140e` 42% |
| `--ajb-accent` | **Sand** | **Dark Sand** ← deliberate shift |
| `--ajb-on-accent` | midnight-blue | `#ffffff` |
| `--ajb-stroke` | white 12% | `#1a140e` 12% |
| `--ajb-stroke-strong` | white 28% | `#1a140e` 24% |

### Scale tokens
- **Weights:** `--ajb-w-light:300` (display), `--ajb-w-regular:400`,
  `--ajb-w-medium:500`, `--ajb-w-bold:700`. Headlines use Light; Bold is for
  emphasis in body, **never** headlines.
- **Radii:** `--ajb-r-sm:4` · `--ajb-r:8` · `--ajb-r-md:12` · `--ajb-r-lg:16` ·
  `--ajb-r-xl:24` · `--ajb-r-pill:999`. **Actions = pill; containers/inputs =
  12–16px.**
- **Elevation:** `--ajb-shadow-1/2/3` (flat by default; elevation only for
  raised cards, sheets, menus, toasts). `--ajb-glow-sand` for primary hover.
- **Type:** Tajawal family (`--ajb-font`); a full display→micro scale
  (`--ajb-display-xl`, `--ajb-h1`, …) with script-aware leading/tracking.
- **Motion:** confident easing (`cubic-bezier(0.2,0.7,0.2,1)`); no bounces.

State colours (semantic only, as ~12–18% tints behind a solid icon + text):
Emerald = success, Rust = danger, Sky Blue = info, Dune/Dark-Sand = warning.

---

## 2. Design-system components consumed

The journeys build from `components.css` (`.ajb-*`) and the design-system React
components. Map of what's used → where:

| Component / class | Used for |
|---|---|
| `.ajb-btn` (`--sand` primary, `--secondary`, `--tertiary`, `--icon`) | all actions; primary CTA is the **sand pill** |
| `.ajb-card` (+ `--raised`) | every section card, saved/locked cards |
| `.ajb-input` (+ `--boxed`), `.ajb-field`, `.ajb-helper` | form fields, login |
| `.ajb-chip` (+ `--filter`), chip `__x` | tags, channel filters |
| `.ajb-badge` (`--success/info/warning/neutral`), `.ajb-count` (`--sand`) | status badges, the nav approval count |
| status **pills** (`StatusPill`) | draft/review/active/expired/archived/inactive |
| `.ajb-table` | templates list, approvals queue |
| `.ajb-li` (list rows) | dashboard recent activity, previews |
| `.ajb-alert` (`--danger/info/warning`) | login errors, edit banners, review notices |
| `.ajb-dialog` + `.ajb-scrim` | discard dialog, delete/archive/reassign/submit modals |
| `.ajb-menu` (+ `__check`) | version switcher, kebab menu |
| `.ajb-seg` | language (EN/AR/Both) + maker-filter segmented controls |
| `.ajb-stepper` / `.ajb-step` | Create Direction B |
| `.ajb-kv` (key-value rows) | overview, review summary, lifecycle |
| `.ajb-tab` / `.ajb-tab-badge` | content language tabs |
| `.ajb-avatar` (+ `--sm`) | user, person chips |
| `.ajb-empty` | empty states (no results, deleted, caught-up) |
| `.ajb-result` (`--success`) | saved confirmations |
| `.ajb-spinner` | login loading |
| `.ajb-stat` | dashboard KPI cards |
| `.ajb-crumb` | breadcrumbs |

App-specific components (built **on top of** the design system, in
`template-parts.jsx` / `approval-parts.jsx` / `template-delete.jsx`):
`DevicePreview`, `SegmentMeter`, `VariablePanel`, `ChannelPicker`, `LangTabs`,
`HiTextarea` (token-highlighting textarea), `ApprovalTimeline`, `DecisionBar`,
`FieldDiff`, `PersonChip`, `PriorityTag`, `KebabMenu`, `DeleteModal`,
`ArchiveModal`, `SubmitModal`, `ReassignModal`, `NeToast`.

### Scrollbars (global, `login.css`)
Native scrollbars are themed two ways so they never fall back to the bright OS
default on a dark surface:
- **`color-scheme`** is set per theme root (`dark` on default/`[data-theme="dark"]`,
  `light` on `[data-theme="light"]`) so the browser paints theme-appropriate
  scrollbars on the page, variable list, code editor, and menus.
- A global `::-webkit-scrollbar` + `scrollbar-color` rule uses a **transparent
  track** and a transparent thumb border (`background-clip: padding-box`). The
  transparent track lets each scroll area's **own** background show through, so
  the scrollbar background dynamically matches whatever surface is behind it
  (page, card, popover, editor) in either theme. Thumb is `color-mix(var(--ajb-fg)
  22%…)`, 34% on hover. `.ts-select-pop` keeps its own surface-2 thumb border.

Icons: **Lucide** (CDN), 1.5–1.7px stroke, never filled — a documented stand-in
for the proprietary aljazira icon set. The `Icon` wrapper (`template-parts.jsx`)
renders a Lucide glyph by name.

---

## 3. The shared console shell (side-nav + topbar)

Source: `console-shell.jsx` (`SideNav`, `SideToggle`, `useSideCollapse`);
CSS in `login.css` (`.ne-home`, `.ne-side`, `.ne-nav-*`, collapse rules).

> **CLAUDE.md rule — the side menu must stay identical across ALL journeys.**
> The nav is duplicated in every page shell. When you add/rename/reorder/remove
> a tab, update **every** shell, add the label to the shared `nav` i18n
> (`TPL.T.en/ar.nav`) so it resolves everywhere, mark the current page's item
> `on`, and give other items an `href` (the shell navigates via
> `window.location.href`). In production this becomes one shared `<SideNav>`
> component + a real router, eliminating the duplication.

### Nav model (order is canonical)
```
Workspace:   Dashboard · Campaigns · Templates
Governance:  Approvals            ← carries the live count badge
Audience &   Customers · Delivery
 delivery:
(footer):    Settings
```
Wired routes: Dashboard → `Login Journey.html`, Templates → `Templates.html`,
Approvals → `Approvals.html`. Campaigns/Customers/Delivery/Settings are visual
placeholders. The active item gets `on: true`.

### Structure
```
<aside class="ne-side">
  logo (theme-aware wordmark + collapsed symbol mark)
  per group: <div class="ne-nav-group"> label </div> + items
  <NavItem>: icon + label + (Approvals → count badge + dot)
  spacer → Settings (footer item)
  divider → user block (avatar O + name/role + chevron)
</aside>
```

### Collapse behaviour (`useSideCollapse`)
- Toggled by the topbar `SideToggle` (`panel-left` icon).
- **Persisted** in `localStorage['ne-side-collapsed']` (`'1'`/`'0'`), so the
  preference is shared across every journey.
- Expanded rail **256px** → collapsed **84px** icon rail. Animated via `width`
  transition (the reference mechanism from `Sidebar Collapse.html`).
- **Expanded:** active item shows a left **accent bar**; the Approvals badge is
  a subtle sand-tint chip ("5").
- **Collapsed:** labels fade to `max-width:0`; items become 44px centered icon
  buttons; the active item becomes a solid **sand square** with `glow-sand`; the
  Approvals badge collapses to **0 width** and a **dot** indicator shows instead
  (dot uses `--ajb-on-accent` when the item is active so it stays visible on the
  sand fill); the user-footer avatar centers (its chevron's `margin-inline-start`
  is cleared so the avatar doesn't shift). Tooltips (`title`) appear on hover.

### Topbar
Collapse toggle · `ajb` symbol mark · page title (`t.nav.<page>`) ·
**language toggle** · notification bell with a dot. (The duplicate user avatar
that used to sit in the topbar was removed — the user identity lives only in the
side-nav footer.)

### Language control (`LangMenu`, `console-shell.jsx`)
A **direct toggle**, not a dropdown: one click flips `lang` EN⇄AR, re-skinning
the whole tree via `dir`/`lang` (RTL mirroring + Arabic type rules apply
automatically). Its label is a single **bilingual glyph** — `A | ع` (Latin A +
Arabic ʿain with a hairline divider), class `.ne-langglyph` in `login.css`. The
**same control and glyph** appear on the login screen (`login.jsx`, both the
sign-in form cluster and the signed-in home topbar), so language switching is
identical across every surface. In production this is one shared control bound to
the app's locale/`dir` state.

---

## 4. Brand usage notes (from the design system)

- **Sand is the single interactive accent** (selected / focused / active /
  primary). On light it resolves to Dark Sand via the token. Text on a sand fill
  uses `--ajb-on-accent`. Sand is never a background fill for content.
- **Hairline borders** (`--ajb-stroke`) define surfaces; elevation only for
  things that float (menus, dialogs, toasts).
- **No emoji, no Unicode dingbats** in UI — always an icon component.
- **The J shape** (`assets/j-shape.svg`) appears on the login brand panel; it's
  the brand's signature graphic (45° parallelogram, midnight→sand gradients).
- Brand name casing: always `aljazira bank` / `ajb` lowercase in product chrome.
