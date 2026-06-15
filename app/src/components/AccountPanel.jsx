/* ============================================================
   Notification Engine — Account panel + Logout flow (shared)

   Slide-in account sheet reached from the side-nav user chip on every
   shell. The Aljazira design system has dialog + menu but no sheet/
   drawer, so this is a new reusable component built from DS tokens +
   the existing .ajb-avatar / .ajb-menu / .ajb-dialog classes.

   Two entry-point variations via `variant`: 'anchored' (rises from the
   chip) and 'drawer' (full-height edge panel).
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function AccountPanel({ open, onClose, user, t, variant, dir, profileHref, settingsHref, loginHref }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const v = variant === 'drawer' ? 'drawer' : 'anchored';

  // Esc closes whichever layer is on top
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') { if (confirm) setConfirm(false); else onClose(); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, confirm, onClose]);

  // reset the confirm layer whenever the panel is dismissed
  useEffect(() => { if (!open) setConfirm(false); }, [open]);

  if (!open) return null;

  const go = (href) => () => { onClose(); if (href) navigate(href); };
  const u = user || {};

  return (
    <React.Fragment>
      <div className={`ne-acct-overlay ne-acct-overlay--${v}`}>
        <div className="ne-acct-scrim" onClick={onClose} />
        <aside className={`ne-acct ne-acct--${v}`} role="dialog" aria-modal="true" aria-label={t.myAccount} dir={dir}>
          <button type="button" className="ne-acct-x" onClick={onClose} aria-label={t.logoutCancel} title="">
            <Icon name="x" />
          </button>

          <header className="ne-acct-head">
            <span className="ajb-avatar ajb-avatar--lg ne-acct-avatar"><span>{u.initial || 'A'}</span></span>
            <span className="ne-acct-eyebrow">{t.signedInAs}</span>
            <span className="ne-acct-name">{u.name}</span>
            <span className="ne-acct-role">{u.role}</span>
            {u.email && <span className="ne-acct-email ajb-ltr">{u.email}</span>}
          </header>

          <div className="ne-acct-menu">
            <button type="button" className="ne-acct-item" onClick={go(profileHref)}>
              <Icon name="circle-user-round" />
              <span className="ne-acct-item-lbl">{t.viewProfile}</span>
              <Icon name="chevron-right" className="ne-acct-item-go" />
            </button>
            <div className="ne-acct-sep" />
            <button type="button" className="ne-acct-item ne-acct-item--danger" onClick={() => setConfirm(true)}>
              <Icon name="log-out" />
              <span className="ne-acct-item-lbl">{t.signOut}</span>
            </button>
          </div>
        </aside>
      </div>

      {confirm && (
        <div className="ne-acct-overlay ne-acct-overlay--dialog">
          <div className="ne-acct-scrim" onClick={() => setConfirm(false)} />
          <div className="ajb-dialog ne-acct-dialog" role="alertdialog" aria-modal="true" dir={dir}>
            <div className="ajb-dialog__ico ne-acct-dialog-ico"><Icon name="log-out" /></div>
            <h3 className="ajb-dialog__title">{t.logoutTitle}</h3>
            <p className="ajb-dialog__text">{t.logoutText}</p>
            <div className="ajb-dialog__actions">
              <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => setConfirm(false)}>{t.logoutCancel}</button>
              <button type="button" className="ajb-btn ajb-btn--danger" onClick={go(loginHref)}>
                <Icon name="log-out" />{t.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
