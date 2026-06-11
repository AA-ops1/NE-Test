# 04 · Business rules (the logic that must be preserved)

**Docs version:** `1.0.0` · **Last updated:** 7 Jun 2026

These rules are the product. The visuals can be reinterpreted in the target
codebase, but **this logic must hold exactly**. Each rule notes where it lives
in the prototype.

---

## 1. Maker–checker — segregation of duties (governance core)

Source: `approval-extras.js`, `approvals.jsx`, `approval-parts.jsx`.

Every template change is proposed by a **Maker** and must be approved by a
**different Checker** before it goes live.

1. **A maker can never approve their own work.** If a submission's maker is the
   signed-in user (`ownWork === true`, i.e. `maker === CURRENT`), the review
   screen **blocks approval** and offers **Reassign** to another checker only.
   - Prototype: auto-assignment can land a maker on their own item; the guard
     catches it. Production: enforce server-side too — never trust the client.
2. **Roles:** `CURRENT` = signed-in user; `CHECKERS = [N, S, F]` are assignable
   reviewers. A maker submitting **cannot assign the template to themselves**
   (`apSubmitGuardSelf`).
3. **Checker decisions** (terminal effects):
   - **Approve & activate** → template becomes **active** (live). Optional note
     recorded.
   - **Send back** → returns to the maker as a **draft** with the checker's
     reason (**reason required**). Maker can edit & resubmit.
   - **Reject** → **terminal**; the template will not be activated (reason
     required).
   - **Reassign** → moves the submission to a different checker.
4. **Submit for review** (maker, from draft) → status **in review**; the
   template **cannot be edited while in review**; a checker is assigned.

> Strings such as "Segregation of duties — the maker cannot approve" (`apDecideSub`)
> and the guard copy (`apGuardTitle/Text`) state the rule in-product.

---

## 2. The version lifecycle & audit trail

Source: `view-extras.js` (version arrays), `edit-extras.js`,
`approval-parts.jsx` (`historyFromVersions`, `EVENTS`).

**Status flow:**
```
draft ──submit──▶ review ──approve──▶ active ──(edit)──▶ new draft ──▶ review ─▶ …
  │                  │                   │
  │                  └─send back──▶ draft │
  │                  └─reject────▶ (terminal)
  └─(never used) ─ deletable          active ──archive──▶ archived (locked)
                                      active ──(supersede)──▶ archived (older ver)
                                                              expired (past validity)
                                                              inactive (versioned, not live)
```

- **Versions are immutable once approved.** An approved/active version is never
  edited in place; edits branch a **new draft version** (see §5).
- **Exactly one `current` version** per template (the one shown by default in
  View; marked "Latest").
- **`acted`** on each version (`created | edited | submitted | approved |
  superseded | archived | rejected`) labels its history row.
- **Audit trail:** every event (`EVENTS`: created/edited/submitted/approved/
  published/sent_back/rejected/reassigned) carries actor + role + timestamp and
  is rendered in the **ApprovalTimeline**. `historyFromVersions(tpl, lang)`
  derives a timeline from a template's versions (draft versions contribute
  create/edit; versions that reached active/archived also contribute
  submit → approve). Production must persist a real, immutable audit log.
- **Lifecycle/audit** is surfaced on View (created/updated/maker/checker/
  approval; archived-by/at/reason) and on the Saved/Submit confirmations.

---

## 3. Form validation

Source: `template-studio.jsx` (`useTemplateForm.errors`).

Required fields for a valid template (errors shown **after** a save/submit
attempt — `submitted` flag — not on first paint):

| field | rule | error key |
|---|---|---|
| `name` | non-empty (trimmed) | `errName` |
| `product` | selected | `errProduct` |
| `channel` | selected | `errChannel` |
| `type` | selected | `errType` |
| `content[activeLang]` | non-empty for the active content language | `errContent` |
| `validFrom` | a start date is required | `errValidFrom` |

Summary message on failure: `fixErrors` — "Please complete the highlighted
fields." Edit's **errors** scenario shows the danger banner `bnErrTitle/Text`.

> Validity default: `validFrom = today`, `validTo = ''` (open / no end date).
> Email shows subject; push/inapp show title; these are not separately required
> in the prototype but production may require subject for email.

---

## 4. Delete vs Archive eligibility

Source: `template-delete.jsx` (`deleteMode`), `delete-extras.js` (copy),
list + view controllers.

**`deleteMode(row)` decides the modal:**
```
if (row.status !== 'draft') return 'notdraft';  // blocked
if (row.used)               return 'used';       // blocked
return 'confirm';                                 // deletable
```

**Rules:**
1. **Only `draft` templates can be permanently deleted**, and **only if they
   have never been used** (`used !== true`) to send notifications.
2. **Deletion is permanent** and requires explicit confirmation
   ("Delete permanently"). It writes a **deletion event to the audit log**
   (toast: "Recorded in the audit log · by {user}").
3. **Blocked — not a draft** (`notdraft`): "Active, in-review, and published
   templates can't be deleted — deactivate or archive it instead." Offers
   **Archive instead**.
4. **Blocked — used** (`used`): "It has been used to send notifications, so it
   can't be deleted. Archive it to remove it from active listings." Offers
   **Archive**.
5. In list + view, the kebab's **Delete is disabled unless `status==='draft'`**
   with hint "Only drafts can be deleted".

**Archive** (the non-destructive alternative): removes a template from active
use, keeps it for reference/audit (history + previous versions retained),
**optional reason** (`No longer used | Replaced | Outdated | Compliance change
| Duplicate | Other` + note). Archived templates **can't be edited, used, or
restored** — only **duplicated**. Confirmation → archived banner + lifecycle
rows (archived-by/at/reason) + toast.

---

## 5. Edit behaviour by status (version branching)

Source: `edit-extras.js` (header comment is the spec), `Edit Template.html`
(`scenario` logic), `edit-template.jsx`.

| Starting status | What editing does | Save actions |
|---|---|---|
| **Draft** | Edit the **same** draft version in place. | *Save as draft* / *Save changes* → stays draft. |
| **Active / inactive-versioned** | Editing creates a **new draft version** (e.g. v4) for maker–checker review. **The active version stays live until the new one is approved.** | *Save as new draft* / *Save & submit for review* → new version, status `review` (if submitted). |
| **Archived** | **Locked** — not editable. Must be restored from version history first. | — (Restore / Back) |

Supporting logic:
- `verLabel` = `v{draftVer}` for draft scenario, else `v{activeVer}`;
  `nextLabel` = `v{activeVer+1}` (the branched version).
- When the active scenario is **dirty**, a pending **"New" version row** is shown
  in version history (`newVer`).
- **Dirty detection** ignores `activeLang` + `sampleMode` (view-only) so
  language/tab switches aren't counted as edits. Cancel-while-dirty prompts the
  **discard guard**.
- Approved/active versions are **never modified in place** (immutability, §2).

---

## 6. Sensitive-data masking

Source: `view-extras.js` (`SENSITIVE`), View + Approvals renderers.

- **Sensitive tokens:** `account.balance`, `account.iban`, `account.masked`,
  `otp.code`, `customer.cif`, `card.last4`.
- Wherever these tokens appear (content body, subject, title, variables list)
  they are **visually flagged** (shield icon / distinct chip style) and labelled
  **"Sensitive"**, with the note: *"Sensitive values are masked in
  non-production previews, audit logs, and to users without elevated access."*
- **Rule for production:** never render resolved sensitive values in non-prod
  previews, in audit logs, or to users lacking elevated access — mask them. The
  prototype only shows the token (never a real value), which is the safe default.

---

## 7. Other rules worth preserving

- **Channel determines content shape** (`channelFields`): email → subject +
  attachments; push/inapp → title (push also image); sms/whatsapp → body +
  **segment meter**. Applied consistently in Create, View, Edit, Approvals.
- **SMS cost is computed, not guessed** — the segment meter uses the GSM-7/UCS-2
  algorithm in `02 §3`; Arabic forces Unicode (fewer chars/segment), which is a
  real cost signal for the author.
- **Editability map** (`TL_EDITABLE`): `active`, `draft`, `review`, `inactive`
  are editable; `expired`, `archived` are not (Edit pencil disabled in list).
- **Bilingual content is first-class** — a template can carry EN and/or AR
  content; the View/Approvals "Both" mode renders them stacked. Don't treat AR
  as a translation afterthought.
- **Live nav badge** — the Approvals count in the side-nav reflects the current
  queue length (`TPL.AP.QUEUE.length`, default 5); decisions that clear items
  update it because queue state is lifted to the page root.
- **Relative timestamps + people** are stored bilingually (`{en,ar}`) and
  localised with `L()`; IDs/versions/dates stay LTR via `.ajb-ltr` even in
  Arabic.
