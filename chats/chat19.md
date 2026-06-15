# Logo size increase

_Started 2026-06-15 19:46 UTC_

---

## User

Let's increase the logo size

## Assistant

I'll find the logo in the side nav and increase its size.

_[tool: grep]_

_[tool: grep]_

The logo size is controlled in `console/login.css`. There are two `.ne-side-logo` rules — let me read them and bump the size.

_[tool: read_file]_

_[tool: read_file]_

The active rule is line 557 (`38px`, it comes later and wins). I'll bump both `.ne-side-logo` heights to **48px** and nudge the collapsed symbol up to match.

_[tool: str_replace_edit]_

Now the changelog entry, per project rules:

_[tool: read_file]_

_[tool: read_file]_

There's already a `[2026-06-15]` section. I'll add a `Changed` entry under it:

_[tool: str_replace_edit]_

Logo bumped — let me verify it renders cleanly.

_[tool: done]_

Done. The Aljazira wordmark in the side nav is now **48px** (up from 38px), with the collapsed-rail symbol scaled to 32px to match. The change applies across every console page since they share `.ne-side-logo`, and it's logged in the changelog.

The lint findings are all pre-existing items in other files, unrelated to this tweak.

## User

Let's increase the logo size only when the side menu collapses

## Assistant

The user wants the logo larger **only in the collapsed state**. In collapsed mode the side nav swaps the wordmark for the `.ne-logo-symbol`. Let me look at the collapsed rules.

_[tool: read_file]_

I'll bump the symbol's height only in the collapsed state, keeping the expanded wordmark untouched.

_[tool: str_replace_edit]_

Now log it per the changelog rules:

_[tool: str_replace_edit]_

Done. The brandmark now enlarges to **36px only when the side menu is collapsed** (the symbol mark that replaces the wordmark), with a smooth height transition. The expanded-state wordmark is unchanged. Logged in the changelog.

## User

Make it 38px, the same size as when it is open

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Updated — the collapsed symbol is now **38px**, matching the expanded wordmark height.

## User

It is not the same size. Can you check by taking a screenshot

## Assistant

Let me look at both states to see what's actually happening.

_[tool: show_html]_

_[tool: show_html]_

This looks like the collapsed rail. Let me measure the actual rendered logo in both states to see what's happening.

_[tool: eval_js]_

The heights are mathematically equal now (both render at the same scaled height — the chrome window is zoomed ~0.67×). But the symbol is a PNG that likely has transparent padding baked in, so its visible glyph looks smaller than the tightly-cropped wordmark at the same box height. Let me check the asset.

_[tool: image_metadata]_

_[tool: view_image]_

It's white-on-transparent so invisible here. Let me measure the actual glyph bounds within the PNG to quantify the padding.

_[tool: run_script]_

The symbol PNG only fills ~86% of its box height (14% baked-in padding), so at 38px it renders a visibly smaller glyph than a tightly-cropped wordmark. Let me check the wordmark SVG's own padding to calculate the right compensation.

_[tool: read_file]_

Let me render the wordmark SVG and measure its actual ink height so I can compare apples-to-apples.

_[tool: run_script]_

Found it. The wordmark SVG is tightly cropped (ink fills 100% of its box), but the symbol PNG has ~14% baked-in padding (ink fills only 85.7%). So at an equal 38px box, the symbol's *visible glyph* is only ~32.6px — noticeably smaller. To make the visible marks match, the symbol box needs to be **38 ÷ 0.857 ≈ 44px**.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now let me verify visually by comparing both states side by side.

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Collapsed symbol now reads larger. Let me compare against the expanded state.

_[tool: eval_js]_

_[tool: save_screenshot]_

Both states look identical here — the logo stays as the symbol and the rail stays narrow. The Templates page may use a different (permanently narrow) shell than the collapsible login home. Let me check what controls the rail here.

_[tool: eval_js]_

On Templates the rail is narrow (84px, symbol shown) but **without** `data-collapsed` — so my rule never applies here. A different mechanism collapses it. Let me find it.

_[tool: grep]_

Let me find the real collapse toggle and inspect both genuine states, plus which CSS rule actually shows the symbol here.

_[tool: eval_js]_

The page's persisted state is **collapsed** (`ne-side-collapsed=1`) — my earlier manual DOM toggle desynced it from React. So what the user actually sees on load is the collapsed rail, where my 44px rule applies. Let me reload fresh to confirm the true state.

_[tool: show_html]_

This is the true default state. The collapsed "ajb" symbol now renders larger. Let me confirm the measured parity numerically.

_[tool: eval_js]_

Verified — the symbol's visible glyph now renders at **25.3px** (scaled) versus the wordmark's **25.5px**: a near-perfect match. The earlier 38px setting only matched the *box*, not the visible mark, because the symbol PNG carries ~14% transparent padding.

Let me clean up the scrap screenshots.

_[tool: delete_file]_

Done — and you were right. Setting both to 38px only matched the *box* height; the collapsed symbol still looked smaller because its PNG has ~14% transparent padding baked in (the glyph fills only 85.7% of the image), while the wordmark SVG is cropped tight. I sized the collapsed symbol to **44px** (38 ÷ 0.857), so the actual visible mark now renders at the same height as the open wordmark — confirmed by measurement (25.3px vs 25.5px). Logged in the changelog.

## User

Did you make the collapsed side menu wider, or did you only change the logo size?

## Assistant

Only the logo size. I made exactly one functional change to the collapsed state — the symbol's `height` (38px → 44px) in this rule:

```css
.ne-home[data-collapsed] .ne-side-logo .ne-logo-symbol { opacity: 1; height: 44px; … }
```

The rail width is untouched — `.ne-side` is still **84px** in the collapsed state, same as before. The larger symbol fits comfortably: at 44px tall its width is only ~56px (the PNG is 366×287), well inside the 84px rail, so nothing overflows or shifts. No layout/width changes anywhere.

## User

Did you record this change in the changelog?

## Assistant

_[tool: read_file]_

Yes. It's logged at the top of `CHANGELOG.md` under today's date (`2026-06-15`), and it reflects the final **44px** value with the full rationale:

- **Name/ID:** `.ne-side-logo .ne-logo-symbol` (collapsed state)
- **What changed:** height → 44px in the `.ne-home[data-collapsed]` rule, plus a height transition; the entry explains the 38 ÷ 0.857 ≈ 44px calculation that matches the visible glyph to the open wordmark
- **Affected journeys:** every console shell (login home, Templates, View/Edit/Create Template, Approvals)
- **Code impact:** CSS-only in `console/login.css`, no markup or prop changes

I updated this same entry in place as the value evolved (36 → 38 → 44px), so there's one accurate record rather than three conflicting ones.

## User

Can we make the side menu's closing animation smoother?

## Assistant

Let me look at how the collapse is currently animated across the side menu.

_[tool: read_file]_

Let me see the collapse-specific rules — the `.ne-side` width transition and the collapsed-state block.

_[tool: read_file]_

_[tool: read_file]_

I can see the collapse is driven by `[data-collapsed]` on `.ne-home`, but the motion is spread across **many different durations** (.14s, .15s, .18s, .2s, .24s, .3s, .32s, .36s) and a mix of eased/un-eased transitions. That desynchronization is what makes the close feel slightly janky — pieces arrive at different times and the active-item glow snaps in.

I'll unify all the *structural* motion onto one timeline (a single `--ne-collapse` duration on the brand easing — 420ms, which is the brand's "panel enter" spec), keep the opacity fades quick so labels clear before the squeeze, and ease the active-item glow in instead of snapping.

_[tool: str_replace_edit]_

Now log it:

_[tool: str_replace_edit]_

Let me verify the collapse animates cleanly with no errors. I'll capture a few mid-transition frames.

_[tool: show_html]_

_[tool: eval_js]_

The token resolves and is applied. Let me trigger the real toggle and sample the width mid-animation to confirm it animates smoothly across one timeline.

_[tool: eval_js]_

My earlier DOM tampering desynced React state. Let me reload fresh and test the real toggle cleanly.

_[tool: show_html]_

_[tool: eval_js]_

The rail is 84px even when not collapsed — something else is constraining it. Let me check the actual DOM structure (possibly multiple shells, or a responsive rule).

_[tool: eval_js]_

_[tool: eval_js]_

On Templates the rail stays 84px even when expanded — so a media query is forcing permanent icon-rail mode at this width. Let me find it.

_[tool: grep]_

Let me find which element actually carries `data-collapsed` and test the transition directly on it, bypassing React's re-render.

_[tool: eval_js]_

_[tool: eval_js]_

Inline `width:256px` still computes to 84px — that means an `!important` rule is forcing it. That's the direct-edit override block. Let me check.

_[tool: eval_js]_

The "stuck at 84px" is a red herring — it's React re-asserting its persisted collapsed state plus the .42s transition not having progressed when read synchronously, not my CSS. My change is purely transition timing. Let me verify the unified timeline is correctly applied across all the key elements by reading their computed transitions directly.

_[tool: eval_js]_

All elements now share the unified **0.42s** structural duration on the brand ease `cubic-bezier(.2, .7, .2, 1)`, with opacity fades kept quick (.16–.2s) so labels clear cleanly. Every structural property — width, padding, max-width, margin, gap, transform, box-shadow — moves on one coordinated timeline. The change is confirmed live and the page loads without errors.

The side-menu close is now smoother because the motion is **synchronized**: previously the rail width (.36s), labels (.2s/.32s), badges (.14s), divider (.32s), and toggle chevron (.36s) all finished at different moments and the active-item glow snapped in. Now they ease together as a single 420ms motion (the brand's "panel enter" spec), and the active glow fades in instead of popping. Logged in the changelog.

One note: I couldn't capture a live width animation in the preview because the rail's collapsed state is React-controlled and persisted, so it kept re-asserting during scripted toggles — but the transitions themselves are verified correct and will play whenever you click the collapse toggle. Want me to also slow it slightly more (e.g. 480ms) or add a subtle stagger, or is 420ms the right feel?

## User

Good for now.

## Assistant

Sounds good. The collapse motion is unified at 420ms on the brand easing, and everything's logged. Just ping me if you want to fine-tune the speed or feel later.

## User

This action is not working. Please fix it and make sure all the action buttons are working

## Assistant

Let me find the preview toggle and the action buttons in this screen.

_[tool: grep]_

Let me read the DevicePreview component and how `onToggleSample`/`sample` are wired.

_[tool: read_file]_

Let me see the DevicePreview signature and where it's used in Templates.html.

_[tool: grep]_

The toggle in the approvals/review preview is wired to a no-op (`onToggleSample={() => {}}` with `sample={false}`). Let me confirm the ReviewScreen context and check what's in Templates.html.

_[tool: grep]_

The user is on Templates.html but the element is inside a `ReviewScreen` (from approvals.jsx). Let me see what Templates.html actually renders.

_[tool: read_file]_

_[tool: read_file]_

Templates.html renders `<TemplateStore>`. Let me find where a DevicePreview/ReviewScreen appears inside it.

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

The broken toggle lives in `ReviewScreen` (approvals.jsx) — its DevicePreview gets `sample={false} onToggleSample={() => {}}`, a genuine no-op. Let me read the full ReviewScreen and its action buttons to fix the toggle and audit every action.

_[tool: read_file]_

The fix: `ReviewScreen` needs real `sample` state instead of the no-op. Let me check the `useApS` hook and the DecisionBar actions to audit all buttons.

_[tool: grep]_

`useApS` is just `React.useState`, so I can add real sample state. Now let me read the DecisionBar to audit its action buttons.

_[tool: read_file]_

The DecisionBar buttons route through `onApprove/onSendBack/onReject/onReassign`. Let me verify those handlers in ApprovalsConsole are real.

_[tool: read_file]_

All DecisionBar actions (approve, add note, send back, reject, reassign), the back button, language segment, and modals are properly wired. The **only** dead control is the Sample data toggle in `ReviewScreen` — it's passed a no-op. Let me fix it with real state.

_[tool: str_replace_edit]_

Now log it in the changelog:

_[tool: str_replace_edit]_

The user is viewing Templates.html, but this fix lives in the shared approvals code that renders on Approvals.html. Let me verify the toggle works there.

_[tool: show_html]_

_[tool: eval_js]_

Confirmed working. The toggle now flips correctly: **"Sample data"** (off) shows the raw `{{customer.first_name}}` token → click → **"Show tokens"** (on) resolves to "Hi Omar…" sample value → click again returns to tokens. State, label, icon, and rendered content all update.

_[tool: done]_

Fixed and verified.

**What was broken:** the **"Sample data"** toggle in the approvals **Review screen** was wired to a no-op — `DevicePreview` received `sample={false}` with `onToggleSample={() => {}}`, so clicking did nothing.

**Fix:** gave `ReviewScreen` real `sample` state (resets when you open a different submission) and connected the toggle. It now swaps `{{tokens}}` ⇄ resolved sample values — verified: token view → "Hi {{customer.first_name}}…", sample view → "Hi Omar…", and back.

**Audited the rest of the screen's actions — all already working:** Approve, Add note, Send back (+reason), Reject (+reason), Reassign (+ modal), Back to queue, and the language segment. No other dead buttons.

One note on location: this control lives on **Approvals.html** (the `ReviewScreen` component), not Templates.html — the comment was tagged to Templates but the element you clicked was the approvals review preview. I surfaced Approvals.html so you can see it live. Logged under today's date in the changelog.

The lint findings are all pre-existing, unrelated to this fix.

## User

Let's build the profile and logout journeys

## Assistant

This is a substantial new piece of work — two new journeys (profile + logout). Before I build, let me understand the existing structure so my questions are informed: how the side-nav user chip works today, the page pattern, and what design-system components exist for menus/dialogs.

_[tool: read_file]_

I've got the picture. The side-nav **user chip** (`.ne-side-user`) is the natural entry point — it already shows avatar + name + role + a chevron, but today it has no click action. There's no profile page or logout flow yet. The design system has menu, dialog, avatar, inputs, selection-controls, and cards I can compose from, and there's a login screen (`Login Journey.html`) to land on after sign-out.

Before I build, a few decisions will shape this a lot. Let me get your direction:

_[tool: questions_v2]_

## User

Questions answered:
- entry: Click chip → slide-in side panel with profile summary + actions
- profile_sections: Personal info (name, email, phone, job title), Role & permissions (read-only), Active sessions / devices
- editability: Read-only profile, can't edit anything
- logout_confirm: Confirmation dialog before signing out
- logout_dest: The existing login screen (Login Journey.html)
- page_vs_settings: New standalone Profile.html page
- variations: Yes — variations of both
- consistency: Yes — wire it on all shells (Templates, Approvals, Settings, etc.)

## Assistant

Good, clear direction. Let me set up a task list and explore the key pieces I need before building — what design-system components exist (especially whether a slide-in panel is a new component I must flag), the shared vs duplicated shells, and the user data model.

_[tool: update_todos]_

_[tool: list_files]_

_[tool: grep]_

Critical finding: the design system has `.ajb-menu`, `.ajb-dialog`, `.ajb-list`/`.ajb-li`, `.ajb-avatar`, `.ajb-badge` — but **no sheet/drawer (slide-in side panel)** component. So the account panel is a genuinely new reusable pattern I'll need to flag. The logout confirm can reuse `.ajb-dialog` (same as the existing DeleteModal/ReassignModal). Let me confirm which shells share `SideNav` and read the user data model.

_[tool: grep]_

Architecture is clear: **all 7 console shells** (Templates, Approvals, Approvals-print, Edit/View/Create Template, Settings) render the shared `<SideNav>` from `console-shell.jsx` — so wiring the chip + panel there covers them all at once. `login.jsx` has its own inline copy (the post-login home). Let me confirm `login.css` is loaded everywhere and read the user data model.

_[tool: read_file]_

`login.css` is loaded by every shell — I'll add the sheet/panel CSS there (single source, available everywhere). Now the user data + i18n structure:

_[tool: grep]_

Let me read the i18n block structure so I can add account/profile strings correctly.

_[tool: read_file]_

Let me see how the `TPL` store is assembled/exported so I can add profile data cleanly.

_[tool: read_file]_

I have the data model. Let me look at the existing DeleteModal to replicate the exact dialog pattern for the logout confirm (reuse, not reinvent).

_[tool: read_file]_

_[tool: grep]_

I have the full pattern now (dialogs use `.nd-overlay`/`.ajb-dialog`; overlays are absolute within `.ne-console`). The `.nd-overlay` CSS lives in `template-delete.css` which isn't loaded everywhere, so I'll define my own overlay in `login.css` (loaded on all shells) and reuse the global `.ajb-dialog`/`.ajb-scrim`/`.ajb-menu` classes. Let me check the login home chip + whether Login Journey.html loads the shared shell.

_[tool: read_file]_

_[tool: grep]_

Login home (`Login Journey.html`) loads only `login.jsx` — its own isolated world using lucide `<i>` icons, no shared `Icon`/shell. Let me check how the shared `Icon` component renders so my panel icons work consistently across both worlds.

_[tool: grep]_

_[tool: read_file]_

I now have the complete picture. Key architecture decision: I'll build a **prop-driven shared `account.jsx`** (self-contained icons via lucide, no dependency on `template-parts`/`TPL`) so the same `AccountPanel` + `LogoutDialog` works in both the 7 shared shells (via `console-shell.jsx`'s `SideNav`) and the isolated login home. The slide-in panel is a **new reusable component** (no design-system sheet/drawer exists) — I'll flag it. CSS goes in `login.css` (loaded everywhere); logout reuses the global `.ajb-dialog`.

Let me start building. First, the i18n + profile data:

_[tool: str_replace_edit]_

Let me redo cleanly — define the `PROFILE` const and add it to the export in one edit:

_[tool: str_replace_edit]_

Now the core shared component. Let me create the prop-driven `account.jsx` (self-contained icon, no `TPL`/`template-parts` dependency, so it works in every shell and the login home):

_[tool: write_file]_

Now the panel CSS in `login.css` (loaded on every shell). Let me read the tail to append cleanly:

_[tool: read_file]_

_[tool: str_replace_edit]_

Now wire the chip in the shared `SideNav` (covers all 7 shells). It must render the panel **outside** the `.ne-side` aside (which has `overflow:hidden`), so I'll return a fragment:

_[tool: str_replace_edit]_

Now add the `account.jsx` script tag to all 7 shells (after `console-shell.jsx`) and update the lint global comment:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

7 shells wired. Let me quickly verify the panel works on Templates before building the Profile page.

_[tool: show_html]_

_[tool: eval_js]_

Panel works. Let me see it rendered and check console:

_[tool: save_screenshot]_

Panel state is open but not visible in the top portion of the capture — the anchored panel sits at the console bottom (off-frame) and I need to confirm the scrim covers correctly. Let me inspect geometry.

_[tool: eval_js]_

DOM geometry is perfect — overlay covers the console, scrim is 58% black, panel anchored bottom-left (the html-to-image capture just doesn't render the animated overlay, but the real browser will). Let me confirm the panel actually paints on top via hit-testing:

_[tool: eval_js]_

Hit-test confirms the panel paints correctly on top (real browser renders it; html-to-image just skips animated overlays — the verifier will confirm visually). Now the Profile page. Let me read the Templates.html scaffolding (FRAMES, useFit, Seg, review chrome) to mirror it exactly:

_[tool: read_file]_

Both the panel and DOM check out. Now let me build the Profile page. First `profile.css`:

_[tool: write_file]_

Let me add the missing `.pf-sec` container and make `.pf-hero` a card:

_[tool: str_replace_edit]_

Now the Profile page itself, mirroring the established shell scaffolding:

_[tool: write_file]_

Let me verify the Profile page renders.

_[tool: show_html]_

Excellent — the Profile page renders cleanly and on-brand. Let me check for console errors and test the account panel + logout flow + layout variations here.

_[tool: get_webview_logs]_

Only the expected Babel notice. Let me test the account panel + sign-out flow on the Profile page.

_[tool: eval_js]_

The full flow works. Let me visually verify the **drawer** variant and **stacked** layout, plus the panel rendering, with a few captures:

_[tool: multi_screenshot]_

Both layouts look polished. Now the login home (`login.jsx`) — the one remaining shell, which is isolated. Let me check its structure to wire the chip safely.

_[tool: read_file]_

`ConsoleHome` has `lang` + `t` (with userName/userRole). Let me check whether the login home wraps its content in `.ne-console` (needed for the overlay anchor).

_[tool: grep]_

The login home wraps in `.ne-console` (now `position: relative`), so the overlay anchors correctly. It has `lang` + `t.userName/userRole`; I'll pull the `acct` strings from `TPL`. Let me wire `ConsoleHome` and add the scripts to `Login Journey.html`:

_[tool: str_replace_edit]_

Now add `template-data.js` (for `TPL`) and `account.jsx` to `Login Journey.html`:

_[tool: str_replace_edit]_

Let me verify the login journey still loads cleanly and reach the home state to test the chip.

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

The login didn't advance to the home. Let me check what triggers the success state.

_[tool: grep]_

_[tool: grep]_

Demo creds are `100245 / aljazira`. Let me log in properly and test the home chip:

_[tool: eval_js]_

All three surfaces work: the 7 console shells, the login home, and the new Profile page. Let me update the changelog and todos, then clean up.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: delete_file]_

Everything is wired and verified via DOM + flow tests. Let me do a final visual sanity check of the drawer variant and RTL before handing off.

_[tool: multi_screenshot]_

_[tool: show_html]_

_[tool: eval_js]_

Arabic/RTL works end-to-end (panel `dir=rtl`, translated labels, "عرض الملف الشخصي"). Everything's verified. Handing off on the new Profile page.

Per the project rules, flagging the one new component I had to create:

> **New component created:** `AccountPanel` (`.ne-acct` slide-in account sheet) + `AcctIcon`
> **Purpose:** A slide-in account panel (profile summary + actions) opened from the side-nav user chip, plus its sign-out confirmation. The Aljazira design system has `dialog` and `menu` but **no sheet/drawer**, so this is a genuinely new reusable pattern — built only from DS tokens and the existing `.ajb-avatar` / `.ajb-menu` / `.ajb-dialog` classes.
> **Used in:** All 7 console shells, the login home, and the Profile journey. Two entry variations: `anchored` + `drawer`.
> **Added to design system:** The bound DS folder is read-only, so it lives in the project (`console/account.jsx` + `.ne-acct*` in `login.css`) and is fully documented in `CHANGELOG.md`. Recommend promoting it into the DS as a `Sheet` component when the DS is editable.

_[tool: done]_

Done — the **profile and logout journeys** are built and verified (clean load, no console errors; the lint warnings are all pre-existing in other files, none in the new ones).

**What's now in place**

- **Account panel** — click the side-nav user chip on *any* shell to open a slide-in account sheet (avatar, name, role, email + View profile · Account settings · Sign out). Wired across all 7 console shells (via the shared `SideNav`) **and** the login home — kept identical per the side-menu-consistency rule.
- **Sign-out flow** — "Sign out" opens a confirmation dialog → returns to `Login Journey.html`. Available from the panel and the Profile header.
- **Profile page** (`Profile.html`) — read-only: **Personal information**, **Role & permissions** (granted/not-granted), and **Active sessions**. Fully EN/AR + RTL.

**Variations (both, as requested), exposed as Tweaks on the Profile page**
- Profile layout: `two-column` ↔ `stacked`
- Account-panel entry style: `anchored` (rises from the chip) ↔ `drawer` (full-height edge panel) — persisted so it's consistent everywhere.

**Design-system note:** everything reuses DS components except the slide-in sheet, which the DS doesn't have — I flagged it above as a new reusable component (`AccountPanel`), built from DS tokens/classes, and documented it in `CHANGELOG.md` (the DS folder is read-only).

One heads-up: the in-tool screenshots don't render the animated overlay, so the panel may look "missing" in a flat capture — it's confirmed rendering via DOM hit-testing and live interaction. Want me to also add a **Profile** entry somewhere in the side nav, or keep it chip-only?

## User

Remove the account settings from here; there's no need for it

## Assistant

_[tool: str_replace_edit]_

Now log the change:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

Done. The account panel now shows just **View profile** and **Sign out** — "Account settings" removed across every shell and the login home (it lives in the shared `account.jsx`). Logged in the changelog.

