import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import AccountPanel from './AccountPanel';
import TPL from '../data/tpl';

const NE_NAV_GROUPS = [
  { id: 'workspace', items: [
    { id: 'home',      icon: 'layout-dashboard', href: '/home' },
    { id: 'campaigns', icon: 'send' },
    { id: 'templates', icon: 'file-text',         href: '/templates' },
  ] },
  { id: 'governance', items: [
    { id: 'approvals', icon: 'check-check', href: '/approvals' },
  ] },
  { id: 'data', items: [
    { id: 'audiences', icon: 'users' },
    { id: 'delivery',  icon: 'activity' },
  ] },
];
const NE_NAV_FOOTER = { id: 'settings', icon: 'settings', href: '/settings' };

export function useSideCollapse() {
  const [collapsed, setCollapsed] = useState(() => {
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
  const navigate = useNavigate();
  const location = useLocation();
  const active = n.href
    ? (n.href === '/home' ? location.pathname === '/home' : location.pathname.startsWith(n.href))
    : (n.id === page);
  const go = () => { if (n.href && !active) navigate(n.href); };
  const count = n.id === 'approvals'
    ? (badge != null ? badge : (TPL.AP && TPL.AP.QUEUE ? TPL.AP.QUEUE.length : null))
    : null;
  return (
    <div className={`ne-nav-item${active ? ' on' : ''}`} onClick={go}
      title={collapsed ? (t.nav && t.nav[n.id]) : undefined}>
      <Icon name={n.icon} />
      <span className="ne-nav-label">{t.nav && t.nav[n.id]}</span>
      {count != null && (
        <React.Fragment>
          <span className="ajb-count ajb-count--sand ne-nav-badge">{count}</span>
          <span className="ne-nav-dot" />
        </React.Fragment>
      )}
    </div>
  );
}

export function SideNav({ page, t, collapsed, badge, acctVariant }) {
  const groupLabel = (gid) => (t.navGroup && t.navGroup[gid]) || gid;
  const [acctOpen, setAcctOpen] = useState(false);
  const prof = TPL.PROFILE || {};
  const acctT = t.acct || {};
  // entry-point variation: explicit prop wins, else persisted, else anchored
  let variant = acctVariant;
  if (!variant) { try { variant = localStorage.getItem('ne-acct-variant') || 'anchored'; } catch (e) { variant = 'anchored'; } }
  useEffect(() => {
    if (!acctVariant) return;
    try { localStorage.setItem('ne-acct-variant', acctVariant); } catch (e) {}
  }, [acctVariant]);
  const openAcct = () => setAcctOpen(true);
  return (
    <React.Fragment>
      <aside className="ne-side">
        <span className="ne-logo ne-side-logo">
          <img className="ne-logo-dark ne-logo-word" src="/assets/logo-white.svg" alt="aljazira bank" />
          <img className="ne-logo-light ne-logo-word" src="/assets/logo-black.svg" alt="aljazira bank" />
          <img className="ne-logo-symbol" src="/assets/logo-ajb-symbol-white.png" alt="ajb" />
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
        <div className={`ne-side-user${acctOpen ? ' is-active' : ''}`} role="button" tabIndex={0}
          title={collapsed ? (t.userName || '') : undefined}
          aria-haspopup="dialog" aria-expanded={acctOpen} aria-label={acctT.open}
          onClick={openAcct}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAcct(); } }}>
          <span className="ajb-avatar ajb-avatar--sm"><span>{prof.initial || 'A'}</span></span>
          <span className="ne-side-user-txt">
            <span className="ne-side-user-name">{t.userName}</span>
            <span className="ne-side-user-role">{t.userRole}</span>
          </span>
          <span className="ne-side-user-act"><Icon name="chevron-right" /></span>
        </div>
      </aside>
      <AccountPanel open={acctOpen} onClose={() => setAcctOpen(false)}
        user={{ initial: prof.initial || 'A', name: t.userName, role: t.userRole, email: prof.email }}
        t={acctT} variant={variant} dir={t.dir}
        profileHref="/profile" settingsHref="/settings" loginHref="/" />
    </React.Fragment>
  );
}

export function SideToggle({ collapsed, onToggle, t }) {
  const label = (t && t.toggleNav) || 'Toggle menu';
  return (
    <button type="button" className="ne-side-toggle" onClick={onToggle} aria-label={label} title={label}>
      <Icon name="panel-left" />
    </button>
  );
}

export function LangMenu({ lang, setLang, label }) {
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

export function Topbar({ t, title, collapsed, onToggle, theme, setTheme, lang, setLang, extra }) {
  const themeLbl = (t && t.review && t.review.theme) || 'Theme';
  const langLbl = (t && t.review && t.review.lang) || 'Language';
  return (
    <div className="ne-topbar">
      <SideToggle collapsed={collapsed} onToggle={onToggle} t={t} />
      <img className="ne-topbar-mark" src="/assets/logo-ajb-symbol-white.png" alt="aljazira" />
      <span className="ne-topbar-t">{title}</span>
      {extra && <div className="ne-topbar-extra">{extra}</div>}
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

export { NE_NAV_GROUPS };
