/* @ds-bundle: {"format":3,"namespace":"AljaziraBankDesignSystem_f24f32","components":[],"sourceHashes":{"slides/deck-stage.js":"d8d952171670","ui_kits/aljazira-app/app/Atoms.jsx":"8882284c6b8e","ui_kits/aljazira-app/app/Components.jsx":"865ccc0a8ba7","ui_kits/aljazira-app/app/Gallery.jsx":"88e3cad3551c","ui_kits/aljazira-app/app/Nav.jsx":"6552bb8f489f","ui_kits/aljazira-app/app/Screens.jsx":"6f0eb1328b9a","ui_kits/aljazira-app/app/store.jsx":"06db861f15ef","ui_kits/aljazira-app/ios-frame.jsx":"d67eb3ffe562","ui_kits/aljazira-website/components/CTAStrip.jsx":"94ddc43fdf8a","ui_kits/aljazira-website/components/Footer.jsx":"58564ff9f296","ui_kits/aljazira-website/components/Hero.jsx":"04bd35510875","ui_kits/aljazira-website/components/NavBar.jsx":"3131025c2bcb","ui_kits/aljazira-website/components/ProductsGrid.jsx":"634217ba809e","ui_kits/aljazira-website/components/StatStrip.jsx":"c312174dc33b","ui_kits/aljazira-website/components/StorySection.jsx":"3013bd546b22"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AljaziraBankDesignSystem_f24f32 = window.AljaziraBankDesignSystem_f24f32 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// slides/deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, and via the `no-rail`
 *      attribute. Rail mutations dispatch a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* Tap zones for mobile — back/forward thirds like Stories.
       Transparent, no visible UI, don't block the overlay. */
    .tapzones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 2147482000;
      pointer-events: none;
    }
    .tapzone {
      flex: 1;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }
    /* Only activate tap zones on coarse pointers (touch devices). */
    @media (hover: hover) and (pointer: fine) {
      .tapzones { display: none; }
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }
    :host([data-rail-anim]) .tapzones { transition: left 200ms cubic-bezier(.3,.7,.4,1); }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .tapzones, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Tap zones (mobile): left third = back, right third = forward.
      const tapzones = document.createElement('div');
      tapzones.className = 'tapzones export-hidden';
      tapzones.setAttribute('aria-hidden', 'true');
      tapzones.setAttribute('data-noncommentable', '');
      const tzBack = document.createElement('div');
      tzBack.className = 'tapzone tapzone--back';
      const tzMid = document.createElement('div');
      tzMid.className = 'tapzone tapzone--mid';
      tzMid.style.pointerEvents = 'none';
      const tzFwd = document.createElement('div');
      tzFwd.className = 'tapzone tapzone--fwd';
      tzBack.addEventListener('click', this._onTapBack);
      tzFwd.addEventListener('click', this._onTapForward);
      tapzones.append(tzBack, tzMid, tzFwd);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-noncommentable', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-noncommentable', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-noncommentable', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-noncommentable', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-noncommentable', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, tapzones, overlay, menu, confirm);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._tapzones = tapzones;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        if (this._tapzones) this._tapzones.style.left = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region. Tapzones just inset from rw.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      if (this._tapzones) this._tapzones.style.left = rw + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTapBack(e) {
      e.preventDefault();
      this._advance(-1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._advance(1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/Atoms.jsx
try { (() => {
/* global React */

function AjbButton({
  variant = 'primary',
  children,
  onClick,
  icon
}) {
  const cls = `ajb-app-btn ajb-app-btn-${variant}`;
  return /*#__PURE__*/React.createElement("button", {
    className: cls,
    onClick: onClick
  }, icon && /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  }), /*#__PURE__*/React.createElement("span", null, children));
}
function AjbBalance({
  amount,
  currency = 'SAR',
  delta
}) {
  const [whole, dec] = String(amount).split('.');
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-balance"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-balance-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-balance-value"
  }, Number(whole).toLocaleString(), dec && /*#__PURE__*/React.createElement("span", {
    className: "ajb-app-balance-dec"
  }, ".", dec)), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-balance-currency"
  }, currency)), delta && /*#__PURE__*/React.createElement("div", {
    className: `ajb-app-balance-delta ${delta.startsWith('-') ? 'neg' : 'pos'}`
  }, delta));
}
function AjbTxRow({
  name,
  sub,
  amount,
  icon,
  neg
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-mid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-name"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: `ajb-app-tx-amt ${neg ? 'neg' : 'pos'}`
  }, neg ? '-' : '+', " ", amount));
}
function AjbAccountChip({
  label,
  last4,
  balance,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `ajb-app-chip ${active ? 'on' : ''}`,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-chip-l"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-chip-label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-chip-last"
  }, "\u2022\u2022\u2022\u2022 ", last4)), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-chip-bal"
  }, balance));
}
function AjbHeader({
  title,
  action,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-header"
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    className: "ajb-app-header-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-left"
  })) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-header-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-header-action"
  }, action));
}
Object.assign(window, {
  AjbButton,
  AjbBalance,
  AjbTxRow,
  AjbAccountChip,
  AjbHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/Atoms.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/Components.jsx
try { (() => {
/* global React */
/* ============================================================
   Aljazira App — reusable component library.
   Every component is built on the semantic tokens in
   colors_and_type.css, so they respond to data-theme + dir.
   Styles live in app.css under the .ajbc- prefix.
   Icons use Lucide (<i data-lucide>) — the host calls
   lucide.createIcons() after each render.
   ============================================================ */
const {
  useState
} = React;

/* ---------- Badges & status ---------- */
function Badge({
  tone = 'neutral',
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `ajbc-badge ajbc-badge-${tone}`
  }, children);
}
function StatusDot({
  tone = 'neutral',
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ajbc-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajbc-dot",
    style: {
      background: `var(--ajbc-tone-${tone})`
    }
  }), children);
}
function CountBadge({
  tone = 'danger',
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `ajbc-count ajbc-count-${tone}`
  }, children);
}

/* ---------- Alert / inline message ---------- */
const ALERT_ICONS = {
  success: 'check-circle-2',
  danger: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info'
};
function Alert({
  tone = 'info',
  title,
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `ajbc-alert ajbc-alert-${tone}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajbc-alert-ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": ALERT_ICONS[tone]
  })), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-alert-b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-alert-t"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "ajbc-alert-d"
  }, children)), onClose && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-alert-x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })));
}

/* ---------- Selection controls ---------- */
function Radio({
  checked,
  label,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ajbc-opt ${disabled ? 'ajbc-muted' : ''}`,
    onClick: () => !disabled && onChange && onChange()
  }, /*#__PURE__*/React.createElement("span", {
    className: `ajbc-radio ${checked ? 'on' : ''}`
  }), label);
}
function Checkbox({
  checked,
  indeterminate,
  label,
  onChange,
  disabled
}) {
  const cls = indeterminate ? 'ind' : checked ? 'on' : '';
  return /*#__PURE__*/React.createElement("label", {
    className: `ajbc-opt ${disabled ? 'ajbc-muted' : ''}`,
    onClick: () => !disabled && onChange && onChange()
  }, /*#__PURE__*/React.createElement("span", {
    className: `ajbc-cb ${cls}`
  }), label);
}
function Toggle({
  checked,
  label,
  onChange
}) {
  const sw = /*#__PURE__*/React.createElement("span", {
    className: `ajbc-tog ${checked ? 'on' : ''}`,
    onClick: () => onChange && onChange(!checked)
  });
  if (!label) return sw;
  return /*#__PURE__*/React.createElement("label", {
    className: "ajbc-opt",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), sw);
}

/* ---------- Segmented & tabs ---------- */
function Segmented({
  options,
  value,
  onChange
}) {
  const [internal, setInternal] = useState(options[0]);
  const val = value !== undefined ? value : internal;
  const set = o => {
    setInternal(o);
    onChange && onChange(o);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-seg"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    className: val === o ? 'on' : '',
    onClick: () => set(o)
  }, o)));
}
function Tabs({
  tabs,
  value,
  onChange
}) {
  const [internal, setInternal] = useState(tabs[0].id);
  const val = value !== undefined ? value : internal;
  const set = id => {
    setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-tabs"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: val === t.id ? 'on' : '',
    onClick: () => set(t.id)
  }, t.label, t.badge != null && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-tabs-badge"
  }, t.badge))));
}

/* ---------- Select ---------- */
function Select({
  label,
  value,
  placeholder,
  focus
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-field"
  }, label && /*#__PURE__*/React.createElement("div", {
    className: "ajbc-field-lbl"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: `ajbc-select ${focus ? 'focus' : ''}`
  }, /*#__PURE__*/React.createElement("span", {
    className: value ? '' : 'ajbc-select-ph'
  }, value || placeholder), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-down"
  })));
}

/* ---------- Avatars ---------- */
function Avatar({
  size = 'md',
  src,
  initials,
  symbol,
  gradient
}) {
  const style = gradient ? {
    background: gradient
  } : undefined;
  return /*#__PURE__*/React.createElement("span", {
    className: `ajbc-av ajbc-av-${size} ${symbol ? 'ajbc-av-symbol' : ''}`,
    style: style
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: ""
  }) : symbol ? /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-ajb-symbol-black.png",
    alt: ""
  }) : initials);
}
function AvatarStack({
  items,
  more
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-stack"
  }, items.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: `ajbc-av ajbc-av-md`,
    style: {
      background: it.gradient
    }
  }, it.initials)), more != null && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-av ajbc-av-md ajbc-av-more"
  }, "+", more));
}

/* ---------- Progress & loaders ---------- */
function ProgressBar({
  value = 0,
  label,
  right
}) {
  return /*#__PURE__*/React.createElement("div", null, (label || right) && /*#__PURE__*/React.createElement("div", {
    className: "ajbc-bar-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, right)), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-bar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${value}%`
    }
  })));
}
function Spinner({
  label,
  size = 44
}) {
  const s = {
    width: size,
    height: size
  };
  if (!label) return /*#__PURE__*/React.createElement("span", {
    className: "ajbc-spin",
    style: s
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-ring"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajbc-spin",
    style: s
  }), /*#__PURE__*/React.createElement("span", {
    className: "ajbc-ring-lbl"
  }, label));
}
function Skeleton({
  w = '100%',
  h = 12,
  radius = 6
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ajbc-sk",
    style: {
      width: w,
      height: h,
      borderRadius: radius,
      display: 'block'
    }
  });
}

/* ---------- Chips ---------- */
function Chip({
  children,
  onRemove,
  selected,
  dashed
}) {
  const cls = `ajbc-chip ${selected ? 'on' : ''} ${dashed ? 'dashed' : ''}`;
  return /*#__PURE__*/React.createElement("span", {
    className: cls
  }, children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-chip-x",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })));
}

/* ---------- Pagination & breadcrumb ---------- */
function Pagination({
  page = 1,
  pages = [1, 2, 3],
  last,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-pag"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav",
    onClick: () => onChange && onChange(Math.max(1, page - 1))
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-left"
  })), pages.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: p === page ? 'on' : '',
    onClick: () => onChange && onChange(p)
  }, p)), last && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }, "\u2026"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange && onChange(last)
  }, last)), /*#__PURE__*/React.createElement("button", {
    className: "nav",
    onClick: () => onChange && onChange(page + 1)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  })));
}
function Breadcrumb({
  items
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-crumb"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  })), /*#__PURE__*/React.createElement("span", {
    className: i === items.length - 1 ? 'cur' : ''
  }, it))));
}

/* ---------- Toast ---------- */
function Toast({
  tone = 'neutral',
  icon = 'check',
  title,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: `ajbc-toast-ico ajbc-toast-${tone}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-toast-b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-toast-t"
  }, title)), action && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-toast-a",
    onClick: onAction
  }, action));
}

/* ---------- Empty state ---------- */
function EmptyState({
  icon = 'inbox',
  title,
  children,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-empty"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajbc-empty-badge"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  })), /*#__PURE__*/React.createElement("h4", null, title), children && /*#__PURE__*/React.createElement("p", null, children), action && /*#__PURE__*/React.createElement("button", {
    className: "ajbc-empty-btn",
    onClick: onAction
  }, action));
}

/* ---------- List row ---------- */
function ListRow({
  icon,
  title,
  sub,
  value,
  trailing = 'chevron',
  toggleOn,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-li",
    onClick: onClick
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-li-ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-li-mid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-li-t"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "ajbc-li-s"
  }, sub)), value && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-li-val"
  }, value), trailing === 'chevron' && /*#__PURE__*/React.createElement("span", {
    className: "ajbc-li-chev"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  })), trailing === 'toggle' && /*#__PURE__*/React.createElement("span", {
    className: `ajbc-tog ${toggleOn ? 'on' : ''}`
  }));
}

/* ---------- Calendar & date field ----------
   Fully interactive single-date picker. Pass `value` (a Date) +
   `onChange` to control it, or let it manage its own selection.
   Month navigation is internal. For range pickers, the same cell
   classes (start / end / range) are styled in app.css. */
const AJBC_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AJBC_MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AJBC_DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function Calendar({
  value,
  onChange,
  year = 2026,
  month = 4
}) {
  const [vy, setVy] = useState(year);
  const [vm, setVm] = useState(month);
  const [internal, setInternal] = useState(value || null);
  const sel = value !== undefined ? value : internal;
  const today = new Date(2026, 4, 31); // demo "today" = 31 May 2026

  const startDow = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const step = delta => {
    let nm = vm + delta,
      ny = vy;
    if (nm < 0) {
      nm = 11;
      ny--;
    } else if (nm > 11) {
      nm = 0;
      ny++;
    }
    setVm(nm);
    setVy(ny);
  };
  const pick = d => {
    const nd = new Date(vy, vm, d);
    setInternal(nd);
    onChange && onChange(nd);
  };
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(/*#__PURE__*/React.createElement("div", {
    key: `b${i}`,
    className: "ajbc-day muted"
  }));
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(vy, vm, d);
    const cls = ['ajbc-day'];
    if (sameDay(dt, sel)) cls.push('sel');else if (sameDay(dt, today)) cls.push('today');
    cells.push(/*#__PURE__*/React.createElement("div", {
      key: d,
      className: cls.join(' '),
      onClick: () => pick(d)
    }, d));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cal-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cal-title"
  }, AJBC_MONTHS[vm], " ", vy), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cal-nav"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => step(-1)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-left"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => step(1)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cal-grid"
  }, AJBC_DOW.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: `d${i}`,
    className: "ajbc-dow"
  }, d)), cells));
}
function fmtDate(d) {
  if (!d) return null;
  return `${d.getDate()} ${AJBC_MON3[d.getMonth()]} ${d.getFullYear()}`;
}
function DateField({
  label,
  value,
  placeholder = 'Select date',
  focus,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-field"
  }, label && /*#__PURE__*/React.createElement("div", {
    className: "ajbc-field-lbl"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: `ajbc-select ${focus ? 'focus' : ''}`,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: value ? '' : 'ajbc-select-ph'
  }, fmtDate(value) || placeholder), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  })));
}
Object.assign(window, {
  Badge,
  StatusDot,
  CountBadge,
  Alert,
  Radio,
  Checkbox,
  Toggle,
  Segmented,
  Tabs,
  Select,
  Avatar,
  AvatarStack,
  ProgressBar,
  Spinner,
  Skeleton,
  Chip,
  Pagination,
  Breadcrumb,
  Toast,
  EmptyState,
  ListRow,
  Calendar,
  DateField
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/Gallery.jsx
try { (() => {
/* global React, useApp, AjbHeader, Badge, StatusDot, CountBadge, Alert, Radio, Checkbox, Toggle, Segmented, Tabs, Select, Avatar, AvatarStack, ProgressBar, Spinner, Skeleton, Chip, Pagination, Breadcrumb, Toast, EmptyState, ListRow, Calendar, DateField */
const {
  useState: useGState
} = React;
function Section({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajbc-gal-sec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-gal-h"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-gal-body"
  }, children));
}
function ComponentsGallery() {
  const {
    setScreen
  } = useApp();
  const [seg, setSeg] = useGState('All');
  const [tab, setTab] = useGState('accounts');
  const [radio, setRadio] = useGState('instant');
  const [save, setSave] = useGState(true);
  const [bio, setBio] = useGState(true);
  const [travel, setTravel] = useGState(false);
  const [page, setPage] = useGState(1);
  const [chips, setChips] = useGState(['Riyadh', 'Beneficiaries']);
  const [showToast, setShowToast] = useGState(true);
  const [date, setDate] = useGState(new Date(2026, 4, 19));
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajbc-gal"
  }, /*#__PURE__*/React.createElement(AjbHeader, {
    title: "Components",
    onBack: () => setScreen('home')
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-gal-scroll"
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Badges & status"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-wrap"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "sand"
  }, "Premier"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Active"), /*#__PURE__*/React.createElement(Badge, {
    tone: "warning"
  }, "Pending"), /*#__PURE__*/React.createElement(Badge, {
    tone: "danger"
  }, "Blocked"), /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "New")), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-wrap",
    style: {
      marginTop: 12,
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(StatusDot, {
    tone: "success"
  }, "Settled"), /*#__PURE__*/React.createElement(StatusDot, {
    tone: "warning"
  }, "Processing"), /*#__PURE__*/React.createElement(StatusDot, {
    tone: "danger"
  }, "Failed"), /*#__PURE__*/React.createElement("span", {
    className: "ajbc-status",
    style: {
      gap: 8
    }
  }, "Alerts ", /*#__PURE__*/React.createElement(CountBadge, null, "3")))), /*#__PURE__*/React.createElement(Section, {
    title: "Alerts"
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "success",
    title: "Transfer complete",
    onClose: () => {}
  }, "18,400 SAR sent to Aramco payroll."), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10
    }
  }), /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "Verify your identity"
  }, "Your Absher details expire in 5 days.")), /*#__PURE__*/React.createElement(Section, {
    title: "Selection controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-cols2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Radio, {
    checked: radio === 'instant',
    label: "Instant",
    onChange: () => setRadio('instant')
  }), /*#__PURE__*/React.createElement(Radio, {
    checked: radio === 'sameday',
    label: "Same-day",
    onChange: () => setRadio('sameday')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    checked: save,
    label: "Save beneficiary",
    onChange: () => setSave(!save)
  }), /*#__PURE__*/React.createElement(Toggle, {
    checked: bio,
    label: "Biometric login",
    onChange: setBio
  }), /*#__PURE__*/React.createElement(Toggle, {
    checked: travel,
    label: "Travel mode",
    onChange: setTravel
  })))), /*#__PURE__*/React.createElement(Section, {
    title: "Segmented & tabs"
  }, /*#__PURE__*/React.createElement(Segmented, {
    options: ['All', 'Income', 'Spending'],
    value: seg,
    onChange: setSeg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      id: 'accounts',
      label: 'Accounts'
    }, {
      id: 'cards',
      label: 'Cards',
      badge: 2
    }, {
      id: 'invest',
      label: 'Invest'
    }]
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Select"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "From account",
    value: "Current \xB7 \u2022\u2022\u2022\u2022 4429"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Transfer speed",
    value: "Instant",
    focus: true
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Avatars"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-wrap",
    style: {
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: "sm",
    initials: "KA",
    gradient: "linear-gradient(135deg,#001421,#8c684a)"
  }), /*#__PURE__*/React.createElement(Avatar, {
    size: "md",
    src: "../../assets/photo-man-shirt.png"
  }), /*#__PURE__*/React.createElement(Avatar, {
    size: "md",
    symbol: true
  }), /*#__PURE__*/React.createElement(AvatarStack, {
    more: 5,
    items: [{
      initials: 'F',
      gradient: 'linear-gradient(135deg,#001421,#8c684a)'
    }, {
      initials: 'K',
      gradient: 'linear-gradient(135deg,#33b793,#1f6e57)'
    }, {
      initials: 'N',
      gradient: 'linear-gradient(135deg,#3e87d3,#1f4c7d)'
    }]
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Progress & loaders"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 62,
    label: "Hajj 2026 goal",
    right: "62%"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajbc-wrap",
    style: {
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    label: "Confirming\u2026",
    size: 32
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Skeleton, {
    w: 40,
    h: 40,
    radius: 12
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Skeleton, {
    w: "60%",
    h: 12
  }), /*#__PURE__*/React.createElement(Skeleton, {
    w: "40%",
    h: 10
  })))), /*#__PURE__*/React.createElement(Section, {
    title: "Chips & filters"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-wrap"
  }, chips.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    onRemove: () => setChips(chips.filter(x => x !== c))
  }, c)), /*#__PURE__*/React.createElement(Chip, {
    selected: true
  }, "Income"), /*#__PURE__*/React.createElement(Chip, {
    dashed: true
  }, "+ Add filter"))), /*#__PURE__*/React.createElement(Section, {
    title: "List rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajbc-list"
  }, /*#__PURE__*/React.createElement(ListRow, {
    icon: "user",
    title: "Personal details",
    sub: "Name, ID, contact"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "globe",
    title: "Language",
    value: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "fingerprint",
    title: "Biometric login",
    trailing: "toggle",
    toggleOn: bio,
    onClick: () => setBio(!bio)
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Calendar & date field"
  }, /*#__PURE__*/React.createElement(DateField, {
    label: "Scheduled transfer",
    value: date,
    focus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14
    }
  }), /*#__PURE__*/React.createElement(Calendar, {
    value: date,
    onChange: setDate,
    year: 2026,
    month: 4
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Navigation"
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: ['Accounts', 'Current', 'May statement']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pages: [1, 2, 3],
    last: 12,
    onChange: setPage
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Toast & empty state"
  }, showToast && /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    icon: "check",
    title: "Beneficiary saved",
    action: "Undo",
    onAction: () => setShowToast(false)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(EmptyState, {
    icon: "inbox",
    title: "No transactions yet",
    action: "Make a transfer",
    onAction: () => setScreen('transfer')
  }, "When money moves in or out, it appears here."))));
}
window.ComponentsGallery = ComponentsGallery;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/Gallery.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/Nav.jsx
try { (() => {
/* global React, useApp */

function BottomTabs() {
  const {
    tab,
    setTab,
    setScreen
  } = useApp();
  const tabs = [{
    id: 'home',
    label: 'Home',
    icon: 'home',
    screen: 'home'
  }, {
    id: 'cards',
    label: 'Cards',
    icon: 'credit-card',
    screen: 'card'
  }, {
    id: 'invest',
    label: 'Invest',
    icon: 'trending-up',
    screen: 'home'
  }, {
    id: 'more',
    label: 'More',
    icon: 'menu',
    screen: 'home'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tabbar"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: tab === t.id ? 'on' : '',
    onClick: () => {
      setTab(t.id);
      setScreen(t.screen);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": t.icon
  }), /*#__PURE__*/React.createElement("span", null, t.label))));
}
window.BottomTabs = BottomTabs;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/Screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, useApp, AjbButton, AjbBalance, AjbTxRow, AjbAccountChip, AjbHeader */
const {
  useEffect
} = React;

/* ---------- ONBOARDING ---------- */
function Onboarding() {
  const {
    setScreen
  } = useApp();
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajb-app-onboard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-onboard-photo",
    style: {
      backgroundImage: 'url(../../assets/scenery-desert-sunrise.png)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-onboard-copy"
  }, /*#__PURE__*/React.createElement("img", {
    className: "ajb-app-onboard-logo",
    src: "../../assets/logo-white.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("h1", {
    className: "ajb-app-onboard-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, "Wealth"), /*#__PURE__*/React.createElement("br", null), "grows here."), /*#__PURE__*/React.createElement("p", {
    className: "ajb-app-onboard-sub"
  }, "Your bank, your journey \u2014 wherever the day takes you."), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-onboard-cta"
  }, /*#__PURE__*/React.createElement(AjbButton, {
    variant: "primary",
    onClick: () => setScreen('home')
  }, "Sign in"), /*#__PURE__*/React.createElement(AjbButton, {
    variant: "ghost",
    onClick: () => setScreen('home')
  }, "Create an account")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-onboard-foot"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "fingerprint"
  }), " Biometric"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "lock"
  }), " Encrypted"))));
}

/* ---------- HOME ---------- */
const HOME_TX = [{
  name: 'Coffee · Half Million',
  sub: 'Today · 8:42',
  amount: '24.00 SAR',
  icon: 'coffee',
  neg: true
}, {
  name: 'Salary · Aramco',
  sub: 'Yesterday',
  amount: '18,400.00 SAR',
  icon: 'briefcase',
  neg: false
}, {
  name: 'STC postpaid',
  sub: 'May 16',
  amount: '210.00 SAR',
  icon: 'phone',
  neg: true
}, {
  name: 'AlMutlaq home rent',
  sub: 'May 14',
  amount: '4,800.00 SAR',
  icon: 'home',
  neg: true
}, {
  name: 'Refund · Jarir',
  sub: 'May 11',
  amount: '149.00 SAR',
  icon: 'package',
  neg: false
}];
function Home() {
  const {
    setScreen
  } = useApp();
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajb-app-home"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-home-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-greeting"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-greeting-l"
  }, "Marhaba,"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-greeting-n"
  }, "Layla")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-home-icons"
  }, /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search"
  })), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-account-label"
  }, "Current account \xB7 SAR"), /*#__PURE__*/React.createElement(AjbBalance, {
    amount: "28492.18",
    delta: "+1.2% this month"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-account-foot"
  }, /*#__PURE__*/React.createElement("span", null, "\u2022\u2022\u2022\u2022 4429"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen('transactions')
  }, "View statement ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-quick"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen('transfer')
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-up-right"
  })), /*#__PURE__*/React.createElement("span", null, "Transfer")), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "qr-code"
  })), /*#__PURE__*/React.createElement("span", null, "Pay")), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  })), /*#__PURE__*/React.createElement("span", null, "Top up")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen('card')
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "credit-card"
  })), /*#__PURE__*/React.createElement("span", null, "Card"))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-l"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-label"
  }, "Saving for"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-title"
  }, "Hajj 2026")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-r"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-pct"
  }, "62%"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-amt"
  }, "62k / 100k SAR")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-goal-bar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '62%'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-sec-head"
  }, /*#__PURE__*/React.createElement("div", null, "Recent activity"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setScreen('transactions')
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-list"
  }, HOME_TX.slice(0, 4).map((t, i) => /*#__PURE__*/React.createElement(AjbTxRow, _extends({
    key: i
  }, t)))));
}

/* ---------- TRANSACTIONS ---------- */
const ALL_TX = [{
  day: 'Today',
  items: [{
    name: 'Coffee · Half Million',
    sub: 'F&B · 8:42',
    amount: '24.00 SAR',
    icon: 'coffee',
    neg: true
  }, {
    name: 'STC data top-up',
    sub: 'Bill · 7:30',
    amount: '60.00 SAR',
    icon: 'wifi',
    neg: true
  }]
}, {
  day: 'Yesterday',
  items: [{
    name: 'Salary · Aramco',
    sub: 'Income',
    amount: '18,400.00 SAR',
    icon: 'briefcase',
    neg: false
  }, {
    name: 'Uber',
    sub: 'Transport · 22:15',
    amount: '38.40 SAR',
    icon: 'car',
    neg: true
  }, {
    name: 'AlBaik',
    sub: 'F&B · 19:02',
    amount: '52.00 SAR',
    icon: 'utensils',
    neg: true
  }]
}, {
  day: 'May 14, 2026',
  items: [{
    name: 'AlMutlaq home rent',
    sub: 'Bill',
    amount: '4,800.00 SAR',
    icon: 'home',
    neg: true
  }, {
    name: 'Hajj fund transfer',
    sub: 'Goal',
    amount: '2,000.00 SAR',
    icon: 'arrow-up-right',
    neg: true
  }]
}];
function Transactions() {
  const {
    setScreen
  } = useApp();
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajb-app-txs"
  }, /*#__PURE__*/React.createElement(AjbHeader, {
    title: "Current account",
    onBack: () => setScreen('home'),
    action: /*#__PURE__*/React.createElement("button", {
      className: "ajb-app-icon-btn"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "sliders-horizontal"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-txs-summary"
  }, /*#__PURE__*/React.createElement(AjbBalance, {
    amount: "28492.18"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-txs-segments"
  }, /*#__PURE__*/React.createElement("button", {
    className: "on"
  }, "All"), /*#__PURE__*/React.createElement("button", null, "In"), /*#__PURE__*/React.createElement("button", null, "Out"))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-list"
  }, ALL_TX.map((g, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-tx-day"
  }, g.day), g.items.map((t, j) => /*#__PURE__*/React.createElement(AjbTxRow, _extends({
    key: j
  }, t)))))));
}

/* ---------- TRANSFER ---------- */
const RECIPIENTS = [{
  id: 'a',
  name: 'Mom · Fatimah',
  sub: 'SA __ __20 1442',
  color: '#8c684a',
  initials: 'F'
}, {
  id: 'b',
  name: 'Khalid',
  sub: 'SA __ __87 9931',
  color: '#33b793',
  initials: 'K'
}, {
  id: 'c',
  name: 'AlMutlaq Group',
  sub: 'Rent · auto-suggestion',
  color: '#6c7378',
  initials: 'A'
}, {
  id: 'd',
  name: 'Noor',
  sub: 'SA __ __04 5588',
  color: '#b27f59',
  initials: 'N'
}];
function TransferStep1({
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-eyebrow"
  }, "Step 1 of 3"), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-app-step-h"
  }, "Send to"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-input-wrap"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Name, IBAN, or mobile"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-sec-head plain"
  }, "Recent"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-recipient-list"
  }, RECIPIENTS.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    className: "ajb-app-recipient",
    onClick: () => onPick(r)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-recipient-av",
    style: {
      background: r.color
    }
  }, r.initials), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-recipient-m"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-recipient-n"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-recipient-s"
  }, r.sub)), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  })))));
}
function TransferStep2({
  recipient,
  amount,
  setAmount,
  onNext,
  onBack
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
  const tap = k => {
    if (k === '⌫') setAmount(amount.slice(0, -1));else if (k === '.' && amount.includes('.')) return;else if (amount.length >= 9) return;else setAmount(amount === '0' && k !== '.' ? k : amount + k);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-eyebrow"
  }, "Step 2 of 3"), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-app-step-h"
  }, "To ", /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, recipient.name.split(' ')[0])), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-amt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-amt-cur"
  }, "SAR"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-amt-val"
  }, amount || '0')), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-note"
  }, "From current account \xB7 28,492 SAR available"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-keypad"
  }, keys.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => tap(k)
  }, k))), /*#__PURE__*/React.createElement(AjbButton, {
    variant: "primary",
    onClick: onNext
  }, "Review transfer"));
}
function TransferStep3({
  recipient,
  amount,
  onConfirm,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-step center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-eyebrow"
  }, "Step 3 of 3"), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-app-step-h"
  }, "Review"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-receipt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "To"), /*#__PURE__*/React.createElement("span", null, recipient.name)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "IBAN"), /*#__PURE__*/React.createElement("span", null, recipient.sub)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "From"), /*#__PURE__*/React.createElement("span", null, "Current \xB7 \u2022\u2022\u2022\u20224429")), /*#__PURE__*/React.createElement("div", {
    className: "row big"
  }, /*#__PURE__*/React.createElement("span", null, "Amount"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, amount || '0'), " SAR")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "Fee"), /*#__PURE__*/React.createElement("span", null, "Free")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", null, "Arrives"), /*#__PURE__*/React.createElement("span", null, "Instantly"))), /*#__PURE__*/React.createElement(AjbButton, {
    variant: "primary",
    onClick: onConfirm
  }, "Hold to confirm"), /*#__PURE__*/React.createElement("button", {
    className: "ajb-app-text-btn",
    onClick: onBack
  }, "Edit amount"));
}
function TransferDone({
  recipient,
  amount,
  onDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-transfer-done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-done-ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-app-done-h"
  }, "Sent."), /*#__PURE__*/React.createElement("p", {
    className: "ajb-app-done-s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, amount, " SAR"), " on its way to ", recipient.name.split(' ')[0], "."), /*#__PURE__*/React.createElement(AjbButton, {
    variant: "primary",
    onClick: onDone
  }, "Done"));
}
function Transfer() {
  const {
    transferStep,
    setTransferStep,
    transferRecipient,
    setTransferRecipient,
    transferAmount,
    setTransferAmount,
    setScreen,
    resetTransfer
  } = useApp();
  if (transferStep === 4) {
    return /*#__PURE__*/React.createElement("div", {
      className: "ajb-app-screen ajb-app-transfer"
    }, /*#__PURE__*/React.createElement(TransferDone, {
      recipient: transferRecipient,
      amount: transferAmount,
      onDone: () => {
        resetTransfer();
        setScreen('home');
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajb-app-transfer"
  }, /*#__PURE__*/React.createElement(AjbHeader, {
    title: "Transfer",
    onBack: () => {
      if (transferStep === 0) {
        setScreen('home');
      } else {
        setTransferStep(transferStep - 1);
      }
    }
  }), transferStep === 0 && /*#__PURE__*/React.createElement(TransferStep1, {
    onPick: r => {
      setTransferRecipient(r);
      setTransferStep(1);
    }
  }), transferStep === 1 && /*#__PURE__*/React.createElement(TransferStep2, {
    recipient: transferRecipient,
    amount: transferAmount,
    setAmount: setTransferAmount,
    onNext: () => setTransferStep(2),
    onBack: () => setTransferStep(0)
  }), transferStep === 2 && /*#__PURE__*/React.createElement(TransferStep3, {
    recipient: transferRecipient,
    amount: transferAmount,
    onConfirm: () => setTransferStep(4),
    onBack: () => setTransferStep(1)
  }));
}

/* ---------- CARD ---------- */
function CardScreen() {
  const {
    setScreen
  } = useApp();
  const [frozen, setFrozen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-screen ajb-app-card-screen"
  }, /*#__PURE__*/React.createElement(AjbHeader, {
    title: "Aljazira World",
    onBack: () => setScreen('home'),
    action: /*#__PURE__*/React.createElement("button", {
      className: "ajb-app-icon-btn"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "ellipsis"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-art"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-art-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-art-top"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-ajb-symbol-white.png",
    alt: "ajb"
  }), /*#__PURE__*/React.createElement("span", null, "WORLD")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-art-num"
  }, "4929 \xB7\xB7\xB7\xB7 \xB7\xB7\xB7\xB7 4429"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-art-bottom"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Cardholder"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "LAYLA AL-JOHANI")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Exp"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "11/29"))))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Spent this month"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "3,240 SAR")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Available limit"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "21,760 SAR"))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: frozen ? 'on' : '',
    onClick: () => setFrozen(!frozen)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": frozen ? 'snowflake' : 'lock'
  }), /*#__PURE__*/React.createElement("span", null, frozen ? 'Card frozen' : 'Freeze card')), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text"
  }), /*#__PURE__*/React.createElement("span", null, "Statement")), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "settings"
  }), /*#__PURE__*/React.createElement("span", null, "Settings"))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-rewards"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-rewards-l"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-eyebrow"
  }, "Aljazira miles"), /*#__PURE__*/React.createElement("div", {
    className: "ajb-app-card-rewards-v"
  }, "12,420")), /*#__PURE__*/React.createElement("button", {
    className: "ajb-app-text-btn ajb-accent"
  }, "Redeem \u2192")));
}
Object.assign(window, {
  Onboarding,
  Home,
  Transactions,
  Transfer,
  CardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/app/store.jsx
try { (() => {
/* global React */
const {
  useState,
  useContext,
  createContext
} = React;
const AppCtx = createContext(null);
function AppProvider({
  children
}) {
  const [screen, setScreen] = useState('onboarding');
  const [tab, setTab] = useState('home');
  const [transferStep, setTransferStep] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState(null);
  const go = s => setScreen(s);
  const resetTransfer = () => {
    setTransferStep(0);
    setTransferAmount('');
    setTransferRecipient(null);
  };
  return /*#__PURE__*/React.createElement(AppCtx.Provider, {
    value: {
      screen,
      setScreen: go,
      tab,
      setTab,
      transferStep,
      setTransferStep,
      transferAmount,
      setTransferAmount,
      transferRecipient,
      setTransferRecipient,
      resetTransfer
    }
  }, children);
}
function useApp() {
  return useContext(AppCtx);
}
window.AppProvider = AppProvider;
window.useApp = useApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/app/store.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-app/ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-app/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/CTAStrip.jsx
try { (() => {
/* global React */

function CTAStrip() {
  return /*#__PURE__*/React.createElement("section", {
    className: "ajb-cta-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-cta-inner"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ajb-h1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, "Your"), " next chapter starts with a conversation."), /*#__PURE__*/React.createElement("div", {
    className: "ajb-cta-actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ajb-btn ajb-btn-primary",
    href: "#"
  }, "Open an account"), /*#__PURE__*/React.createElement("a", {
    className: "ajb-btn ajb-btn-ghost",
    href: "#"
  }, "Find a branch"))));
}
window.CTAStrip = CTAStrip;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/CTAStrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/Footer.jsx
try { (() => {
/* global React */

const SECTIONS = [{
  title: 'Personal',
  items: ['Accounts', 'Cards', 'Financing', 'Mortgage', 'Savings']
}, {
  title: 'Wealth',
  items: ['Private Banking', 'Advisory', 'Managed Portfolios', 'Estate']
}, {
  title: 'Business',
  items: ['SME', 'Corporate', 'Trade', 'Treasury']
}, {
  title: 'Aljazira',
  items: ['About', 'Careers', 'Investor relations', 'Sustainability', 'Newsroom']
}];
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "ajb-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-footer-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-footer-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.svg",
    alt: "aljazira bank"
  }), /*#__PURE__*/React.createElement("p", null, "Authorised and regulated by the Saudi Central Bank (SAMA). Member, IBSA.")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-footer-cols"
  }, SECTIONS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.title
  }, /*#__PURE__*/React.createElement("h4", null, s.title), /*#__PURE__*/React.createElement("ul", null, s.items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, i)))))))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-footer-base"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Bank Aljazira \xB7 Riyadh, Kingdom of Saudi Arabia"), /*#__PURE__*/React.createElement("span", {
    className: "ajb-footer-links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Privacy"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Terms"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Accessibility"))));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/Hero.jsx
try { (() => {
/* global React */

function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "ajb-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-hero-photo",
    style: {
      backgroundImage: 'url(../../assets/scenery-desert-sunrise.png)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-hero-copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-eyebrow"
  }, "A bank for the way you live"), /*#__PURE__*/React.createElement("h1", {
    className: "ajb-display"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, "Wealth"), /*#__PURE__*/React.createElement("br", null), "grows here."), /*#__PURE__*/React.createElement("p", {
    className: "ajb-sub"
  }, "Bespoke financial solutions, shaped around your journey \u2014 from your first salary to your family's tomorrow."), /*#__PURE__*/React.createElement("div", {
    className: "ajb-hero-cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ajb-btn ajb-btn-primary",
    href: "#"
  }, "Open an account"), /*#__PURE__*/React.createElement("a", {
    className: "ajb-btn ajb-btn-ghost",
    href: "#"
  }, "Talk to a banker"))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/NavBar.jsx
try { (() => {
/* global React */
const {
  useState
} = React;
function NavBar() {
  const [lang, setLang] = useState('EN');
  const items = ['Personal', 'Wealth', 'Cards', 'Business', 'About', 'Help'];
  return /*#__PURE__*/React.createElement("nav", {
    className: "ajb-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ajb-brand",
    href: "#"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.svg",
    alt: "aljazira bank"
  })), /*#__PURE__*/React.createElement("ul", {
    className: "ajb-nav-links"
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, i)))), /*#__PURE__*/React.createElement("div", {
    className: "ajb-nav-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ajb-nav-lang",
    onClick: () => setLang(lang === 'EN' ? 'AR' : 'EN')
  }, lang === 'EN' ? 'العربية' : 'English'), /*#__PURE__*/React.createElement("a", {
    className: "ajb-btn ajb-btn-primary",
    href: "#"
  }, "Sign in"))));
}
window.NavBar = NavBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/ProductsGrid.jsx
try { (() => {
/* global React, lucide */
const {
  useEffect
} = React;
const PRODUCTS = [{
  icon: 'wallet',
  title: 'Personal',
  body: 'Current and savings accounts with profit-sharing structures certified by our Shariah board.'
}, {
  icon: 'trending-up',
  title: 'Wealth',
  body: 'Private banking, advisory, and managed portfolios for high-net-worth individuals.'
}, {
  icon: 'credit-card',
  title: 'Cards',
  body: 'World, Platinum, and Infinite cards — with airport lounges and miles on every spend.'
}, {
  icon: 'building-2',
  title: 'Business',
  body: 'SME and corporate solutions: financing, trade, treasury, and cash-management.'
}];
function ProductsGrid() {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("section", {
    className: "ajb-products"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-section-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-eyebrow"
  }, "Our products"), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-h1"
  }, "Banking that meets you ", /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, "where you are"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-products-grid"
  }, PRODUCTS.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.title,
    className: "ajb-product-card",
    href: "#"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-product-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": p.icon
  })), /*#__PURE__*/React.createElement("h3", {
    className: "ajb-h3"
  }, p.title), /*#__PURE__*/React.createElement("p", null, p.body), /*#__PURE__*/React.createElement("div", {
    className: "ajb-product-more"
  }, "Explore ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right"
  }))))));
}
window.ProductsGrid = ProductsGrid;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/ProductsGrid.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/StatStrip.jsx
try { (() => {
/* global React */

const STATS = [{
  v: '1976',
  l: 'Founded'
}, {
  v: '95+',
  l: 'Branches across the Kingdom'
}, {
  v: 'SAR 110B',
  l: 'Assets under management'
}, {
  v: 'A1',
  l: 'Moody\u2019s credit rating'
}];
function StatStrip() {
  return /*#__PURE__*/React.createElement("section", {
    className: "ajb-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-stats-inner"
  }, STATS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "ajb-stat",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-stat-v"
  }, s.v), /*#__PURE__*/React.createElement("div", {
    className: "ajb-stat-l"
  }, s.l)))));
}
window.StatStrip = StatStrip;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/StatStrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/aljazira-website/components/StorySection.jsx
try { (() => {
/* global React */

function StorySection() {
  return /*#__PURE__*/React.createElement("section", {
    className: "ajb-story"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-story-copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-eyebrow"
  }, "Our story"), /*#__PURE__*/React.createElement("h2", {
    className: "ajb-h1"
  }, "Three generations of ", /*#__PURE__*/React.createElement("span", {
    className: "ajb-accent"
  }, "stewardship"), "."), /*#__PURE__*/React.createElement("p", {
    className: "ajb-body"
  }, "Founded in 1976, Bank Aljazira has spent five decades helping Saudi families and businesses build, protect, and pass on wealth \u2014 under principles drawn from our faith and shaped by the kingdom we serve."), /*#__PURE__*/React.createElement("p", {
    className: "ajb-body"
  }, "Today, that mandate looks like a fully Shariah-compliant retail bank, a private wealth practice trusted by the kingdom's leading families, and a digital-first product line built for the next generation."), /*#__PURE__*/React.createElement("a", {
    className: "ajb-link",
    href: "#"
  }, "Read the full story \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "ajb-story-photos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ajb-story-photo big",
    style: {
      backgroundImage: 'url(../../assets/scenery-riyadh-skyline.png)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ajb-story-photo small",
    style: {
      backgroundImage: 'url(../../assets/photo-hand-sand.png)'
    }
  })));
}
window.StorySection = StorySection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/aljazira-website/components/StorySection.jsx", error: String((e && e.message) || e) }); }

})();
