import React, { useState, useEffect, useRef, useCallback, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Icon from '../components/Icon';

export const LoginCtx = createContext(null);

const VALID_ID = '100245';
const VALID_PW = 'aljazira';
const MAX_ATTEMPTS = 3;

const T = {
  en: {
    eyebrow: 'aljazira bank · notification engine',
    title: 'Sign in to continue',
    lede: 'Use your Aljazira employee credentials to access the notification engine.',
    empId: 'Employee ID', empIdPh: 'e.g. 100245',
    password: 'Password', passwordPh: 'Enter your password',
    show: 'Show', hide: 'Hide',
    stay: 'Keep me signed in', forgot: 'Forgot password?',
    signIn: 'Sign in', signingIn: 'Signing in',
    reqId: 'Enter your employee ID', reqIdFmt: 'Employee ID is 6 digits',
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
    themeLbl: 'Theme', langLbl: 'Language',
  },
  ar: {
    eyebrow: 'بنك الجزيرة · محرّك الإشعارات',
    title: 'تسجيل الدخول للمتابعة',
    lede: 'استخدم بيانات موظف الجزيرة للدخول إلى محرّك الإشعارات.',
    empId: 'الرقم الوظيفي', empIdPh: 'مثال: 100245',
    password: 'كلمة المرور', passwordPh: 'أدخل كلمة المرور',
    show: 'إظهار', hide: 'إخفاء',
    stay: 'إبقائي مسجّلاً', forgot: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول', signingIn: 'جارٍ تسجيل الدخول',
    reqId: 'أدخل الرقم الوظيفي', reqIdFmt: 'الرقم الوظيفي مكوّن من 6 أرقام',
    reqPw: 'أدخل كلمة المرور',
    invalidT: 'الرقم الوظيفي أو كلمة المرور غير صحيحة',
    invalidD: (n) => `تبقّى ${n} ${n === 1 ? 'محاولة' : 'محاولات'} قبل قفل الحساب.`,
    lockedT: 'تم قفل الحساب',
    lockedD: 'محاولات فاشلة كثيرة. تواصل مع مكتب خدمة تقنية المعلومات لإلغاء قفل حسابك.',
    helpdesk: 'تواصل مع مكتب الخدمة التقنية',
    monitored: 'للموظفين المصرّح لهم فقط. تتم مراقبة النشاط.',
    brandHead1: 'كل رسالة', brandHead2: 'بعناية.',
    brandSub: 'الوحدة الخلفية التي تصل إلى كل عميل في اللحظة المناسبة — عبر التطبيق والإشعارات والرسائل والبريد.',
    secured: 'اتصال آمن',
    themeLbl: 'السمة', langLbl: 'اللغة',
  },
};

function Logo({ cls }) {
  return (
    <span className={`ne-logo ${cls || ''}`}>
      <img className="ne-logo-dark" src="/assets/logo-white.svg" alt="aljazira bank" />
      <img className="ne-logo-light" src="/assets/logo-black.svg" alt="aljazira bank" />
    </span>
  );
}

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
          <div className="ajb-alert__ico"><Icon name="alert-circle" /></div>
          <div className="ajb-alert__body">
            <div className="ajb-alert__title">{t.invalidT}</div>
            {remaining > 0 && <div className="ajb-alert__desc">{t.invalidD(remaining)}</div>}
          </div>
        </div>
      )}
      {locked && (
        <div className="ajb-alert ajb-alert--danger" role="alert">
          <div className="ajb-alert__ico"><Icon name="lock" /></div>
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
        {loading
          ? <><span className="ajb-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{t.signingIn}</>
          : t.signIn}
      </button>

      <div className="ne-foot-note">
        <span>{t.monitored}</span>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.helpdesk}</a>
      </div>
    </div>
  );
}

function DirectionA({ t, lang, theme, setTheme, setLang }) {
  return (
    <div className="ne-split">
      <div className="ne-brand">
        <div className="ne-brand-photo" style={{ backgroundImage: 'url(/assets/scenery-desert-sunrise.png)' }} />
        <div className="ne-brand-scrim" />
        <img className="ne-brand-j" src="/assets/j-shape.svg" alt="" />
        <Logo cls="ne-brand-logo" />
        <div className="ne-brand-head-block">
          <h2 className="ne-brand-head">
            {t.brandHead1}<br /><span className="ajb-accent">{t.brandHead2}</span>
          </h2>
          <p className="ne-brand-sub">{t.brandSub}</p>
        </div>
      </div>
      <div className="ne-formside">
        <div className="ne-utilcluster">
          <button type="button" className="ne-iconbtn"
            aria-label={t.themeLbl} title={t.themeLbl}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button type="button" className="ne-iconbtn ne-iconbtn--lang"
            aria-label={t.langLbl} title={t.langLbl}
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            <span className="ne-langglyph" aria-hidden="true"><span className="ne-langglyph-en">E</span><span className="ne-langglyph-ar">ع</span></span>
          </button>
        </div>
        <SignInForm t={t} lang={lang} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useApp();
  const t = T[lang];

  const [status, setStatus] = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const [fieldErr, setFieldErr] = useState({});
  const [id, setIdRaw] = useState('');
  const [pw, setPwRaw] = useState('');
  const timer = useRef(null);

  const setId = (v) => {
    setIdRaw(v);
    if (fieldErr.id) setFieldErr(e => ({ ...e, id: null }));
    if (status === 'invalid') setStatus('idle');
  };
  const setPw = (v) => {
    setPwRaw(v);
    if (fieldErr.pw) setFieldErr(e => ({ ...e, pw: null }));
    if (status === 'invalid') setStatus('idle');
  };

  const submit = useCallback(() => {
    if (status === 'loading' || status === 'locked') return;
    const fe = {};
    if (!id) fe.id = 'reqId';
    else if (id.length !== 6) fe.id = 'reqIdFmt';
    if (!pw) fe.pw = 'reqPw';
    setFieldErr(fe);
    if (Object.keys(fe).length) return;

    setStatus('loading');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (id === VALID_ID && pw === VALID_PW) {
        navigate('/home');
      } else {
        setAttempts(a => {
          const n = a + 1;
          setStatus(n >= MAX_ATTEMPTS ? 'locked' : 'invalid');
          return n;
        });
      }
    }, 850);
  }, [id, pw, status, navigate]);

  const ctx = { status, attempts, fieldErr, id, pw, setId, setPw, submit };

  return (
    <LoginCtx.Provider value={ctx}>
      <DirectionA t={t} lang={lang} theme={theme} setTheme={setTheme} setLang={setLang} />
    </LoginCtx.Provider>
  );
}
