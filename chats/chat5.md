# Comment UI

_Started 2026-06-03 13:31 UTC_

---

## User

Apply comment

## Assistant

_[tool: read_file]_

_[tool: read_file]_

Let me look at the button you're asking about and compare it to the design system's button spec.

_[tool: grep]_

_[tool: read_file]_

Let me check how the "Save template" button is actually styled in this file vs. the design system spec.

Good question — and the short answer is **yes, that's correct as-is.**

The "Save template" button uses `.ts-btn.primary`, which resolves to:

```css
.ts-btn.primary { background: var(--ajb-fg); color: var(--ajb-bg); }
```

That matches the Aljazira design system's **primary** button spec exactly. In the design system, the primary button is white fill with inverted (dark) text — `background:#fff; color:#0a1c2b` — which is what `--ajb-fg` / `--ajb-bg` evaluate to in the dark theme. So the white pill you're seeing *is* the canonical primary button.

One thing worth flagging, since I suspect this is the root of your question: in this design system the brand **Sand** color (`#b27f59`, `--ajb-accent`) is **not** the primary button color. Sand is a separate, deliberately-reserved variant — `.ts-btn.sand` — used as a secondary "brand voice" accent. The hierarchy is:

- **Primary** → white fill / dark text (the strongest call-to-action)
- **Sand** → sand fill / midnight text (warmer accent emphasis)
- **Secondary** → outline
- **Ghost** → quiet/tertiary

So if your expectation was that "primary = the sand brand color," that's the mismatch — but the button itself is faithfully implementing the system.

Would you like me to **switch Save template to the Sand variant** (`.ts-btn.sand`) so the primary action carries the brand color? That's a one-line change and a reasonable call for a flagship action. Or keep it white per the spec — your call.

## User

ok in this case always use the sand color in the dark theme

## Assistant

_[tool: read_file]_

Got it — primary actions should carry the Sand brand color in the dark theme. Let me make that change in the button CSS so it applies everywhere, not just on this one button.I'll make `.ts-btn.primary` resolve to the Sand fill in the dark theme, while keeping the white-fill behavior in light theme.

_[tool: str_replace_edit]_

_[tool: done]_

Done. Primary action buttons (like **Save template**) now use the **Sand** brand color in the dark theme — Sand fill with midnight-blue text, the design system's `--ajb-accent` / `--ajb-on-accent` pairing. The light theme keeps the white-fill primary, since Sand washes out on pale surfaces (Sand → Dark Sand is the system's documented light-theme behavior).

## User

I've updated the design to include a dictionary update, the references so that you only use the component from the dictionary and update the current implementation with the design

## Assistant

_[tool: list_files]_

Let me explore the updated design system to find the dictionary and component references.There's a new `dictionary.html` and `COMPONENTS.md` and `components.css`. Let me read all three.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

The design system now ships a canonical `components.css` with `.ajb-*` classes and a dictionary. The directive: build only from these components and retrofit the current implementation. Let me read `components.css` and survey the current console files.

_[tool: read_file]_

_[tool: read_file]_

This is a substantial retrofit. Let me read the full current implementation before planning.

_[tool: read_file]_

Now the full CSS so I can map bespoke `.ts-*` classes to dictionary `.ajb-*` components.

_[tool: update_todos]_

I now have the full picture. The design system shipped a canonical component layer (`components.css` + dictionary). The directive — reinforced by the project rules — is to **consume those `.ajb-*` components** and retrofit the bespoke `.ts-*` reimplementations to them. Let me lay out the plan.

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Plan is clear. I'll reconcile the earlier "sand primary" request the dictionary-correct way: the real CTA becomes the dictionary's `.ajb-btn--sand` (sand in dark, dark-sand in light), so I can drop my one-off override. Now retrofitting the shared parts.

_[tool: str_replace_edit]_

Now the custom select → dictionary `.ajb-select` trigger + `.ajb-menu` popover.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now language tabs → dictionary `.ajb-tabs`, and the status pill → `.ajb-badge`.

_[tool: str_replace_edit]_

Now the studio file: TagEditor → dictionary chips, notes → boxed input, buttons, cards, crumbs.

_[tool: run_script]_

The crumbs appear in multiple spots and the footer/saved/list buttons need mapping. I'll batch these literal replacements via script.

_[tool: write_file]_

Now the big one — trimming `template-studio.css`: dropping every block that the dictionary now governs (buttons, inputs, select, chips, lang-tab base, status pills, table cells, tags) and keeping only the bespoke product pieces, plus small bridging rules. I'll rewrite the file cleanly.

_[tool: run_script]_

`SectionCard` now carries `.ajb-card`, but Direction B uses bare `<div className="ts-card">` cards whose base styling I just removed. Let me promote those to the dictionary card too.

_[tool: grep]_

Let me verify no JSX still references classes I removed from the CSS.

_[tool: read_file]_

The Tweaks stylesheet still targets the old class names. Let me read and retarget it.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The dictionary card is flex+gap, but the section cards and density tweaks assume block flow with a header margin. Let me reconcile so spacing stays correct.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The "+ Add language" button lives inside `.ajb-tabs`, so the dictionary `.ajb-tabs button` rule will bleed onto it. Let me raise the specificity of the add-button rules.

_[tool: str_replace_edit]_

_[tool: show_html]_

Now let me check it renders cleanly.

_[tool: show_html]_

_[tool: get_webview_logs]_

No errors. Let me screenshot the key states to verify the retrofit visually.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

Excellent — dictionary buttons, boxed select, filter chips, and cards all rendering. Let me verify the table (List), Saved, and light theme.

_[tool: view_image]_

_[tool: save_screenshot]_

Table looks clean with dictionary badges. Now Saved state, plus light theme and Arabic to confirm theming/RTL.

_[tool: view_image]_

_[tool: save_screenshot]_

Saved card is clean. Now light theme + Arabic (RTL) on the filled compose view.

_[tool: view_image]_

_[tool: update_todos]_

Light + Arabic RTL mirrors perfectly — sidebar flips, sand-fill primary, boxed selects, filter chips, channel cards, badges all themed correctly. The retrofit is solid across all four theme/dir combinations. Let me finalize.

_[tool: done]_

_[tool: fork_verifier_agent]_

Done. I wired the Create Template console up to the new **component dictionary** and retrofitted it onto the canonical `.ajb-*` components.

**What changed**
- Linked the dictionary's `components.css` into the page.
- Replaced every bespoke `.ts-*` reimplementation that had a dictionary equivalent: buttons → `.ajb-btn` (with `--sand` / `--secondary` / `--tertiary`), inputs/labels/helpers → `.ajb-field`/`.ajb-input`, the product picker → `.ajb-select` + `.ajb-menu`, type/priority → `.ajb-chip--filter`, language tabs → `.ajb-tabs`, status pills → `.ajb-badge`, the list → `.ajb-table`, tags → `.ajb-chip` + `.ajb-chip__x`, cards → `.ajb-card`, breadcrumbs → `.ajb-crumb`, and the saved screen → `.ajb-card--raised`.
- Trimmed `template-studio.css` down to **only** the things the dictionary doesn't cover — channel picker, token-highlighting editor, variable panel, segment meter, device previews, stepper, review summary, list framing — plus thin bridging rules. Retuned the Tweaks (density/surface/accent) to the new class names.

On your earlier note — the dictionary keeps **primary = Pearl** and **Sand** as a separate action variant, so the real CTA (Save template, Next, etc.) now uses `.ajb-btn--sand`, giving you the sand brand color in dark (and dark-sand in light) the dictionary-correct way, without overriding the primary token. Verified across dark/light × EN/AR and all five states (compose, filled, errors, saved, list).

**Two things to flag:**
- The **channel picker** (5-up icon cards) has no dictionary equivalent, so I kept it as a product-specific component built on tokens — rather than invent a new dictionary entry. Want me to propose it as a new dictionary component, or leave it local?
- I scoped this to the **Create Template** studio (the file you're in). The **Login Journey** still runs on its own `login.css` — say the word and I'll retrofit it to the dictionary next.

## User

Please add it as a new dictionary component

## Assistant

_[tool: str_replace_edit]_

Good call — promoting it properly. Per the dictionary's own "Adding a new component" workflow, this touches three files: `components.css`, `dictionary.html`, and `COMPONENTS.md`. I'll generalize it beyond just channels into a reusable **Option cards** tile-select (icon + label, single-select) so the system gets a durable component, not a one-off.

First, adding it to the component stylesheet the console consumes:Now retrofit `ChannelPicker` to the new component and drop the bespoke `.ts-channel` styles.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

## User

Also, retrofit for the login journey from the dictionary

## Assistant

## User

lets continue from where we did stopped.

## Assistant

_[tool: grep]_

Let me pick up the threads. First, the responsive rule still references the removed `.ts-channels`, and the option-card change needs verifying. Let me check.

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

Option cards wired in. Now the bigger remaining task — retrofitting the **Login Journey** to the dictionary. Let me read those files.

_[tool: read_file]_

Now `login.css` to see what maps to the dictionary and what's shared shell chrome.

_[tool: str_replace_edit]_

Clear plan. The login journey reimplements alerts, fields/inputs, checkbox, submit button, badges, KPI cards, panel and list rows — all of which now have dictionary equivalents. The brand split panel, console shell chrome (sidebar/topbar), and harness stay bespoke (no dictionary equivalent). Let me link `components.css` and retrofit the JSX first.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the success landing (KPIs, panel, list rows, pills) in `ConsoleHome`:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now trim `login.css` — replace the reimplemented form region with thin bridging, drop the alert block, and adapt the success-landing styles.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the success-landing blocks:

_[tool: grep]_

Let me verify no stale class references remain in the login files.

_[tool: show_html]_

Clean — only the intentional `.ne-input-wrap` wrapper remains. Let me render the login journey and check.

_[tool: get_webview_logs]_

No errors. Let me screenshot the sign-in form (invalid state to see the alert + checkbox + button) and the success landing.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

Login form retrofit looks great — dictionary alert, boxed inputs, sand checkbox, sand button. Now the success landing.

_[tool: view_image]_

_[tool: get_webview_logs]_

The success landing is blank — likely a render error. Let me check logs.

_[tool: save_screenshot]_

Let me re-check with a longer settle and inspect the DOM state.

_[tool: view_image]_

_[tool: show_to_user]_

The URL flips to `/home` so `ConsoleHome` is rendering, but it captures blank — likely the `.ne-enter` opacity-0 entrance animation being caught at its start frame by the capture. Let me verify the DOM actually has content.

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

The DOM confirms it renders correctly — `.ne-home` at full opacity, KPI cards, list rows with `ajb-badge--success`. The blank capture was an entrance-animation artifact. Let me confirm visually from the user's view, now settled.

_[tool: done]_

Both the Login form and the success landing are now fully dictionary-driven — KPI `.ajb-card`s, `.ajb-li` rows, and semantic `.ajb-badge`s (Sent/Scheduled/Draft). The retrofit is complete across both deliverables. Let me finalize.

_[tool: fork_verifier_agent]_

Both done — here's where things landed.

## Login Journey → retrofitted to the dictionary
- Alerts (invalid / locked) → `.ajb-alert--danger`
- Fields → `.ajb-field` / `.ajb-field__label` / `.ajb-input--boxed`, errors → `.ajb-helper--error`
- "Keep me signed in" → `.ajb-option` + `.ajb-check`
- Sign-in CTA → `.ajb-btn--sand`, spinner → `.ajb-spinner`
- Success landing: KPIs → `.ajb-card`, activity rows → `.ajb-li`, status pills → `.ajb-badge` (Sent=success, Scheduled=info, Draft=neutral)
- Kept bespoke (no dictionary equivalent): the brand-split panel, the console shell chrome (sidebar/topbar/avatar), the review harness and phone frame.

## New component: Option cards
I generalized the channel picker into a reusable **Option cards** tile-select and wired the console to it (`.ajb-optioncards` / `.ajb-optioncard`, `.is-on`). It's live in this project's `components.css`.

One thing to flag: the dictionary's source files (`components.css`, `dictionary.html`, `COMPONENTS.md`) live in the **design-system project, which is read-only to me** — so I can't commit the new component back there directly. To keep the dictionary in lockstep, paste these three into the design system:

**1. `components.css`** — the block I added (Forms section):
```css
/* Option cards — single-select tile group */
.ajb-optioncards { display: grid; grid-template-columns: repeat(var(--ajb-optioncols, 4), 1fr); gap: 10px; }
.ajb-optioncard { display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-family: var(--ajb-font); font-size: var(--ajb-small); font-weight: var(--ajb-w-medium);
  color: var(--ajb-fg-muted); text-align: center; cursor: pointer;
  background: var(--ajb-surface-2); border: 1px solid var(--ajb-stroke);
  border-radius: var(--ajb-r-md); padding: 14px 8px;
  transition: color var(--ajb-dur-2) var(--ajb-ease), border-color var(--ajb-dur-2) var(--ajb-ease), background var(--ajb-dur-2) var(--ajb-ease); }
.ajb-optioncard svg { width: 20px; height: 20px; stroke-width: 1.6; }
.ajb-optioncard:hover { color: var(--ajb-fg); border-color: var(--ajb-stroke-strong); }
.ajb-optioncard.is-on { color: var(--ajb-accent); border-color: var(--ajb-accent); background: var(--ajb-tint-sand-bg); }
.ajb-optioncard.is-disabled { opacity: 0.4; pointer-events: none; }
```

**2. `dictionary.html`** — add to the `CATALOG` "Forms" group:
```js
{ name: "Option cards", cls: ".ajb-optioncards · .ajb-optioncard", desc: "Single-select tile group — icon over label. Set columns with --ajb-optioncols; mark the choice with .is-on.", layout: "col",
  html:
`<div class="ajb-optioncards" style="--ajb-optioncols:5">
  <div class="ajb-optioncard is-on">${ICON('message-square')}<span>SMS</span></div>
  <div class="ajb-optioncard">${ICON('mail')}<span>Email</span></div>
  <div class="ajb-optioncard">${ICON('bell')}<span>Push</span></div>
  <div class="ajb-optioncard">${ICON('layout-template')}<span>In-App</span></div>
  <div class="ajb-optioncard">${ICON('message-circle')}<span>WhatsApp</span></div>
</div>` },
```

**3. `COMPONENTS.md`** — under Forms:
> ### Option cards — `.ajb-optioncards` / `.ajb-optioncard`
> Single-select tile group; each card is an icon over a label. Set the column count with `--ajb-optioncols` (default 4); mark the chosen card with `.is-on`.

Want me to also save these three snippets into a file in this project (e.g. `dictionary-additions/`) so they're easy to hand off?

## User

yes please add all the missing component to the dictionary

## Assistant

_[tool: update_todos]_

Good — I'll promote all the genuinely reusable components into the dictionary, retrofit the console to consume them (so nothing is built on non-conforming components), and produce a clean handoff package for the read-only design-system project.

Let me set up the plan.

_[tool: read_file]_

First, adding the five new components to the consumed stylesheet:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now retrofit Create Template to consume the stepper, date field, key-value rows, and result components:

_[tool: grep]_

I accidentally dropped `SettingsFields` in that last edit and still need to rename the `.ts-rev` wrapper. Let me look at the current state.

_[tool: read_file]_

_[tool: str_replace_edit]_

I see — `SettingsFields` is gone from step 2. Let me restore it and rename the review wrapper to `.ajb-kv`.Now the SavedCard → `.ajb-result`:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now trim the now-redundant bespoke CSS and fix the responsive selectors. Let me update the stepper, dates, review, and saved blocks in `template-studio.css`.

_[tool: str_replace_edit]_

Now the Login KPIs → `.ajb-stat`:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The `.ajb-stat` parts need a block wrapper so the card's flex-gap doesn't double up with their margins. Let me add the wrapper and define the base.

_[tool: str_replace_edit]_

_[tool: grep]_

Let me fix the leftover `.ne-kpi*` references in the login responsive rules.

_[tool: str_replace_edit]_

_[tool: grep]_

Now let me verify no stale references remain across the console files.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Now let me verify the retrofitted pieces render. First the Create Template wizard (stepper shows in mobile/Direction B) and saved card.

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_to_user]_

The stepper, key-value review rows, and date field all render. Let me verify the stepper's active/done state classes are correct via the DOM rather than eyeballing.

_[tool: eval_js_user_view]_

_[tool: save_screenshot]_

Stepper is correct (`is-done, is-done, is-on`), 8 key-value rows, 2 date fields. Let me confirm the saved card (`.ajb-result`) and the Login KPI stats render well.

_[tool: view_image]_

_[tool: write_file]_

The saved card now uses `.ajb-result` — clean. All retrofits render correctly. Now let me build the handoff package so these components can be committed to the read-only design-system project.

_[tool: write_file]_

_[tool: update_todos]_

Handoff package complete. Let me do a final verification pass on the Login page (KPI stat change) before handing off.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

_[tool: show_to_user]_

No errors. The capture catches the entrance animation blank, so let me verify the KPI stats via the user view with a real pixel screenshot.

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: update_todos]_

Everything renders correctly. Both deliverables are now fully dictionary-driven. Let me finalize.

_[tool: done]_

_[tool: fork_verifier_agent]_

Done. I promoted **six reusable components** into the dictionary and retrofitted both deliverables to consume them — nothing in the console is built on a non-conforming component anymore.

## New dictionary components (now in `console/components.css`)
| Component | Classes | Replaces |
|---|---|---|
| **Option cards** | `.ajb-optioncards` / `.ajb-optioncard` | channel picker |
| **Stepper** | `.ajb-stepper` / `.ajb-step` / `.ajb-step-line` | wizard progress |
| **Date field** | `.ajb-datefield` | validity date inputs |
| **Stat** | `.ajb-stat` (`__label`/`__value`/`__delta`) | dashboard KPIs |
| **Description list** | `.ajb-kv` / `.ajb-kv__row` | review summary rows |
| **Result** | `.ajb-result` (`--success`/`--danger`/`--info`) | "saved" confirmation |

All token-driven, theme- and RTL-aware. Verified live: stepper states resolve correctly (`is-done`/`is-on`), date fields and key-value rows render in the wizard, the saved screen uses `.ajb-result`, and the dashboard KPIs render as `.ajb-card` + `.ajb-stat`.

## Handoff for the design-system project
Since that project is read-only from here, I dropped a ready-to-apply package in **`dictionary-additions/`**:
- `components-additions.css` — paste-append to the DS `components.css`
- `README.md` — the `CATALOG` entries for `dictionary.html` and the `COMPONENTS.md` doc sections, following the dictionary's own 3-file "add a component" workflow

## Left app-specific on purpose
The SMS **segment meter**, channel **device previews**, **variable inserter**, and **token-highlighting editor** stay local to the Notification Engine — they encode product domain, not reusable bank UI. The console shell (sidebar/topbar) and the marketing **auth layouts** also remain local. I noted these in the README; happy to formalize any of them if you want.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

The boxed inputs sit inside `.ne-input-wrap` (a flex row), so they size to content instead of filling the field width — narrower than the button. The fix is to let the input grow to fill the wrap (applies to both Employee ID and password).Let me verify both fields now span full width matching the button.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

Both the Employee ID and Password fields now span the full width, matching the Sign-in button. Fixed.

The fix: the boxed inputs were inside a flex-row wrapper (`.ne-input-wrap`) without growing, so they sized to content. I let them flex to fill the wrap, so both fields now align edge-to-edge with the button.

## User

please update the date picker from the dictionary

## Assistant

_[tool: grep]_

_[tool: read_file]_

Let me check what the dictionary actually offers for dates — there may be a richer calendar component in the design system I should use.

_[tool: str_replace_edit]_

The dictionary has a **calendar / date-picker** specimen (`preview/calendar.html`) that was never promoted into `components.css` — it's the proper "date picker from the dictionary." I'll formalize it as `.ajb-calendar`, build a working popover date picker, and wire it into the Create Template validity fields (replacing the bare native inputs).

_[tool: str_replace_edit]_

Now the working date-picker React component:

_[tool: str_replace_edit]_

Now wire `DatePicker` into `SettingsFields` (replacing the bare native date fields):

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the popover positioning bridging:Now let me verify the date picker works. Let me render and test.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

The date field is in section 3, below the fold. Let me scroll to it and open the picker.

_[tool: view_image]_

_[tool: show_to_user]_

The scaled frame is throwing off the scroll math. Let me drive it in the user view and capture there.

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

Date picker is functional — trigger shows "02 Jun 2026", calendar opens to June 2026 with today (the 2nd) marked. Let me capture it visually.

_[tool: eval_js_user_view]_

The DOM confirms the picker is fully functional. Let me do a final check that selecting a day updates the value, and that Arabic localizes the month title.

_[tool: eval_js_user_view]_

Let me re-run that check more defensively.

_[tool: str_replace_edit]_

Everything works: selecting the 15th updates the field to "15 Jun 2026" and closes the popover; Arabic localizes the month to "يونيو 2026". Let me add the calendar to the handoff package, then finalize.

_[tool: str_replace_edit]_

_[tool: done]_

Calendar added to the handoff. Let me finalize on the file you're viewing.

_[tool: fork_verifier_agent]_

Done. I promoted the dictionary's **calendar / date-picker** (which lived only as a static specimen in `preview/calendar.html` and was never in `components.css`) into a real component and wired it into the Create Template validity fields.

**What changed**
- Added `.ajb-calendar` to the dictionary (`console/components.css`) — month popover with `__head` / `__title` / `__nav` / `__grid` / `__dow` / `__day`, day states `.is-today` / `.is-on` / `.is-muted`, plus range states (`.in-range`, `.is-start`, `.is-end`) for completeness. Token-driven and RTL-aware.
- Built a working `DatePicker` React component: an `.ajb-select` trigger that opens the `.ajb-calendar` popover with month navigation, today marker, outside-click close, and localized month titles.
- Replaced both **Valid from** / **Valid to** native inputs in Create Template with it.

**Verified live:** opens to June 2026 with the 2nd marked as today, selecting the 15th sets the field to "15 Jun 2026" and closes, and the Arabic month renders as "يونيو 2026".

The handoff package in `dictionary-additions/` now includes the calendar too (CSS block + `dictionary.html` CATALOG entry + `COMPONENTS.md` doc), so it can be committed to the read-only design-system project alongside the other six components.

## User

Apply comment

## Assistant

_[tool: eval_js_user_view]_

Good catch — let me measure the three buttons to find the real cause before fixing.

_[tool: str_replace_edit]_

Confirmed — it's a real inconsistency, and partly a design-system bug. Three causes:

1. The icon inside **Save template** renders at the unconstrained lucide default (24px), making that button **52px** tall vs ~42–44px for the text-only ones — the dictionary's `.ajb-btn` never sizes inline icons.
2. The **secondary** (outline) button's 1px border adds height because the base `.ajb-btn` uses `border: 0` instead of a reserved transparent border.
3. **Cancel** is `--tertiary` (a text button) with intentionally tight horizontal padding — that part *is* by design.

The fix belongs in the dictionary's `.ajb-btn` base, so it corrects every button project-wide. Let me apply it.

_[tool: eval_js_user_view]_

Now let me verify all three buttons render at equal height.

_[tool: eval_js_user_view]_

The preview is still on the old CSS — let me reload it and re-measure.

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: str_replace_edit]_

The icon is still 24px because the console's React `Icon` keeps a persistent `<i>` wrapper and a global rule in `login.css` (`i > svg { width:100% }`) overrides the dictionary's `.ajb-btn svg` sizing. I need to size the `<i>` wrapper itself. `login.css` owns that global and is shared by both pages, so the fix there applies everywhere.

_[tool: eval_js_user_view]_

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

All three are now exactly 46px. Let me confirm visually and spot-check the wizard footer buttons too.

_[tool: str_replace_edit]_

All three buttons are now identical height (46px) with the check icon properly sized. The header looks balanced.

Since this corrects the dictionary's existing `.ajb-btn`, let me record it in the handoff for the DS team, then finalize.

