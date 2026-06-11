# 01 · Architecture

**Docs version:** `1.0.0` · **Last updated:** 7 Jun 2026

How the console is put together: the stack, the file map, how a page boots, the
shared data layer, and the four cross-cutting contracts (i18n, RTL, theming,
preview frame) that every journey obeys.

---

## 1. Tech stack (prototype)

| Concern | Prototype uses | Production guidance |
|---|---|---|
| Rendering | **React 18.3.1** UMD, transpiled in-browser by **Babel standalone** (`<script type="text/babel">`) | Use the codebase's real React/Vue/etc. build pipeline. No in-browser Babel. |
| State | React `useState`/`useMemo`/`useRef` + module-scope data | Real store + server state (React Query/RTK/etc.). |
| Data | A single global `window.TPL` object, assembled at load time | A real API + typed models. `TPL` documents the *shape* and seed content. |
| Routing | Separate `.html` files; navigation is `window.location.href = '…'` | Real client router (`/templates`, `/templates/:id`, `/templates/:id/edit`, `/approvals`, …). |
| Persistence | `localStorage` only for sidebar-collapse preference | Real persistence + user preferences. |
| Icons | **Lucide** via CDN (`<i data-lucide="…">` or an `<Icon>` wrapper) | Codebase icon set; Lucide is a documented stand-in for the aljazira icon family. |
| Auth | Hard-coded demo credentials (see `03-journeys §1`) | Real SSO / staff auth. |

Each page is a fixed-canvas prototype scaled to fit the viewport (a "review
frame"), wrapped in either a **browser-window** chrome (desktop, 1280×812) or a
**phone** frame (mobile, 402×844). This framing is demo scaffolding — see §6.

---

## 2. File map

```
console/
├── Login Journey.html        # Journey 1 shell  → login.jsx
├── Templates.html            # Journey 2 shell  → template-list.jsx
├── Create Template.html      # Journey 3 shell  → template-studio.jsx
├── View Template.html        # Journey 4 shell  → view-template.jsx
├── Edit Template.html        # Journey 5 shell  → edit-template.jsx
├── Approvals.html            # Journey 6 shell  → approvals.jsx
│
├── template-data.js          # CORE data + EN/AR strings → window.TPL
├── edit-extras.js            # + edit i18n, EDIT_TPL, VERSIONS, DRAFT_VERSIONS
├── list-extras.js            # + list i18n, TPL.LIST (the store dataset)
├── delete-extras.js          # + delete/archive i18n
├── view-extras.js            # + view i18n, SENSITIVE, VIEW_TEMPLATES
├── approval-extras.js        # + approvals i18n, TPL.AP (people, QUEUE, MINE, EVENTS)
│
├── console-shell.jsx         # SideNav, SideToggle, useSideCollapse (shared shell)
├── template-parts.jsx        # Field, TextInput, DropSelect, DatePicker, ChannelPicker,
│                             #   ChoiceChips, LangTabs, HiTextarea, VariablePanel,
│                             #   SegmentMeter, DevicePreview, StatusPill, ChannelTag, Icon, L, cx
├── approval-parts.jsx        # apfmt, withTokens, changedFields, historyFromVersions,
│                             #   Avatar, PersonChip, PriorityTag, FieldDiff, ApprovalTimeline,
│                             #   DecisionBar, ReassignModal, SubmitModal
├── template-delete.jsx       # deleteMode, KebabMenu, DeleteModal, ArchiveModal, NeToast
├── template-studio.jsx       # useTemplateForm, DirectionA/B, SavedCard, TemplateList
├── view-template.jsx         # ViewDetails, TokenText, VariablesUsed, VersionSwitcher
├── edit-template.jsx         # EditWorkspace, LockedState, EditSaved, DiscardDialog, StatusBanner
├── template-list.jsx         # TemplateStore
├── approvals.jsx             # ApprovalsConsole + queue/review/maker surfaces
│
├── browser-window.jsx        # ChromeWindow (desktop chrome frame)
├── tweaks-panel.jsx          # TweaksPanel + Tweak* controls
└── *.css                     # per-journey styles (see README §5)

assets/                       # logos, j-shape, scenery, symbol mark
fonts/                        # Tajawal ttf
colors_and_type.css           # design tokens (project root)
components.css                # design-system component classes (project root)
```

> **Files that are NOT journeys:** `Sidebar Collapse.html`,
> `Side Menu Options.html`, `Sidebar Light vs Dark.html` are design-exploration
> artifacts kept for reference on the side-nav decisions. They are not part of
> the product.

---

## 3. Script load order (per page)

Every journey shell loads scripts in a strict order. **Data first, then shared
UI, then the journey controller, then the inline `App`.** Example
(`Templates.html`), abbreviated:

```html
<!-- styles: design system first, then journey -->
<link rel="stylesheet" href="../colors_and_type.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="login.css">          <!-- carries the shared shell CSS -->
<link rel="stylesheet" href="template-studio.css">
<link rel="stylesheet" href="template-tweaks.css">
<link rel="stylesheet" href="template-list.css">
<link rel="stylesheet" href="template-delete.css">

<!-- libs -->
<script src="…/lucide…"></script>
<script src="…/react@18.3.1…"></script>          <!-- pinned + integrity -->
<script src="…/react-dom@18.3.1…"></script>
<script src="…/@babel/standalone@7.29.0…"></script>

<!-- 1) DATA: plain JS, must run before any JSX that reads TPL -->
<script src="template-data.js"></script>
<script src="edit-extras.js"></script>
<script src="list-extras.js"></script>
<script src="delete-extras.js"></script>

<!-- 2) SHARED UI (babel) -->
<script type="text/babel" src="browser-window.jsx"></script>
<script type="text/babel" src="tweaks-panel.jsx"></script>
<script type="text/babel" src="template-parts.jsx"></script>
<script type="text/babel" src="console-shell.jsx"></script>
<script type="text/babel" src="template-delete.jsx"></script>

<!-- 3) JOURNEY CONTROLLER (babel) -->
<script type="text/babel" src="template-list.jsx"></script>

<!-- 4) inline <script type="text/babel"> defines App and mounts it -->
```

**Why the order matters in the prototype** (and what it tells you about real
dependencies):

- The `*-extras.js` files **mutate** `window.TPL` (merge strings + datasets).
  They throw a console error if `template-data.js` has not run. → In production
  these map to separate feature modules/slices that all depend on the core
  domain model.
- JSX files share scope only via `window` (each Babel script is isolated).
  Components are published with `Object.assign(window, { … })` at the end of
  each file and consumed by name. → In production these are normal ES module
  imports.
- `login.css` is loaded by **every** page because it carries the **shared shell
  CSS** (`.ne-home`, `.ne-side`, `.ne-nav-item`, collapse rules). See doc `05`.

---

## 4. App bootstrap pattern

Every page's inline script defines an `App` component and mounts it after a
short delay so the Babel-transpiled shared scripts are all registered:

```jsx
setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}, 50);
```

`App` typically owns the demo-frame state (`theme`, `lang`, `device`, tweaks)
and renders:

```
<App>
 ├─ <div class="ne-review"> … device/theme/lang segmented controls …   (demo only)
 ├─ <div class="ne-fit-wrap">                                          (fit-to-viewport scaler)
 │   └─ ChromeWindow | PhoneFrame
 │       └─ <div class="ne-console" data-theme data-density … lang dir>
 │           └─ <Shell>                  ← shared side-nav + topbar
 │               └─ <JourneyRoot/>        ← TemplateStore / ViewDetails / …
 └─ <TweaksPanel>                                                       (demo only)
```

`<Shell>` is re-declared inline in each page but is identical: it renders
`<SideNav page="…">` from `console-shell.jsx`, the topbar (toggle + symbol mark
+ page title + bell), and the journey body as `children`. See doc `05 §3` for
the shell contract and the **CLAUDE.md rule** that the nav must stay identical
across all pages.

---

## 5. The shared data layer — `window.TPL`

`template-data.js` creates `window.TPL`; each `*-extras.js` augments it. Full
field reference is in `02-data-model.md`. Top-level shape:

```
window.TPL = {
  // catalogues (from template-data.js)
  CHANNELS, PRODUCTS, TYPES, PRIORITIES, LANGS,
  VAR_GROUPS, VAR_INDEX,            // dynamic-variable catalogue + flat lookup
  calcSegments(rawText),           // SMS segment/encoding calculator
  resolveSample(text, lang),       // {{token}} → sample value
  T,                               // i18n: T.en / T.ar (strings, merged by extras)
  SAMPLE, LIST_SEED,               // create-flow sample + list glimpse seed

  // merged in by extras:
  LIST,                            // list-extras: the Template Store dataset
  SENSITIVE,                       // view-extras: sensitive token list
  VIEW_TEMPLATES,                  // view-extras: per-channel detail samples (+ a draft)
  EDIT_TPL, VERSIONS, DRAFT_VERSIONS, // edit-extras: the edited template + histories
  AP: { O,N,S,F, CURRENT, CHECKERS, EVENTS, QUEUE, MINE }, // approval-extras
}
```

`L(obj, lang)` (in `template-parts.jsx`) is the universal localiser: given
`{ en, ar }` it returns the string for the active language. Almost all
human-readable data is stored as `{ en, ar }` pairs.

---

## 6. Cross-cutting contracts

### 6.1 Internationalisation (EN / AR)

- All UI strings live in `TPL.T.en` / `TPL.T.ar`; a journey picks
  `const t = TPL.T[lang]` and reads `t.someKey`.
- Extras modules **merge** their strings into `TPL.T[lang]` with
  `Object.assign`. ⚠️ They merge **flat** keys only — never a nested object that
  would clobber an existing one (e.g. `approval-extras` deliberately avoids a
  `review` key because the core strings already define a `review` object).
- Interpolation helpers replace `{name}`-style placeholders:
  `apfmt`/`vfmt`/`lfmt`/`ndfmt`/`fmt` all do
  `str.replace(/\{(\w+)\}/g, (m,k) => map[k] ?? m)`. (Five identical copies
  exist across files — consolidate to one util in production.)
- Data pairs are localised with `L({en,ar}, lang)`.

### 6.2 RTL / bidirectionality

- Arabic sets `dir="rtl"` on the `.ne-console` container (English `ltr`); this
  **mirrors the whole layout**. Build with **logical properties**
  (`margin-inline-*`, `inset-inline-*`, `text-align: start/end`, fl/grid `gap`)
  so a single `dir` flip mirrors correctly.
- **Latin runs inside Arabic stay upright** by wrapping in `class="ajb-ltr"`
  (`direction: ltr; unicode-bidi: isolate`): template IDs, version labels
  (`v3`), IBANs, dates, numbers, the latin logo. This appears throughout the
  journeys — preserve it.
- Per-field direction: text inputs/areas set `dir` from the *content* language
  (e.g. the message editor flips when editing the Arabic tab), independent of
  the UI language.

### 6.3 Theming (light / dark)

- The system is **dark by default**. Theme is set via `data-theme="dark|light"`
  on `.ne-console` (or any subtree). All chrome colours resolve from semantic
  tokens (`--ajb-bg`, `--ajb-surface`, `--ajb-fg`, `--ajb-accent`, …) so a
  single attribute re-skins everything. See doc `05 §1`.
- One deliberate accent shift: **Sand → Dark Sand** on light theme (Sand washes
  out on pale surfaces). Handled by tokens, not per-component code.
- Theme-aware logo: two `<img>`s (`.ne-logo-dark` white, `.ne-logo-light` black)
  toggled by CSS on the nearest `[data-theme]` ancestor.

### 6.4 The demo preview frame (NOT product UI)

Each page wraps the real console in scaffolding that exists only to present the
prototype. **Do not port this** — it is the harness, not the product:

- **`.ne-review` bar** (top): segmented controls to switch **device**
  (desktop/mobile), **theme** (dark/light), **language** (EN/AR). The **Edit**
  page additionally has a **Scenario** switch (`active | draft | errors | locked
  | saved`) used to demo the status-aware edit states — see `03-journeys §5`.
- **`.ne-fit-wrap` / `.ne-fit`** : a `ResizeObserver`-driven `transform: scale()`
  that fits the fixed canvas to the viewport.
- **`ChromeWindow` / `PhoneFrame`** : faux browser/phone bezels.
- **`<TweaksPanel>`** : live design tweaks (density / surface / sand-accent).
  These map to `data-density` / `data-surface` / `data-accent` on `.ne-console`
  and are design-exploration knobs, not user settings.

In production, the real app renders just the `.ne-console` subtree
(`<Shell>` + journey) inside the real layout, at real viewport size, with theme
and language coming from app/user settings.
