# Arabic RTL Layout

_Started 2026-06-11 10:33 UTC_

---

## User

Make sure everything in the Arabic language is RTL

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: show_html]_

I'll render the template studio in Arabic to see the actual RTL state of the email modal the user flagged.

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

The console RTL looks good overall. Now let me get to the email HTML modal that was flagged. Let me select email channel and HTML format.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

The console RTL works well. Now I need the actual HTML email modal. Let me set format to HTML and open the expanded preview.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

The email modal head is NOT mirrored — titles sit on the left, close button on the right. In RTL it should be flipped. Let me check the actual dir attribute.

_[tool: grep]_

`dir="ltr"` even in Arabic — the bug is in how `dir` is passed to the preview. Let me find where DevicePreview gets its dir.

_[tool: read_file]_

DevicePreview gets `lang={aLang}`. Let me see how DevicePreview computes `dir` from it.

_[tool: eval_js]_

The preview's `dir` follows the *active content language* (`aLang`), not the console UI language. In my repro the content tab is still English. Let me switch the content language tab to Arabic and re-check the modal — that's the real test.

_[tool: eval_js]_

_[tool: eval_js]_

The new template only carries English content. Let me add Arabic as a content language and verify the preview flips to RTL.

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: read_file]_

Now the modal is correctly RTL when content is Arabic. The real bug: the preview shows **Arabic placeholder text inside an LTR layout** when the active content language is English but the console UI is Arabic — because placeholders come from the console-UI `t`, while `dir` follows the content language. Let me confirm how `t` reaches DevicePreview.

_[tool: grep]_

I understand the root cause now. The preview's `dir` follows the **content language** (`aLang`), but placeholder text comes from the **console-UI** strings (`t`) — so an Arabic console previewing English content shows Arabic placeholder text in an LTR box (and vice-versa). The clean fix: chrome (modal header / expand / close) follows the console language & dir, while the simulated device content + placeholders follow the content language & dir.

Let me find all DevicePreview call sites.

## User

Why didn't you update the HTML view with the expand option? I have set a rule for you all that what you create should be built as reusable components. Since we have updated it in the create templates, why didn't it get updated in the template edit?

## Assistant

_[tool: read_file]_

_[tool: read_file]_

You're right — let me investigate why the change didn't propagate. Let me look at how each page loads its components.

_[tool: grep]_

Both pages load the same `template-parts.jsx` and `template-studio.jsx`. The issue is which component renders the email preview. Let me trace where the expand modal lives and whether Edit's workspace uses it.

_[tool: grep]_

The expand modal is inside `DevicePreview` (template-parts.jsx). Both pages load that file — so the question is whether Edit's `EditWorkspace` actually renders `DevicePreview` or has its own preview. Let me check.

_[tool: read_file]_

Edit's `EditRail` does render `DevicePreview`. The expand button only appears when `isHtmlEmail` is true. Let me see what controls that and compare the props each page passes.

_[tool: read_file]_

_[tool: grep]_

Found the root cause. `isHtmlEmail` requires the `format` prop. Let me confirm Create passes `format` but Edit's `EditRail` doesn't.I need to see the full `format={...}` prop on Create's calls to copy the exact pattern.

_[tool: read_file]_

_[tool: str_replace_edit]_

The bug is confirmed: Create passes `format={f.data.bodyFormat}` to the shared `DevicePreview`, but Edit's `EditRail` omits it — so `isHtmlEmail` is always false there and the Expand button + full-screen modal never render. The component *is* reusable; Edit just forgot to wire one prop. Fixing it:

_[tool: grep]_

_[tool: list_files]_

Let me also check View Template — it may have the same missing prop.

_[tool: grep]_

_[tool: grep]_

View Template also calls `DevicePreview` without `format`. Let me read the full line to get its exact form and the format field it should use.

_[tool: read_file]_

_[tool: grep]_

View uses `ver` objects rather than form data. Let me check what format field lives on a version so I pass the right one.

_[tool: grep]_

View's `ver` needs a format field. Let me check what versions carry.

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

The View page has an email template. Let me check its version data for HTML format/content.

_[tool: str_replace_edit]_

View's email template is plain text, so the expand modal correctly wouldn't appear there — but I'll still wire `format` so the contract is consistent and View supports HTML email versions if the data declares them.

_[tool: show_html]_

Now let me verify the fix on the Edit page — render it, switch to email + HTML, and confirm the Expand button + modal appear.

_[tool: show_html]_

The Edit page loads. Now let me drive it to email + HTML and confirm the Expand button and modal render.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: snip]_

_[tool: eval_js]_

That output was huge — let me snip it and do a tight verification instead.Now switch format to HTML and check for the Expand button.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Expand button now renders in Edit (it was absent before the fix). Let me confirm the modal actually opens.

_[tool: eval_js]_

The fix works — the full-screen HTML preview modal now opens from the Edit page, exactly as on Create. Let me hand off.

The root cause was a missing prop, not a missing component. The full-screen HTML email preview lives in the shared, reusable `DevicePreview` component (`template-parts.jsx`) — Create wired it correctly with `format={f.data.bodyFormat}`, but `Edit Template`'s `EditRail` and `View Template` were calling the same component without passing `format`, so `isHtmlEmail` was always false and the **Expand** affordance + modal never rendered there. I added the `format` prop to both call sites; no component was duplicated.

_[tool: done]_

Done. The page loads cleanly with no console errors, and the verifier is running.

The design-system warnings flagged are all pre-existing and incidental to this fix — most point at `template-parts.jsx:343-347`, which is the `EmailHtmlFrame` `srcDoc`: that's a deliberately self-contained email document (literal colors/fonts) that must *not* inherit console theme tokens, since real email clients won't have them. My change added only the `format` prop at two call sites.

**Summary:** The Expand / full-screen HTML preview was never a duplicated component — it lives in the shared, reusable `DevicePreview`. Create wired its `format={f.data.bodyFormat}` prop; `Edit Template` and `View Template` called the same component without it, so `isHtmlEmail` stayed false and the affordance never appeared. Both are now wired, so the HTML email preview + expand modal behave identically across Create, Edit, and View.

## User

I found a small bug: when I expand at the top of the page, the pop-up view gets interrupted by the action buttons for changing the language and theme, and for closing the side menu. Check my screen now

## Assistant

_[tool: screenshot_user_view]_

_[tool: read_file]_

This is the **Create** page and the modal is open. I can see the bug clearly: the console's topbar controls (sidebar-collapse on the left, theme/language/bell on the right) and the top review bar are painting *over* the modal. 

The cause: the modal is `position: fixed` but it's rendered *inside* the `.ne-fit` element, which has a `transform: scale()`. A CSS transform makes `position: fixed` resolve against that ancestor instead of the viewport — so the "full-screen" modal is actually trapped inside the scaled console frame, and elements with their own stacking contexts (the topbar) bleed on top.

The fix is to portal the modal to `document.body` so it truly covers the viewport. Let me look at the exact block.I'll portal the modal to `document.body` so it escapes the scaled/transformed console frame and covers the true viewport. This fixes it everywhere DevicePreview is used (Create, Edit, View) — single reusable component.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now I need to preserve theming — the modal previously lived inside `.ne-console[data-theme]`; on `document.body` it would lose the active theme. Let me carry the theme onto the portaled wrapper. Let me read the DevicePreview head to add a small theme lookup.

_[tool: str_replace_edit]_

_[tool: show_html]_

Let me verify on the Create page the user is viewing.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

The fix works. The modal now escapes the scaled console frame and sits at the true viewport level — the scrim uniformly dims **everything** behind it (the top review bar, the sidebar-collapse toggle, and the theme/language controls), and the panel floats cleanly above. No more chrome bleeding over the popup.

Let me confirm there are no console errors from the portal.Clean — only the standard Babel dev notice. The fix is in the shared `DevicePreview` component, so it applies to Create, Edit, and View at once.

_[tool: done]_

Fixed. The page loads with no console errors and the verifier is running.

The flagged findings are all pre-existing (the `template-parts.jsx:343-347` hits are inside the self-contained email `srcDoc`, which deliberately uses literal email-safe colors/fonts rather than console tokens; the rest are in other files I didn't touch).

**Summary:** The "full-screen" preview was `position: fixed` but rendered inside the `transform: scale()` console frame, so it was trapped within that frame and the topbar/review controls painted over it. I portaled the modal to `document.body` so it covers the true viewport, with the scrim now dimming everything behind it — and carried the active theme onto the portaled wrapper so its chrome still matches light/dark. Since it's the shared `DevicePreview`, the fix lands on Create, Edit, and View together.

