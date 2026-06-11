/* global React */

function AjbButton({ variant = 'primary', children, onClick, icon }) {
  const cls = `ajb-app-btn ajb-app-btn-${variant}`;
  return (
    <button className={cls} onClick={onClick}>
      {icon && <i data-lucide={icon}></i>}
      <span>{children}</span>
    </button>
  );
}

function AjbBalance({ amount, currency = 'SAR', delta }) {
  const [whole, dec] = String(amount).split('.');
  return (
    <div className="ajb-app-balance">
      <div className="ajb-app-balance-row">
        <div className="ajb-app-balance-value">
          {Number(whole).toLocaleString()}
          {dec && <span className="ajb-app-balance-dec">.{dec}</span>}
        </div>
        <div className="ajb-app-balance-currency">{currency}</div>
      </div>
      {delta && <div className={`ajb-app-balance-delta ${delta.startsWith('-') ? 'neg' : 'pos'}`}>{delta}</div>}
    </div>
  );
}

function AjbTxRow({ name, sub, amount, icon, neg }) {
  return (
    <div className="ajb-app-tx">
      <div className="ajb-app-tx-ico"><i data-lucide={icon}></i></div>
      <div className="ajb-app-tx-mid">
        <div className="ajb-app-tx-name">{name}</div>
        <div className="ajb-app-tx-sub">{sub}</div>
      </div>
      <div className={`ajb-app-tx-amt ${neg ? 'neg' : 'pos'}`}>
        {neg ? '-' : '+'} {amount}
      </div>
    </div>
  );
}

function AjbAccountChip({ label, last4, balance, active, onClick }) {
  return (
    <button className={`ajb-app-chip ${active ? 'on' : ''}`} onClick={onClick}>
      <div className="ajb-app-chip-l">
        <div className="ajb-app-chip-label">{label}</div>
        <div className="ajb-app-chip-last">•••• {last4}</div>
      </div>
      <div className="ajb-app-chip-bal">{balance}</div>
    </button>
  );
}

function AjbHeader({ title, action, onBack }) {
  return (
    <div className="ajb-app-header">
      {onBack ? <button className="ajb-app-header-back" onClick={onBack}><i data-lucide="chevron-left"></i></button> : <span />}
      <div className="ajb-app-header-title">{title}</div>
      <div className="ajb-app-header-action">{action}</div>
    </div>
  );
}

Object.assign(window, { AjbButton, AjbBalance, AjbTxRow, AjbAccountChip, AjbHeader });
