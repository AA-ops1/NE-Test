# Changelog — Notification Engine handoff docs

All notable changes to **this documentation** (and the design/business logic it
describes) are recorded here. Newest first. See the versioning policy in
`README.md §4`.

Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: SemVer.

---

## [1.0.0] — 7 Jun 2026

Baseline. First complete capture of the Notification Engine console as built in
the prototype.

### Documented
- **Six journeys**: Login + Dashboard, Templates list, Create, View, Edit,
  Approvals (maker–checker).
- **Architecture**: in-browser React + Babel stack, per-page script load order,
  the `setTimeout` bootstrap, and the shared `window.TPL` data layer assembled
  from `template-data.js` + the five `*-extras.js` modules.
- **Cross-cutting contracts**: EN/AR i18n via `TPL.T[lang]`, RTL mirroring with
  logical properties, light/dark theming via `data-theme`, the `.ajb-ltr`
  isolation helper, and the demo preview frame (review bar + device/theme/lang
  segmented controls + Tweaks).
- **Data model**: channels, products, types, priorities, content languages, the
  dynamic-variable catalogue (5 groups), sensitive-variable list, seed datasets
  for every journey, and the GSM-7/UCS-2 **SMS segment calculator**.
- **Business rules**: maker–checker segregation of duties (incl. the
  self-approval guard + reassignment), the template **version lifecycle**
  (draft → in review → active → archived/expired/inactive), **delete vs
  archive** eligibility (`deleteMode`), **edit-by-status** branching
  (draft edits in place / active edits create a new draft version / archived is
  locked), form validation rules, and sensitive-data masking.
- **Design system + shell**: token usage (`--ajb-*`), the design-system
  components consumed, and the shared collapsible side-nav shell duplicated
  across every page (nav order, badge, collapse persistence).

### Known prototype limitations (intended production behaviour noted in docs)
- No backend: auth, "save", submit, approve, delete, archive are simulated in
  React state / `localStorage`.
- Each `*.html` exposes a **demo review bar** (device / theme / language and,
  on Edit, a scenario switcher) that is *not* part of the product UI — see
  `01-architecture.md §6` and `03-journeys.md`.
- Some catalogue lists (channels, types, products, priorities, variable lengths)
  are marked **"assumed"** in the UI, pending business sign-off.

---

<!-- Template for the next entry — copy above this line:

## [x.y.z] — DD Mon YYYY
### Added
### Changed
### Fixed
### Removed
-->
