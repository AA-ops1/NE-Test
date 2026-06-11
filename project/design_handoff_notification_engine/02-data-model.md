# 02 · Data model & the SMS segment calculator

**Docs version:** `1.0.0` · **Last updated:** 7 Jun 2026

Complete reference for `window.TPL` — the catalogues, the dynamic-variable
system, sensitive variables, seed datasets, and the SMS segment/encoding
algorithm. Source: `template-data.js` + the five `*-extras.js` files.

> **Lists marked "assumed"** in the UI are sensible banking defaults pending
> business sign-off (channels, types, products, priorities, per-variable
> lengths, default validity). Treat them as configurable, not hard-coded law.

---

## 1. Catalogues (`template-data.js`)

All carry `{ id, en, ar }`; channels also carry an `icon` (Lucide name).

### Channels — `TPL.CHANNELS`
| id | EN | icon | content fields it drives |
|---|---|---|---|
| `sms` | SMS | `message-square-text` | body + **segment meter** |
| `email` | Email | `mail` | **subject** + body + attachments |
| `push` | Push | `smartphone` | **title** + body + image URL |
| `inapp` | In-App | `bell-ring` | **title** + body |
| `whatsapp` | WhatsApp | `message-circle` | body + **segment meter** |

> The channel determines which content fields appear. Logic lives in
> `channelFields(ch)` (`template-studio.jsx`): `subject` for email, `title` for
> push/inapp, `segments` for sms/whatsapp. View/Approvals mirror this.

### Products — `TPL.PRODUCTS`
`accounts` Personal Accounts · `cards` Credit Cards · `finance` Personal Finance
· `mortgage` Home Finance · `wealth` Investment & Wealth · `digital` Digital
Banking · `transfers` Transfers & Remittances.

### Template types — `TPL.TYPES`
`otp` OTP / Verification · `transaction` Transaction Alert · `reminder` Reminder
· `security` Security Alert · `service` Service Notice · `statement` Statement /
Document · `marketing` Marketing.

### Priorities — `TPL.PRIORITIES`
`low` · `normal` · `high` · `critical`.

### Content languages — `TPL.LANGS`
`en` (English, native "English", `ltr`) · `ar` (Arabic, native "العربية",
`rtl`). A template declares which languages it carries (`langs: ['en','ar']`);
content is authored per language.

---

## 2. Dynamic variables — `TPL.VAR_GROUPS` / `TPL.VAR_INDEX`

Tokens written as `{{group.name}}` in message content, replaced with live
customer data at send time. Five groups; each variable has:

- `token` — e.g. `customer.first_name`
- `len` — **assumed resolved character length** (drives the segment estimate)
- `en` / `ar` — sample values for the "sample data" preview toggle
- `lbl_en` / `lbl_ar` — human label shown in the variable panel

| Group (`id`, icon) | Tokens (`token` · len · EN sample) |
|---|---|
| **Customer** (`customer`, `user`) | `customer.first_name` ·7· "Omar" — `customer.full_name` ·16· "Omar Al Otaibi" — `customer.cif` ·9· "100245982" 🔒 |
| **Account** (`account`, `wallet`) | `account.masked` ·8· "••••4416" 🔒 — `account.balance` ·12· "SAR 18,420.00" 🔒 — `account.iban` ·24· "SA03 8000 0000 6080" 🔒 |
| **Transaction** (`transaction`, `arrow-left-right`) | `txn.amount` ·10· "SAR 250.00" — `txn.merchant` ·14· "Jarir Bookstore" — `txn.datetime` ·16· "02 Jun, 14:32" — `txn.ref` ·10· "TRX8841902" |
| **Security** (`security`, `shield-check`) | `otp.code` ·6· "784512" 🔒 — `otp.expiry` ·2· "10" — `card.last4` ·4· "4416" 🔒 |
| **General** (`general`, `building-2`) | `bank.name` ·13· "Aljazira Bank" — `support.number` ·9· "8001160001" — `date.today` ·10· "02 Jun 2026" |

`VAR_INDEX` is a flat `token → meta` lookup built from the groups.

### Sensitive variables — `TPL.SENSITIVE` (`view-extras.js`)
```
['account.balance', 'account.iban', 'account.masked',
 'otp.code', 'customer.cif', 'card.last4']
```
Marked 🔒 above. **Data-protection rule:** sensitive values are masked in
non-production previews, in audit logs, and to users without elevated access.
The View and Approvals screens flag these tokens with a shield icon + a note.
See `04-business-rules §6`.

### Helpers
- `resolveSample(text, lang)` — replaces each `{{token}}` with its localised
  sample value (used by the "Sample data" preview toggle). Unknown tokens are
  left as-is.
- `resolveForCount(text)` — replaces each `{{token}}` with `len` filler chars
  (used internally by the segment calculator). Unknown tokens default to 10.

---

## 3. The SMS segment / encoding calculator — `TPL.calcSegments(rawText)`

Drives the **SegmentMeter** on SMS/WhatsApp content. Returns
`{ encoding, encodingNote, length, segments, perSegment, capacity, remaining }`.

**Algorithm (preserve exactly):**

1. **Resolve variables to length:** run `resolveForCount(rawText)` so each
   `{{token}}` contributes its assumed `len`.
2. **Detect encoding:** if every char of the resolved text is in the **GSM-7**
   basic set or extension set → `GSM-7`; otherwise → `Unicode` (UCS-2). Arabic
   text forces Unicode.
   - GSM-7 basic + extension charsets are defined verbatim in `template-data.js`
     (`GSM7_BASIC`, `GSM7_EXT`).
3. **Count length:**
   - GSM-7: sum chars, where each **extension** char (`^{}\[~]|€`) costs **2**.
   - Unicode: count code points (`[...resolved].length`).
4. **Segment sizing:**
   - GSM-7: single = **160**, concatenated = **153**/segment.
   - Unicode: single = **70**, concatenated = **67**/segment.
   - `len === 0` → 0 segments. `len ≤ single` → 1 segment.
     Else → `ceil(len / multi)` segments.
5. **Capacity** = `single` for ≤1 segment, else `segments × multi`.
   **Remaining** = `max(0, capacity − len)` ("left in last segment").

UI strings: `segGsm` ("Latin → GSM-7 · 160 single / 153 per concatenated
segment"), `segUni` ("Arabic / Unicode → UCS-2 · 70 / 67"). The meter shows
encoding, character count, segment count, and remaining.

---

## 4. Seed datasets (by journey)

These are demo fixtures. They define realistic shapes + content for production
models, and the exact copy shown in the prototype.

### 4.1 Create flow — `TPL.SAMPLE`, `TPL.LIST_SEED` (`template-data.js`)
- `SAMPLE` — the "Filled" demo template: a high-priority **card transaction
  alert** SMS for the `cards` product, bilingual, with tags. Used to seed the
  Create form's "filled" state.
- `LIST_SEED` — 4 rows shown as the "where it lands" glimpse after saving
  (OTP, Salary credited, Card statement ready, Ramadan offer).

### 4.2 Templates list — `TPL.LIST` (`list-extras.js`)
The **Template Store** dataset: 12 rows. Each row:
```
{ id, ch, product, type, ver, status, by:{en,ar}, name:{en,ar},
  upd:{en,ar}, detail, used? }
```
- `status` ∈ `active | draft | review | expired | archived | inactive`.
- `detail` keys into `VIEW_TEMPLATES` (`'sms'|'email'|'push'`) so a row routes
  to the right View sample via `?ch=`.
- `used` (on drafts) gates deletion (see `04 §4`).
- People: `A` A. Al Amri, `N` N. Al Harbi, `S` S. Al Qahtani.

### 4.3 View details — `TPL.VIEW_TEMPLATES` (`view-extras.js`)
Per-channel fully-detailed samples (`sms`, `email`, `push`) plus a `draft`
(never-used, deletable). Each template:
```
{ id, channel, product, type, priority, name, desc, tags:{en,ar},
  validFrom, validTo, langs, createdBy, createdAt,
  versions: [ { ver, status, acted, current?, who, when,
                updatedBy, updatedAt, maker, checker,
                content:{en,ar}, subject?, ntitle?, imageUrl?, attachments? } ] }
```
- **Versions are newest-first**; exactly one has `current: true`.
- Channel-specific payload: email → `subject` + `attachments[]`; push →
  `ntitle` + `imageUrl`; sms → `content` only.
- The three published samples are marked `used: true` (block delete); the
  `draft` is `used: false` (deletable).
- `acted` ∈ `created | edited | submitted | approved | superseded | archived |
  rejected` — labels the version-history row.

### 4.4 Edit — `TPL.EDIT_TPL`, `TPL.VERSIONS`, `TPL.DRAFT_VERSIONS` (`edit-extras.js`)
- `EDIT_TPL` — the template being edited (`activeVer: 3`, `draftVer: 4`).
- `VERSIONS` — history for the **active** scenario (v3 active, v2/v1 archived).
- `DRAFT_VERSIONS` — history for the **draft** scenario (open v4 draft on top of
  v3 active). See the edit scenario logic in `03-journeys §5` and
  `04-business-rules §5`.

### 4.5 Approvals — `TPL.AP` (`approval-extras.js`)
```
TPL.AP = { O, N, S, F, CURRENT, CHECKERS, EVENTS, QUEUE, MINE }
```
- **People:** `O` (current user / signed-in maker), `N`, `S`, `F`.
  `CURRENT = O`; `CHECKERS = [N, S, F]` (assignable checkers).
- **`EVENTS`** — event-type metadata for the audit timeline: `created`,
  `edited`, `submitted`, `approved`, `published`, `sent_back`, `rejected`,
  `reassigned`. Each has `{ icon, key (i18n label), role (maker|checker|system),
  tint }`.
- **`QUEUE`** — the checker's inbox (5 items). Each submission:
  ```
  { id, channel, product, type, priority, name, kind, ver, prevVer?, maker,
    assignedTo, submittedAt, ago, langs, note, content, subject?, ntitle?,
    prev?, history[], ownWork? }
  ```
  - `kind` ∈ `new` (first activation) | `edit` (change to an active template).
  - For `edit`, `prev` holds the currently-live content → drives the **diff**.
  - `ownWork: true` marks the **segregation-of-duties** demo item (maker ===
    current user) → approval is blocked, reassignment offered.
  - `history[]` — prior audit events (`{ type, who, when, note? }`).
- **`MINE`** — the current user's own submissions for the **maker home**. Each:
  `{ id, channel, …, state, ver, checker?, reason?, decisionAt?, … }` where
  `state` ∈ `ready` (draft, not yet submitted) | `review` | `sent_back` |
  `approved`.

---

## 5. Status vocabulary (used everywhere)

| status | meaning | editable? | deletable? |
|---|---|---|---|
| `draft` | authored, not submitted | yes (in place) | **only if never used** |
| `review` | submitted, awaiting checker | yes | no |
| `active` | approved & live | yes (→ new draft version) | no |
| `inactive` | versioned but not currently live | yes (→ new draft version) | no |
| `expired` | past validity window | no | no |
| `archived` | retired, kept for audit | **no (locked)** | no |

Editability map: `template-list.jsx` `TL_EDITABLE = { active, draft, review,
inactive: true; expired, archived: false }`. Delete eligibility: `deleteMode`
(see `04 §4`). Status pills/labels come from i18n keys `stDraft`/`stReview`/
`stActive`/`stExpired`/`stArchived`/`stInactive`.
