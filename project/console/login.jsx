/* global React */
/* ============================================================
   Notification Engine — Login journey
   Staff console authentication (Employee ID + password).
   Two layout directions, full state machine, bilingual EN/AR,
   light/dark. Demo credentials: 100245 / aljazira
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* Safe Lucide icon for icons whose NAME changes at runtime (e.g. the theme
   toggle). Mirrors template-parts.jsx's Icon: render a stable leaf <i> and
   inject the svg as a child via createElement, so React never tries to
   reconcile (and removeChild) a node lucide.createIcons() already swapped.
   Static icons can keep using <i data-lucide> + the page's createIcons(). */
function LucideIcon({ name }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    const p = String(name).split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const node = (window.lucide.icons && window.lucide.icons[p]) || window.lucide[p];
    el.innerHTML = '';
    if (node && window.lucide.createElement) el.appendChild(window.lucide.createElement(node));
  }, [name]);
  return <i ref={ref} aria-hidden="true"></i>;
}

const VALID_ID = '100245';
const VALID_PW = 'aljazira';
const MAX_ATTEMPTS = 3;

/* ---------- Localization ---------- */
const T = {
  en: {
    eyebrow: 'aljazira bank · notification engine',
    title: 'Sign in to continue',
    lede: 'Use your Aljazira employee credentials to access the notification engine.',
    empId: 'Employee ID',
    empIdPh: 'e.g. 100245',
    password: 'Password',
    passwordPh: 'Enter your password',
    show: 'Show', hide: 'Hide',
    stay: 'Keep me signed in',
    forgot: 'Forgot password?',
    signIn: 'Sign in',
    signingIn: 'Signing in',
    reqId: 'Enter your employee ID',
    reqIdFmt: 'Employee ID is 6 digits',
    reqPw: 'Enter your password',
    invalidT: 'Incorrect employee ID or password',
    invalidD: (n) => `${n} attempt${n === 1 ? '' : 's'} remaining before your account is locked.`,
    lockedT: 'Account locked',
    lockedD: 'Too many failed attempts. Contact the IT service desk to unlock your account.',
    helpdesk: 'Contact IT service desk',
    monitored: 'For authorized staff only. Activity is monitored.',
    brandHead1: 'Every message,',
    brandHead2: 'with care.',
    brandSub: 'The back-office that reaches every customer at the right moment — across in-app, push, SMS and email.',
    secured: 'Secured connection',
    // home
    home: 'Dashboard', campaigns: 'Campaigns', templates: 'Templates',
    approvals: 'Approvals',
    audiences: 'Customers', delivery: 'Delivery', settings: 'Settings',
    navGroup: { workspace: 'Workspace', governance: 'Governance', data: 'Audience & delivery' },
    userName: 'Abdulrahman Al Amri', userRole: 'Compliance · Maker', toggleNav: 'Collapse menu',
    themeLbl: 'Theme', langLbl: 'Language',
    crumb: 'Notification engine',
    welcome: 'Welcome back, Abdulrahman',
    welcomeSub: "Here's what's moving across your channels today.",
    kpiSent: 'Sent today', kpiSched: 'Scheduled', kpiRate: 'Delivery rate',
    recent: 'Recent activity',
    a1t: 'Salary credited — May payroll', a1s: 'Transaction alert · 18,400 recipients',
    a2t: 'Eid offers — World cardholders', a2s: 'Marketing · scheduled for 09:00',
    a3t: 'Statement ready — April', a3s: 'Account update · draft',
    sent: 'Sent', scheduled: 'Scheduled', draft: 'Draft',
  },
  ar: {
    eyebrow: 'بنك الجزيرة · محرّك الإشعارات',
    title: 'تسجيل الدخول للمتابعة',
    lede: 'استخدم بيانات موظف الجزيرة للدخول إلى محرّك الإشعارات.',
    empId: 'الرقم الوظيفي',
    empIdPh: 'مثال: 100245',
    password: 'كلمة المرور',
    passwordPh: 'أدخل كلمة المرور',
    show: 'إظهار', hide: 'إخفاء',
    stay: 'إبقائي مسجّلاً',
    forgot: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول',
    reqId: 'أدخل الرقم الوظيفي',
    reqIdFmt: 'الرقم الوظيفي مكوّن من 6 أرقام',
    reqPw: 'أدخل كلمة المرور',
    invalidT: 'الرقم الوظيفي أو كلمة المرور غير صحيحة',
    invalidD: (n) => `تبقّى ${n} ${n === 1 ? 'محاولة' : 'محاولات'} قبل قفل الحساب.`,
    lockedT: 'تم قفل الحساب',
    lockedD: 'محاولات فاشلة كثيرة. تواصل مع مكتب خدمة تقنية المعلومات لإلغاء قفل حسابك.',
    helpdesk: 'تواصل مع مكتب الخدمة التقنية',
    monitored: 'للموظفين المصرّح لهم فقط. تتم مراقبة النشاط.',
    brandHead1: 'كل رسالة',
    brandHead2: 'بعناية.',
    brandSub: 'الوحدة الخلفية التي تصل إلى كل عميل في اللحظة المناسبة — عبر التطبيق والإشعارات والرسائل والبريد.',
    secured: 'اتصال آمن',
    home: 'لوحة التحكم', campaigns: 'الحملات', templates: 'القوالب',
    approvals: 'الاعتمادات',
    audiences: 'العملاء', delivery: 'التسليم', settings: 'الإعدادات',
    navGroup: { workspace: 'مساحة العمل', governance: 'الحوكمة', data: 'الجمهور والتسليم' },
    userName: 'عبدالرحمن العمري', userRole: 'الالتزام · مُنشئ', toggleNav: 'طيّ القائمة',
    themeLbl: 'السمة', langLbl: 'اللغة',
    crumb: 'محرّك الإشعارات',
    welcome: 'مرحباً بعودتك، عبدالرحمن',
    welcomeSub: 'إليك ما يجري عبر قنواتك اليوم.',
    kpiSent: 'أُرسلت اليوم', kpiSched: 'مجدولة', kpiRate: 'نسبة التسليم',
    recent: 'النشاط الأخير',
    a1t: 'إيداع الراتب — رواتب مايو', a1s: 'تنبيه معاملة · 18,400 مستلم',
    a2t: 'عروض العيد — حاملو بطاقة World', a2s: 'تسويق · مجدولة الساعة 09:00',
    a3t: 'كشف الحساب جاهز — أبريل', a3s: 'تحديث حساب · مسودة',
    sent: 'أُرسلت', scheduled: 'مجدولة', draft: 'مسودة',
  },
};

/* Theme-aware brandmark: white logo on dark surfaces, positive (dark-sand)
   logo on light surfaces. CSS toggles which is shown via the nearest
   [data-theme] ancestor, so it works in either direction automatically. */
function Logo({ cls }) {
  return (
    <span className={`ne-logo ${cls || ''}`}>
      <img className="ne-logo-dark" src="../assets/logo-white.svg" alt="aljazira bank" />
      <img className="ne-logo-light" src="../assets/logo-black.svg" alt="aljazira bank" />
    </span>
  );
}

/* ============================================================
   Shared sign-in form
   ============================================================ */
function SignInForm({ t, lang }) {
  const ctx = React.useContext(LoginCtx);
  const { status, attempts, fieldErr, id, pw, setId, setPw, submit } = ctx;
  const [showPw, setShowPw] = useState(false);
  const [stay, setStay] = useState(true);
  const loading = status === 'loading';
  const locked = status === 'locked';
  const remaining = MAX_ATTEMPTS - attempts;

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="ne-form">
      <div className="ne-eyebrow">{t.eyebrow}</div>
      <h1 className="ne-title">{t.title}</h1>
      <p className="ne-lede">{t.lede}</p>

      {status === 'invalid' && (
        <div className="ajb-alert ajb-alert--danger" role="alert">
          <div className="ajb-alert__ico"><i data-lucide="alert-circle"></i></div>
          <div className="ajb-alert__body">
            <div className="ajb-alert__title">{t.invalidT}</div>
            {remaining > 0 && <div className="ajb-alert__desc">{t.invalidD(remaining)}</div>}
          </div>
        </div>
      )}
      {locked && (
        <div className="ajb-alert ajb-alert--danger" role="alert">
          <div className="ajb-alert__ico"><i data-lucide="lock"></i></div>
          <div className="ajb-alert__body">
            <div className="ajb-alert__title">{t.lockedT}</div>
            <div className="ajb-alert__desc">{t.lockedD}</div>
          </div>
        </div>
      )}

      <div className="ajb-field ne-field">
        <label className="ajb-field__label">{t.empId}</label>
        <div className="ne-input-wrap">
          <input
            className="ajb-input ajb-input--boxed"
            inputMode="numeric"
            dir="ltr"
            style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
            value={id}
            placeholder={t.empIdPh}
            disabled={loading || locked}
            onChange={(e) => setId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            onKeyDown={onKey}
          />
        </div>
        {fieldErr.id && <div className="ajb-helper ajb-helper--error">{t[fieldErr.id]}</div>}
      </div>

      <div className="ajb-field ne-field">
        <label className="ajb-field__label">{t.password}</label>
        <div className="ne-input-wrap">
          <input
            className="ajb-input ajb-input--boxed ne-haseye"
            type={showPw ? 'text' : 'password'}
            value={pw}
            placeholder={t.passwordPh}
            disabled={loading || locked}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={onKey}
          />
          <button type="button" className="ne-eye" tabIndex={-1} onClick={() => setShowPw(!showPw)}>
            {showPw ? t.hide : t.show}
          </button>
        </div>
        {fieldErr.pw && <div className="ajb-helper ajb-helper--error">{t[fieldErr.pw]}</div>}
      </div>

      <div className="ne-row">
        <span className="ajb-option" onClick={() => setStay(!stay)} style={{ cursor: 'pointer' }}>
          <span className={`ajb-check ${stay ? 'is-on' : ''}`}></span>
          {t.stay}
        </span>
        <a className="ne-link" href="#" onClick={(e) => e.preventDefault()}>{t.forgot}</a>
      </div>

      <button className="ajb-btn ajb-btn--sand ne-submit" disabled={loading || locked} onClick={submit}>
        {loading ? <React.Fragment><span className="ajb-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{t.signingIn}</React.Fragment> : t.signIn}
      </button>

      <div className="ne-foot-note">
        <span>{t.monitored}</span>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.helpdesk}</a>
      </div>
    </div>
  );
}

/* ============================================================
   Direction A — Brand split
   ============================================================ */
function DirectionA({ t, lang, theme, setTheme, setLang }) {
  return (
    <div className="ne-split">
      <div className="ne-brand">
        <div className="ne-brand-photo" style={{ backgroundImage: 'url(../assets/scenery-desert-sunrise.png)' }} />
        <div className="ne-brand-scrim" />
        <img className="ne-brand-j" src="../assets/j-shape.svg" alt="" />
        <Logo cls="ne-brand-logo" />
        <div className="ne-brand-head-block">
          <h2 className="ne-brand-head">
            {t.brandHead1}<br /><span className="ajb-accent">{t.brandHead2}</span>
          </h2>
          <p className="ne-brand-sub">{t.brandSub}</p>
        </div>
      </div>
      <div className="ne-formside">
        {(setTheme || setLang) && (
          <div className="ne-utilcluster">
            {setTheme && (
              <button type="button" className="ne-iconbtn"
                aria-label={t.themeLbl || 'Theme'} title={t.themeLbl || 'Theme'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <LucideIcon name={theme === 'dark' ? 'sun' : 'moon'} />
              </button>
            )}
            {setLang && (
              <button type="button" className="ne-iconbtn ne-iconbtn--lang"
                aria-label={t.langLbl || 'Language'} title={t.langLbl || 'Language'}
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                <span className="ne-langglyph" aria-hidden="true"><span className="ne-langglyph-en">E</span><span className="ne-langglyph-ar">ع</span></span>
              </button>
            )}
          </div>
        )}
        <SignInForm t={t} lang={lang} />
      </div>
    </div>
  );
}

/* ============================================================
   Success landing — Notification Engine home (stub)
   ============================================================ */
function ConsoleHome({ t, theme, setTheme, lang, setLang }) {
  const groups = [
    { id: 'workspace', items: [
      { id: 'home', icon: 'layout-dashboard', on: true },
      { id: 'campaigns', icon: 'send' },
      { id: 'templates', icon: 'file-text', href: 'Templates.html' },
    ] },
    { id: 'governance', items: [
      { id: 'approvals', icon: 'check-check', href: 'Approvals.html', badge: 5 },
    ] },
    { id: 'data', items: [
      { id: 'audiences', icon: 'users' },
      { id: 'delivery', icon: 'activity' },
    ] },
  ];
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('ne-side-collapsed') === '1'; } catch (e) { return false; }
  });
  const toggleSide = () => setCollapsed(c => {
    const next = !c;
    try { localStorage.setItem('ne-side-collapsed', next ? '1' : '0'); } catch (e) {}
    return next;
  });
  // account panel (shared component) — strings/email come from TPL when present
  const acctT = (window.TPL && window.TPL.T[lang] && window.TPL.T[lang].acct) || {};
  const acctEmail = (window.TPL && window.TPL.PROFILE && window.TPL.PROFILE.email) || '';
  let acctVariant = 'anchored';
  try { acctVariant = localStorage.getItem('ne-acct-variant') || 'anchored'; } catch (e) {}
  const [acctOpen, setAcctOpen] = useState(false);
  const navItem = (n) => (
    <div key={n.id} className={`ne-nav-item ${n.on ? 'on' : ''}`}
      title={collapsed ? t[n.id] : undefined}
      onClick={() => { if (n.href) window.location.href = n.href; }}>
      <i data-lucide={n.icon}></i>
      <span className="ne-nav-label">{t[n.id]}</span>
      {n.badge ? <React.Fragment>
        <span className="ajb-count ajb-count--sand ne-nav-badge">{n.badge}</span>
        <span className="ne-nav-dot" />
      </React.Fragment> : null}
    </div>
  );
  const acts = [
    { icon: 'banknote', t: t.a1t, s: t.a1s, pill: 'sent', label: t.sent },
    { icon: 'gift', t: t.a2t, s: t.a2s, pill: 'sched', label: t.scheduled },
    { icon: 'receipt', t: t.a3t, s: t.a3s, pill: 'draft', label: t.draft },
  ];
  return (
    <div className="ne-home ne-enter" data-collapsed={collapsed ? '' : undefined}>
      <aside className="ne-side">
        <span className="ne-logo ne-side-logo">
          <img className="ne-logo-dark ne-logo-word" src="../assets/logo-white.svg" alt="aljazira bank" />
          <img className="ne-logo-light ne-logo-word" src="../assets/logo-black.svg" alt="aljazira bank" />
          <img className="ne-logo-symbol" src="../assets/logo-ajb-symbol-white.png" alt="ajb" />
        </span>
        {groups.map(g => (
          <React.Fragment key={g.id}>
            <div className="ne-nav-group"><span>{(t.navGroup && t.navGroup[g.id]) || g.id}</span></div>
            {g.items.map(navItem)}
          </React.Fragment>
        ))}
        <div className="ne-side-sp" />
        {navItem({ id: 'settings', icon: 'settings' })}
        <div className="ne-side-divider" />
        <div className={`ne-side-user${acctOpen ? ' is-active' : ''}`} role="button" tabIndex={0}
          title={collapsed ? t.userName : undefined}
          aria-haspopup="dialog" aria-expanded={acctOpen} aria-label={acctT.open}
          onClick={() => setAcctOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAcctOpen(true); } }}>
          <span className="ajb-avatar ajb-avatar--sm"><span>A</span></span>
          <span className="ne-side-user-txt">
            <span className="ne-side-user-name">{t.userName}</span>
            <span className="ne-side-user-role">{t.userRole}</span>
          </span>
          <span className="ne-side-user-act"><i data-lucide="chevron-right"></i></span>
        </div>
      </aside>
      <AccountPanel open={acctOpen} onClose={() => setAcctOpen(false)}
        user={{ initial: 'A', name: t.userName, role: t.userRole, email: acctEmail }}
        t={acctT} variant={acctVariant} dir={lang === 'ar' ? 'rtl' : 'ltr'}
        profileHref="Profile.html" settingsHref="Settings.html" loginHref="Login Journey.html" />
      <div className="ne-main">
        <div className="ne-topbar">
          <button type="button" className="ne-side-toggle" onClick={toggleSide}
            aria-label={t.toggleNav} title={t.toggleNav}><i data-lucide="panel-left"></i></button>
          <img className="ne-topbar-mark" src="../assets/logo-ajb-symbol-white.png" alt="aljazira" />
          <span className="ne-topbar-t">{t.crumb}</span>
          <div className="ne-topbar-r">
            {setTheme && (
              <button type="button" className="ne-iconbtn" aria-label={t.themeLbl || 'Theme'} title={t.themeLbl || 'Theme'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <LucideIcon name={theme === 'dark' ? 'sun' : 'moon'} />
              </button>
            )}
            {setLang && (
              <button type="button" className="ne-iconbtn ne-iconbtn--lang" aria-label={t.langLbl || 'Language'} title={t.langLbl || 'Language'}
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                <span className="ne-langglyph" aria-hidden="true"><span className="ne-langglyph-en">E</span><span className="ne-langglyph-ar">ع</span></span>
              </button>
            )}
            <button className="ne-iconbtn"><i data-lucide="bell"></i><span className="dot" /></button>
          </div>
        </div>
        <div className="ne-content">
          <h1 className="ne-welcome">{t.welcome}</h1>
          <p className="ne-welcome-sub">{t.welcomeSub}</p>
          <div className="ne-kpis">
            <div className="ajb-card"><div className="ajb-stat"><div className="ajb-stat__label">{t.kpiSent}</div><div className="ajb-stat__value ajb-ltr">24,180</div><div className="ajb-stat__delta ajb-stat__delta--up">+8.2%</div></div></div>
            <div className="ajb-card"><div className="ajb-stat"><div className="ajb-stat__label">{t.kpiSched}</div><div className="ajb-stat__value ajb-ltr">7</div></div></div>
            <div className="ajb-card"><div className="ajb-stat"><div className="ajb-stat__label">{t.kpiRate}</div><div className="ajb-stat__value ajb-ltr">99.4%</div><div className="ajb-stat__delta ajb-stat__delta--up">+0.3%</div></div></div>
          </div>
          <div className="ajb-card ne-panel">
            <h3 className="ne-panel-h">{t.recent}</h3>
            <div className="ne-acts">
            {acts.map((a, i) => {
              const variant = { sent: 'success', sched: 'info', draft: 'neutral' }[a.pill];
              return (
              <div className="ajb-li" key={i}>
                <div className="ajb-li__ico"><i data-lucide={a.icon}></i></div>
                <div className="ajb-li__mid">
                  <div className="ajb-li__title">{a.t}</div>
                  <div className="ajb-li__sub">{a.s}</div>
                </div>
                <span className={`ajb-badge ajb-badge--${variant}`}>{a.label}</span>
              </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SignInForm = SignInForm;
window.DirectionA = DirectionA;
window.ConsoleHome = ConsoleHome;
window.T = T;
window.NE_VALID = { id: VALID_ID, pw: VALID_PW, max: MAX_ATTEMPTS };
