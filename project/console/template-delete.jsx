/* global React, TPL, Icon, cx */
/* ============================================================
   Delete flow — shared components (Templates list + View details).
   • deleteMode(row) → 'confirm' | 'notdraft' | 'used'
   • KebabMenu — a more-actions dropdown
   • DeleteModal — confirm + the two blocked variants
   • NeToast — bottom-center confirmation toast
   ============================================================ */
const { useState: useDS, useRef: useDR, useEffect: useDE, useLayoutEffect: useDL } = React;

function ndfmt(str, map) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m)); }

function deleteMode(row) {
  if (row.status !== 'draft') return 'notdraft';
  if (row.used) return 'used';
  return 'confirm';
}
function statusLabel(status, t) {
  return ({ active: t.stActive, draft: t.stDraft, review: t.stReview, expired: t.stExpired, archived: t.stArchived, inactive: t.stInactive }[status]) || status;
}

/* ---------- kebab / more-actions menu ---------- */
function KebabMenu({ items, t, triggerClass, triggerIcon }) {
  const [open, setOpen] = useDS(false);
  const [up, setUp] = useDS(false);
  const ref = useDR(null);
  const menuRef = useDR(null);
  useDE(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // after the menu renders (default downward), measure real geometry and flip up
  // when downward placement would be clipped by the nearest overflow container.
  useDL(() => {
    if (!open || !menuRef.current || !ref.current) return;
    const btn = ref.current.querySelector('button').getBoundingClientRect();
    const h = menuRef.current.getBoundingClientRect().height;
    let clipBottom = window.innerHeight, clipTop = 0, el = ref.current.parentElement;
    while (el) {
      const s = getComputedStyle(el);
      if (/(hidden|auto|scroll)/.test(s.overflow + s.overflowY)) {
        const cr = el.getBoundingClientRect();
        clipBottom = Math.min(clipBottom, cr.bottom);
        clipTop = Math.max(clipTop, cr.top);
        break;
      }
      el = el.parentElement;
    }
    const overflowsDown = (btn.bottom + 6 + h) > clipBottom;
    const fitsUp = (btn.top - 6 - h) >= clipTop;
    setUp(overflowsDown && fitsUp);
  }, [open]);

  const toggle = (e) => { e.stopPropagation(); setUp(false); setOpen(o => !o); };

  return (
    <span className="nd-menuwrap" ref={ref}>
      <button type="button" className={triggerClass || 'tl-act'} title={t.rowMenu} onClick={toggle}>
        <Icon name={triggerIcon || 'more-horizontal'} />
      </button>
      {open && (
        <div ref={menuRef} className={cx('ajb-menu nd-menu', up && 'is-up')} onClick={e => e.stopPropagation()}>
          {items.map((it, i) => it.sep
            ? <div className="nd-menu-sep" key={'s' + i} />
            : (
              <div key={i}
                className={cx('ajb-menu__item', it.danger && 'is-danger', it.disabled && 'is-disabled')}
                onClick={() => { if (it.disabled) return; setOpen(false); it.onClick && it.onClick(); }}>
                <Icon name={it.icon} />
                <span className="nd-menu-label">{it.label}{it.hint && <span className="nd-menu-hint">{it.hint}</span>}</span>
              </div>
            ))}
        </div>
      )}
    </span>
  );
}

/* ---------- delete / blocked dialog ---------- */
function DeleteModal({ mode, row, lang, t, onClose, onConfirm, onArchive }) {
  const name = row.name ? (row.name[lang] || row.name.en) : '';
  const stop = e => e.stopPropagation();

  let ico, icoTone, title, bodyEl, actions;
  if (mode === 'confirm') {
    ico = 'trash-2'; icoTone = '';
    title = t.delTitle;
    bodyEl = (
      <React.Fragment>
        <div className="nd-tplchip"><Icon name="file-text" />{name}<span className="ajb-ltr">· {row.id} · {row.ver}</span></div>
        <p className="ajb-dialog__text">{ndfmt(t.delText, { name })}</p>
        <div className="nd-permanent"><Icon name="alert-triangle" />{lang === 'ar' ? 'الحذف نهائي ولا يمكن استرجاع القالب.' : 'Deletion is permanent — the template cannot be recovered.'}</div>
      </React.Fragment>
    );
    actions = (
      <React.Fragment>
        <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onClose}>{t.delKeep}</button>
        <button type="button" className="ajb-btn ajb-btn--danger" onClick={onConfirm}><Icon name="trash-2" />{t.delConfirm}</button>
      </React.Fragment>
    );
  } else {
    ico = mode === 'used' ? 'history' : 'shield-alert'; icoTone = 'warning';
    title = mode === 'used' ? t.blkUsedTitle : t.blkNdTitle;
    const text = mode === 'used' ? t.blkUsedText : ndfmt(t.blkNdText, { status: statusLabel(row.status, t) });
    bodyEl = (
      <React.Fragment>
        <div className="nd-tplchip"><Icon name="file-text" />{name}<span className="ajb-ltr">· {row.id}</span></div>
        <p className="ajb-dialog__text">{text}</p>
      </React.Fragment>
    );
    actions = (
      <React.Fragment>
        <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onClose}>{t.blkClose}</button>
        <button type="button" className="ajb-btn ajb-btn--sand" onClick={onArchive}><Icon name="archive" />{t.blkArchive}</button>
      </React.Fragment>
    );
  }

  return (
    <div className="nd-overlay nd-dialog" onClick={onClose}>
      <div className="ajb-scrim" />
      <div className="ajb-dialog" role="dialog" aria-modal="true" onClick={stop}>
        <div className={cx('ajb-dialog__ico', icoTone && 'ajb-dialog__ico--' + icoTone)}><Icon name={ico} /></div>
        <h3 className="ajb-dialog__title">{title}</h3>
        {bodyEl}
        <div className="ajb-dialog__actions">{actions}</div>
      </div>
    </div>
  );
}

/* ---------- toast ---------- */
function NeToast({ tone, title, sub, onClose }) {
  const icon = tone === 'danger' ? 'trash-2' : 'archive';
  return (
    <div className="nd-toastwrap">
      <div className="ajb-toast">
        <span className={cx('ajb-toast__ico', tone === 'danger' ? 'nd-toast__ico--danger' : 'nd-toast__ico--neutral')}><Icon name={icon} /></span>
        <div className="ajb-toast__body">
          <div className="ajb-toast__title">{title}</div>
          {sub && <div className="nd-toast-sub">{sub}</div>}
        </div>
        <span className="nd-toast-x" onClick={onClose}><Icon name="x" /></span>
      </div>
    </div>
  );
}

/* ---------- archive reason catalogue ---------- */
const ARCHIVE_REASONS = [
  { id: 'unused',     icon: 'circle-slash',  key: 'arcRUnused' },
  { id: 'replaced',   icon: 'replace',       key: 'arcRReplaced' },
  { id: 'outdated',   icon: 'clock',         key: 'arcROutdated' },
  { id: 'compliance', icon: 'scale',         key: 'arcRCompliance' },
  { id: 'duplicate',  icon: 'copy',          key: 'arcRDuplicate' },
  { id: 'other',      icon: 'pencil',        key: 'arcROther' },
];

/* ---------- archive dialog (confirm + optional reason) ---------- */
function ArchiveModal({ row, lang, t, onClose, onConfirm }) {
  const name = row.name ? (row.name[lang] || row.name.en) : '';
  const [reason, setReason] = useDS(null);
  const [other, setOther] = useDS('');
  const stop = e => e.stopPropagation();

  const submit = () => {
    let r = null;
    if (reason) {
      const meta = ARCHIVE_REASONS.find(x => x.id === reason);
      r = { id: reason, label: t[meta.key], note: reason === 'other' ? other.trim() : '' };
    }
    onConfirm(r);
  };

  return (
    <div className="nd-overlay nd-dialog" onClick={onClose}>
      <div className="ajb-scrim" />
      <div className="ajb-dialog nd-arc" role="dialog" aria-modal="true" onClick={stop}>
        <div className="ajb-dialog__ico ajb-dialog__ico--sand"><Icon name="archive" /></div>
        <h3 className="ajb-dialog__title">{t.arcTitle}</h3>
        <div className="nd-tplchip"><Icon name="file-text" />{name}<span className="ajb-ltr">· {row.id}</span></div>
        <p className="ajb-dialog__text nd-arc-lead">{ndfmt(t.arcText, { name })}</p>

        <div className="nd-arc-reasonlbl">{t.arcReasonLbl}</div>
        <div className="nd-arc-reasons">
          {ARCHIVE_REASONS.map(o => (
            <button type="button" key={o.id}
              className={cx('nd-arc-reason', reason === o.id && 'is-on')}
              onClick={() => setReason(reason === o.id ? null : o.id)}>
              <span className={cx('ajb-radio', reason === o.id && 'is-on')} />
              <Icon name={o.icon} />
              <span className="nd-arc-reason-lbl">{t[o.key]}</span>
            </button>
          ))}
        </div>
        {reason === 'other' && (
          <input className="ajb-input ajb-input--boxed nd-arc-other" value={other}
            onChange={e => setOther(e.target.value)} placeholder={t.arcOtherPh}
            dir={lang === 'ar' ? 'rtl' : 'ltr'} autoFocus maxLength={120} />
        )}

        <div className="nd-arc-keep"><Icon name="info" />{t.arcNote}</div>
        <div className="ajb-dialog__actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onClose}>{t.arcCancel}</button>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={submit}><Icon name="archive" />{t.arcConfirm}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { deleteMode, statusLabel, KebabMenu, DeleteModal, NeToast, ArchiveModal, ARCHIVE_REASONS });
