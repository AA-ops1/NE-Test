/* ============================================================
   Template Studio — shared UI parts
   Reused by both layout directions (Workspace + Stepper).
   ============================================================ */
import React, { useState, useRef, useEffect, useMemo, forwardRef, useCallback } from 'react';
import Icon from './Icon';
import TPL from '../data/tpl';

/* ---------- tiny helpers ---------- */
function L(obj, lang) { return obj ? (obj[lang] ?? obj.en) : ''; }
function cx() { return [...arguments].filter(Boolean).join(' '); }

/* ---------- Field shell ---------- (dictionary: .ajb-field / .ajb-field__label / .ajb-helper) */
function Field({ label, hint, error, required, children, full, assumed, t }) {
  return (
    <div className={cx('ajb-field', 'ts-field', full && 'full')}>
      {label && (
        <label className="ajb-field__label">
          {label}{required && <span className="ts-req">*</span>}
          {assumed && <span className="ts-assumed">{t.assumed}</span>}
        </label>
      )}
      {children}
      {error
        ? <div className="ajb-helper ajb-helper--error">{error}</div>
        : hint ? <div className="ajb-helper">{hint}</div> : null}
    </div>
  );
}

/* ---------- Text input ---------- (dictionary: .ajb-input) */
function TextInput({ value, onChange, placeholder, error, dir }) {
  return (
    <input className="ajb-input" value={value} dir={dir}
      placeholder={placeholder} onChange={e => onChange(e.target.value)} />
  );
}

/* ---------- Custom dropdown select ---------- (dictionary: .ajb-select trigger + .ajb-menu popover) */
function DropSelect({ value, onChange, options, lang, placeholder, error, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const sel = options.find(o => o.id === value);
  return (
    <div className="ts-selectwrap" ref={ref}>
      <div className={cx('ajb-select', open && 'is-focus')} onClick={() => setOpen(o => !o)}>
        <span className="ts-select-lead">
          {icon && <Icon name={icon} className="ts-select-ic" />}
          <span className={cx('ts-select-val', !sel && 'ph')}>{sel ? L(sel, lang) : placeholder}</span>
        </span>
        <Icon name="chevron-down" className={cx('ts-select-caret', open && 'open')} />
      </div>
      {open && (
        <div className="ajb-menu ts-select-pop">
          {options.map(o => (
            <div key={o.id}
              className={cx('ajb-menu__item', o.id === value && 'is-on')}
              onClick={() => { onChange(o.id); setOpen(false); }}>
              {o.icon && <Icon name={o.icon} />}
              <span className="ts-opt-lbl">{L(o, lang)}</span>
              {o.id === value && <span className="ajb-menu__check"><Icon name="check" /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Date picker ---------- (dictionary: .ajb-select trigger + .ajb-calendar popover) */
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};
function isoDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function DatePicker({ value, onChange, placeholder, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const sel = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = useState(() => sel || new Date('2026-06-01T00:00:00'));
  useEffect(() => { if (value) setView(new Date(value + 'T00:00:00')); }, [value]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const y = view.getFullYear(), m = view.getMonth();
  const today = new Date('2026-06-02T00:00:00');
  const startDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const label = sel ? sel.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const pick = (d) => { onChange(isoDate(new Date(y, m, d))); setOpen(false); };
  const same = (d) => sel && sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
  const isToday = (d) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  return (
    <div className="ts-datepick" ref={ref}>
      <div className={cx('ajb-select', open && 'is-focus')} onClick={() => setOpen(o => !o)}>
        <span className={cx('ts-select-val', !sel && 'ph')}>{label || placeholder}</span>
        <Icon name="calendar" />
      </div>
      {open && (
        <div className="ajb-calendar ts-cal-pop">
          <div className="ajb-calendar__head">
            <div className="ajb-calendar__title">{MONTHS[lang === 'ar' ? 'ar' : 'en'][m]} {y}</div>
            <div className="ajb-calendar__nav">
              <button type="button" onClick={() => setView(new Date(y, m - 1, 1))}><Icon name="chevron-left" /></button>
              <button type="button" onClick={() => setView(new Date(y, m + 1, 1))}><Icon name="chevron-right" /></button>
            </div>
          </div>
          <div className="ajb-calendar__grid">
            {DOW.map((d, i) => <div className="ajb-calendar__dow" key={'d' + i}>{d}</div>)}
            {cells.map((d, i) => d === null
              ? <div className="ajb-calendar__day is-muted" key={'e' + i} />
              : <div key={i} className={cx('ajb-calendar__day', same(d) && 'is-on', isToday(d) && 'is-today')} onClick={() => pick(d)}>{d}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Channel picker ---------- (dictionary: .ajb-optioncards / .ajb-optioncard) */
function ChannelPicker({ value, onChange, lang }) {
  return (
    <div className="ajb-optioncards" style={{ '--ajb-optioncols': 5 }}>
      {TPL.CHANNELS.map(c => (
        <div key={c.id}
          className={cx('ajb-optioncard', c.id === value && 'is-on')}
          onClick={() => onChange(c.id)}>
          <Icon name={c.icon} />
          <span>{L(c, lang)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Choice chips (type / priority) ---------- (dictionary: .ajb-chip--filter) */
function ChoiceChips({ value, onChange, options, lang, prio }) {
  return (
    <div className="ts-chips">
      {options.map(o => (
        <span key={o.id}
          className={cx('ajb-chip', 'ajb-chip--filter', o.id === value && 'is-on')}
          onClick={() => onChange(o.id)}>
          {L(o, lang)}
        </span>
      ))}
    </div>
  );
}

/* ---------- Language tabs ---------- (dictionary: .ajb-tabs + .ajb-tab-badge) */
function LangTabs({ langs, active, onSelect, onAdd, lang, t }) {
  const avail = TPL.LANGS.filter(l => !langs.includes(l.id));
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="ajb-tabs ts-langtabs">
      {langs.map(id => {
        const meta = TPL.LANGS.find(l => l.id === id);
        return (
          <button type="button" key={id}
            className={cx(id === active && 'is-on')}
            onClick={() => onSelect(id)}>
            <span className="ajb-tab-badge ts-langtab-code">{id.toUpperCase()}</span>
            {meta.native}
          </button>
        );
      })}
      {avail.length > 0 && (
        <div className="ts-langadd-wrap">
          <button type="button" className="ts-langadd" onClick={() => setAddOpen(o => !o)}>
            <Icon name="plus" />{t.addLang}
          </button>
          {addOpen && (
            <div className="ajb-menu ts-select-pop">
              {avail.map(l => (
                <div key={l.id} className="ajb-menu__item"
                  onClick={() => { onAdd(l.id); setAddOpen(false); }}>
                  <span className="ajb-tab-badge ts-langtab-code">{l.id.toUpperCase()}</span>
                  <span className="ts-opt-lbl">{L(l, lang)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Highlighted textarea (backdrop highlights {{tokens}}) ---------- */
const HiTextarea = forwardRef(function HiTextarea({ value, onChange, placeholder, dir, code }, ref) {
  const backRef = useRef(null);
  const html = useMemo(() => {
    let esc = (value || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // code mode (email HTML): tint the markup tags so the body reads as code
    if (code) esc = esc.replace(/(&lt;[^&]*?&gt;)/g, '<span class="ts-tag">$1</span>');
    const marked = esc.replace(/\{\{\s*([\w.]+)\s*\}\}/g,
      '<mark class="ts-tok">{{$1}}</mark>');
    return marked + '\n'; // trailing newline keeps last line visible
  }, [value, code]);
  const sync = () => {
    if (backRef.current && ref.current) backRef.current.scrollTop = ref.current.scrollTop;
  };
  return (
    <div className={cx('ts-editor', code && 'ts-editor--code')}>
      <div className="ts-editor-back" ref={backRef} dir={dir}
        dangerouslySetInnerHTML={{ __html: html }} />
      <textarea className="ts-editor-ta" ref={ref} value={value} dir={dir}
        placeholder={placeholder} spellCheck={false}
        onScroll={sync}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
});

/* ---------- Variable panel (searchable, grouped, click-to-insert) ---------- */
function VariablePanel({ onInsert, lang, t, compact }) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return TPL.VAR_GROUPS;
    return TPL.VAR_GROUPS
      .map(g => ({ ...g, vars: g.vars.filter(v =>
        v.token.toLowerCase().includes(needle) ||
        (v['lbl_' + lang] || v.lbl_en).toLowerCase().includes(needle)) }))
      .filter(g => g.vars.length);
  }, [q, lang]);
  return (
    <div className={cx('ts-varpanel', compact && 'compact')}>
      <div className="ts-varpanel-head">
        <div className="ts-varpanel-title"><Icon name="braces" />{t.variables}</div>
        <span className="ts-varpanel-hint">{t.variablesHint}</span>
      </div>
      <div className="ts-varsearch">
        <Icon name="search" />
        <input value={q} placeholder={t.searchVars} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="ts-varlist">
        {groups.map(g => (
          <div className="ts-vargroup" key={g.id}>
            <div className="ts-vargroup-h"><Icon name={g.icon} />{L(g, lang)}</div>
            {g.vars.map(v => (
              <button type="button" key={v.token} className="ts-varitem"
                onClick={() => onInsert(v.token)}>
                <span className="ts-varitem-tok">{`{{${v.token}}}`}</span>
                <span className="ts-varitem-lbl">{v['lbl_' + lang] || v.lbl_en}</span>
                <Icon name="plus" className="ts-varitem-add" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Segment / encoding meter ---------- */
function SegmentMeter({ text, lang, t }) {
  const seg = TPL.calcSegments(text || '');
  const isUni = seg.encoding === 'Unicode';
  const fillPct = seg.capacity ? Math.min(100, (seg.length / seg.capacity) * 100) : 0;
  return (
    <div className="ts-seg">
      <div className="ts-seg-head">
        <span className="ts-seg-title">{t.segTitle}</span>
        <span className={cx('ts-seg-enc', isUni && 'uni')}>{seg.encoding}</span>
      </div>
      <div className="ts-seg-stats">
        <div className="ts-seg-stat">
          <div className="ts-seg-num ajb-ltr">{seg.length}</div>
          <div className="ts-seg-cap">{t.characters}</div>
        </div>
        <div className="ts-seg-stat">
          <div className="ts-seg-num ajb-ltr">{seg.segments}</div>
          <div className="ts-seg-cap">{t.segments}</div>
        </div>
        <div className="ts-seg-stat">
          <div className="ts-seg-num ajb-ltr">{seg.segments > 0 ? seg.remaining : seg.perSegment}</div>
          <div className="ts-seg-cap">{t.remaining}</div>
        </div>
      </div>
      <div className="ts-seg-bar">
        <div className="ts-seg-bar-fill" style={{ width: fillPct + '%' }} />
        {seg.segments > 1 && Array.from({ length: seg.segments - 1 }).map((_, i) => (
          <span key={i} className="ts-seg-tick" style={{ insetInlineStart: ((i + 1) * (seg.perSegment / seg.capacity) * 100) + '%' }} />
        ))}
      </div>
      <div className="ts-seg-note">{isUni ? t.segUni : t.segGsm}</div>
    </div>
  );
}

/* Renders an HTML email body in a sandboxed iframe so a full document
   (doctype / head / <style>) parses correctly and its CSS stays SCOPED to the
   email — it can never leak out and restyle the console. Scripts are disabled
   (no allow-scripts). A bare fragment gets wrapped in a sensible email shell. */
function EmailHtmlFrame({ html, dir, fill }) {
  const ref = useRef(null);
  const srcDoc = useMemo(() => {
    const src = html || '';
    const isFull = /<!doctype/i.test(src) || /<html[\s>]/i.test(src) || /<head[\s>]/i.test(src) || /<body[\s>]/i.test(src);
    if (isFull) return src;
    return '<!doctype html><html dir="' + dir + '"><head><meta charset="utf-8">'
      + '<style>html,body{margin:0}body{background:#fff;color:#1a140e;'
      + 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'
      + 'font-size:14px;line-height:1.55;padding:16px}'
      + 'a{color:#8c684a}img{max-width:100%;height:auto}'
      + 'h1,h2,h3{line-height:1.2;margin:0 0 8px}p{margin:0 0 10px}</style></head><body>'
      + src + '</body></html>';
  }, [html, dir]);
  const fit = () => {
    if (fill) return;            // fill mode fills its container, no auto-height
    const el = ref.current; if (!el) return;
    try {
      const d = el.contentDocument;
      if (d && d.body) el.style.height = Math.max(72, Math.min(560, d.body.scrollHeight)) + 'px';
    } catch (e) { /* opaque origin — keep the CSS min-height */ }
  };
  useEffect(fit, [srcDoc, fill]);
  return <iframe ref={ref} className={cx('ts-pv-email-frame', fill && 'ts-pv-email-frame--fill')} title="email preview" sandbox="allow-same-origin" srcDoc={srcDoc} onLoad={fit} />;
}

/* ---------- Channel-realistic device preview ---------- */
function DevicePreview({ channel, text, subject, ntitle, lang, sample, onToggleSample, t, format }) {
  const body = sample ? TPL.resolveSample(text || '', lang) : (text || '');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isHtmlEmail = channel === 'email' && format === 'html';
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => { if (e.key === 'Escape') setZoom(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom]);
  useEffect(() => { if (!isHtmlEmail && zoom) setZoom(false); }, [isHtmlEmail, zoom]);

  // render with token chips when NOT in sample mode
  const renderBody = (str) => {
    if (sample) return str;
    const parts = [];
    let last = 0; const re = /\{\{\s*([\w.]+)\s*\}\}/g; let m; let i = 0;
    while ((m = re.exec(str))) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      parts.push(<span key={i++} className="ts-pvtok">{`{{${m[1]}}}`}</span>);
      last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length ? parts : str;
  };

  const ph = !text;
  const placeholderEl = <span className="ts-pv-ph">{t.messagePh}</span>;

  let inner;
  if (channel === 'sms' || channel === 'whatsapp') {
    const wa = channel === 'whatsapp';
    inner = (
      <div className={cx('ts-pv-chat', wa && 'wa')} dir={dir}>
        <div className="ts-pv-chat-name">{wa ? 'Aljazira Bank' : 'AlJazira'}{wa && <Icon name="badge-check" className="ts-wa-badge" />}</div>
        <div className="ts-pv-bubble">
          <span className="ts-pv-bodytext">{ph ? placeholderEl : renderBody(body)}</span>
          {wa && <span className="ts-wa-time">14:32 <Icon name="check-check" /></span>}
        </div>
      </div>
    );
  } else if (channel === 'email') {
    let emailBody;
    if (ph) emailBody = <div className="ts-pv-email-body">{placeholderEl}</div>;
    else if (isHtmlEmail) emailBody = <div className="ts-pv-email-body ts-pv-email-body--html"><EmailHtmlFrame html={body} dir={dir} /></div>;
    else emailBody = <div className="ts-pv-email-body">{renderBody(body)}</div>;
    inner = (
      <div className="ts-pv-email" dir={dir}>
        <div className="ts-pv-email-row">
          <span className="ts-pv-email-from">Aljazira Bank</span>
          <span className="ts-pv-email-meta">{isHtmlEmail && <span className="ts-pv-html-badge">HTML</span>}<span className="ts-pv-email-time">14:32</span></span>
        </div>
        <div className="ts-pv-email-subj">{subject || <span className="ts-pv-ph">{t.subjectPh}</span>}</div>
        <div className="ts-pv-email-to">to me</div>
        {emailBody}
      </div>
    );
  } else if (channel === 'push') {
    inner = (
      <div className="ts-pv-push" dir={dir}>
        <div className="ts-pv-push-ico"><img src="/assets/logo-ajb-symbol-white.png" alt="" /></div>
        <div className="ts-pv-push-body">
          <div className="ts-pv-push-top"><span className="ts-pv-push-app">Aljazira</span><span className="ts-pv-push-time">now</span></div>
          <div className="ts-pv-push-title">{ntitle || <span className="ts-pv-ph">{t.titlePh}</span>}</div>
          <div className="ts-pv-push-text">{ph ? placeholderEl : renderBody(body)}</div>
        </div>
      </div>
    );
  } else { // inapp
    inner = (
      <div className="ts-pv-inapp" dir={dir}>
        <div className="ts-pv-inapp-bar"><Icon name="bell-ring" /></div>
        <div className="ts-pv-inapp-card">
          <div className="ts-pv-inapp-title">{ntitle || <span className="ts-pv-ph">{t.titlePh}</span>}</div>
          <div className="ts-pv-inapp-text">{ph ? placeholderEl : renderBody(body)}</div>
          <div className="ts-pv-inapp-cta">{lang === 'ar' ? 'عرض' : 'View'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-pv">
      <div className="ts-pv-head">
        <span className="ts-pv-head-t">{t.preview}</span>
        <div className="ts-pv-head-r">
          {isHtmlEmail && (
            <button type="button" className="ts-pv-toggle" onClick={() => setZoom(true)} title={t.expandPreview}>
              <Icon name="maximize-2" />{t.expand}
            </button>
          )}
          <button type="button" className={cx('ts-pv-toggle', sample && 'on')} onClick={onToggleSample}>
            <Icon name={sample ? 'eye' : 'tag'} key={sample ? 'eye' : 'tag'} />{sample ? t.showSample : t.showRaw}
          </button>
        </div>
      </div>
      <div className={cx('ts-pv-stage', `ch-${channel}`)} key={channel}>{inner}</div>
      {zoom && isHtmlEmail && (
        <div className="ts-emailmodal" role="dialog" aria-modal="true">
          <div className="ajb-scrim ts-emailmodal-scrim" onClick={() => setZoom(false)} />
          <div className="ts-emailmodal-panel" dir={dir}>
            <div className="ts-emailmodal-head">
              <div className="ts-emailmodal-titles">
                <span className="ts-emailmodal-eyebrow"><span className="ts-pv-html-badge">HTML</span>{t.emailFull}</span>
                <span className="ts-emailmodal-subj">{subject || <span className="ts-pv-ph">{t.subjectPh}</span>}</span>
              </div>
              <button type="button" className="ts-emailmodal-x" onClick={() => setZoom(false)} aria-label={t.close} title={t.close}><Icon name="x" /></button>
            </div>
            <div className="ts-emailmodal-body">
              <EmailHtmlFrame html={body} dir={dir} fill />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- status pill / channel tag ---------- (dictionary: .ajb-badge) */
function StatusPill({ status, t }) {
  const map = { draft: t.stDraft, review: t.stReview, active: t.stActive, expired: t.stExpired, archived: t.stArchived, inactive: t.stInactive };
  const variant = { draft: 'neutral', review: 'info', active: 'success', expired: 'neutral', archived: 'neutral', inactive: 'neutral' }[status];
  const muted = status === 'expired' || status === 'archived';
  return <span className={cx('ajb-badge', 'ajb-badge--' + variant, muted && 'ts-badge-muted')}>{map[status]}</span>;
}
function ChannelTag({ id, lang }) {
  const c = TPL.CHANNELS.find(x => x.id === id);
  return <span className="ts-chtag"><Icon name={c.icon} />{L(c, lang)}</span>;
}

export { L, cx, Field, TextInput, DropSelect, DatePicker, ChannelPicker, ChoiceChips, LangTabs, HiTextarea, VariablePanel, SegmentMeter, EmailHtmlFrame, DevicePreview, StatusPill, ChannelTag };
