# 03 · Journeys (screens, states & copy)

**Docs version:** `1.0.0` · **Last updated:** 7 Jun 2026

Every screen in detail: purpose, layout, the states it can be in, and the
controls each prototype exposes. Business rules referenced here are specified in
full in `04-business-rules.md`.

> **Reminder:** the `.ne-review` bar (device / theme / language, and on Edit a
> *Scenario* switch) and the Tweaks panel are **demo scaffolding**, not product
> UI (see `01 §6`). Below, "demo control" flags these.

Every journey renders inside the **shared shell** (`05 §3`): left side-nav
(Dashboard · Campaigns · Templates · Approvals · Customers · Delivery ·
Settings) + topbar (collapse toggle, `ajb` symbol, page title, notification
bell). Only **Templates**, **Approvals**, and **Dashboard** are wired; the rest
are visual placeholders.

---

## 1. Login + Dashboard — `Login Journey.html` (`login.jsx`)

### Sign-in
**Purpose:** authenticate bank staff into the console.

**Two layout directions** (the file ships both; pick one in production):
- **Direction A — brand split:** left brand panel (desert-sunrise photo + J-shape
  + white logo + headline "Every message, with care."), right sign-in form.
- **Direction B — centered card:** a single centered console card over the
  J-shape graphic.

**Form fields:** Employee ID (numeric, **6 digits**, auto-strips non-digits),
Password (with show/hide toggle), "Keep me signed in" checkbox, "Forgot
password?" link, primary **Sign in** button. Footer: "For authorized staff
only. Activity is monitored." + IT service-desk link.

**State machine** (`status`): `idle → loading → (success | invalid | locked)`.
- **Demo credentials:** ID `100245`, password `aljazira` (`NE_VALID`).
- **Validation:** ID required + must be 6 digits (`reqId` / `reqIdFmt`);
  password required (`reqPw`).
- **Invalid:** danger alert "Incorrect employee ID or password" + remaining
  attempts. **Max 3 attempts** (`MAX_ATTEMPTS`) → **locked**.
- **Locked:** danger alert "Account locked" + IT-desk contact; inputs disabled.
- **Success:** renders `ConsoleHome`.

> Production: replace with real staff auth/SSO. Keep the 6-digit ID format,
> attempt-limit + lockout messaging, and the "monitored" notice.

### Dashboard (`ConsoleHome`)
**Purpose:** post-login landing.

**Layout:** shared shell + content: welcome heading ("Welcome back, Omar"),
**3 KPI stat cards** (Sent today `24,180` +8.2% · Scheduled `7` · Delivery rate
`99.4%` +0.3%), then a **Recent activity** panel — list rows with icon, title,
sub, and a status badge (Sent=success / Scheduled=info / Draft=neutral).

> This dashboard's nav is wired to Templates + Approvals. Its KPIs/activity are
> static demo content.

---

## 2. Templates list — `Templates.html` (`template-list.jsx` → `TemplateStore`)

**Purpose:** the Template Store — find, filter, and act on templates.

**Layout:** header (title "Templates" · live count · search box · **New
template** primary button) → filter bar → data table.

**Filters** (all client-side, combined with AND; `rows` memo):
- **Channel chips** — All + one per channel (icon + label).
- **Status** dropdown — All + the 6 statuses.
- **Product** dropdown — All + the 7 products.
- **Search** — matches name (EN + AR) and ID, case-insensitive.
- **Clear filters** appears when any filter is dirty. Empty result → empty state
  ("No templates match") with a clear-filters action.

**Table columns:** Name (channel icon + name + ID) · Product · Type · Version ·
Status (pill) · Updated (relative + "by {person}") · Actions.

**Row actions:**
- Whole row click → **View** (`View Template.html?ch={detail}`).
- Eye icon → View. Pencil icon → **Edit** (disabled when status is
  `expired`/`archived`, per `TL_EDITABLE`).
- **Kebab** (`KebabMenu`): Duplicate · Archive · ⎯ · **Delete** (delete is
  destructive-styled and **disabled unless `status === 'draft'`**, with hint
  "Only drafts can be deleted"). Archived rows show only Duplicate.

**Delete / Archive** open modals from `template-delete.jsx`; confirmation fires
a bottom-center **toast** and mutates the local `data`. See `04 §4`.

---

## 3. Create template — `Create Template.html` (`template-studio.jsx`)

**Purpose:** author a new template for a product + channel.

**Two layout directions** (demo control switches them):
- **Direction A — Workspace (two-pane):** left = form (3 numbered section cards:
  *Template details*, *Message content*, *Delivery & validity*); right rail =
  **device preview** + **segment meter** + **variable panel**. Header has
  breadcrumb, title + "New · Draft" badge, and actions (Cancel / Save as draft /
  Save template).
- **Direction B — Stepper (guided):** 3 steps — *Details → Content → Review* —
  with a progress stepper, per-step body, and a footer (Back / Save as draft /
  Continue → Review & save). Step 2 shows preview + variables alongside; Step 3
  shows a read-only review (key-value summary) + settings + preview.

**Form model** (`useTemplateForm` → `blank()`):
```
name, desc, product, channel(='sms'), type, priority(='normal'),
langs(['en']), activeLang('en'),
content{en,ar}, subject{en,ar}, ntitle{en,ar},
validFrom('2026-06-02'), validTo(''), tags[], notes, sampleMode(false)
```

**Section 1 — Template details:** Name (required), Description, Related product
(required, "assumed"), Priority (chips), Channel category (required, "assumed",
`ChannelPicker`), Template type (required, "assumed", chips).

**Section 2 — Message content:**
- **Language tabs** (`LangTabs`) — add EN/AR; the active tab decides which
  `content[lang]` is edited and the editor's `dir`.
- **Channel-conditional fields:** Subject (email) / Title (push, inapp) above
  the body. Body uses `HiTextarea` with placeholder guidance.
- **Variable panel** — searchable list of the variable catalogue grouped by
  category; clicking inserts `{{token}}` at the cursor (`insert()` preserves
  selection + refocuses).
- **Segment meter** — for sms/whatsapp; live from `calcSegments`.
- **Sample data toggle** — preview swaps `{{tokens}}` for sample values.

**Section 3 — Delivery & validity:** Valid from (required, "assumed",
`DatePicker`), Valid to (empty = "No end date (open)"), Tags (enter-to-add
chips), Attachments (drop zone — visual only), Internal notes (reviewer-only).

**Validation** (`errors` memo, shown after submit): name, product, channel,
type, content (active language), validFrom. Failing → "Please complete the
highlighted fields." See `04 §3`.

**Save → `SavedCard`:** success result "Template saved as draft" + "A
maker–checker review is required before it can be activated." Shows generated
Template ID, version `v1`, status Draft, created-by/maker/checker (Pending).
Actions: **Create another** / **Go to templates** (→ `TemplateList` glimpse).

> Production: "Save" persists a draft (status `draft`, version `v1`, maker =
> current user, checker pending). Activation requires the approval flow (`06`).

---

## 4. View template — `View Template.html` (`view-template.jsx` → `ViewDetails`)

**Purpose:** read-only detail of a template, per the **Notification Attributes
Matrix** (what's shown depends on TYPE + CHANNEL). Routed with `?ch=sms|email|
push`; defaults to the SMS sample.

**Header:** breadcrumb → name + **status pill** + version chip + "Read-only"
tag; meta line (ID · last updated by · when). **Actions** are status-aware:
- **Kebab:** Duplicate · Export · Archive · Delete (draft-only, else disabled).
  Archived → only Duplicate + Export.
- **Primary button(s):**
  - Archived → **Duplicate**.
  - In review (after submit) → an "Awaiting {checker}" info badge (no edit).
  - Draft → **Edit template** (secondary) + **Submit for review** (primary).
  - Active/other → **Edit template**.

**Version bar:** "Viewing {version}" + a **VersionSwitcher** dropdown (lists all
versions with status, who/when, "Latest" marker). Selecting an older
(non-current) version shows an info banner "You're viewing an older version" +
"View latest version".

**Body (two-pane):**
- **Left column — cards:**
  1. **Overview** — key-value attributes (product, type, channel tag, priority;
     valid from/to, content languages, tags).
  2. **Content structure** — channel-specific read-only render with a language
     segmented control (EN / AR / **Both**):
     - email → Subject + Body + **Attachments** list (name + size + download).
     - push/inapp → Title + Body; push also shows **Image URL**.
     - sms/whatsapp → Body only.
     - `{{tokens}}` render as chips; **sensitive** tokens get a distinct style.
  3. **Variables in this template** — extracted tokens with labels; sensitive
     ones flagged "Sensitive" + a masking note (`04 §6`).
  4. **Lifecycle & audit** — created / last updated / maker / checker /
     approval; if archived: archived-by / at / reason.
  5. **Approval history** — `ApprovalTimeline` built from the version history
     (`historyFromVersions`).
- **Right rail:** device preview (+ sample-data toggle), segment meter
  (sms/whatsapp), and a compact version-history list.

**Embedded flows (all open modals + toast):**
- **Submit for review** (draft) → `SubmitModal` → status flips to in-review,
  toast "Submitted for review · Assigned to {checker}".
- **Delete** (draft + unused) → `DeleteModal` → "deleted" empty state
  ("This template was deleted") + audit toast. Blocked variants for non-draft /
  used. See `04 §4`.
- **Archive** → `ArchiveModal` (optional reason) → archived banner + lifecycle
  rows + toast. Archived templates are locked from editing.

---

## 5. Edit template — `Edit Template.html` (`edit-template.jsx`)

**Purpose:** modify a template; the experience and outcome depend on its
**status** (this is the core business rule — `04 §5`).

**Scenario switch (demo control)** drives five states:
`active | draft | errors | locked | saved`.

**`EditWorkspace`** (active/draft/errors) — two-pane like Create's Direction A,
reusing `DetailsFields` / `ContentArea` / `SettingsFields` and a rail with
preview + segment + variables + **version history**. Header: breadcrumb (Templates
→ {name} → Edit), name + status pill + version chip, last-updated meta, and an
**"Unsaved changes"** flag when `dirty`.

**Status-aware banner (`StatusBanner`) + actions (`EditActions`):**
- **Draft** → info banner "You're editing draft {v} directly". Actions: Cancel /
  **Save as draft** / **Save changes** (saves to the same version).
- **Active / inactive-versioned** → warning banner "This is the active version
  ({v})… saving creates a new draft version ({next}) for maker–checker review;
  {v} stays live until approved." Actions: Cancel / **Save as new draft** /
  **Save & submit for review**. A pending **new version** row (e.g. v4, "New")
  appears in the version history when `dirty`.
- **Errors** → danger banner "Some fields need attention"; same actions as
  active; fields are pre-marked invalid.

**Dirty tracking:** `fingerprint(data)` excludes view-only fields
(`activeLang`, `sampleMode`) so switching language/tabs is **not** treated as an
edit. Cancel while dirty → **Discard dialog** ("Discard your changes?" / Keep
editing / Discard) → back to View.

**`LockedState`** (archived) — a centered locked card: "This template can't be
edited / It's archived. Restore it from version history…" with **Back to
templates** + **Restore template**. Archived = not editable.

**`EditSaved`** — success card. Two shapes:
- new-version path (`submit` / `draftNew`) → "New version submitted for review",
  status `review`, shows the new version label, maker, checker (Pending).
- same-draft path → "Draft updated", status `draft`.
Actions: **Back to template** / **View version**.

---

## 6. Approvals — `Approvals.html` (`approvals.jsx` → `ApprovalsConsole`)

**Purpose:** the maker–checker workflow. The full governance spec is in
`04 §1–2`; this section covers the surfaces.

**Role switch (demo control):** `checker` ↔ `maker`. (Production: derived from
the signed-in user's role/assignment.) Queue + "mine" state is lifted to `App`
so the **nav badge count stays live**.

### 6a. Checker queue (`CheckerQueue`)
**Purpose:** the checker's inbox of submissions awaiting review.

**Layout:** header (title "Approvals" + "{n} awaiting your review"); then a
**table** or **cards** view (demo tweak `queueView`). Each item: channel icon +
name (+ "Your template" tag if `ownWork`) + ID/type, **change kind** (New
template / "{prev} → {ver}" content change), maker (`PersonChip`), submitted-ago,
**priority tag**, and a **Review** button. Empty → "You're all caught up".

### 6b. Review screen (`ReviewScreen`)
**Purpose:** examine one submission and decide.

**Two variants** (demo tweak `reviewLayout`): **split** (two-pane: content left,
decision + preview rail right) or **stacked** (single column + a sticky
**decision dock** at the bottom).

**Content:**
- **Back to approvals** link.
- **Summary card** — channel icon, name, ID, channel tag, product; status pill +
  **kind tag** (New / "{prev}→{ver}") + priority; "Submitted by {maker} on
  {date}"; the **maker's note**.
- **What changed** — for `edit`, a per-field **diff** (`changedFields` compares
  `prev` vs proposed; `FieldDiff` shows before/after) with a changed-field count
  and an EN/AR/Both language segmented control. For `new`, an info alert "New
  template — approving it activates the template for sending."
- **Content under review** — read-only render (same channel logic as View) with
  the language segmented control, plus the **variables used** (sensitive flagged).
- **Approval history** timeline.
- **Decision bar** (`DecisionBar`): **Approve & activate** / **Send back** /
  **Reject** / **Reassign**. Send-back and Reject **require a reason**; Approve
  takes an optional note. If `ownWork` (maker === current user), approval is
  **blocked** by a segregation-of-duties guard offering **Reassign** only.

**Decision outcomes** (remove from queue + toast):
- Approve → "Approved & activated · {name} is now live".
- Send back → "Sent back to maker · returned to {maker} with your note".
- Reject → "Template rejected · will not be activated" (terminal).
- Reassign (`ReassignModal`, pick another checker) → "Reassigned for review".

### 6c. Maker home (`MakerHome`) — "My submissions"
**Purpose:** the maker tracks their own templates.

**Layout:** header ("My submissions") + a **state filter** segmented control
(All / Ready to submit / In review / Sent back / Approved). Cards sorted
ready → sent_back → review → approved. Per state:
- **ready** — "Draft complete" + **Submit for review** (`SubmitModal`, pick
  checker; can't self-assign) → moves to `review` + toast.
- **review** — "Awaiting {checker} · {when}".
- **sent_back** — checker's note + **Edit & resubmit**.
- **approved** — "Approved by {checker} · {when}".

Empty → "Nothing submitted yet".

> Production: role + assignment come from auth; queue/mine are server state.
> Decisions persist to the audit trail and notify the counterpart.
