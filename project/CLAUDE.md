# Notification Engine — project rules

## Components: use the Aljazira design system, never invent
- **Always build UI from the Aljazira Bank design system's component specimens** — do not author new/bespoke components when a design-system equivalent exists.
- The design system's canonical component definitions live in
  `/projects/f24f326b-8012-4d7c-aad1-aa995d0fdc1e/preview/*.html`
  (buttons, form-inputs, chips, cards, alerts, badges, tabs, menu, dialog,
  data-table, list-rows, pagination, selection-controls, calendar, progress,
  notifications, avatars, tooltip, etc.). Replicate their exact markup + CSS.
- Drive everything through the design-system tokens in `colors_and_type.css`
  (`var(--ajb-*)`). Never hard-code colors/type/spacing.
- If the design system has no component for a need, ASK before creating one —
  do not silently invent.

## Always retrofit to the design system FIRST
- Before implementing anything new, FIRST retrofit any existing UI to match the
  design system's component specimens. Do the retrofit pass first, then build on
  top of components that already conform. Never build new work on top of
  non-conforming/bespoke components.

## Side menu must stay consistent across ALL journeys
- The console side nav is duplicated across every page shell
  (`login.jsx` home, `Templates.html`, `View Template.html`,
  `Edit Template.html`, `Create Template.html`, `Approvals.html`).
  Nav order: Dashboard · Campaigns · Templates · Approvals · Customers ·
  Delivery · Settings.
- When you add, rename, reorder, or remove a side-menu tab, update EVERY page
  shell — never just one. Add the label to the shared `nav` i18n in
  `template-data.js` (en + ar) so it resolves everywhere, mark the current
  page's item with `on: true`, and give other items an `href` (the shell's
  nav `onClick` does `window.location.href`).

# Design System Enforcement Rules

These rules are mandatory and apply to **every journey, screen, and flow** you build. They override any default styling or component behavior. Follow them exactly.

## 1. Use the design system directory as the only source

- Build **exclusively** from components, icons, colors, typography, and patterns that already exist in our design system directory.
- Do **not** invent, improvise, or pull in icons, components, or styles from outside the design system — not even for empty states, errors, confirmations, loading states, or edge cases.
- If you are unsure whether something exists in the design system, treat it as **not existing** and follow the gap workflow in Rule 2. Do not guess.

## 2. When a needed component does not exist

If a journey genuinely requires a component that is not in the design system, do the following — in this order — before placing it:

1. **Stop and tell me explicitly.** State clearly: what is missing, why the journey needs it, and where it would be used.
2. **Define it as a proper reusable component**, consistent with the existing design system's tokens (colors, spacing, typography, radii, etc.) — never as a one-off visual.
3. **Add it to the design system dictionary** so it becomes a permanent, reusable entry available for future journeys. Give it a clear name and note its intended use.
4. Only then use it in the journey.

Report every newly created component to me in this format:

> **New component created:** `[name]`
> **Purpose:** [what it's for]
> **Used in:** [which journey/screen]
> **Added to design system:** yes

## 3. Never add non-reusable design to a journey

This is a strict, non-negotiable rule:

- **Never** add any design element to a journey unless it is a reusable component that exists in (or has just been added to) the design system.
- No inline, one-off, or "just for this screen" visuals. If it isn't a reusable component, it does not go into the journey.
- If you cannot satisfy a requirement using a reusable component, raise it with me (per Rule 2) instead of working around it.

## 4. Before finishing any journey

Confirm to me that:

- Every element used comes from the design system.
- Any new components were reported and added to the design system dictionary.
- No one-off or outside-the-system designs were introduced anywhere in the journey.

# Design Change Log Rules

These rules are mandatory and apply to **every change you make to the design** — new components, modified components, token changes, journey/screen changes, or removals. They work alongside the Design System Enforcement Rules. A change is **not complete** until it is logged.

The log exists so that a developer or coding agent (Claude Code) can read it and understand exactly what changed, where, and what it means for the code. Write every entry with that reader in mind: be specific, name things exactly, and state the code impact.

## 1. Log every design change

- Maintain a single **`CHANGELOG.md` at the project root** (canonical design
  change log). The bound design system under `_ds/` and `/projects/…/` is
  read-only — do not attempt to log there.
- Every time you add, change, deprecate, or remove a component, token, icon, or journey element, add an entry **before** you consider the task done.
- Never make a design change without a corresponding log entry. No silent changes.

## 2. Entry format

Add new entries at the **top** of the log, grouped under the current date. Use these categories (only the ones that apply):

- **Added** — new components, tokens, icons, or screens
- **Changed** — modifications to existing components or tokens
- **Deprecated** — items still present but no longer recommended
- **Removed** — items deleted from the system
- **Fixed** — corrections to existing design elements

Each entry must include:

- **Name/ID** — the exact name of the component or token as it appears in the design system
- **What changed** — specific, including `old value → new value` where applicable
- **Affected journeys/screens** — everywhere this change shows up
- **Code impact** — what a developer or Claude Code needs to update in the codebase (props, tokens, file/component names if known). Write "None" if purely visual with no code change.

## 3. Entry template

```
## [YYYY-MM-DD]

### Changed
- **Button / Primary** — corner radius 4px → 8px; hover state darkened by one step.
  - Affected: Onboarding, Checkout, Settings journeys.
  - Code impact: update `--radius-button` token; no prop changes.

### Added
- **Toast / Inline** — new reusable notification component for non-blocking alerts.
  - Affected: Notification Engine.
  - Code impact: new component `<InlineToast variant="info|success|error" />`.
```

## 4. Before finishing any task

Confirm to me that:

- Every design change made in this task has a corresponding changelog entry.
- Each entry names the exact component/token, the specific change, the affected journeys, and the code impact.
- The newest entries are at the top, under today's date.
