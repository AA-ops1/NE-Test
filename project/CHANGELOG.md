# Notification Engine — Design Change Log

Canonical log of **every design change** (components, tokens, icons, journey/
screen changes, removals), per the *Design Change Log Rules* in `CLAUDE.md`.
Newest entries at the top, grouped by date. A change is not complete until it is
logged here. Written for a developer / coding agent: be specific, name things
exactly, and state the code impact.

Categories: **Added · Changed · Deprecated · Removed · Fixed**

---

## [2026-06-15]

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
