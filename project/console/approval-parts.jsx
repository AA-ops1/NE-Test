/* global React, TPL, Icon, L, cx, StatusPill */
/* ============================================================
   Maker–Checker — shared parts (Approvals page + View details retrofit)
   • Word-level diff + FieldDiff (before/after)
   • ApprovalTimeline (audit trail) + historyFromVersions()
   • PersonChip / Avatar helpers
   • DecisionBar, ReasonModal, ReassignModal, SubmitModal
   Loads after template-parts.jsx (Icon, L, cx, StatusPill).
   ============================================================ */
const { useState: useAS, useMemo: useAM, useRef: useAR, useEffect: useAE } = React;

function apfmt(str, map) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m)); }
const AP = () => TPL.AP;

/* ---------- avatar / person ---------- */
function Avatar({ p, size = 'sm' }) {
  return <span className={`ajb-avatar ajb-avatar--${size}`}><span>{p ? p.init : '?'}</span></span>;
}
function PersonChip({ p, lang, sub }) {
  return (
    <span className="ajb-person">
      <Avatar p={p} size="xs" />
      <span className="ajb-person__txt">
        <span className="ajb-person__name">{L(p, lang)}</span>
        {sub && <span className="ajb-person__sub">{sub}</span>}
      </span>
    </span>
  );
}

/* ---------- priority — the design-system status dot ---------- */
function PriorityTag({ id, lang }) {
  const p = TPL.PRIORITIES.find(x => x.id === id);
  const dot = { low: 'muted', normal: 'info', high: 'warning', critical: 'danger' }[id] || 'muted';
  return <span className="ajb-status"><span className={cx('ajb-dot', 'ajb-dot--' + dot)} />{p ? L(p, lang) : id}</span>;
}

/* ---------- token-aware inline renderer (chips for {{tokens}}) ---------- */
function withTokens(str, keyPfx) {
  const out = []; let last = 0, i = 0;
  const re = /\{\{\s*([\w.]+)\s*\}\}/g; let m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(<span key={keyPfx + (i++)} className="ap-tok">{`{{${m[1]}}}`}</span>);
    last = re.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

/* ---------- word-level diff (LCS) ----------
   Tokenises into words + whitespace + {{tokens}}; returns segments with
   op 'eq' | 'del' | 'ins'. Good enough for short notification copy. */
function tokenizeForDiff(s) {
  return (s || '').match(/\{\{[^}]+\}\}|\s+|[^\s]+/g) || [];
}
function diffWords(aStr, bStr) {
  const a = tokenizeForDiff(aStr), b = tokenizeForDiff(bStr);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const segs = []; let i = 0, j = 0;
  const push = (op, text) => {
    const prev = segs[segs.length - 1];
    if (prev && prev.op === op) prev.text += text; else segs.push({ op, text });
  };
  while (i < n && j < m) {
    if (a[i] === b[j]) { push('eq', a[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push('del', a[i]); i++; }
    else { push('ins', b[j]); j++; }
  }
  while (i < n) { push('del', a[i]); i++; }
  while (j < m) { push('ins', b[j]); j++; }
  return segs;
}
function renderSide(segs, side, keyPfx) {
  // side 'before' shows eq+del; side 'after' shows eq+ins
  const keep = side === 'before' ? 'del' : 'ins';
  const out = [];
  segs.forEach((s, idx) => {
    if (s.op === 'eq') out.push(<span key={keyPfx + idx}>{withTokens(s.text, keyPfx + idx + '-')}</span>);
    else if (s.op === keep) out.push(<mark key={keyPfx + idx} className={cx('ajb-diff__mark', side === 'before' ? 'ajb-diff__mark--del' : 'ajb-diff__mark--ins')}>{withTokens(s.text, keyPfx + idx + '-')}</mark>);
  });
  return out;
}

/* ---------- a single changed field (before/after) ---------- */
function FieldDiff({ label, before, after, lang }) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const segs = useAM(() => diffWords(before || '', after || ''), [before, after]);
  const t = TPL.T[lang];
  return (
    <div className="ajb-diff">
      <div className="ajb-diff__label">{label}</div>
      <div className="ajb-diff__grid">
        <div className="ajb-diff__side">
          <div className="ajb-diff__tag ajb-diff__tag--before"><Icon name="minus" />{t.apCurrent}</div>
          <div className="ajb-diff__box ajb-diff__box--before" dir={dir}>{renderSide(segs, 'before', 'b')}</div>
        </div>
        <div className="ajb-diff__side">
          <div className="ajb-diff__tag ajb-diff__tag--after"><Icon name="plus" />{t.apProposed}</div>
          <div className="ajb-diff__box ajb-diff__box--after" dir={dir}>{renderSide(segs, 'after', 'a')}</div>
        </div>
      </div>
    </div>
  );
}

/* compute the changed fields for an edit submission, in a given content language.
   `lang` selects which language's content to diff; `t` (optional) supplies the
   field labels (defaults to that language's strings). */
function changedFields(sub, lang, t) {
  if (sub.kind !== 'edit' || !sub.prev) return [];
  t = t || TPL.T[lang];
  const out = [];
  const pick = (o) => (o ? (o[lang] ?? o.en) : '');
  if (sub.subject || (sub.prev.subject)) {
    const b = pick(sub.prev.subject), a = pick(sub.subject);
    if (b !== a) out.push({ key: 'subject', label: t.subjectLbl, before: b, after: a });
  }
  if (sub.ntitle || sub.prev.ntitle) {
    const b = pick(sub.prev.ntitle), a = pick(sub.ntitle);
    if (b !== a) out.push({ key: 'title', label: t.titleLbl, before: b, after: a });
  }
  {
    const b = pick(sub.prev.content), a = pick(sub.content);
    if (b !== a) out.push({ key: 'body', label: t.bodyLbl, before: b, after: a });
  }
  return out;
}

/* ============================================================
   Approval timeline (audit trail)
   Accepts an array of events {type, who, when, note?}.
   ============================================================ */
function ApprovalTimeline({ events, lang, awaiting }) {
  const t = TPL.T[lang];
  const EV = AP().EVENTS;
  const roleTag = { maker: 'sand', checker: 'info', system: 'muted' };
  const roleLabel = { maker: t.apRoleTagMaker, checker: t.apRoleTagChecker, system: t.apRoleTagSystem };
  return (
    <ol className="ajb-timeline">
      {events.map((e, i) => {
        const meta = EV[e.type] || { icon: 'dot', key: 'apEvEdited', role: 'system', tint: '' };
        return (
          <li className={cx('ajb-timeline__item', meta.tint && 'ajb-timeline__item--' + meta.tint)} key={i}>
            <span className="ajb-timeline__ico"><Icon name={meta.icon} /></span>
            <div className="ajb-timeline__body">
              <div className="ajb-timeline__top">
                <span className="ajb-timeline__action">{t[meta.key]}</span>
                {e.who && <span className="ajb-timeline__by">· {L(e.who, lang)}</span>}
                <span className={cx('ajb-timeline__tag', 'ajb-timeline__tag--' + roleTag[meta.role])}>{roleLabel[meta.role]}</span>
              </div>
              {e.when && <div className="ajb-timeline__when ajb-ltr">{L(e.when, lang)}</div>}
              {e.note && <div className="ajb-timeline__note">{L(e.note, lang)}</div>}
            </div>
          </li>
        );
      })}
      {awaiting && (
        <li className="ajb-timeline__item ajb-timeline__item--info" key="await">
          <span className="ajb-timeline__ico ajb-timeline__ico--pulse"><Icon name="clock" /></span>
          <div className="ajb-timeline__body">
            <div className="ajb-timeline__top"><span className="ajb-timeline__action">{t.apEvAwaiting}</span>
              {awaiting.who && <span className="ajb-timeline__by">· {L(awaiting.who, lang)}</span>}
              <span className="ajb-timeline__tag ajb-timeline__tag--info">{t.apRoleTagChecker}</span>
            </div>
          </div>
        </li>
      )}
    </ol>
  );
}

/* derive an audit trail from a template's version array (for View details).
   Newest event first. Draft versions contribute only create/edit; versions
   that reached active/archived contribute submit → approve as well. */
function historyFromVersions(tpl, lang) {
  const events = [];
  const verAsc = [...tpl.versions].slice().reverse(); // oldest → newest
  verAsc.forEach((v, idx) => {
    const isFirst = idx === 0;
    events.push({ type: isFirst ? 'created' : 'edited', who: v.maker || tpl.createdBy, when: v.updatedAt, ver: v.ver });
    if (v.status === 'active' || v.status === 'archived') {
      events.push({ type: 'submitted', who: v.maker || tpl.createdBy, when: v.updatedAt, ver: v.ver });
      events.push({ type: 'approved', who: v.checker, when: v.updatedAt, ver: v.ver,
        note: { en: `${v.ver} approved & activated.`, ar: `تم اعتماد وتفعيل ${v.ver}.` } });
    }
  });
  return events.reverse(); // newest first
}

/* ============================================================
   Decision bar — Approve / Send back / Reject / Reassign.
   Sends back & reject require a reason (inline expanding field).
   When `blocked` (maker === current checker), Approve is disabled and a
   reassign affordance is shown instead.
   ============================================================ */
function DecisionBar({ lang, t, blocked, variant, onApprove, onSendBack, onReject, onReassign }) {
  const [mode, setMode] = useAS(null);      // null | 'note' | 'send' | 'reject'
  const [note, setNote] = useAS('');
  const [reason, setReason] = useAS('');
  const [touched, setTouched] = useAS(false);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const reset = () => { setMode(null); setNote(''); setReason(''); setTouched(false); };
  const submitSend = () => { if (!reason.trim()) { setTouched(true); return; } onSendBack(reason.trim()); };
  const submitReject = () => { if (!reason.trim()) { setTouched(true); return; } onReject(reason.trim()); };

  if (blocked) {
    return (
      <div className={cx('ap-decision', 'is-blocked', variant && 'ap-decision--' + variant)}>
        <div className="ap-decision-h"><Icon name="shield-alert" />{t.apDecide}</div>
        <div className="ajb-alert ajb-alert--warning ap-guard">
          <span className="ajb-alert__ico"><Icon name="user-x" /></span>
          <div className="ajb-alert__body">
            <p className="ajb-alert__title">{t.apGuardTitle}</p>
            <p className="ajb-alert__desc">{t.apGuardText}</p>
          </div>
        </div>
        <button type="button" className="ajb-btn ajb-btn--sand ap-fullbtn" onClick={onReassign}>
          <Icon name="users" />{t.apGuardReassign}
        </button>
      </div>
    );
  }

  return (
    <div className={cx('ap-decision', variant && 'ap-decision--' + variant)}>
      <div className="ap-decision-h"><Icon name="gavel" />{t.apDecide}</div>

      {mode === 'send' || mode === 'reject' ? (
        <div className="ap-reasonblock">
          <div className={cx('ap-reason-hd', mode === 'reject' && 'is-reject')}>
            <Icon name={mode === 'reject' ? 'x-circle' : 'corner-up-left'} />
            {mode === 'reject' ? t.apRejectHd : t.apSendBackHd}
          </div>
          <p className="ap-reason-req">{mode === 'reject' ? t.apReasonReqReject : t.apReasonReqSend}</p>
          <textarea
            className={cx('ajb-input ajb-input--boxed ap-reason-ta', touched && !reason.trim() && 'is-error')}
            value={reason} dir={dir} autoFocus
            placeholder={mode === 'reject' ? t.apRejectPh : t.apSendBackPh}
            onChange={e => setReason(e.target.value)} />
          <div className="ap-reason-actions">
            <button type="button" className="ajb-btn ajb-btn--secondary" onClick={reset}>{t.apCancel}</button>
            {mode === 'reject'
              ? <button type="button" className="ajb-btn ajb-btn--danger" onClick={submitReject}><Icon name="x" />{t.apConfirmReject}</button>
              : <button type="button" className="ajb-btn ajb-btn--sand" onClick={submitSend}><Icon name="corner-up-left" />{t.apConfirmSendBack}</button>}
          </div>
        </div>
      ) : (
        <React.Fragment>
          <button type="button" className="ajb-btn ajb-btn--sand ap-fullbtn ap-approve" onClick={() => onApprove(note.trim())}>
            <Icon name="check" />{t.apApprove}
          </button>
          {mode === 'note' ? (
            <textarea className="ajb-input ajb-input--boxed ap-note-ta" value={note} dir={dir} autoFocus
              placeholder={t.apApproveNotePh} onChange={e => setNote(e.target.value)} />
          ) : (
            <button type="button" className="ap-addnote" onClick={() => setMode('note')}>
              <Icon name="message-square-plus" />{t.apAddNote} <span className="ap-note-opt">{t.apNoteOptional}</span>
            </button>
          )}
          <div className="ap-decision-sep" />
          <div className="ap-decision-row">
            <button type="button" className="ajb-btn ajb-btn--secondary ap-half" onClick={() => { setReason(''); setTouched(false); setMode('send'); }}>
              <Icon name="corner-up-left" />{t.apSendBack}
            </button>
            <button type="button" className="ajb-btn ajb-btn--secondary ap-half ap-rejectbtn" onClick={() => { setReason(''); setTouched(false); setMode('reject'); }}>
              <Icon name="x" />{t.apReject}
            </button>
          </div>
          <button type="button" className="ap-reassign-link" onClick={onReassign}>
            <Icon name="users" />{t.apReassign}
          </button>
        </React.Fragment>
      )}
    </div>
  );
}

/* ============================================================
   Reassign modal — pick another checker
   ============================================================ */
function ReassignModal({ name, lang, t, onClose, onConfirm }) {
  const [pick, setPick] = useAS(null);
  const stop = e => e.stopPropagation();
  const checkers = AP().CHECKERS;
  return (
    <div className="nd-overlay nd-dialog" onClick={onClose}>
      <div className="ajb-scrim" />
      <div className="ajb-dialog ap-modal" role="dialog" aria-modal="true" onClick={stop}>
        <div className="ajb-dialog__ico ajb-dialog__ico--sand"><Icon name="users" /></div>
        <h3 className="ajb-dialog__title">{t.apReassignTitle}</h3>
        <p className="ajb-dialog__text">{apfmt(t.apReassignText, { name })}</p>
        <div className="ap-pickerlbl">{t.apReassignPick}</div>
        <div className="ap-checkers">
          {checkers.map(c => (
            <button type="button" key={c.id} className={cx('ap-checker', pick && pick.id === c.id && 'is-on')} onClick={() => setPick(c)}>
              <span className={cx('ajb-radio', pick && pick.id === c.id && 'is-on')} />
              <Avatar p={c} size="sm" />
              <span className="ap-checker-name">{L(c, lang)}</span>
            </button>
          ))}
        </div>
        <div className="ajb-dialog__actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onClose}>{t.apCancel}</button>
          <button type="button" className={cx('ajb-btn ajb-btn--sand', !pick && 'is-disabled')} onClick={() => pick && onConfirm(pick)}>
            <Icon name="user-check" />{t.apReassignConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Submit-for-review modal (maker) — pick checker + optional note
   ============================================================ */
function SubmitModal({ name, lang, t, onClose, onConfirm }) {
  const [pick, setPick] = useAS(null);
  const [note, setNote] = useAS('');
  const stop = e => e.stopPropagation();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const checkers = AP().CHECKERS; // current user is never in this list → can't self-assign
  return (
    <div className="nd-overlay nd-dialog" onClick={onClose}>
      <div className="ajb-scrim" />
      <div className="ajb-dialog ap-modal ap-submitmodal" role="dialog" aria-modal="true" onClick={stop}>
        <div className="ajb-dialog__ico ajb-dialog__ico--sand"><Icon name="send" /></div>
        <h3 className="ajb-dialog__title">{t.apSubmitTitle}</h3>
        <p className="ajb-dialog__text">{apfmt(t.apSubmitText, { name })}</p>

        <div className="ap-pickerlbl">{t.apSubmitChecker}</div>
        <div className="ap-checkers">
          {checkers.map(c => (
            <button type="button" key={c.id} className={cx('ap-checker', pick && pick.id === c.id && 'is-on')} onClick={() => setPick(c)}>
              <span className={cx('ajb-radio', pick && pick.id === c.id && 'is-on')} />
              <Avatar p={c} size="sm" />
              <span className="ap-checker-name">{L(c, lang)}</span>
            </button>
          ))}
        </div>

        <div className="ap-pickerlbl ap-pickerlbl--mt">{t.apSubmitNote} <span className="ap-note-opt">{t.apNoteOptional}</span></div>
        <textarea className="ajb-input ajb-input--boxed ap-note-ta" value={note} dir={dir}
          placeholder={t.apSubmitNotePh} onChange={e => setNote(e.target.value)} />

        <div className="ajb-dialog__actions ap-submit-actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onClose}>{t.apCancel}</button>
          <button type="button" className={cx('ajb-btn ajb-btn--sand', !pick && 'is-disabled')} onClick={() => pick && onConfirm(pick, note.trim())}>
            <Icon name="send" />{t.apSubmitConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  apfmt, Avatar, PersonChip, PriorityTag, withTokens,
  diffWords, FieldDiff, changedFields,
  ApprovalTimeline, historyFromVersions,
  DecisionBar, ReassignModal, SubmitModal,
});
