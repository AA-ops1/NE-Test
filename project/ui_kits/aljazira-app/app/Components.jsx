/* global React */
/* ============================================================
   Aljazira App — reusable component library.
   Every component is built on the semantic tokens in
   colors_and_type.css, so they respond to data-theme + dir.
   Styles live in app.css under the .ajbc- prefix.
   Icons use Lucide (<i data-lucide>) — the host calls
   lucide.createIcons() after each render.
   ============================================================ */
const { useState } = React;

/* ---------- Badges & status ---------- */
function Badge({ tone = 'neutral', children }) {
  return <span className={`ajbc-badge ajbc-badge-${tone}`}>{children}</span>;
}

function StatusDot({ tone = 'neutral', children }) {
  return (
    <span className="ajbc-status">
      <span className="ajbc-dot" style={{ background: `var(--ajbc-tone-${tone})` }} />
      {children}
    </span>
  );
}

function CountBadge({ tone = 'danger', children }) {
  return <span className={`ajbc-count ajbc-count-${tone}`}>{children}</span>;
}

/* ---------- Alert / inline message ---------- */
const ALERT_ICONS = { success: 'check-circle-2', danger: 'alert-circle', warning: 'alert-triangle', info: 'info' };
function Alert({ tone = 'info', title, children, onClose }) {
  return (
    <div className={`ajbc-alert ajbc-alert-${tone}`}>
      <span className="ajbc-alert-ico"><i data-lucide={ALERT_ICONS[tone]}></i></span>
      <div className="ajbc-alert-b">
        <div className="ajbc-alert-t">{title}</div>
        {children && <div className="ajbc-alert-d">{children}</div>}
      </div>
      {onClose && <span className="ajbc-alert-x" onClick={onClose}><i data-lucide="x"></i></span>}
    </div>
  );
}

/* ---------- Selection controls ---------- */
function Radio({ checked, label, onChange, disabled }) {
  return (
    <label className={`ajbc-opt ${disabled ? 'ajbc-muted' : ''}`} onClick={() => !disabled && onChange && onChange()}>
      <span className={`ajbc-radio ${checked ? 'on' : ''}`} />{label}
    </label>
  );
}

function Checkbox({ checked, indeterminate, label, onChange, disabled }) {
  const cls = indeterminate ? 'ind' : (checked ? 'on' : '');
  return (
    <label className={`ajbc-opt ${disabled ? 'ajbc-muted' : ''}`} onClick={() => !disabled && onChange && onChange()}>
      <span className={`ajbc-cb ${cls}`} />{label}
    </label>
  );
}

function Toggle({ checked, label, onChange }) {
  const sw = <span className={`ajbc-tog ${checked ? 'on' : ''}`} onClick={() => onChange && onChange(!checked)} />;
  if (!label) return sw;
  return (
    <label className="ajbc-opt" style={{ justifyContent: 'space-between' }}>
      <span>{label}</span>{sw}
    </label>
  );
}

/* ---------- Segmented & tabs ---------- */
function Segmented({ options, value, onChange }) {
  const [internal, setInternal] = useState(options[0]);
  const val = value !== undefined ? value : internal;
  const set = (o) => { setInternal(o); onChange && onChange(o); };
  return (
    <div className="ajbc-seg">
      {options.map(o => (
        <button key={o} className={val === o ? 'on' : ''} onClick={() => set(o)}>{o}</button>
      ))}
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  const [internal, setInternal] = useState(tabs[0].id);
  const val = value !== undefined ? value : internal;
  const set = (id) => { setInternal(id); onChange && onChange(id); };
  return (
    <div className="ajbc-tabs">
      {tabs.map(t => (
        <button key={t.id} className={val === t.id ? 'on' : ''} onClick={() => set(t.id)}>
          {t.label}{t.badge != null && <span className="ajbc-tabs-badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Select ---------- */
function Select({ label, value, placeholder, focus }) {
  return (
    <div className="ajbc-field">
      {label && <div className="ajbc-field-lbl">{label}</div>}
      <div className={`ajbc-select ${focus ? 'focus' : ''}`}>
        <span className={value ? '' : 'ajbc-select-ph'}>{value || placeholder}</span>
        <i data-lucide="chevron-down"></i>
      </div>
    </div>
  );
}

/* ---------- Avatars ---------- */
function Avatar({ size = 'md', src, initials, symbol, gradient }) {
  const style = gradient ? { background: gradient } : undefined;
  return (
    <span className={`ajbc-av ajbc-av-${size} ${symbol ? 'ajbc-av-symbol' : ''}`} style={style}>
      {src ? <img src={src} alt="" />
        : symbol ? <img src="../../assets/logo-ajb-symbol-black.png" alt="" />
        : initials}
    </span>
  );
}

function AvatarStack({ items, more }) {
  return (
    <div className="ajbc-stack">
      {items.map((it, i) => (
        <span key={i} className={`ajbc-av ajbc-av-md`} style={{ background: it.gradient }}>{it.initials}</span>
      ))}
      {more != null && <span className="ajbc-av ajbc-av-md ajbc-av-more">+{more}</span>}
    </div>
  );
}

/* ---------- Progress & loaders ---------- */
function ProgressBar({ value = 0, label, right }) {
  return (
    <div>
      {(label || right) && <div className="ajbc-bar-lbl"><span>{label}</span><span>{right}</span></div>}
      <div className="ajbc-bar"><div style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function Spinner({ label, size = 44 }) {
  const s = { width: size, height: size };
  if (!label) return <span className="ajbc-spin" style={s} />;
  return <div className="ajbc-ring"><span className="ajbc-spin" style={s} /><span className="ajbc-ring-lbl">{label}</span></div>;
}

function Skeleton({ w = '100%', h = 12, radius = 6 }) {
  return <span className="ajbc-sk" style={{ width: w, height: h, borderRadius: radius, display: 'block' }} />;
}

/* ---------- Chips ---------- */
function Chip({ children, onRemove, selected, dashed }) {
  const cls = `ajbc-chip ${selected ? 'on' : ''} ${dashed ? 'dashed' : ''}`;
  return (
    <span className={cls}>
      {children}
      {onRemove && <span className="ajbc-chip-x" onClick={onRemove}><i data-lucide="x"></i></span>}
    </span>
  );
}

/* ---------- Pagination & breadcrumb ---------- */
function Pagination({ page = 1, pages = [1, 2, 3], last, onChange }) {
  return (
    <div className="ajbc-pag">
      <button className="nav" onClick={() => onChange && onChange(Math.max(1, page - 1))}><i data-lucide="chevron-left"></i></button>
      {pages.map(p => <button key={p} className={p === page ? 'on' : ''} onClick={() => onChange && onChange(p)}>{p}</button>)}
      {last && <React.Fragment><span className="dots">…</span><button onClick={() => onChange && onChange(last)}>{last}</button></React.Fragment>}
      <button className="nav" onClick={() => onChange && onChange(page + 1)}><i data-lucide="chevron-right"></i></button>
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <div className="ajbc-crumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep"><i data-lucide="chevron-right"></i></span>}
          <span className={i === items.length - 1 ? 'cur' : ''}>{it}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Toast ---------- */
function Toast({ tone = 'neutral', icon = 'check', title, action, onAction }) {
  return (
    <div className="ajbc-toast">
      <span className={`ajbc-toast-ico ajbc-toast-${tone}`}><i data-lucide={icon}></i></span>
      <div className="ajbc-toast-b"><div className="ajbc-toast-t">{title}</div></div>
      {action && <span className="ajbc-toast-a" onClick={onAction}>{action}</span>}
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = 'inbox', title, children, action, onAction }) {
  return (
    <div className="ajbc-empty">
      <span className="ajbc-empty-badge"><i data-lucide={icon}></i></span>
      <h4>{title}</h4>
      {children && <p>{children}</p>}
      {action && <button className="ajbc-empty-btn" onClick={onAction}>{action}</button>}
    </div>
  );
}

/* ---------- List row ---------- */
function ListRow({ icon, title, sub, value, trailing = 'chevron', toggleOn, onClick }) {
  return (
    <div className="ajbc-li" onClick={onClick}>
      {icon && <span className="ajbc-li-ico"><i data-lucide={icon}></i></span>}
      <div className="ajbc-li-mid">
        <div className="ajbc-li-t">{title}</div>
        {sub && <div className="ajbc-li-s">{sub}</div>}
      </div>
      {value && <span className="ajbc-li-val">{value}</span>}
      {trailing === 'chevron' && <span className="ajbc-li-chev"><i data-lucide="chevron-right"></i></span>}
      {trailing === 'toggle' && <span className={`ajbc-tog ${toggleOn ? 'on' : ''}`} />}
    </div>
  );
}

/* ---------- Calendar & date field ----------
   Fully interactive single-date picker. Pass `value` (a Date) +
   `onChange` to control it, or let it manage its own selection.
   Month navigation is internal. For range pickers, the same cell
   classes (start / end / range) are styled in app.css. */
const AJBC_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AJBC_MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const AJBC_DOW = ['S','M','T','W','T','F','S'];

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function Calendar({ value, onChange, year = 2026, month = 4 }) {
  const [vy, setVy] = useState(year);
  const [vm, setVm] = useState(month);
  const [internal, setInternal] = useState(value || null);
  const sel = value !== undefined ? value : internal;
  const today = new Date(2026, 4, 31); // demo "today" = 31 May 2026

  const startDow = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();

  const step = (delta) => {
    let nm = vm + delta, ny = vy;
    if (nm < 0) { nm = 11; ny--; } else if (nm > 11) { nm = 0; ny++; }
    setVm(nm); setVy(ny);
  };
  const pick = (d) => {
    const nd = new Date(vy, vm, d);
    setInternal(nd); onChange && onChange(nd);
  };

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`b${i}`} className="ajbc-day muted" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(vy, vm, d);
    const cls = ['ajbc-day'];
    if (sameDay(dt, sel)) cls.push('sel');
    else if (sameDay(dt, today)) cls.push('today');
    cells.push(<div key={d} className={cls.join(' ')} onClick={() => pick(d)}>{d}</div>);
  }

  return (
    <div className="ajbc-cal">
      <div className="ajbc-cal-head">
        <div className="ajbc-cal-title">{AJBC_MONTHS[vm]} {vy}</div>
        <div className="ajbc-cal-nav">
          <button onClick={() => step(-1)}><i data-lucide="chevron-left"></i></button>
          <button onClick={() => step(1)}><i data-lucide="chevron-right"></i></button>
        </div>
      </div>
      <div className="ajbc-cal-grid">
        {AJBC_DOW.map((d, i) => <div key={`d${i}`} className="ajbc-dow">{d}</div>)}
        {cells}
      </div>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return null;
  return `${d.getDate()} ${AJBC_MON3[d.getMonth()]} ${d.getFullYear()}`;
}

function DateField({ label, value, placeholder = 'Select date', focus, onClick }) {
  return (
    <div className="ajbc-field">
      {label && <div className="ajbc-field-lbl">{label}</div>}
      <div className={`ajbc-select ${focus ? 'focus' : ''}`} onClick={onClick}>
        <span className={value ? '' : 'ajbc-select-ph'}>{fmtDate(value) || placeholder}</span>
        <i data-lucide="calendar"></i>
      </div>
    </div>
  );
}

Object.assign(window, {
  Badge, StatusDot, CountBadge, Alert,
  Radio, Checkbox, Toggle, Segmented, Tabs, Select,
  Avatar, AvatarStack, ProgressBar, Spinner, Skeleton,
  Chip, Pagination, Breadcrumb, Toast, EmptyState, ListRow,
  Calendar, DateField,
});
