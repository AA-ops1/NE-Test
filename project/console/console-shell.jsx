/* global React, Icon */
/* ============================================================
   Notification Engine — shared console shell (side nav + collapse)
   One source of truth for the duplicated side menu across every
   journey shell. Renders the grouped sidebar (direction B) which
   collapses to an icon rail (direction C). Loads after
   template-parts.jsx (needs the global Icon component).

   Usage in a page Shell:
     const [collapsed, toggleSide] = useSideCollapse();
     <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
       <SideNav page="templates" t={t} collapsed={collapsed} />
       <div className="ne-main">
         <div className="ne-topbar">
           <SideToggle collapsed={collapsed} onToggle={toggleSide} t={t} />
           …
   ============================================================ */
const { useState: useShellState, useRef: useShellRef, useEffect: useShellEffect } = React;

/* nav model — order matches CLAUDE.md:
   Dashboard · Campaigns · Templates · Approvals · Customers · Delivery · Settings */
const NE_NAV_GROUPS = [
  { id: 'workspace', items: [
    { id: 'home', icon: 'layout-dashboard', href: 'Login Journey.html' },
    { id: 'campaigns', icon: 'send' },
    { id: 'templates', icon: 'file-text', href: 'Templates.html' },
  ] },
  { id: 'governance', items: [
    { id: 'approvals', icon: 'check-check', href: 'Approvals.html' },
  ] },
  { id: 'data', items: [
    { id: 'audiences', icon: 'users' },
    { id: 'delivery', icon: 'activity' },
  ] },
];
const NE_NAV_FOOTER = { id: 'settings', icon: 'settings', href: 'Settings.html' };

/* collapse state, persisted + shared across journeys */
function useSideCollapse() {
  const [collapsed, setCollapsed] = useShellState(() => {
    try { return localStorage.getItem('ne-side-collapsed') === '1'; } catch (e) { return false; }
  });
  const toggle = () => setCollapsed(c => {
    const next = !c;
    try { localStorage.setItem('ne-side-collapsed', next ? '1' : '0'); } catch (e) {}
    return next;
  });
  return [collapsed, toggle];
}

function NavItem({ n, page, t, collapsed, badge }) {
  const active = n.id === page;
  const go = () => { if (n.href && !active) window.location.href = n.href; };
  const count = n.id === 'approvals'
    ? (badge != null ? badge : ((window.TPL && window.TPL.AP && window.TPL.AP.QUEUE) ? window.TPL.AP.QUEUE.length : 5))
    : null;
  return (
    <div className={`ne-nav-item ${active ? 'on' : ''}`} onClick={go}
      title={collapsed ? t.nav[n.id] : undefined}>
      <Icon name={n.icon} />
      <span className="ne-nav-label">{t.nav[n.id]}</span>
      {count != null && <React.Fragment>
        <span className="ajb-count ajb-count--sand ne-nav-badge">{count}</span>
        <span className="ne-nav-dot" />
      </React.Fragment>}
    </div>
  );
}

function SideNav({ page, t, collapsed, badge }) {
  const groupLabel = (gid) => (t.navGroup && t.navGroup[gid]) || gid;
  return (
    <aside className="ne-side">
      <span className="ne-logo ne-side-logo">
        <img className="ne-logo-dark ne-logo-word" src="../assets/logo-white.svg" alt="aljazira bank" />
        <img className="ne-logo-light ne-logo-word" src="../assets/logo-black.svg" alt="aljazira bank" />
        <img className="ne-logo-symbol" src="../assets/logo-ajb-symbol-white.png" alt="ajb" />
      </span>
      {NE_NAV_GROUPS.map(g => (
        <React.Fragment key={g.id}>
          <div className="ne-nav-group"><span>{groupLabel(g.id)}</span></div>
          {g.items.map(n => <NavItem key={n.id} n={n} page={page} t={t} collapsed={collapsed} badge={badge} />)}
        </React.Fragment>
      ))}
      <div className="ne-side-sp" />
      <NavItem n={NE_NAV_FOOTER} page={page} t={t} collapsed={collapsed} />
      <div className="ne-side-divider" />
      <div className="ne-side-user" title={collapsed ? (t.userName || '') : undefined}>
        <span className="ajb-avatar ajb-avatar--sm"><span>A</span></span>
        <span className="ne-side-user-txt">
          <span className="ne-side-user-name">{t.userName}</span>
          <span className="ne-side-user-role">{t.userRole}</span>
        </span>
        <span className="ne-side-user-act"><Icon name="chevron-right" /></span>
      </div>
    </aside>
  );
}

/* Language picker — a topbar trigger (languages icon + current language)
   that opens the dictionary .ajb-menu listing both languages in their own
   script, with a check on the active one. Composed from existing DS
   components; outside-click closes (same pattern as KebabMenu). */
function LangMenu({ lang, setLang, label }) {
  const toggle = () => setLang(lang === 'en' ? 'ar' : 'en');
  return (
    <span className="ne-langwrap">
      <button type="button" className="ne-iconbtn ne-iconbtn--lang"
        aria-label={label} title={label}
        onClick={toggle}>
        <span className="ne-langglyph" aria-hidden="true">
          <span className="ne-langglyph-en">E</span>
          <span className="ne-langglyph-ar">ع</span>
        </span>
      </button>
    </span>
  );
}

function SideToggle({ collapsed, onToggle, t }) {
  const label = (t && t.toggleNav) || 'Toggle menu';
  return (
    <button type="button" className="ne-side-toggle" onClick={onToggle} aria-label={label} title={label}>
      <Icon name="panel-left" />
    </button>
  );
}

/* ============================================================
   Shared console topbar — one source of truth for the bar that
   sits above every journey (side toggle · brand mark · crumb ·
   theme toggle · language toggle · notifications). Pass theme/
   setTheme and lang/setLang to enable the quick toggles; omit a
   setter to hide that toggle.
   ============================================================ */
function Topbar({ t, title, collapsed, onToggle, theme, setTheme, lang, setLang }) {
  const themeLbl = (t && t.review && t.review.theme) || 'Theme';
  const langLbl = (t && t.review && t.review.lang) || 'Language';
  return (
    <div className="ne-topbar">
      <SideToggle collapsed={collapsed} onToggle={onToggle} t={t} />
      <img className="ne-topbar-mark" src="../assets/logo-ajb-symbol-white.png" alt="aljazira" />
      <span className="ne-topbar-t">{title}</span>
      <div className="ne-topbar-r">
        {setTheme && (
          <button type="button" className="ne-iconbtn" aria-label={themeLbl} title={themeLbl}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        )}
        {setLang && <LangMenu lang={lang} setLang={setLang} label={langLbl} />}
        <button type="button" className="ne-iconbtn"><Icon name="bell" /><span className="dot" /></button>
      </div>
    </div>
  );
}

Object.assign(window, { SideNav, SideToggle, Topbar, LangMenu, useSideCollapse, NE_NAV_GROUPS });
