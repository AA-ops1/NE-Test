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
