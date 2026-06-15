/* global React */
/* ============================================================
   Notification Engine — Account panel + Logout flow (shared)

   One source of truth for the user-account journey reached from the
   side-nav user chip on EVERY shell (console journeys + login home).

   Prop-driven + self-contained (its own lucide icon renderer) so it
   has no dependency on template-parts (Icon) or TPL — the login home,
   which loads neither, reuses the exact same component.

   Exports (window): AccountPanel, AcctIcon
     <AccountPanel
        open onClose                       // controlled visibility
        user={{ initial, name, role, email }}
        t={acctStrings}                    // TPL.T[lang].acct
        variant="anchored|drawer"          // entry-point variation
        dir="ltr|rtl"
        profileHref settingsHref loginHref // navigation targets
     />

   The slide-in panel is a NEW reusable component — the Aljazira design
   system has dialog + menu but no sheet/drawer. Built only from DS
   tokens + the existing .ajb-menu / .ajb-avatar / .ajb-dialog classes.
   ============================================================ */
const { useState: useAcctS, useEffect: useAcctE } = React;

/* self-contained icon — same React-owns-the-<i> pattern as template-parts,
   so it never desyncs the vdom and works wherever lucide is loaded. */
function AcctIcon({ name, className }) {
  const ref = React.useRef(null);
  useAcctE(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    const p = String(name).split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const node = (window.lucide.icons && window.lucide.icons[p]) || window.lucide[p];
    el.innerHTML = '';
    if (node && window.lucide.createElement) el.appendChild(window.lucide.createElement(node));
  }, [name]);
  return <i ref={ref} className={className} aria-hidden="true"></i>;
}

function AccountPanel({ open, onClose, user, t, variant, dir, profileHref, settingsHref, loginHref }) {
  const [confirm, setConfirm] = useAcctS(false);
  const v = variant === 'drawer' ? 'drawer' : 'anchored';

  // Esc closes whichever layer is on top
  useAcctE(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') { if (confirm) setConfirm(false); else onClose(); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, confirm, onClose]);

  // reset the confirm layer whenever the panel is dismissed
  useAcctE(() => { if (!open) setConfirm(false); }, [open]);

  if (!open) return null;

  const go = (href) => () => { if (href) window.location.href = href; };
  const u = user || {};

  return (
    <React.Fragment>
      <div className={`ne-acct-overlay ne-acct-overlay--${v}`}>
        <div className="ne-acct-scrim" onClick={onClose} />
        <aside className={`ne-acct ne-acct--${v}`} role="dialog" aria-modal="true" aria-label={t.myAccount} dir={dir}>
          <button type="button" className="ne-acct-x" onClick={onClose} aria-label={t.logoutCancel} title="">
            <AcctIcon name="x" />
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
              <AcctIcon name="circle-user-round" />
              <span className="ne-acct-item-lbl">{t.viewProfile}</span>
              <AcctIcon name="chevron-right" className="ne-acct-item-go" />
            </button>
            <div className="ne-acct-sep" />
            <button type="button" className="ne-acct-item ne-acct-item--danger" onClick={() => setConfirm(true)}>
              <AcctIcon name="log-out" />
              <span className="ne-acct-item-lbl">{t.signOut}</span>
            </button>
          </div>
        </aside>
      </div>

      {confirm && (
        <div className="ne-acct-overlay ne-acct-overlay--dialog">
          <div className="ne-acct-scrim" onClick={() => setConfirm(false)} />
          <div className="ajb-dialog ne-acct-dialog" role="alertdialog" aria-modal="true" dir={dir}>
            <div className="ajb-dialog__ico ne-acct-dialog-ico"><AcctIcon name="log-out" /></div>
            <h3 className="ajb-dialog__title">{t.logoutTitle}</h3>
            <p className="ajb-dialog__text">{t.logoutText}</p>
            <div className="ajb-dialog__actions">
              <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => setConfirm(false)}>{t.logoutCancel}</button>
              <button type="button" className="ajb-btn ajb-btn--danger" onClick={go(loginHref)}>
                <AcctIcon name="log-out" />{t.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

Object.assign(window, { AccountPanel, AcctIcon });
