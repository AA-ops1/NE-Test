/* global React */
/* ============================================================
   Side-menu exploration — five rail variants.
   Pure presentation. Uses a local Icon (lucide innerHTML pattern).
   ============================================================ */
const { useRef: useSR, useEffect: useSE } = React;

function smPascal(name) {
  return String(name).split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}
function SIcon({ name }) {
  const ref = useSR(null);
  useSE(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    const p = smPascal(name);
    const node = (window.lucide.icons && window.lucide.icons[p]) || window.lucide[p];
    el.innerHTML = '';
    if (node && window.lucide.createElement) el.appendChild(window.lucide.createElement(node));
  }, [name]);
  return <i ref={ref} aria-hidden="true"></i>;
}

/* nav model (active = Templates everywhere, for fair comparison) */
const NAV = [
  { id: 'home', icon: 'layout-dashboard', label: 'Dashboard', group: 'workspace' },
  { id: 'campaigns', icon: 'send', label: 'Campaigns', group: 'workspace' },
  { id: 'templates', icon: 'file-text', label: 'Templates', group: 'workspace', on: true },
  { id: 'approvals', icon: 'check-check', label: 'Approvals', group: 'governance', badge: 5 },
  { id: 'customers', icon: 'users', label: 'Customers', group: 'data' },
  { id: 'delivery', icon: 'activity', label: 'Delivery', group: 'data' },
  { id: 'settings', icon: 'settings', label: 'Settings', group: 'system' },
];
const GROUPS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'governance', label: 'Governance' },
  { id: 'data', label: 'Audience & delivery' },
];

const LOGO = '../assets/logo-white.svg';
const SYMBOL = '../assets/logo-ajb-symbol-white.png';
const JSHAPE = '../assets/j-shape.svg';

function Item({ n, badgeClass }) {
  return (
    <div className={`sm-item ${n.on ? 'on' : ''}`}>
      <SIcon name={n.icon} />
      <span>{n.label}</span>
      {n.badge ? <span className={`sm-badge ${badgeClass || ''}`}>{n.badge}</span> : null}
    </div>
  );
}

/* ---------- A · Current (baseline) ---------- */
function RailA() {
  return (
    <div className="sm-rail sm-a">
      <span className="sm-logo"><img src={LOGO} alt="aljazira bank" /></span>
      <nav className="sm-nav">
        {NAV.map(n => <Item key={n.id} n={n} />)}
      </nav>
      <div className="sm-spacer" />
    </div>
  );
}

/* ---------- B · Grouped + user footer ---------- */
function RailB() {
  const main = NAV.filter(n => n.group !== 'system');
  return (
    <div className="sm-rail sm-b">
      <span className="sm-logo"><img src={LOGO} alt="aljazira bank" /></span>
      <nav className="sm-nav">
        {GROUPS.map(g => (
          <React.Fragment key={g.id}>
            <div className="sm-grouplbl">{g.label}</div>
            {main.filter(n => n.group === g.id).map(n => <Item key={n.id} n={n} badgeClass="sm-badge--soft" />)}
          </React.Fragment>
        ))}
      </nav>
      <div className="sm-spacer" />
      <Item n={NAV.find(n => n.id === 'settings')} />
      <div className="sm-divider" />
      <div className="sm-b-footer">
        <div className="sm-user">
          <span className="sm-avatar">A</span>
          <span className="sm-user-txt">
            <span className="sm-user-name">Abdulrahman Al Amri</span>
            <span className="sm-user-role">Compliance · Maker</span>
          </span>
          <span className="sm-user-act"><SIcon name="log-out" /></span>
        </div>
      </div>
    </div>
  );
}

/* ---------- C · Icon rail (collapsed) ---------- */
function RailC() {
  return (
    <div className="sm-rail sm-c">
      <img className="sm-symbol" src={SYMBOL} alt="ajb" />
      <nav className="sm-nav">
        {NAV.map(n => (
          <div key={n.id} className={`sm-item ${n.on ? 'on' : ''}`} title={n.label}>
            <SIcon name={n.icon} />
            {n.badge ? <span className="sm-badge sm-badge--dot" /> : null}
          </div>
        ))}
      </nav>
      <div className="sm-spacer" />
      <span className="sm-avatar">A</span>
    </div>
  );
}

/* ---------- D · Soft console (switcher + search + indicator) ---------- */
function RailD() {
  return (
    <div className="sm-rail sm-d">
      <div className="sm-switch">
        <span className="sm-switch-mark"><img src={SYMBOL} alt="ajb" /></span>
        <span className="sm-switch-txt">
          <span className="sm-switch-name">Notification Engine</span>
          <span className="sm-switch-sub">aljazira bank</span>
        </span>
        <span className="sm-switch-cv"><SIcon name="chevrons-up-down" /></span>
      </div>
      <div className="sm-search"><SIcon name="search" /><span>Search…</span></div>
      <nav className="sm-nav">
        {NAV.filter(n => n.id !== 'settings').map(n => <Item key={n.id} n={n} badgeClass="sm-badge--soft" />)}
      </nav>
      <div className="sm-spacer" />
      <Item n={NAV.find(n => n.id === 'settings')} />
      <div className="sm-d-footer">
        <span className="sm-avatar">A</span>
        <span className="sm-user-txt">
          <span className="sm-user-name">Abdulrahman Al Amri</span>
          <span className="sm-user-role">Compliance</span>
        </span>
        <span className="sm-env"><span className="sm-env-dot" />Live</span>
      </div>
    </div>
  );
}

/* ---------- E · Branded (J-shape header) ---------- */
function RailE() {
  const main = NAV.filter(n => n.group !== 'system');
  return (
    <div className="sm-rail sm-e">
      <div className="sm-e-hdr">
        <img className="sm-e-jbg" src={JSHAPE} alt="" />
        <span className="sm-logo"><img src={LOGO} alt="aljazira bank" /></span>
        <div className="sm-e-tag">Notification Engine</div>
      </div>
      <div className="sm-e-body">
        <nav className="sm-nav">
          {GROUPS.map(g => (
            <React.Fragment key={g.id}>
              <div className="sm-grouplbl">{g.label}</div>
              {main.filter(n => n.group === g.id).map(n => <Item key={n.id} n={n} badgeClass="sm-badge--soft" />)}
            </React.Fragment>
          ))}
        </nav>
        <div className="sm-spacer" />
        <Item n={NAV.find(n => n.id === 'settings')} />
      </div>
      <div className="sm-e-footer">
        <div className="sm-user">
          <span className="sm-avatar">A</span>
          <span className="sm-user-txt">
            <span className="sm-user-name">Abdulrahman Al Amri</span>
            <span className="sm-user-role">Compliance · Maker</span>
          </span>
          <span className="sm-user-act"><SIcon name="chevron-right" /></span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RailA, RailB, RailC, RailD, RailE, SIcon });
