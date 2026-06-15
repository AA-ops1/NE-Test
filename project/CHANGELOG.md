# Notification Engine — Design Change Log

Canonical log of **every design change** (components, tokens, icons, journey/
screen changes, removals), per the *Design Change Log Rules* in `CLAUDE.md`.
Newest entries at the top, grouped by date. A change is not complete until it is
logged here. Written for a developer / coding agent: be specific, name things
exactly, and state the code impact.

Categories: **Added · Changed · Deprecated · Removed · Fixed**

---

## [2026-06-16]

### Added
- **Account panel — `AccountPanel` / `.ne-acct` (NEW reusable component)** — a
  slide-in account **sheet** opened from the side-nav user chip on every shell.
  Shows a profile summary (avatar, name, role, email) + actions (View profile ·
  Account settings · Sign out). Two entry-point variations: `anchored` (rises
  from the chip) and `drawer` (full-height edge panel), chosen by the `variant`
  prop / persisted `ne-acct-variant`. The Aljazira design system has **no
  sheet/drawer** component, so this is a new reusable entry; built only from DS
  tokens + the existing `.ajb-avatar` / `.ajb-menu` / `.ajb-dialog` classes.
  - Affected: every console shell (Templates, Approvals, Approvals-print,
    Create/Edit/View Template, Settings) + login home + Profile.
  - Code impact: new file `console/account.jsx` exporting
    `window.AccountPanel` + `AcctIcon` (self-contained lucide icon, prop-driven,
    no `TPL`/`Icon` dependency); styles `.ne-acct*` in `login.css`; loaded via
    `<script src="account.jsx">` on all 7 shells + `Login Journey.html`.
- **Sign-out flow (logout confirmation)** — confirm dialog (reuses `.ajb-dialog`)
  → navigates to `Login Journey.html`. Lives inside `AccountPanel`; also wired to
  the Profile page header "Sign out" button.
  - Affected: all shells + login home + Profile.
  - Code impact: in `account.jsx` (`AccountPanel` confirm layer) and
    `Profile.html`.
- **Profile journey — `Profile.html` + `profile.css`** — standalone **read-only**
  profile page: Personal information, Role & permissions (granted/not-granted),
  and Active sessions. Two layouts via `[data-pf-layout]`: `two-column`
  (default) and `stacked`. Reached from the account panel's "View profile".
  - Affected: new Profile journey.
  - Code impact: new files `console/Profile.html`, `console/profile.css`; uses
    `window.TPL.PROFILE` + `T.<lang>.prof`/`.acct`. Tweaks expose
    `profileLayout` (page layout) and `accountPanel` (entry-style) variations.
- **`TPL.PROFILE` data + `acct`/`prof` i18n** — read-only signed-in-user data
  (identity, role, permissions[], sessions[]) and EN/AR strings for the account
  panel, sign-out dialog, and profile page.
  - Code impact: `console/template-data.js` — new `PROFILE` const (exported on
    `window.TPL`) and `acct`/`prof` blocks in `T.en`/`T.ar`.

### Changed
- **Account panel (`AccountPanel`) — removed "Account settings" item** — the
  panel menu now lists just **View profile** + **Sign out** (the Settings nav
  tab already covers account settings, so the panel entry was redundant). The
  `settingsHref` prop is retained but unused.
  - Affected: account panel on every shell + login home.
  - Code impact: `console/account.jsx` — dropped the second `.ne-acct-item`.
- **Side-nav user chip (`.ne-side-user`)** — was a static block; now an
  interactive trigger (`role="button"`, Enter/Space, focus ring, `is-active`
  while open) that opens the account panel. Updated in the shared `SideNav`
  (`console-shell.jsx`, which now returns a fragment of the `<aside>` **plus**
  `<AccountPanel/>` rendered outside the `overflow:hidden` rail) and in the login
  home's inline copy (`login.jsx` `ConsoleHome`).
  - Affected: every console shell + login home (per the side-menu-consistency
    rule — both copies updated identically).
  - Code impact: `SideNav` gains an `acctVariant` prop + account open-state;
    `.ne-console { position: relative }` added to `login.css` so the in-console
    overlay anchors on every shell (previously only set by `template-delete.css`);
    new persisted key `ne-acct-variant`. `Login Journey.html` now also loads
    `template-data.js` + `account.jsx`. No nav tabs added/renamed/reordered.

### Fixed
- **ReviewScreen — DevicePreview "Sample data" toggle (`.ts-pv-toggle`)** — the
  toggle was inert in the approvals review screen: `DevicePreview` was passed
  `sample={false}` with a no-op `onToggleSample={() => {}}`, so clicking it did
  nothing. Added real `sample` state to `ReviewScreen` (`useApS(false)`, reset on
  `sub.id` change) and wired `onToggleSample` to flip it, so the preview now
  swaps `{{tokens}}` ⇄ resolved sample values like every other DevicePreview
  instance (Create/Edit/View Template).
  - Affected: Approvals journey — checker Review screen (split + stacked
    variants); `Approvals.html`, `Approvals-print.html`.
  - Code impact: `ReviewScreen` in `console/approvals.jsx` — new local state +
    handler. No `DevicePreview` API change. The other review actions
    (approve · add note · send back · reject · reassign · back · language
    segment) were audited and already wired correctly — no change needed.

## [2026-06-15]

### Changed
- **Side-nav collapse/expand motion (`.ne-side` rail + all inner elements)** —
  unified the previously desynced transition timings (a mix of .14/.15/.18/.2/
  .24/.3/.32/.36s, some un-eased) onto a single shared duration token
  `--ne-collapse: .42s` (the brand "panel enter" spec) on the brand easing
  `--ne-ease` (`cubic-bezier(.2,.7,.2,1)`). All structural changes — rail width
  + padding, nav-item padding/gap, label/badge/user-text `max-width`, logo
  margin + symbol height, divider margin, footer condense, toggle-chevron
  rotation — now move on one coordinated timeline. Opacity fades kept quick
  (.14–.22s) so labels/badges clear before the squeeze. Added `box-shadow` to
  the nav-item transition so the active item's sand glow eases in on collapse
  instead of snapping.
  - Affected: every console shell (login home, Templates, View/Edit/Create
    Template, Approvals) — all share the collapsible `.ne-side` rail.
  - Code impact: CSS-only in `console/login.css`. New CSS custom property
    `--ne-collapse` declared on `.ne-home`; tune collapse speed there in one
    place. No markup or prop changes.
- **Side-nav brandmark — collapsed symbol (`.ne-side-logo .ne-logo-symbol`)** —
  height set to 44px **only when the rail is collapsed**
  (`.ne-home[data-collapsed]`) so the symbol's *visible glyph* matches the open
  wordmark. The symbol PNG (`logo-ajb-symbol-white.png`) has ~14% transparent
  padding baked in (ink fills 85.7% of the box), while the wordmark SVG is
  tightly cropped (100%); 38 ÷ 0.857 ≈ 44px makes the rendered marks equal in
  height. Added a `height` transition so it scales smoothly on collapse.
  - Affected: every console shell (login home, Templates, View/Edit/Create
    Template, Approvals) — all render the shared collapsible `.ne-side-logo`.
  - Code impact: CSS-only in `console/login.css`; no markup or prop changes.
- **Console light theme — content area background (`.ne-main`)** — official
  light-theme content surface changed from flat white `var(--ajb-bg-deep)`
  (`#ffffff`) → warm pearl `var(--ajb-bg)` (`#faf7f2`). Side menu intentionally
  **unchanged** (stays solid `var(--ajb-surface-2)`). This is now the project's
  official light-theme background.
  - Affected: every console journey via the shared shell — Dashboard,
    Campaigns, Templates, Approvals, Create/Edit/View Template, and the login
    home (`login.jsx`). Any page loading `login.css`.
  - Code impact: one rule in `login.css` —
    `[data-theme="light"] .ne-main { background: var(--ajb-bg-deep) → var(--ajb-bg); }`.
    No token values, props, or component changes. The exploratory samples
    (`Templates (light gradient sample).html`, `Templates Side Menu
    Compare.html`) are now redundant and can be deleted.

### Added
- **Templates — light background sample (`Templates (light gradient
  sample).html`)** — new standalone sample copy of the Templates journey that
  previews the **light** theme with the flat warm-pearl surface
  (`var(--ajb-bg)`, `#faf7f2`) behind the content area, in place of the flat
  white `var(--ajb-bg-deep)`. (Briefly trialled `var(--ajb-bg-grad)` light
  gradient first; settled on warm pearl.) Scoped override only:
  `.ne-console[data-theme="light"] .ne-main { background: var(--ajb-bg); }`,
  plus the review harness defaults to the light theme. Original
  `Templates.html` is intentionally **not** changed.
  - Affected: new sample file only; production Templates journey untouched.
  - Code impact: none — exploratory sample. If approved, the change to promote
    is the single `.ne-main` light-theme background rule in `login.css`
    (currently `[data-theme="light"] .ne-main { background: var(--ajb-bg-deep); }`).

### Changed
- **DevicePreview — sample/token toggle button (`.ts-pv-toggle`)** — reversed
  the label/icon to describe the *action* instead of the current state. While
  tokens are shown it now reads `Sample data` (eye icon); while sample data is
  shown it reads `Show tokens` (tag icon).
  - Affected: Create / Edit / View Template + Approvals (all DevicePreview
    instances).
  - Code impact: `DevicePreview` in `template-parts.jsx` — swapped the
    `sample ? … : …` ternary on the toggle's `Icon name` and label. No prop or
    token changes.

### Changed
- **Language control — bilingual glyph (`.ne-langglyph`)** — English letter
  `A` → `E` (now reads `E | ع`).
  - Affected: all journeys (shell topbar) + Login (form + signed-in home).
  - Code impact: `.ne-langglyph-en` text in `console-shell.jsx` (`LangMenu`)
    and `login.jsx`. Purely visual, no prop changes.

### Fixed
- **Navigation — journey actions wired to routes** — previously-inert controls
  now navigate via the shell convention (`window.location.href`):
  breadcrumb "Templates" (`href="#"` → `Templates.html`) on Create/View/Edit;
  Create *Cancel* → `Templates.html`; View kebab *Duplicate* → `Create
  Template.html` and *Export* → `window.print()`; View archived *Duplicate* →
  Create; Templates-list kebab *Duplicate* → Create; Edit (locked) *Back to
  templates* → `Templates.html` and *Restore* → `View Template.html`.
  - Affected: Templates, View, Edit, Create journeys.
  - Code impact: handlers in `template-studio.jsx`, `view-template.jsx`,
    `template-list.jsx`, `edit-template.jsx`, `Edit Template.html`. No new props.

### Changed
- **Language control** — converted from a dropdown menu to a **direct EN⇄AR
  toggle**; label is now the bilingual glyph `A | ع` (`.ne-langglyph`) instead
  of "EN"/"عر" text. Unified across all journeys including both login views.
  - Affected: all journeys (shell topbar) + Login (form + signed-in home).
  - Code impact: `LangMenu` in `console-shell.jsx` (removed open-state/menu);
    `.ne-langglyph` styles in `login.css`; glyph markup in `login.jsx`.
- **Brand logo sizing** — `.ne-side-logo` 30px → 38px; `.ne-brand-logo` 30px →
  38px.
  - Affected: Login journey (side-nav rail + brand panel).
  - Code impact: `login.css` only; purely visual, no prop changes.

### Added
- **Scrollbars — theme-aware, surface-matching** — global treatment in
  `login.css`: `color-scheme` per `data-theme` root (dark/light), plus a
  transparent-track `::-webkit-scrollbar` + `scrollbar-color` rule whose
  transparent track lets each scroll area's own surface show through, so the
  gutter dynamically matches the background behind it. Thumb is
  `color-mix(var(--ajb-fg) 22%…)`, 34% on hover.
  - Affected: every journey (page, variable list, code editor, menus).
  - Code impact: global CSS in `login.css`; no markup or token additions.
    `.ts-select-pop` keeps its own surface-2 thumb border by specificity.
