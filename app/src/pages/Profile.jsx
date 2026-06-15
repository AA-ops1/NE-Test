import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Icon from '../components/Icon';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { L, cx } from '../components/TemplateParts';
import TPL from '../data/tpl';

/* ============================================================
   Profile page — read-only personal info, role/permissions, sessions
   ============================================================ */
function ProfileBody({ t, lang, layout }) {
  const navigate = useNavigate();
  const p = TPL.PROFILE;
  const pf = t.prof;
  const ac = t.acct;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [confirm, setConfirm] = useState(false);

  const rows = [
    { k: pf.fName, v: L(p.name, lang) },
    { k: pf.fEmail, v: <span className="ajb-ltr">{p.email}</span> },
    { k: pf.fPhone, v: <span className="ajb-ltr">{p.phone}</span> },
    { k: pf.fJob, v: L(p.job, lang) },
    { k: pf.fDept, v: L(p.dept, lang) },
    { k: pf.fEmployee, v: <span className="ajb-ltr">{p.employeeId}</span> },
    { k: pf.fJoined, v: L(p.joined, lang) },
  ];

  const personal = (
    <section className="pf-sec">
      <header className="pf-sec-h"><Icon name="id-card" />{pf.secPersonal}
        <span className="ajb-badge ajb-badge--neutral pf-ro">{pf.readOnly}</span>
      </header>
      <div className="pf-dl">
        {rows.map((r, i) => (
          <div className="pf-row" key={i}>
            <span className="pf-row-k">{r.k}</span>
            <span className="pf-row-v">{r.v}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const role = (
    <section className="pf-sec">
      <header className="pf-sec-h"><Icon name="shield-check" />{pf.secRole}
        <span className="ajb-badge ajb-badge--neutral pf-ro">{pf.readOnly}</span>
      </header>
      <div className="pf-role">
        <span className="pf-role-lbl">{pf.roleLbl}</span>
        <span className="pf-role-sp" />
        <span className="ajb-badge ajb-badge--sand-soft">{L(p.roleTag, lang)}</span>
      </div>
      <div className="pf-perms">
        {p.perms.map((perm) => (
          <div className={cx('pf-perm', perm.granted ? 'is-on' : 'is-off')} key={perm.id}>
            <span className="pf-perm-ico"><Icon name={perm.granted ? 'check-circle-2' : 'minus-circle'} /></span>
            <span className="pf-perm-lbl">{pf[perm.id]}</span>
            <span className={cx('ajb-badge', perm.granted ? 'ajb-badge--success' : 'ajb-badge--neutral')}>
              {perm.granted ? pf.granted : pf.notGranted}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const sessions = (
    <section className="pf-sec">
      <header className="pf-sec-h"><Icon name="monitor-smartphone" />{pf.secSessions}</header>
      {p.sessions.map((s) => (
        <div className="pf-sess" key={s.id}>
          <span className="pf-sess-ico"><Icon name={s.icon} /></span>
          <span className="pf-sess-txt">
            <span className="pf-sess-dev">{L(s.device, lang)}</span>
            <span className="pf-sess-sub"><Icon name="map-pin" />{L(s.loc, lang)} · {L(s.last, lang)}</span>
          </span>
          {s.current && <span className="ajb-badge ajb-badge--success pf-sess-tr">{pf.current}</span>}
        </div>
      ))}
      <div className="pf-sess-note"><Icon name="info" />{pf.sessionsNote}</div>
    </section>
  );

  return (
    <div className="pf-page" data-pf-layout={layout} dir={dir}>
      <div className="pf-hd">
        <div className="pf-hd-titles">
          <span className="pf-hd-title">{pf.title}</span>
          <span className="pf-hd-sub">{pf.subtitle}</span>
        </div>
        <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => setConfirm(true)}>
          <Icon name="log-out" />{pf.signOut}
        </button>
      </div>

      <div className="pf-hero">
        <span className="ajb-avatar ajb-avatar--lg"><span>{p.initial}</span></span>
        <div className="pf-hero-id">
          <span className="pf-hero-name">{L(p.name, lang)}</span>
          <span className="pf-hero-meta">
            <span className="ajb-badge ajb-badge--sand-soft">{L(p.roleTag, lang)}</span>
            <span><Icon name="briefcase" />{L(p.job, lang)}</span>
            <span><Icon name="building-2" />{L(p.dept, lang)}</span>
          </span>
        </div>
      </div>

      <div className="pf-grid">
        {personal}
        {role}
        <div className="pf-sessions-wrap">{sessions}</div>
      </div>

      {confirm && (
        <div className="ne-acct-overlay ne-acct-overlay--dialog">
          <div className="ne-acct-scrim" onClick={() => setConfirm(false)} />
          <div className="ajb-dialog ne-acct-dialog" role="alertdialog" aria-modal="true" dir={dir}>
            <div className="ajb-dialog__ico ne-acct-dialog-ico"><Icon name="log-out" /></div>
            <h3 className="ajb-dialog__title">{ac.logoutTitle}</h3>
            <p className="ajb-dialog__text">{ac.logoutText}</p>
            <div className="ajb-dialog__actions">
              <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => setConfirm(false)}>{ac.logoutCancel}</button>
              <button type="button" className="ajb-btn ajb-btn--danger" onClick={() => navigate('/')}>
                <Icon name="log-out" />{ac.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };
  return (
    <div className="ne-home ne-enter" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="profile" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar t={t} title={t.prof.title} collapsed={collapsed} onToggle={toggleSide}
          theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} />
        <ProfileBody t={t} lang={lang} layout="two-column" />
      </div>
    </div>
  );
}
