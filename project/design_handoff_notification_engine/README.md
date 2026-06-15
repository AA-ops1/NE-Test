# Handoff — Notification Engine (aljazira bank)

**Docs version:** `1.0.0` · **Last updated:** 7 Jun 2026 · **Status:** baseline

This folder is the **living handoff documentation** for the aljazira bank
**Notification Engine** staff console. It describes *all functionality and
business logic* in the project so a developer (or Claude Code) can implement it
in a production codebase — and so the behaviour stays documented as the design
evolves.

---

## 1. What this project is

A back-office web console used by bank staff to **author, review, approve, and
manage customer notification templates** (SMS, Email, Push, In-App, WhatsApp).
The defining concern is **governance**: every template change flows through a
**maker–checker** approval process with a full audit trail, versioning, and
data-protection rules around sensitive variables.

The console is fully **bilingual (English / Arabic)**, **right-to-left aware**,
and ships **light + dark** themes, all driven by the bound *Aljazira Bank
Design System*.

### The six journeys

| # | Journey | File | What it does |
|---|---|---|---|
| 1 | **Login + Dashboard** | `console/Login Journey.html` (`login.jsx`) | Staff sign-in (Employee ID + password), then the console home with KPIs + recent activity. |
| 2 | **Templates list** | `console/Templates.html` (`template-list.jsx`) | The Template Store — search, filter by channel/status/product, row actions, routes to View/Edit/Create. |
| 3 | **Create template** | `console/Create Template.html` (`template-studio.jsx`) | Author a new template — two layouts (Workspace / Stepper), live device preview, variable insertion, SMS segment meter. |
| 4 | **View template** | `console/View Template.html` (`view-template.jsx`) | Read-only detail per the Notification Attributes Matrix, version switcher, lifecycle/audit, delete/archive/submit actions. |
| 5 | **Edit template** | `console/Edit Template.html` (`edit-template.jsx`) | Status-aware editing (draft vs active vs archived), version branching, discard guard, saved confirmation. |
| 6 | **Approvals** | `console/Approvals.html` (`approvals.jsx`) | Maker–checker workflow — checker queue + review screen (approve / send back / reject / reassign), maker "My submissions" home. |

---

## 2. About the design files — read this first

The HTML/JSX files under `console/` are **design references / working
prototypes**, not production code to ship as-is. They demonstrate the intended
look, copy, states, and behaviour at high fidelity. They are built with
**in-browser React + Babel** and a shared in-memory data object (`window.TPL`)
— there is **no backend, no router, and no persistence** beyond `localStorage`
for the sidebar-collapse preference.

**The implementation task** is to recreate these designs in the target
codebase's real environment (its framework, component library, state
management, API layer, i18n tooling, and auth), preserving the documented
**business rules** exactly. Where the prototype fakes something (auth, "saving",
the approvals queue), this documentation calls it out and states the *intended*
production behaviour.

### Fidelity

**High-fidelity.** Colours, typography, spacing, component structure, copy
(EN + AR), and interaction states are final and come from the Aljazira Bank
Design System. Recreate the UI faithfully using the codebase's existing
implementation of that design system. Do **not** invent new colours, type, or
components — every value resolves from design tokens (see doc `05`).

---

## 3. How these docs are organised

Read them in order; each is self-contained but builds on the last.

| Doc | Covers |
|---|---|
| **`README.md`** (this file) | Overview, the six journeys, fidelity, versioning policy. |
| **`01-architecture.md`** | Tech stack, full file map, script load order, app bootstrap pattern, the shared `TPL` data layer, and the cross-cutting i18n / RTL / theme / preview-frame contracts. |
| **`02-data-model.md`** | Complete reference for `window.TPL`: channels, products, types, priorities, languages, the dynamic-variable catalogue, sensitive variables, seed datasets, and the **SMS segment/encoding calculator** algorithm. |
| **`03-journeys.md`** | Every screen in detail — purpose, layout, components, states, exact copy, and the demo controls each prototype exposes. |
| **`04-business-rules.md`** | The governance logic that *must* be preserved: maker–checker segregation of duties, the version lifecycle, delete vs archive eligibility, edit-by-status branching, form validation, and sensitive-data masking. |
| **`05-design-system-and-shell.md`** | Design tokens, the design-system components used, and the **shared console shell** (side navigation + collapse) contract that is duplicated across every journey. |

---

## 4. Versioning policy (keep this documentation current)

This is **living documentation**. When the design or business logic changes,
update the docs in the same change and bump the version.

- **Single source of truth.** These docs *describe* the files under `console/`;
  they do not duplicate them. When you change a journey, update the matching
  section here so the two never drift.
- **Semantic versioning** (`MAJOR.MINOR.PATCH`) for these docs, recorded
  alongside each doc's `Docs version` stamp:
  - **MAJOR** — a business rule changes (e.g. maker *can* now self-approve under
    a condition), a journey is added/removed, or the data model changes shape.
  - **MINOR** — new screen state, new field, new copy, additive tweak.
  - **PATCH** — corrections, clarifications, typo/wording fixes.
- **Stamp every doc.** Each file carries a `Docs version` + `Last updated` line
  at the top — bump both when you edit it.
- **Record every design change** in the project-root `../../CHANGELOG.md`
  (the canonical design change log), newest first — see the *Design Change Log
  Rules* in `CLAUDE.md`.

> See the project-root `CHANGELOG.md` for the full design change history.

---

## 5. Source files referenced by these docs

All under `console/` unless noted. Grouped by concern:

- **Shared data / i18n:** `template-data.js` (core `TPL` + EN/AR strings),
  `edit-extras.js`, `list-extras.js`, `delete-extras.js`, `view-extras.js`,
  `approval-extras.js` (each merges its dataset + strings into `TPL`).
- **Shared UI:** `console-shell.jsx` (side nav + collapse), `template-parts.jsx`
  (fields, pickers, device preview, segment meter, variable panel),
  `approval-parts.jsx` (timeline, decision bar, diffs, modals),
  `template-delete.jsx` (kebab menu, delete/archive modals, toast),
  `browser-window.jsx` (chrome frame), `tweaks-panel.jsx` (tweaks shell).
- **Journey controllers:** `login.jsx`, `template-list.jsx`,
  `template-studio.jsx`, `view-template.jsx`, `edit-template.jsx`,
  `approvals.jsx`, and their page shells (the `*.html` files).
- **Styles:** `login.css`, `template-studio.css`, `template-list.css`,
  `template-delete.css`, `view-template.css`, `edit-template.css`,
  `approvals.css`, `template-tweaks.css`, plus the design-system
  `colors_and_type.css` + `components.css` at the project root.
- **Design exploration (not journeys):** `Sidebar Collapse.html`,
  `Side Menu Options.html`, `Sidebar Light vs Dark.html` — reference artifacts
  for the side-nav design decisions.

---

## 6. Assets

- Logos: `assets/logo-white.svg`, `assets/logo-black.svg`,
  `assets/logo-ajb-symbol-white.png` (the `ajb` symbol mark).
- Brand graphic: `assets/j-shape.svg` (the signature "J shape").
- Imagery: `assets/scenery-desert-sunrise.png` (login brand panel).
- Fonts: **Tajawal** (Light/Regular/Medium/Bold) under `fonts/` — Latin + Arabic.
- Icons: **Lucide** (CDN) as a stand-in for the proprietary aljazira icon set.

See `05-design-system-and-shell.md` for how these are wired.
