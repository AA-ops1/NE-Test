# Dictionary additions — new components

These components were hand-rolled inside the **Notification Engine** build, then
promoted into reusable, token-driven components. The working copy lives in this
project's `console/components.css`. Because the canonical design-system project
is read-only from here, apply them there by following the dictionary's own
**"Adding a new component"** workflow (3 files).

| Component | Classes | Group |
|---|---|---|
| Option cards | `.ajb-optioncards` / `.ajb-optioncard` | Forms |
| Stepper | `.ajb-stepper` / `.ajb-step` / `.ajb-step-line` | Navigation |
| Date field | `.ajb-datefield` | Forms |
| Stat | `.ajb-stat` (`__label` / `__value` / `__delta`) | Data display |
| Description list | `.ajb-kv` / `.ajb-kv__row` | Data display |
| Result | `.ajb-result` (`--success` / `--danger` / `--info`) | Feedback |
| Calendar / date picker | `.ajb-calendar` (+ `.ajb-calendar__day` states) | Forms |
| **Person** | `.ajb-person` (`__name` / `__sub`) | Data display |
| **Timeline** | `.ajb-timeline` / `.ajb-timeline__item` (`--sand`/`--success`/`--warning`/`--danger`/`--info`) | Data display |
| **Diff** | `.ajb-diff` (`__box--before`/`--after`, `__mark--del`/`--ins`) | Data display |

**Variant on an existing component:** `.ajb-dot--info` (sky-blue) rounds out the
status-dot set. The maker–checker **priority** indicator now uses the real
`.ajb-status` + `.ajb-dot--*` component (low → muted, normal → info, high →
warning, critical → danger) instead of a bespoke pill.

---

## 1 · `components.css`
Append the contents of **`components-additions.css`** (in this folder) to the
design system's `components.css`. No token changes are needed — the blocks reuse
the existing semantic + state-tint tokens.

## 2 · `dictionary.html` — add these entries to the `CATALOG`
Drop each object into the matching group's `items` array.

```js
// → Forms group
{ name: "Option cards", cls: ".ajb-optioncards · .ajb-optioncard", desc: "Single-select tile group — icon over label. Columns via --ajb-optioncols; mark the choice with .is-on.", layout: "col",
  html:
`<div class="ajb-optioncards" style="--ajb-optioncols:5">
  <div class="ajb-optioncard is-on">${ICON('message-square')}<span>SMS</span></div>
  <div class="ajb-optioncard">${ICON('mail')}<span>Email</span></div>
  <div class="ajb-optioncard">${ICON('bell')}<span>Push</span></div>
  <div class="ajb-optioncard">${ICON('layout-template')}<span>In-App</span></div>
  <div class="ajb-optioncard">${ICON('message-circle')}<span>WhatsApp</span></div>
</div>` },

{ name: "Date field", cls: ".ajb-datefield", desc: "Native date input on the underline baseline with a leading calendar icon. Focus turns the underline Sand.", layout: "row",
  html:
`<div class="ajb-datefield" style="width:240px">${ICON('calendar')}<input type="date" value="2026-06-02"></div>` },

{ name: "Calendar / date picker", cls: ".ajb-calendar", desc: "Month calendar popover that pairs with an .ajb-select trigger. Day states: .is-muted / .is-today / .is-on; ranges use .in-range + .is-start/.is-end.", layout: "center",
  html:
`<div class="ajb-calendar">
  <div class="ajb-calendar__head">
    <div class="ajb-calendar__title">June 2026</div>
    <div class="ajb-calendar__nav"><button>${ICON('chevron-left')}</button><button>${ICON('chevron-right')}</button></div>
  </div>
  <div class="ajb-calendar__grid">
    <div class="ajb-calendar__dow">S</div><div class="ajb-calendar__dow">M</div><div class="ajb-calendar__dow">T</div><div class="ajb-calendar__dow">W</div><div class="ajb-calendar__dow">T</div><div class="ajb-calendar__dow">F</div><div class="ajb-calendar__dow">S</div>
    <div class="ajb-calendar__day is-muted"></div>
    <div class="ajb-calendar__day">1</div><div class="ajb-calendar__day is-today">2</div><div class="ajb-calendar__day">3</div><div class="ajb-calendar__day">4</div><div class="ajb-calendar__day">5</div><div class="ajb-calendar__day">6</div>
    <div class="ajb-calendar__day">7</div><div class="ajb-calendar__day">8</div><div class="ajb-calendar__day">9</div><div class="ajb-calendar__day">10</div><div class="ajb-calendar__day">11</div><div class="ajb-calendar__day">12</div><div class="ajb-calendar__day">13</div>
    <div class="ajb-calendar__day">14</div><div class="ajb-calendar__day is-on">15</div><div class="ajb-calendar__day">16</div><div class="ajb-calendar__day">17</div><div class="ajb-calendar__day">18</div><div class="ajb-calendar__day">19</div><div class="ajb-calendar__day">20</div>
  </div>
</div>` },

// → Navigation group
{ name: "Stepper", cls: ".ajb-stepper · .ajb-step", desc: "Multi-step progress. Active step .is-on, completed steps .is-done; cross lines get .is-done.", layout: "center",
  html:
`<div class="ajb-stepper">
  <div class="ajb-step is-done"><span class="ajb-step__dot">${ICON('check')}</span><span class="ajb-step__label">Details</span></div>
  <span class="ajb-step-line is-done"></span>
  <div class="ajb-step is-on"><span class="ajb-step__dot">2</span><span class="ajb-step__label">Content</span></div>
  <span class="ajb-step-line"></span>
  <div class="ajb-step"><span class="ajb-step__dot">3</span><span class="ajb-step__label">Review</span></div>
</div>` },

// → Data display group
{ name: "Stat", cls: ".ajb-stat", desc: "A KPI figure — label, value, optional delta (--up / --down). Place inside an .ajb-card.", layout: "row",
  html:
`<div class="ajb-card" style="width:220px"><div class="ajb-stat">
  <div class="ajb-stat__label">Sent today</div>
  <div class="ajb-stat__value">24,180</div>
  <div class="ajb-stat__delta ajb-stat__delta--up">+8.2%</div>
</div></div>
<div class="ajb-card" style="width:220px"><div class="ajb-stat">
  <div class="ajb-stat__label">Delivery rate</div>
  <div class="ajb-stat__value">99.4%</div>
  <div class="ajb-stat__delta ajb-stat__delta--up">+0.3%</div>
</div></div>` },

{ name: "Description list", cls: ".ajb-kv · .ajb-kv__row", desc: "Key / value rows for review & detail summaries.", layout: "col",
  html:
`<div class="ajb-kv">
  <div class="ajb-kv__row"><span class="ajb-kv__key">Template name</span><span class="ajb-kv__val">Card transaction alert</span></div>
  <div class="ajb-kv__row"><span class="ajb-kv__key">Channel</span><span class="ajb-kv__val">SMS</span></div>
  <div class="ajb-kv__row"><span class="ajb-kv__key">Valid from</span><span class="ajb-kv__val">02 Jun 2026</span></div>
</div>` },

// → Feedback group
{ name: "Result", cls: ".ajb-result", desc: "Outcome confirmation — centered icon badge, title, text. Tint per intent with --success / --danger / --info.", layout: "center",
  html:
`<div class="ajb-result ajb-result--success">
  <div class="ajb-result__badge">${ICON('check')}</div>
  <h2 class="ajb-result__title">Template saved as draft</h2>
  <p class="ajb-result__text">A maker-checker review is required before it can be activated.</p>
</div>` },

// → Data display group
{ name: "Person", cls: ".ajb-person", desc: "Identity chip — an .ajb-avatar beside a name and an optional secondary line (role / team / time). The atom for actor rows, assignees and table owner cells.", layout: "row",
  html:
`<span class="ajb-person">
  <span class="ajb-avatar ajb-avatar--xs"><span>A</span></span>
  <span class="ajb-person__txt"><span class="ajb-person__name">A. Al Amri</span><span class="ajb-person__sub">Compliance · Maker</span></span>
</span>` },

{ name: "Timeline", cls: ".ajb-timeline · .ajb-timeline__item", desc: "Activity feed / audit trail. Tint each node with an item modifier (--sand/--success/--warning/--danger/--info); the actor pill __tag takes the same tints; __ico--pulse marks a live step.", layout: "col",
  html:
`<ol class="ajb-timeline">
  <li class="ajb-timeline__item ajb-timeline__item--sand">
    <span class="ajb-timeline__ico">${ICON('send')}</span>
    <div class="ajb-timeline__body"><div class="ajb-timeline__top"><span class="ajb-timeline__action">Submitted for review</span><span class="ajb-timeline__by">· N. Al Harbi</span><span class="ajb-timeline__tag ajb-timeline__tag--sand">Maker</span></div><div class="ajb-timeline__when">04 Jun 2026, 08:42</div></div>
  </li>
  <li class="ajb-timeline__item ajb-timeline__item--success">
    <span class="ajb-timeline__ico">${ICON('check')}</span>
    <div class="ajb-timeline__body"><div class="ajb-timeline__top"><span class="ajb-timeline__action">Approved &amp; activated</span><span class="ajb-timeline__by">· S. Al Qahtani</span><span class="ajb-timeline__tag ajb-timeline__tag--info">Checker</span></div></div>
  </li>
  <li class="ajb-timeline__item ajb-timeline__item--info">
    <span class="ajb-timeline__ico ajb-timeline__ico--pulse">${ICON('clock')}</span>
    <div class="ajb-timeline__body"><div class="ajb-timeline__top"><span class="ajb-timeline__action">Awaiting decision</span><span class="ajb-timeline__tag ajb-timeline__tag--info">Checker</span></div></div>
  </li>
</ol>` },

{ name: "Diff", cls: ".ajb-diff", desc: "Before / after comparison of a field — current vs proposed columns with word-level marks (__mark--del removed, __mark--ins added). Auto-stacks when narrow.", layout: "col",
  html:
`<div class="ajb-diff">
  <div class="ajb-diff__label">Subject line</div>
  <div class="ajb-diff__grid">
    <div class="ajb-diff__side"><div class="ajb-diff__tag ajb-diff__tag--before">${ICON('minus')}Current</div><div class="ajb-diff__box ajb-diff__box--before">Your statement is ready<mark class="ajb-diff__mark ajb-diff__mark--del">.</mark></div></div>
    <div class="ajb-diff__side"><div class="ajb-diff__tag ajb-diff__tag--after">${ICON('plus')}Proposed</div><div class="ajb-diff__box ajb-diff__box--after">Your statement is ready <mark class="ajb-diff__mark ajb-diff__mark--ins">— due today.</mark></div></div>
  </div>
</div>` },

{ name: "Status dot — info", cls: ".ajb-dot--info", desc: "New sky-blue variant rounding out the labelled-dot set. (Priority indicators map low→muted, normal→info, high→warning, critical→danger.)", layout: "col",
  html:
`<span class="ajb-status"><span class="ajb-dot ajb-dot--muted"></span>Low</span>
<span class="ajb-status"><span class="ajb-dot ajb-dot--info"></span>Normal</span>
<span class="ajb-status"><span class="ajb-dot ajb-dot--warning"></span>High</span>
<span class="ajb-status"><span class="ajb-dot ajb-dot--danger"></span>Critical</span>` },
```

## 3 · `COMPONENTS.md` — add these sections

```md
### Option cards — `.ajb-optioncards` / `.ajb-optioncard`
Single-select tile group; each card is an icon over a label. Set the column
count with `--ajb-optioncols` (default 4); mark the chosen card with `.is-on`;
disable with `.is-disabled`.

### Date field — `.ajb-datefield`
Native date input on the underline-input baseline with a leading calendar icon.
Focus turns the underline Sand.

### Calendar / date picker — `.ajb-calendar`
Month calendar popover; pair it with an `.ajb-select` trigger (or `.ajb-datefield`)
for a full date picker. Day states: `.is-muted` (other month), `.is-today`,
`.is-on` (selected). Range select adds `.in-range` with `.is-start` / `.is-end`
on the endpoints. Mirrors under `dir="rtl"`.

### Stepper — `.ajb-stepper` / `.ajb-step`
Multi-step progress. Active step `.is-on`, completed steps `.is-done` (put a
check icon in `.ajb-step__dot`). Separate with `.ajb-step-line` (`.is-done` once
crossed).

### Stat — `.ajb-stat`
A KPI figure: `__label`, `__value`, optional `__delta` (`--up` / `--down`).
Place inside an `.ajb-card`.

### Description list — `.ajb-kv` / `.ajb-kv__row`
Key/value rows (`__key`, `__val`) for review and detail summaries.

### Result — `.ajb-result`
Outcome confirmation: centered `__badge`, `__title`, `__text`. Tint the badge
per intent with `--success` / `--danger` / `--info` (default Sand).

### Person — `.ajb-person`
Identity chip: an `.ajb-avatar` beside `__name` and an optional `__sub` line
(role, team, timestamp). The atom for actor rows, assignees, table owner cells
and comment authors.

### Timeline — `.ajb-timeline` / `.ajb-timeline__item`
Activity feed / audit trail on a connecting rail. Each `__item` holds an
`__ico` node, an `__action` + `__by` actor, an `__when` timestamp and an
optional `__note`. Tint the node with an item modifier (`--sand` / `--success`
/ `--warning` / `--danger` / `--info`); the actor pill `__tag` takes the same
tints (`--sand` / `--info` / `--muted`). Add `.ajb-timeline__ico--pulse` for a
live "in progress" step. Mirrors under `dir="rtl"`.

### Diff — `.ajb-diff`
Before/after comparison of one field: a `__label` over a two-column `__grid`
of `__box--before` (current) and `__box--after` (proposed). Word-level changes
are wrapped in `__mark--del` (removed) / `__mark--ins` (added). The grid
auto-stacks to a single column on narrow containers; pass `dir` on each box for
mixed-script copy.

### Status dot — new `.ajb-dot--info`
Adds a sky-blue informational variant beside `--success` / `--warning` /
`--danger` / `--muted`. Used by priority indicators (low → muted, normal →
info, high → warning, critical → danger).
```

---

### Not promoted (intentionally)
These stayed app-specific to the Notification Engine and were **not** added to the
dictionary, as they encode product domain rather than reusable bank UI:
SMS **segment/encoding meter**, channel **device previews** (SMS/email/push/in-app),
the **variable inserter** panel, and the **token-highlighting message editor**.
The console shell (sidebar nav + top bar) and the marketing **auth layouts**
(brand split / centered) also remain local. Say the word if you'd like any of
these formalized too.
