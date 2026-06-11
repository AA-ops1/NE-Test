/* global React, useApp, AjbButton, AjbBalance, AjbTxRow, AjbAccountChip, AjbHeader */
const { useEffect } = React;

/* ---------- ONBOARDING ---------- */
function Onboarding() {
  const { setScreen } = useApp();
  return (
    <div className="ajb-app-screen ajb-app-onboard">
      <div className="ajb-app-onboard-photo" style={{backgroundImage:'url(../../assets/scenery-desert-sunrise.png)'}} />
      <div className="ajb-app-onboard-copy">
        <img className="ajb-app-onboard-logo" src="../../assets/logo-white.svg" alt="" />
        <h1 className="ajb-app-onboard-h">
          <span className="ajb-accent">Wealth</span><br/>grows here.
        </h1>
        <p className="ajb-app-onboard-sub">Your bank, your journey — wherever the day takes you.</p>
        <div className="ajb-app-onboard-cta">
          <AjbButton variant="primary" onClick={() => setScreen('home')}>Sign in</AjbButton>
          <AjbButton variant="ghost" onClick={() => setScreen('home')}>Create an account</AjbButton>
        </div>
        <div className="ajb-app-onboard-foot">
          <span><i data-lucide="fingerprint"></i> Biometric</span>
          <span><i data-lucide="lock"></i> Encrypted</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- HOME ---------- */
const HOME_TX = [
  { name: 'Coffee · Half Million', sub: 'Today · 8:42', amount: '24.00 SAR', icon: 'coffee', neg: true },
  { name: 'Salary · Aramco', sub: 'Yesterday', amount: '18,400.00 SAR', icon: 'briefcase', neg: false },
  { name: 'STC postpaid', sub: 'May 16', amount: '210.00 SAR', icon: 'phone', neg: true },
  { name: 'AlMutlaq home rent', sub: 'May 14', amount: '4,800.00 SAR', icon: 'home', neg: true },
  { name: 'Refund · Jarir', sub: 'May 11', amount: '149.00 SAR', icon: 'package', neg: false },
];

function Home() {
  const { setScreen } = useApp();
  return (
    <div className="ajb-app-screen ajb-app-home">
      <div className="ajb-app-home-top">
        <div className="ajb-app-greeting">
          <div className="ajb-app-greeting-l">Marhaba,</div>
          <div className="ajb-app-greeting-n">Layla</div>
        </div>
        <div className="ajb-app-home-icons">
          <button><i data-lucide="search"></i></button>
          <button><i data-lucide="bell"></i><span className="dot"/></button>
        </div>
      </div>

      <div className="ajb-app-card-account">
        <div className="ajb-app-card-account-label">Current account · SAR</div>
        <AjbBalance amount="28492.18" delta="+1.2% this month" />
        <div className="ajb-app-card-account-foot">
          <span>•••• 4429</span>
          <button onClick={() => setScreen('transactions')}>View statement <i data-lucide="arrow-right"></i></button>
        </div>
      </div>

      <div className="ajb-app-quick">
        <button onClick={() => setScreen('transfer')}>
          <span className="ico"><i data-lucide="arrow-up-right"></i></span>
          <span>Transfer</span>
        </button>
        <button>
          <span className="ico"><i data-lucide="qr-code"></i></span>
          <span>Pay</span>
        </button>
        <button>
          <span className="ico"><i data-lucide="plus"></i></span>
          <span>Top up</span>
        </button>
        <button onClick={() => setScreen('card')}>
          <span className="ico"><i data-lucide="credit-card"></i></span>
          <span>Card</span>
        </button>
      </div>

      <div className="ajb-app-goal">
        <div className="ajb-app-goal-l">
          <div className="ajb-app-goal-label">Saving for</div>
          <div className="ajb-app-goal-title">Hajj 2026</div>
        </div>
        <div className="ajb-app-goal-r">
          <div className="ajb-app-goal-pct">62%</div>
          <div className="ajb-app-goal-amt">62k / 100k SAR</div>
        </div>
        <div className="ajb-app-goal-bar"><div style={{width:'62%'}}/></div>
      </div>

      <div className="ajb-app-sec-head">
        <div>Recent activity</div>
        <button onClick={() => setScreen('transactions')}>See all</button>
      </div>
      <div className="ajb-app-tx-list">
        {HOME_TX.slice(0,4).map((t,i) => <AjbTxRow key={i} {...t} />)}
      </div>
    </div>
  );
}

/* ---------- TRANSACTIONS ---------- */
const ALL_TX = [
  { day: 'Today', items: [
    { name: 'Coffee · Half Million', sub: 'F&B · 8:42', amount: '24.00 SAR', icon: 'coffee', neg: true },
    { name: 'STC data top-up', sub: 'Bill · 7:30', amount: '60.00 SAR', icon: 'wifi', neg: true },
  ]},
  { day: 'Yesterday', items: [
    { name: 'Salary · Aramco', sub: 'Income', amount: '18,400.00 SAR', icon: 'briefcase', neg: false },
    { name: 'Uber', sub: 'Transport · 22:15', amount: '38.40 SAR', icon: 'car', neg: true },
    { name: 'AlBaik', sub: 'F&B · 19:02', amount: '52.00 SAR', icon: 'utensils', neg: true },
  ]},
  { day: 'May 14, 2026', items: [
    { name: 'AlMutlaq home rent', sub: 'Bill', amount: '4,800.00 SAR', icon: 'home', neg: true },
    { name: 'Hajj fund transfer', sub: 'Goal', amount: '2,000.00 SAR', icon: 'arrow-up-right', neg: true },
  ]},
];

function Transactions() {
  const { setScreen } = useApp();
  return (
    <div className="ajb-app-screen ajb-app-txs">
      <AjbHeader title="Current account" onBack={() => setScreen('home')}
        action={<button className="ajb-app-icon-btn"><i data-lucide="sliders-horizontal"></i></button>}/>
      <div className="ajb-app-txs-summary">
        <AjbBalance amount="28492.18" />
        <div className="ajb-app-txs-segments">
          <button className="on">All</button>
          <button>In</button>
          <button>Out</button>
        </div>
      </div>
      <div className="ajb-app-tx-list">
        {ALL_TX.map((g, i) => (
          <React.Fragment key={i}>
            <div className="ajb-app-tx-day">{g.day}</div>
            {g.items.map((t, j) => <AjbTxRow key={j} {...t} />)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- TRANSFER ---------- */
const RECIPIENTS = [
  { id: 'a', name: 'Mom · Fatimah',  sub: 'SA __ __20 1442',         color: '#8c684a', initials: 'F' },
  { id: 'b', name: 'Khalid',         sub: 'SA __ __87 9931',         color: '#33b793', initials: 'K' },
  { id: 'c', name: 'AlMutlaq Group', sub: 'Rent · auto-suggestion',  color: '#6c7378', initials: 'A' },
  { id: 'd', name: 'Noor',           sub: 'SA __ __04 5588',         color: '#b27f59', initials: 'N' },
];

function TransferStep1({ onPick }) {
  return (
    <div className="ajb-app-transfer-step">
      <div className="ajb-app-eyebrow">Step 1 of 3</div>
      <h2 className="ajb-app-step-h">Send to</h2>
      <div className="ajb-app-input-wrap">
        <i data-lucide="search"></i>
        <input placeholder="Name, IBAN, or mobile" />
      </div>
      <div className="ajb-app-sec-head plain">Recent</div>
      <div className="ajb-app-recipient-list">
        {RECIPIENTS.map(r => (
          <button key={r.id} className="ajb-app-recipient" onClick={() => onPick(r)}>
            <div className="ajb-app-recipient-av" style={{background:r.color}}>{r.initials}</div>
            <div className="ajb-app-recipient-m">
              <div className="ajb-app-recipient-n">{r.name}</div>
              <div className="ajb-app-recipient-s">{r.sub}</div>
            </div>
            <i data-lucide="chevron-right"></i>
          </button>
        ))}
      </div>
    </div>
  );
}

function TransferStep2({ recipient, amount, setAmount, onNext, onBack }) {
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  const tap = (k) => {
    if (k === '⌫') setAmount(amount.slice(0,-1));
    else if (k === '.' && amount.includes('.')) return;
    else if (amount.length >= 9) return;
    else setAmount((amount === '0' && k !== '.') ? k : amount + k);
  };
  return (
    <div className="ajb-app-transfer-step">
      <div className="ajb-app-eyebrow">Step 2 of 3</div>
      <h2 className="ajb-app-step-h">To <span className="ajb-accent">{recipient.name.split(' ')[0]}</span></h2>
      <div className="ajb-app-transfer-amt">
        <div className="ajb-app-transfer-amt-cur">SAR</div>
        <div className="ajb-app-transfer-amt-val">{amount || '0'}</div>
      </div>
      <div className="ajb-app-transfer-note">From current account · 28,492 SAR available</div>
      <div className="ajb-app-keypad">
        {keys.map(k => <button key={k} onClick={() => tap(k)}>{k}</button>)}
      </div>
      <AjbButton variant="primary" onClick={onNext}>Review transfer</AjbButton>
    </div>
  );
}

function TransferStep3({ recipient, amount, onConfirm, onBack }) {
  return (
    <div className="ajb-app-transfer-step center">
      <div className="ajb-app-eyebrow">Step 3 of 3</div>
      <h2 className="ajb-app-step-h">Review</h2>
      <div className="ajb-app-receipt">
        <div className="row"><span>To</span><span>{recipient.name}</span></div>
        <div className="row"><span>IBAN</span><span>{recipient.sub}</span></div>
        <div className="row"><span>From</span><span>Current · ••••4429</span></div>
        <div className="row big"><span>Amount</span><span><span className="ajb-accent">{amount || '0'}</span> SAR</span></div>
        <div className="row"><span>Fee</span><span>Free</span></div>
        <div className="row"><span>Arrives</span><span>Instantly</span></div>
      </div>
      <AjbButton variant="primary" onClick={onConfirm}>Hold to confirm</AjbButton>
      <button className="ajb-app-text-btn" onClick={onBack}>Edit amount</button>
    </div>
  );
}

function TransferDone({ recipient, amount, onDone }) {
  return (
    <div className="ajb-app-transfer-done">
      <div className="ajb-app-done-ico"><i data-lucide="check"></i></div>
      <h2 className="ajb-app-done-h">Sent.</h2>
      <p className="ajb-app-done-s"><span className="ajb-accent">{amount} SAR</span> on its way to {recipient.name.split(' ')[0]}.</p>
      <AjbButton variant="primary" onClick={onDone}>Done</AjbButton>
    </div>
  );
}

function Transfer() {
  const { transferStep, setTransferStep, transferRecipient, setTransferRecipient, transferAmount, setTransferAmount, setScreen, resetTransfer } = useApp();

  if (transferStep === 4) {
    return (
      <div className="ajb-app-screen ajb-app-transfer">
        <TransferDone recipient={transferRecipient} amount={transferAmount} onDone={() => { resetTransfer(); setScreen('home'); }} />
      </div>
    );
  }

  return (
    <div className="ajb-app-screen ajb-app-transfer">
      <AjbHeader title="Transfer" onBack={() => { if (transferStep === 0) { setScreen('home'); } else { setTransferStep(transferStep - 1); } }}/>
      {transferStep === 0 && <TransferStep1 onPick={(r) => { setTransferRecipient(r); setTransferStep(1); }} />}
      {transferStep === 1 && <TransferStep2 recipient={transferRecipient} amount={transferAmount} setAmount={setTransferAmount} onNext={() => setTransferStep(2)} onBack={() => setTransferStep(0)} />}
      {transferStep === 2 && <TransferStep3 recipient={transferRecipient} amount={transferAmount} onConfirm={() => setTransferStep(4)} onBack={() => setTransferStep(1)} />}
    </div>
  );
}

/* ---------- CARD ---------- */
function CardScreen() {
  const { setScreen } = useApp();
  const [frozen, setFrozen] = React.useState(false);
  return (
    <div className="ajb-app-screen ajb-app-card-screen">
      <AjbHeader title="Aljazira World" onBack={() => setScreen('home')}
        action={<button className="ajb-app-icon-btn"><i data-lucide="ellipsis"></i></button>}/>
      <div className="ajb-app-card-art">
        <div className="ajb-app-card-art-inner">
          <div className="ajb-app-card-art-top">
            <img src="../../assets/logo-ajb-symbol-white.png" alt="ajb" />
            <span>WORLD</span>
          </div>
          <div className="ajb-app-card-art-num">4929 ···· ···· 4429</div>
          <div className="ajb-app-card-art-bottom">
            <div><div className="l">Cardholder</div><div className="v">LAYLA AL-JOHANI</div></div>
            <div><div className="l">Exp</div><div className="v">11/29</div></div>
          </div>
        </div>
      </div>
      <div className="ajb-app-card-stats">
        <div><div className="l">Spent this month</div><div className="v">3,240 SAR</div></div>
        <div><div className="l">Available limit</div><div className="v">21,760 SAR</div></div>
      </div>
      <div className="ajb-app-card-actions">
        <button className={frozen ? 'on' : ''} onClick={() => setFrozen(!frozen)}>
          <i data-lucide={frozen ? 'snowflake' : 'lock'}></i>
          <span>{frozen ? 'Card frozen' : 'Freeze card'}</span>
        </button>
        <button><i data-lucide="file-text"></i><span>Statement</span></button>
        <button><i data-lucide="settings"></i><span>Settings</span></button>
      </div>
      <div className="ajb-app-card-rewards">
        <div className="ajb-app-card-rewards-l">
          <div className="ajb-app-eyebrow">Aljazira miles</div>
          <div className="ajb-app-card-rewards-v">12,420</div>
        </div>
        <button className="ajb-app-text-btn ajb-accent">Redeem →</button>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, Home, Transactions, Transfer, CardScreen });
