# Aljazira Bank — Mobile App UI Kit

A high-fidelity mobile banking app **inferred** from Aljazira's brand language. The brand book ships social-media patterns (X, Instagram, Facebook, YouTube) but does not document a specific mobile app design — so this kit applies the brand's foundations (gradient backgrounds, Tajawal type, J-shape, sand-accent rule, linear icons) to a typical Saudi retail-banking flow.

## Files

| File | What |
|---|---|
| `index.html` | Interactive prototype — iOS frame + 5 screens + live component gallery |
| `ios-frame.jsx` | Device-bezel starter (iPhone status bar + home indicator) |
| `app/Screens.jsx` | All five screens — Onboarding, Home, Transactions, Transfer, Card |
| `app/Atoms.jsx` | App-specific pieces: buttons, balance display, transaction row, account chip, header |
| `app/Components.jsx` | **Reusable component library** — 23 token-driven components (see below) |
| `app/Gallery.jsx` | Live, interactive showcase of the component library (the "Components" screen) |
| `app/Nav.jsx` | Bottom tab bar + screen router |
| `app/store.jsx` | Single shared `useApp` hook for navigation + transient state |
| `app.css` | All styles — app screens (`.ajb-app-*`) and the component library (`.ajbc-*`) |

## Component library (`app/Components.jsx`)

The design system's components are wired in as **reusable React components**, each built purely on the semantic tokens in `colors_and_type.css` — so they inherit `data-theme` (light/dark) and `dir="rtl"` automatically. Every component is exported to `window`, so any screen can use it directly.

| Component | Props (key ones) |
|---|---|
| `<Badge tone>` | `neutral · sand · success · warning · danger · info` |
| `<StatusDot tone>` · `<CountBadge tone>` | colored status indicators |
| `<Alert tone title onClose>` | `success · danger · warning · info` |
| `<Radio>` `<Checkbox>` (+ `indeterminate`) `<Toggle>` | `checked`, `onChange`, `label` |
| `<Segmented options value onChange>` | pill segmented control |
| `<Tabs tabs value onChange>` | underline tabs, optional `badge` |
| `<Select label value placeholder focus>` | field-style select |
| `<Avatar size src\|initials\|symbol>` · `<AvatarStack items more>` | |
| `<ProgressBar value label right>` · `<Spinner label size>` · `<Skeleton w h radius>` | |
| `<Chip onRemove selected dashed>` | input / filter chips |
| `<Pagination page pages last onChange>` · `<Breadcrumb items>` | |
| `<Calendar value onChange year month>` · `<DateField label value>` | interactive month picker + field |
| `<Toast tone icon title action onAction>` | snackbar |
| `<EmptyState icon title action onAction>` | |
| `<ListRow icon title sub value trailing toggleOn>` | `trailing: chevron \| toggle` |

State-bearing components (Segmented, Tabs, Toggle, Calendar, etc.) are **uncontrolled by default** (internal state) and become **controlled** when you pass `value`/`checked` + `onChange`. Open the **Components** screen in the prototype to see all 23 live and interactive.

## Screens covered

1. **Onboarding** — split layout: hero photo with J-shape mask, sand-accent headline, primary/ghost CTAs.
2. **Home** — current account balance, three quick-action chips (Transfer, Pay, Top-up), savings goal card, recent transactions.
3. **Transactions** — full account detail with searchable, grouped transaction list.
4. **Transfer flow** — three-step wizard: pick recipient → amount → confirm → success.
5. **Card** — single card screen with freeze toggle, statement, settings.
6. **Components** — a live gallery of the full reusable component library (12 sections, all interactive).

## Marked as inferred

- **Visuals: brand-faithful.** Background gradient, Tajawal type, Sand accents, photography, logo placement, linear icons.
- **Functionality: inferred.** Transaction copy, transfer flow steps, card states, and account labels are reasonable defaults; if your team has the real app's IA, swap them in.
