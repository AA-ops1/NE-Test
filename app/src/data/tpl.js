// Master data module — merges template-data.js + all extras

const CATALOG_KEY = 'ne-catalog-v1';

// ---------- Channels ----------
const CHANNELS = [
  { id: 'sms',      icon: 'message-square-text', en: 'SMS',        ar: 'رسالة نصية' },
  { id: 'email',    icon: 'mail',                en: 'Email',      ar: 'بريد إلكتروني' },
  { id: 'push',     icon: 'smartphone',          en: 'Push',       ar: 'إشعار' },
  { id: 'inapp',    icon: 'bell-ring',           en: 'In-App',     ar: 'داخل التطبيق' },
  { id: 'whatsapp', icon: 'message-circle',      en: 'WhatsApp',   ar: 'واتساب' },
];

// ---------- Products (with localStorage override) ----------
let PRODUCTS = [
  { id: 'accounts',  en: 'Personal Accounts',        ar: 'الحسابات الشخصية' },
  { id: 'cards',     en: 'Credit Cards',             ar: 'البطاقات الائتمانية' },
  { id: 'finance',   en: 'Personal Finance',         ar: 'التمويل الشخصي' },
  { id: 'mortgage',  en: 'Home Finance',             ar: 'تمويل المنازل' },
  { id: 'wealth',    en: 'Investment & Wealth',      ar: 'الاستثمار والثروة' },
  { id: 'digital',   en: 'Digital Banking',          ar: 'الخدمات المصرفية الرقمية' },
  { id: 'transfers', en: 'Transfers & Remittances',  ar: 'التحويلات والحوالات' },
];

// ---------- Template types (with localStorage override) ----------
let TYPES = [
  { id: 'otp',         en: 'OTP / Verification',  ar: 'رمز التحقق' },
  { id: 'transaction', en: 'Transaction Alert',   ar: 'تنبيه عملية' },
  { id: 'reminder',    en: 'Reminder',            ar: 'تذكير' },
  { id: 'security',    en: 'Security Alert',      ar: 'تنبيه أمني' },
  { id: 'service',     en: 'Service Notice',      ar: 'إشعار خدمة' },
  { id: 'statement',   en: 'Statement / Document', ar: 'كشف / مستند' },
  { id: 'marketing',   en: 'Marketing',           ar: 'تسويقي' },
];

// ---------- Priority ----------
const PRIORITIES = [
  { id: 'low',      en: 'Low',      ar: 'منخفضة' },
  { id: 'normal',   en: 'Normal',   ar: 'عادية' },
  { id: 'high',     en: 'High',     ar: 'عالية' },
  { id: 'critical', en: 'Critical', ar: 'حرجة' },
];

// ---------- Languages ----------
const LANGS = [
  { id: 'en', en: 'English', ar: 'الإنجليزية', native: 'English', dir: 'ltr' },
  { id: 'ar', en: 'Arabic',  ar: 'العربية',    native: 'العربية',  dir: 'rtl' },
];

// ---------- Variable groups (with localStorage override) ----------
let VAR_GROUPS = [
  {
    id: 'customer', en: 'Customer', ar: 'العميل', icon: 'user',
    vars: [
      { token: 'customer.first_name', len: 7,  en: 'Omar',           ar: 'عمر',           lbl_en: 'First name',     lbl_ar: 'الاسم الأول' },
      { token: 'customer.full_name',  len: 16, en: 'Omar Al Otaibi', ar: 'عمر العتيبي',   lbl_en: 'Full name',      lbl_ar: 'الاسم الكامل' },
      { token: 'customer.cif',        len: 9,  en: '100245982',      ar: '100245982',     lbl_en: 'CIF number',     lbl_ar: 'رقم العميل' },
    ],
  },
  {
    id: 'account', en: 'Account', ar: 'الحساب', icon: 'wallet',
    vars: [
      { token: 'account.masked',  len: 8,  en: '••••4416',          ar: '••••٤٤١٦',         lbl_en: 'Masked number', lbl_ar: 'رقم محجوب' },
      { token: 'account.balance', len: 12, en: 'SAR 18,420.00',     ar: '١٨٬٤٢٠٫٠٠ ر.س',   lbl_en: 'Balance',       lbl_ar: 'الرصيد' },
      { token: 'account.iban',    len: 24, en: 'SA03 8000 0000 6080', ar: 'SA03 8000 0000 6080', lbl_en: 'IBAN',      lbl_ar: 'الآيبان' },
    ],
  },
  {
    id: 'transaction', en: 'Transaction', ar: 'العملية', icon: 'arrow-left-right',
    vars: [
      { token: 'txn.amount',   len: 10, en: 'SAR 250.00',      ar: '٢٥٠٫٠٠ ر.س',       lbl_en: 'Amount',      lbl_ar: 'المبلغ' },
      { token: 'txn.merchant', len: 14, en: 'Jarir Bookstore', ar: 'مكتبة جرير',        lbl_en: 'Merchant',    lbl_ar: 'التاجر' },
      { token: 'txn.datetime', len: 16, en: '02 Jun, 14:32',   ar: '٠٢ يونيو، ١٤:٣٢',  lbl_en: 'Date & time', lbl_ar: 'التاريخ والوقت' },
      { token: 'txn.ref',      len: 10, en: 'TRX8841902',      ar: 'TRX8841902',        lbl_en: 'Reference',   lbl_ar: 'المرجع' },
    ],
  },
  {
    id: 'security', en: 'Security', ar: 'الأمان', icon: 'shield-check',
    vars: [
      { token: 'otp.code',   len: 6, en: '784512', ar: '٧٨٤٥١٢', lbl_en: 'OTP code',     lbl_ar: 'رمز التحقق' },
      { token: 'otp.expiry', len: 2, en: '10',     ar: '١٠',     lbl_en: 'Expiry (min)', lbl_ar: 'مدة الصلاحية (دقيقة)' },
      { token: 'card.last4', len: 4, en: '4416',   ar: '٤٤١٦',   lbl_en: 'Card last 4',  lbl_ar: 'آخر ٤ أرقام' },
    ],
  },
  {
    id: 'general', en: 'General', ar: 'عام', icon: 'building-2',
    vars: [
      { token: 'bank.name',      len: 13, en: 'Aljazira Bank', ar: 'بنك الجزيرة', lbl_en: 'Bank name',    lbl_ar: 'اسم البنك' },
      { token: 'support.number', len: 9,  en: '8001160001',    ar: '٨٠٠١١٦٠٠٠١',  lbl_en: 'Support line', lbl_ar: 'خط الدعم' },
      { token: 'date.today',     len: 10, en: '02 Jun 2026',   ar: '٠٢ يونيو ٢٠٢٦', lbl_en: 'Today',      lbl_ar: 'تاريخ اليوم' },
    ],
  },
];

// Apply localStorage catalog overrides
try {
  const saved = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
  if (saved && typeof saved === 'object') {
    if (Array.isArray(saved.products) && saved.products.length) PRODUCTS = saved.products;
    if (Array.isArray(saved.types) && saved.types.length) TYPES = saved.types;
    if (Array.isArray(saved.varGroups) && saved.varGroups.length) VAR_GROUPS = saved.varGroups;
  }
} catch (e) {}

// Build flat token index
const VAR_INDEX = {};
VAR_GROUPS.forEach(g => g.vars.forEach(v => { VAR_INDEX[v.token] = v; }));

// ---------- SMS calculation ----------
const GSM7_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXT = "^{}\\[~]|€";
const VAR_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function resolveForCount(text) {
  return text.replace(VAR_RE, (m, tok) => {
    const v = VAR_INDEX[tok];
    return 'x'.repeat(v ? v.len : 10);
  });
}

export function resolveSample(text, lang) {
  return text.replace(VAR_RE, (m, tok) => {
    const v = VAR_INDEX[tok];
    if (!v) return m;
    return v[lang] || v.en;
  });
}

function isGsm7(str) {
  for (const ch of str) {
    if (GSM7_BASIC.indexOf(ch) === -1 && GSM7_EXT.indexOf(ch) === -1) return false;
  }
  return true;
}

export function calcSegments(rawText) {
  const resolved = resolveForCount(rawText);
  const gsm = isGsm7(resolved);
  let len = 0;
  if (gsm) {
    for (const ch of resolved) len += GSM7_EXT.indexOf(ch) > -1 ? 2 : 1;
  } else {
    len = [...resolved].length;
  }
  const single = gsm ? 160 : 70;
  const multi = gsm ? 153 : 67;
  let segments, perSeg;
  if (len === 0) { segments = 0; perSeg = single; }
  else if (len <= single) { segments = 1; perSeg = single; }
  else { segments = Math.ceil(len / multi); perSeg = multi; }
  const capacity = segments <= 1 ? single : segments * multi;
  return {
    encoding: gsm ? 'GSM-7' : 'Unicode',
    encodingNote: gsm ? 'GSM-7' : 'UCS-2',
    length: len,
    segments,
    perSegment: perSeg,
    capacity,
    remaining: Math.max(0, capacity - len),
  };
}

// ---------- Sample data ----------
const SAMPLE = {
  name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' },
  desc: { en: 'Sent when a card purchase is authorised.', ar: 'يُرسل عند اعتماد عملية شراء بالبطاقة.' },
  product: 'cards', channel: 'sms', type: 'transaction', priority: 'high',
  content: {
    en: 'Aljazira: A purchase of {{txn.amount}} on card ending {{card.last4}} at {{txn.merchant}} was approved on {{txn.datetime}}. Not you? Call {{support.number}}.',
    ar: 'الجزيرة: تمت الموافقة على عملية شراء بمبلغ {{txn.amount}} على البطاقة المنتهية بـ {{card.last4}} لدى {{txn.merchant}} بتاريخ {{txn.datetime}}. لم تقم بها؟ اتصل {{support.number}}.',
  },
  tags: { en: ['cards', 'alert', 'realtime'], ar: ['بطاقات', 'تنبيه', 'فوري'] },
};

// ---------- People ----------
const O = { id: 'o', en: 'A. Al Amri', ar: 'عبدالرحمن العمري', init: 'A' };
const N = { id: 'n', en: 'N. Al Harbi', ar: 'ناصر الحربي', init: 'N' };
const S_person = { id: 's', en: 'S. Al Qahtani', ar: 'سارة القحطاني', init: 'S' };
const F = { id: 'f', en: 'F. Al Dossari', ar: 'فيصل الدوسري', init: 'F' };
const PENDING = { en: 'Pending assignment', ar: 'بانتظار التعيين' };

// ---------- AP (Approvals) data ----------
const EVENTS = {
  created:    { icon: 'file-plus',     key: 'apEvCreated',    role: 'maker',   tint: '' },
  edited:     { icon: 'pencil',        key: 'apEvEdited',     role: 'maker',   tint: '' },
  submitted:  { icon: 'send',          key: 'apEvSubmitted',  role: 'maker',   tint: 'sand' },
  approved:   { icon: 'check',         key: 'apEvApproved',   role: 'checker', tint: 'success' },
  published:  { icon: 'circle-check',  key: 'apEvPublished',  role: 'system',  tint: 'success' },
  sent_back:  { icon: 'corner-up-left', key: 'apEvSentBack',  role: 'checker', tint: 'warning' },
  rejected:   { icon: 'x',            key: 'apEvRejected',   role: 'checker', tint: 'danger' },
  reassigned: { icon: 'users',         key: 'apEvReassigned', role: 'checker', tint: 'info' },
};

const QUEUE = [
  {
    id: 'TPL-2026-04388', detail: 'push', channel: 'push', product: 'transfers', type: 'security', priority: 'high',
    name: { en: 'Beneficiary added', ar: 'تمت إضافة مستفيد' },
    kind: 'new', ver: 'v1', maker: S_person, assignedTo: O,
    submittedAt: { en: '04 Jun 2026, 08:42', ar: '٠٤ يونيو ٢٠٢٦، ٠٨:٤٢' },
    ago: { en: '2 hours ago', ar: 'قبل ساعتين' },
    langs: ['en', 'ar'],
    note: { en: 'New security push for the beneficiary-management release. Please review wording.', ar: 'إشعار أمني جديد لإصدار إدارة المستفيدين. يرجى مراجعة الصياغة.' },
    ntitle: { en: 'New beneficiary added', ar: 'تمت إضافة مستفيد جديد' },
    content: {
      en: 'Hi {{customer.first_name}}, a new beneficiary was added to your account {{account.masked}} on {{txn.datetime}}. Not you? Call {{support.number}}.',
      ar: 'مرحبًا {{customer.first_name}}، تمت إضافة مستفيد جديد إلى حسابك {{account.masked}} بتاريخ {{txn.datetime}}. لم تقم بذلك؟ اتصل {{support.number}}.',
    },
    history: [
      { type: 'created',   who: S_person, when: { en: '03 Jun 2026, 16:20', ar: '٠٣ يونيو ٢٠٢٦، ١٦:٢٠' } },
      { type: 'submitted', who: S_person, when: { en: '04 Jun 2026, 08:42', ar: '٠٤ يونيو ٢٠٢٦، ٠٨:٤٢' }, note: { en: 'For the beneficiary-management release.', ar: 'لإصدار إدارة المستفيدين.' } },
    ],
  },
  {
    id: 'TPL-2026-04410', detail: 'sms', channel: 'sms', product: 'digital', type: 'otp', priority: 'critical',
    name: { en: 'OTP — login verification', ar: 'رمز التحقق للدخول' },
    kind: 'edit', ver: 'v6', prevVer: 'v5', maker: N, assignedTo: O,
    submittedAt: { en: '04 Jun 2026, 07:15', ar: '٠٤ يونيو ٢٠٢٦، ٠٧:١٥' },
    ago: { en: '3 hours ago', ar: 'قبل ٣ ساعات' },
    langs: ['en', 'ar'],
    note: { en: 'Added the expiry minutes and a do-not-share warning per security review.', ar: 'أضفت مدة الصلاحية وتحذير عدم المشاركة وفق المراجعة الأمنية.' },
    content: {
      en: 'Aljazira: {{otp.code}} is your login code. It expires in {{otp.expiry}} minutes. Never share this code with anyone.',
      ar: 'الجزيرة: {{otp.code}} هو رمز الدخول الخاص بك. تنتهي صلاحيته خلال {{otp.expiry}} دقائق. لا تشارك هذا الرمز مع أي شخص.',
    },
    prev: {
      content: {
        en: 'Aljazira: {{otp.code}} is your login code. Do not share it.',
        ar: 'الجزيرة: {{otp.code}} هو رمز الدخول الخاص بك. لا تشاركه.',
      },
    },
    history: [
      { type: 'approved',  who: S_person, when: { en: '02 Apr 2026', ar: '٠٢ أبريل ٢٠٢٦' }, note: { en: 'v5 approved & activated.', ar: 'تم اعتماد وتفعيل الإصدار ٥.' } },
      { type: 'edited',    who: N, when: { en: '04 Jun 2026, 07:02', ar: '٠٤ يونيو ٢٠٢٦، ٠٧:٠٢' } },
      { type: 'submitted', who: N, when: { en: '04 Jun 2026, 07:15', ar: '٠٤ يونيو ٢٠٢٦، ٠٧:١٥' } },
    ],
  },
  {
    id: 'TPL-2026-04102', detail: 'email', channel: 'email', product: 'cards', type: 'statement', priority: 'normal',
    name: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' },
    kind: 'edit', ver: 'v3', prevVer: 'v2', maker: S_person, assignedTo: O,
    submittedAt: { en: '03 Jun 2026, 14:08', ar: '٠٣ يونيو ٢٠٢٦، ١٤:٠٨' },
    ago: { en: 'yesterday', ar: 'أمس' },
    langs: ['en', 'ar'],
    note: { en: 'Warmer opening line and added the due date to the subject.', ar: 'افتتاحية أدفأ وإضافة تاريخ الاستحقاق إلى الموضوع.' },
    subject: { en: 'Your {{bank.name}} statement is ready — due {{date.today}}', ar: 'كشف {{bank.name}} جاهز — يستحق {{date.today}}' },
    content: {
      en: 'Dear {{customer.first_name}},\n\nGood news — your statement for the card ending {{card.last4}} is ready. Outstanding balance: {{account.balance}}, due on {{date.today}}.\n\nView it securely in the aljazira app.',
      ar: 'عزيزي {{customer.first_name}}،\n\nخبر سار — كشف البطاقة المنتهية بـ {{card.last4}} جاهز. الرصيد المستحق: {{account.balance}}، يستحق في {{date.today}}.\n\nاطّلع عليه بأمان عبر تطبيق الجزيرة.',
    },
    prev: {
      subject: { en: 'Your {{bank.name}} card statement is ready', ar: 'كشف بطاقة {{bank.name}} جاهز' },
      content: {
        en: 'Dear {{customer.first_name}},\n\nYour statement for the card ending {{card.last4}} is now available. Outstanding balance: {{account.balance}}, due on {{date.today}}.\n\nView it securely in the aljazira app.',
        ar: 'عزيزي {{customer.first_name}}،\n\nكشف البطاقة المنتهية بـ {{card.last4}} متاح الآن. الرصيد المستحق: {{account.balance}}، يستحق في {{date.today}}.\n\nاطّلع عليه بأمان عبر تطبيق الجزيرة.',
      },
    },
    history: [
      { type: 'approved',  who: N, when: { en: '20 Apr 2026', ar: '٢٠ أبريل ٢٠٢٦' }, note: { en: 'v2 approved & activated.', ar: 'تم اعتماد وتفعيل الإصدار ٢.' } },
      { type: 'edited',    who: S_person, when: { en: '03 Jun 2026, 13:50', ar: '٠٣ يونيو ٢٠٢٦، ١٣:٥٠' } },
      { type: 'submitted', who: S_person, when: { en: '03 Jun 2026, 14:08', ar: '٠٣ يونيو ٢٠٢٦، ١٤:٠٨' } },
    ],
  },
  {
    id: 'TPL-2026-04503', detail: 'sms', channel: 'whatsapp', product: 'cards', type: 'marketing', priority: 'low',
    name: { en: 'Summer cashback offer', ar: 'عرض كاش باك الصيف' },
    kind: 'new', ver: 'v1', maker: N, assignedTo: O,
    submittedAt: { en: '03 Jun 2026, 11:30', ar: '٠٣ يونيو ٢٠٢٦، ١١:٣٠' },
    ago: { en: 'yesterday', ar: 'أمس' },
    langs: ['en', 'ar'],
    note: { en: 'Seasonal WhatsApp promo.', ar: 'عرض موسمي عبر واتساب.' },
    content: {
      en: 'Hi {{customer.first_name}} — earn 10% cashback this summer on card ending {{card.last4}}. Tap to opt in before {{date.today}}.',
      ar: 'مرحبًا {{customer.first_name}} — احصل على ١٠٪ كاش باك هذا الصيف على بطاقتك المنتهية بـ {{card.last4}}. اضغط للاشتراك قبل {{date.today}}.',
    },
    history: [
      { type: 'created',   who: N, when: { en: '02 Jun 2026, 17:40', ar: '٠٢ يونيو ٢٠٢٦، ١٧:٤٠' } },
      { type: 'submitted', who: N, when: { en: '03 Jun 2026, 11:30', ar: '٠٣ يونيو ٢٠٢٦، ١١:٣٠' } },
    ],
  },
  {
    id: 'TPL-2026-04401', detail: 'sms', channel: 'sms', product: 'finance', type: 'reminder', priority: 'normal',
    name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' },
    kind: 'new', ver: 'v2', maker: O, assignedTo: O, ownWork: true,
    submittedAt: { en: '04 Jun 2026, 09:12', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:١٢' },
    ago: { en: '1 hour ago', ar: 'قبل ساعة' },
    langs: ['en', 'ar'],
    note: { en: 'Reminder template for the finance team.', ar: 'قالب تذكير لفريق التمويل.' },
    content: {
      en: 'Aljazira: A reminder that your finance installment of {{txn.amount}} is due on {{date.today}}.',
      ar: 'الجزيرة: نذكّرك بأن قسط تمويلك البالغ {{txn.amount}} يستحق بتاريخ {{date.today}}.',
    },
    history: [
      { type: 'created',   who: O, when: { en: '01 Jun 2026, 10:24', ar: '٠١ يونيو ٢٠٢٦، ١٠:٢٤' } },
      { type: 'edited',    who: O, when: { en: '04 Jun 2026, 09:08', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:٠٨' } },
      { type: 'submitted', who: O, when: { en: '04 Jun 2026, 09:12', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:١٢' } },
    ],
  },
];

const MINE = [
  {
    id: 'TPL-2026-04401', detail: 'sms', channel: 'sms', product: 'finance', type: 'reminder', priority: 'normal',
    name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' },
    state: 'ready', ver: 'v2',
    updated: { en: 'just now', ar: 'الآن' },
    content: {
      en: 'Aljazira: A reminder that your finance installment of {{txn.amount}} is due on {{date.today}}.',
      ar: 'الجزيرة: نذكّرك بأن قسط تمويلك البالغ {{txn.amount}} يستحق بتاريخ {{date.today}}.',
    },
  },
  {
    id: 'TPL-2026-04210', detail: 'push', channel: 'inapp', product: 'digital', type: 'security', priority: 'high',
    name: { en: 'New device sign-in', ar: 'دخول من جهاز جديد' },
    state: 'review', ver: 'v4', checker: N,
    submittedAt: { en: '04 Jun 2026, 08:05', ar: '٠٤ يونيو ٢٠٢٦، ٠٨:٠٥' },
    updated: { en: '2 hours ago', ar: 'قبل ساعتين' },
  },
  {
    id: 'TPL-2026-04075', detail: 'push', channel: 'push', product: 'digital', type: 'security', priority: 'high',
    name: { en: 'Password changed', ar: 'تم تغيير كلمة المرور' },
    state: 'sent_back', ver: 'v3', checker: N,
    updated: { en: 'yesterday', ar: 'أمس' },
    decisionAt: { en: '03 Jun 2026, 15:22', ar: '٠٣ يونيو ٢٠٢٦، ١٥:٢٢' },
    reason: { en: 'Please include the masked account and a support number so the customer can act if this wasn\'t them.', ar: 'يرجى تضمين الحساب المحجوب ورقم الدعم ليتمكن العميل من التصرف إذا لم يكن هو.' },
  },
  {
    id: 'TPL-2026-03907', detail: 'push', channel: 'push', product: 'accounts', type: 'transaction', priority: 'normal',
    name: { en: 'Salary credited', ar: 'إيداع الراتب' },
    state: 'approved', ver: 'v2', checker: N,
    updated: { en: '2 May 2026', ar: '٢ مايو ٢٠٢٦' },
    decisionAt: { en: '02 May 2026, 09:40', ar: '٠٢ مايو ٢٠٢٦، ٠٩:٤٠' },
  },
];

// ---------- Template list data ----------
const LIST = [
  { id: 'TPL-2026-03318', ch: 'sms',      product: 'cards',     type: 'transaction', ver: 'v3', status: 'active',   by: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' }, upd: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' }, detail: 'sms' },
  { id: 'TPL-2026-04102', ch: 'email',    product: 'cards',     type: 'statement',   ver: 'v2', status: 'active',   by: { en: 'S. Al Qahtani', ar: 'سارة القحطاني' }, name: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' }, upd: { en: '20 Apr 2026', ar: '٢٠ أبريل ٢٠٢٦' }, detail: 'email' },
  { id: 'TPL-2026-03907', ch: 'push',     product: 'accounts',  type: 'transaction', ver: 'v2', status: 'active',   by: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, name: { en: 'Salary credited', ar: 'إيداع الراتب' }, upd: { en: '02 May 2026', ar: '٠٢ مايو ٢٠٢٦' }, detail: 'push' },
  { id: 'TPL-2026-04410', ch: 'sms',      product: 'digital',   type: 'otp',         ver: 'v5', status: 'active',   by: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, name: { en: 'OTP — login verification', ar: 'رمز التحقق للدخول' }, upd: { en: '2 days ago', ar: 'قبل يومين' }, detail: 'sms' },
  { id: 'TPL-2026-04388', ch: 'push',     product: 'transfers', type: 'security',    ver: 'v1', status: 'review',   by: { en: 'S. Al Qahtani', ar: 'سارة القحطاني' }, name: { en: 'Beneficiary added', ar: 'تمت إضافة مستفيد' }, upd: { en: '1 week ago', ar: 'قبل أسبوع' }, detail: 'push' },
  { id: 'TPL-2026-04401', ch: 'sms',      product: 'finance',   type: 'reminder',    ver: 'v2', status: 'draft',    used: false, by: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' }, upd: { en: 'just now', ar: 'الآن' }, detail: 'sms' },
  { id: 'TPL-2026-04210', ch: 'inapp',    product: 'digital',   type: 'security',    ver: 'v3', status: 'active',   by: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, name: { en: 'New device sign-in', ar: 'دخول من جهاز جديد' }, upd: { en: 'yesterday', ar: 'أمس' }, detail: 'push' },
  { id: 'TPL-2026-03980', ch: 'whatsapp', product: 'cards',     type: 'marketing',   ver: 'v4', status: 'expired',  by: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, name: { en: 'Ramadan cashback offer', ar: 'عرض كاش باك رمضان' }, upd: { en: '2 months ago', ar: 'قبل شهرين' }, detail: 'sms' },
  { id: 'TPL-2026-04150', ch: 'email',    product: 'accounts',  type: 'service',     ver: 'v1', status: 'draft',    used: true,  by: { en: 'S. Al Qahtani', ar: 'سارة القحطاني' }, name: { en: 'IBAN ready', ar: 'الآيبان جاهز' }, upd: { en: '3 days ago', ar: 'قبل ٣ أيام' }, detail: 'email' },
  { id: 'TPL-2026-04075', ch: 'push',     product: 'digital',   type: 'security',    ver: 'v2', status: 'active',   by: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, name: { en: 'Password changed', ar: 'تم تغيير كلمة المرور' }, upd: { en: '5 days ago', ar: 'قبل ٥ أيام' }, detail: 'push' },
  { id: 'TPL-2026-03450', ch: 'email',    product: 'cards',     type: 'service',     ver: 'v1', status: 'archived', by: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, name: { en: 'Statement archive notice', ar: 'إشعار أرشفة الكشوف' }, upd: { en: '6 months ago', ar: 'قبل ٦ أشهر' }, detail: 'email' },
  { id: 'TPL-2026-04299', ch: 'sms',      product: 'wealth',    type: 'reminder',    ver: 'v1', status: 'inactive', by: { en: 'S. Al Qahtani', ar: 'سارة القحطاني' }, name: { en: 'Investment maturity', ar: 'استحقاق الاستثمار' }, upd: { en: '1 month ago', ar: 'قبل شهر' }, detail: 'sms' },
];

// ---------- Edit template data ----------
const EDIT_TPL = {
  id: 'TPL-2026-03318',
  name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' },
  activeVer: 3, draftVer: 4,
  updatedBy: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },
  updatedAt: { en: '12 May 2026, 09:18', ar: '١٢ مايو ٢٠٢٦، ٠٩:١٨' },
};

const VERSIONS = [
  { ver: 'v3', status: 'active',   acted: 'approved',   who: { en: 'N. Al Harbi', ar: 'ناصر الحربي' },         when: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' }, current: true },
  { ver: 'v2', status: 'archived', acted: 'superseded', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },     when: { en: '03 Mar 2026', ar: '٠٣ مارس ٢٠٢٦' } },
  { ver: 'v1', status: 'archived', acted: 'created',    who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },     when: { en: '14 Jan 2026', ar: '١٤ يناير ٢٠٢٦' } },
];

const DRAFT_VERSIONS = [
  { ver: 'v4', status: 'draft',    acted: 'edited',     who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },     when: { en: '2 days ago', ar: 'قبل يومين' }, current: true, isDraft: true },
  { ver: 'v3', status: 'active',   acted: 'approved',   who: { en: 'N. Al Harbi', ar: 'ناصر الحربي' },         when: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' } },
  { ver: 'v2', status: 'archived', acted: 'superseded', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },     when: { en: '03 Mar 2026', ar: '٠٣ مارس ٢٠٢٦' } },
  { ver: 'v1', status: 'archived', acted: 'created',    who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },     when: { en: '14 Jan 2026', ar: '١٤ يناير ٢٠٢٦' } },
];

// ---------- Sensitive tokens ----------
const SENSITIVE = ['account.balance', 'account.iban', 'account.masked', 'otp.code', 'customer.cif', 'card.last4'];

// ---------- View templates ----------
const VIEW_TEMPLATES = {
  sms: {
    id: 'TPL-2026-03318', channel: 'sms', product: 'cards', type: 'transaction', priority: 'high',
    name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' },
    desc: { en: 'Sent when a card purchase is authorised.', ar: 'يُرسل عند اعتماد عملية شراء بالبطاقة.' },
    tags: { en: ['cards', 'alert', 'realtime'], ar: ['بطاقات', 'تنبيه', 'فوري'] },
    validFrom: '2026-01-14', validTo: '', used: true,
    langs: ['en', 'ar'],
    createdBy: O, createdAt: { en: '14 Jan 2026, 11:02', ar: '١٤ يناير ٢٠٢٦، ١١:٠٢' },
    versions: [
      {
        ver: 'v3', status: 'active', acted: 'approved', current: true,
        who: N, when: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' },
        updatedBy: O, updatedAt: { en: '12 May 2026, 09:18', ar: '١٢ مايو ٢٠٢٦، ٠٩:١٨' }, maker: O, checker: N,
        content: {
          en: 'Aljazira: A purchase of {{txn.amount}} on card ending {{card.last4}} at {{txn.merchant}} was approved on {{txn.datetime}}. Not you? Call {{support.number}}.',
          ar: 'الجزيرة: تمت الموافقة على عملية شراء بمبلغ {{txn.amount}} على البطاقة المنتهية بـ {{card.last4}} لدى {{txn.merchant}} بتاريخ {{txn.datetime}}. لم تقم بها؟ اتصل {{support.number}}.',
        },
      },
      {
        ver: 'v2', status: 'archived', acted: 'superseded',
        who: O, when: { en: '03 Mar 2026', ar: '٠٣ مارس ٢٠٢٦' },
        updatedBy: O, updatedAt: { en: '03 Mar 2026, 16:40', ar: '٠٣ مارس ٢٠٢٦، ١٦:٤٠' }, maker: O, checker: S_person,
        content: {
          en: 'Aljazira: {{txn.amount}} spent on card {{card.last4}} at {{txn.merchant}}. Not you? Call {{support.number}}.',
          ar: 'الجزيرة: {{txn.amount}} على البطاقة {{card.last4}} لدى {{txn.merchant}}. لم تقم بها؟ اتصل {{support.number}}.',
        },
      },
      {
        ver: 'v1', status: 'archived', acted: 'created',
        who: O, when: { en: '14 Jan 2026', ar: '١٤ يناير ٢٠٢٦' },
        updatedBy: O, updatedAt: { en: '14 Jan 2026, 11:02', ar: '١٤ يناير ٢٠٢٦، ١١:٠٢' }, maker: O, checker: N,
        content: {
          en: 'Aljazira: A purchase of {{txn.amount}} was approved on your card ending {{card.last4}}.',
          ar: 'الجزيرة: تمت الموافقة على عملية شراء بمبلغ {{txn.amount}} على بطاقتك المنتهية بـ {{card.last4}}.',
        },
      },
    ],
  },
  email: {
    id: 'TPL-2026-04102', channel: 'email', product: 'cards', type: 'statement', priority: 'normal',
    name: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' },
    desc: { en: 'Monthly notice that the card statement is available.', ar: 'إشعار شهري بتوفّر كشف البطاقة.' },
    tags: { en: ['cards', 'statement', 'monthly'], ar: ['بطاقات', 'كشف', 'شهري'] },
    validFrom: '2026-02-01', validTo: '', used: true,
    langs: ['en', 'ar'],
    createdBy: S_person, createdAt: { en: '01 Feb 2026, 08:30', ar: '٠١ فبراير ٢٠٢٦، ٠٨:٣٠' },
    versions: [
      {
        ver: 'v2', status: 'active', acted: 'approved', current: true,
        who: N, when: { en: '20 Apr 2026', ar: '٢٠ أبريل ٢٠٢٦' },
        updatedBy: S_person, updatedAt: { en: '20 Apr 2026, 10:05', ar: '٢٠ أبريل ٢٠٢٦، ١٠:٠٥' }, maker: S_person, checker: N,
        subject: { en: 'Your {{bank.name}} card statement is ready', ar: 'كشف بطاقة {{bank.name}} جاهز' },
        content: {
          en: 'Dear {{customer.first_name}},\n\nYour statement for the card ending {{card.last4}} is now available. Outstanding balance: {{account.balance}}, due on {{date.today}}.\n\nView it securely in the aljazira app.',
          ar: 'عزيزي {{customer.first_name}}،\n\nكشف البطاقة المنتهية بـ {{card.last4}} متاح الآن. الرصيد المستحق: {{account.balance}}، يستحق في {{date.today}}.\n\nاطّلع عليه بأمان عبر تطبيق الجزيرة.',
        },
        attachments: [{ name: 'Statement-May-2026.pdf', size: '212 KB' }],
      },
      {
        ver: 'v1', status: 'archived', acted: 'created',
        who: S_person, when: { en: '01 Feb 2026', ar: '٠١ فبراير ٢٠٢٦' },
        updatedBy: S_person, updatedAt: { en: '01 Feb 2026, 08:30', ar: '٠١ فبراير ٢٠٢٦، ٠٨:٣٠' }, maker: S_person, checker: N,
        subject: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' },
        content: {
          en: 'Dear {{customer.first_name}}, your card statement is now available in the aljazira app.',
          ar: 'عزيزي {{customer.first_name}}، كشف بطاقتك متاح الآن في تطبيق الجزيرة.',
        },
        attachments: [],
      },
    ],
  },
  push: {
    id: 'TPL-2026-03907', channel: 'push', product: 'accounts', type: 'transaction', priority: 'normal',
    name: { en: 'Salary credited', ar: 'إيداع الراتب' },
    desc: { en: 'Push sent when a salary credit posts to the account.', ar: 'إشعار يُرسل عند إيداع الراتب في الحساب.' },
    tags: { en: ['salary', 'credit', 'accounts'], ar: ['راتب', 'إيداع', 'حسابات'] },
    validFrom: '2026-03-10', validTo: '', used: true,
    langs: ['en', 'ar'],
    createdBy: O, createdAt: { en: '10 Mar 2026, 13:15', ar: '١٠ مارس ٢٠٢٦، ١٣:١٥' },
    versions: [
      {
        ver: 'v2', status: 'active', acted: 'approved', current: true,
        who: N, when: { en: '02 May 2026', ar: '٠٢ مايو ٢٠٢٦' },
        updatedBy: O, updatedAt: { en: '02 May 2026, 09:40', ar: '٠٢ مايو ٢٠٢٦، ٠٩:٤٠' }, maker: O, checker: N,
        ntitle: { en: 'Salary credited', ar: 'تم إيداع الراتب' },
        content: {
          en: 'Hi {{customer.first_name}}, {{txn.amount}} has been credited to your account {{account.masked}}.',
          ar: 'مرحبًا {{customer.first_name}}، تم إيداع {{txn.amount}} في حسابك {{account.masked}}.',
        },
        imageUrl: 'cdn.aljazira.sa/push/salary-credited-en.png',
      },
      {
        ver: 'v1', status: 'archived', acted: 'created',
        who: O, when: { en: '10 Mar 2026', ar: '١٠ مارس ٢٠٢٦' },
        updatedBy: O, updatedAt: { en: '10 Mar 2026, 13:15', ar: '١٠ مارس ٢٠٢٦، ١٣:١٥' }, maker: O, checker: S_person,
        ntitle: { en: 'Salary credited', ar: 'تم إيداع الراتب' },
        content: {
          en: 'Your salary of {{txn.amount}} has been credited.',
          ar: 'تم إيداع راتبك البالغ {{txn.amount}}.',
        },
        imageUrl: '',
      },
    ],
  },
  draft: {
    id: 'TPL-2026-04401', channel: 'sms', product: 'finance', type: 'reminder', priority: 'normal',
    used: false,
    name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' },
    desc: { en: 'Reminds the customer that a finance installment is due.', ar: 'يذكّر العميل باستحقاق قسط التمويل.' },
    tags: { en: ['finance', 'reminder', 'draft'], ar: ['تمويل', 'تذكير', 'مسودة'] },
    validFrom: '2026-06-01', validTo: '',
    langs: ['en', 'ar'],
    createdBy: O, createdAt: { en: '01 Jun 2026, 10:24', ar: '٠١ يونيو ٢٠٢٦، ١٠:٢٤' },
    versions: [
      {
        ver: 'v2', status: 'draft', acted: 'edited', current: true,
        who: O, when: { en: 'just now', ar: 'الآن' },
        updatedBy: O, updatedAt: { en: '04 Jun 2026, 09:12', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:١٢' }, maker: O, checker: PENDING,
        content: {
          en: 'Aljazira: A reminder that your finance installment of {{txn.amount}} is due on {{date.today}}. Pay via the aljazira app to avoid any late fees.',
          ar: 'الجزيرة: نذكّرك بأن قسط تمويلك البالغ {{txn.amount}} يستحق بتاريخ {{date.today}}. ادفع عبر تطبيق الجزيرة لتجنّب أي رسوم تأخير.',
        },
      },
    ],
  },
};

// ---------- i18n strings (merged from all extras files) ----------
const T = {
  en: {
    dir: 'ltr',
    // shell / nav
    nav: { home: 'Dashboard', campaigns: 'Campaigns', templates: 'Templates', approvals: 'Approvals', audiences: 'Customers', delivery: 'Delivery', settings: 'Settings' },
    navGroup: { workspace: 'Workspace', governance: 'Governance', data: 'Audience & delivery' },
    userName: 'Abdulrahman Al Amri', userRole: 'Compliance · Maker', toggleNav: 'Collapse menu',
    crumb: 'Notification Engine', crumbHome: 'Templates', crumbNew: 'New template',
    // header
    title: 'Create template', subtitle: 'Define a reusable notification for a product and channel.',
    draftBadge: 'New · Draft', assumptionsNote: 'Lists marked "assumed" use sensible defaults pending business sign-off.',
    // sections
    secDetails: 'Template details', secContent: 'Message content', secSettings: 'Delivery & validity',
    stepDetails: 'Details', stepContent: 'Content', stepReview: 'Review',
    // fields
    fName: 'Template name', fNamePh: 'e.g. Card transaction alert',
    fDesc: 'Description', fDescPh: 'Short summary of when this template is used',
    fProduct: 'Related product', fChannel: 'Channel category', fType: 'Template type', fPriority: 'Priority',
    fId: 'Template ID', fVersion: 'Version', fStatus: 'Status',
    assumed: 'assumed', autoGen: 'Auto-generated on save',
    // content
    contentLangs: 'Content languages', addLang: 'Add language',
    messagePh: "Type your message. Insert variables from the panel — they're replaced with live data at send time.",
    subjectLbl: 'Subject line', subjectPh: 'Email subject',
    titleLbl: 'Title', titlePh: 'Notification title',
    bodyFormatLbl: 'Format', fmtPlain: 'Plain text', fmtHtml: 'HTML', htmlBodyLbl: 'HTML body',
    htmlHint: 'Inline HTML is supported — {{variables}} still resolve at send time.',
    htmlPh: '<p>Dear {{customer.first_name}},</p>\n<p>Your statement is ready to view.</p>',
    expand: 'Expand', expandPreview: 'Open full-screen preview', emailFull: 'Email preview', close: 'Close',
    variables: 'Variables', variablesHint: 'Click to insert at cursor', searchVars: 'Search variables',
    showSample: 'Sample data', showRaw: 'Show tokens',
    // segment meter
    preview: 'Preview', segTitle: 'Message length',
    encoding: 'Encoding', characters: 'Characters', segments: 'Segments', perSeg: 'per segment', remaining: 'left in last segment',
    segGsm: 'Latin text uses GSM-7 · 160 single / 153 per concatenated segment.',
    segUni: 'Arabic / Unicode uses UCS-2 · 70 single / 67 per concatenated segment.',
    // settings
    fValidFrom: 'Valid from', fValidTo: 'Valid to', validToOpen: 'No end date (open)',
    fTags: 'Tags', tagsPh: 'Add tag and press Enter',
    fAttach: 'Attachments', attachHint: 'Drop files or browse — PDF, PNG, JPG up to 5 MB',
    fNotes: 'Internal notes', notesPh: 'Notes for reviewers (not sent to customers)',
    // actions
    cancel: 'Cancel', saveDraft: 'Save as draft', save: 'Save template',
    back: 'Back', next: 'Continue', toReview: 'Review & save',
    // validation
    errName: 'Template name is required', errProduct: 'Select a product', errChannel: 'Select a channel',
    errType: 'Select a template type', errContent: 'Message content is required', errValidFrom: 'A validity start date is required',
    fixErrors: 'Please complete the highlighted fields.',
    // saved
    savedTitle: 'Template saved as draft', savedSub: 'A maker–checker review is required before it can be activated.',
    created: 'Created by', createdAt: 'Created at', maker: 'Maker', checker: 'Checker', pending: 'Pending assignment',
    viewList: 'Go to templates', createAnother: 'Create another',
    // list
    listTitle: 'Templates', listNew: 'New template', searchList: 'Search templates',
    colName: 'Name', colProduct: 'Product', colChannel: 'Channel', colType: 'Type', colVer: 'Version', colStatus: 'Status', colUpdated: 'Updated',
    stDraft: 'Draft', stReview: 'In review', stActive: 'Active', stExpired: 'Expired',
    justNow: 'just now',
    review: { dir: 'Layout', a: 'A · Workspace', b: 'B · Stepper', state: 'State', compose: 'Compose', filled: 'Filled', errors: 'Errors', saved: 'Saved', list: 'List', device: 'Device', desktop: 'Desktop', mobile: 'Mobile', theme: 'Theme', dark: 'Dark', light: 'Light', lang: 'Lang' },
    set: {
      title: 'Settings', subtitle: 'Manage the building blocks that templates draw on — products, template types, and dynamic variables.',
      crumb: 'Settings', flowNote: 'Changes here flow into the Create & Edit template forms.',
      tabProducts: 'Products', tabTypes: 'Template types', tabVars: 'Variables',
      descProducts: 'Business lines a template can be filed under.',
      descTypes: 'Categories that classify what a notification is for.',
      descVars: 'Tokens like {{token}} resolved with live data at send time.',
      add: 'Add', addProduct: 'Add product', addType: 'Add type', addVar: 'Add variable',
      edit: 'Edit', duplicate: 'Duplicate', remove: 'Delete', save: 'Save', cancel: 'Cancel',
      editItem: 'Edit', newItem: 'New',
      search: 'Search', empty: 'Nothing here yet', emptySub: 'Add the first one to get started.', noMatch: 'No matches',
      reorderHint: 'Drag to reorder',
      colName: 'Name', colNameEn: 'Name (English)', colNameAr: 'Name (Arabic)', colCode: 'Code', colToken: 'Token',
      colLabel: 'Label', colLabelEn: 'Label (English)', colLabelAr: 'Label (Arabic)',
      colSample: 'Sample', colSampleEn: 'Sample (English)', colSampleAr: 'Sample (Arabic)',
      colLen: 'Length', colGroup: 'Group', colUsage: 'Used in',
      lenHint: 'Assumed resolved length — feeds the SMS segment estimate.',
      codeHint: 'Lowercase identifier, no spaces.', tokenHint: 'Referenced in messages as {{token}}.',
      fName: 'Name', fLabel: 'Label', fSample: 'Sample value', fLen: 'Assumed length', fGroup: 'Group', fCode: 'Code', fToken: 'Token',
      delTitle: 'Delete {name}?', delText: 'This removes it from the catalogue. Templates already using it keep their saved copy.', delConfirm: 'Delete', delKeep: 'Keep',
      usedWarn: 'In use by {n} template(s)',
      savedToast: 'Catalogue updated', savedSub: 'Create & Edit forms will use the new list.',
      deletedToast: 'Item deleted', addedToast: 'Item added', resetCat: 'Reset to defaults', resetDone: 'Catalogue reset to defaults',
      items1: '1 item', itemsN: '{n} items',
    },
    // dashboard (from login.jsx)
    welcome: 'Welcome back, Abdulrahman', welcomeSub: "Here's what's moving across your channels today.",
    kpiSent: 'Sent today', kpiSched: 'Scheduled', kpiRate: 'Delivery rate',
    recent: 'Recent activity',
    a1t: 'Salary credited — May payroll', a1s: 'Transaction alert · 18,400 recipients',
    a2t: 'Eid offers — World cardholders', a2s: 'Marketing · scheduled for 09:00',
    a3t: 'Statement ready — April', a3s: 'Account update · draft',
    sent: 'Sent', scheduled: 'Scheduled', draft: 'Draft',
    // ---- list-extras.js E.en ----
    tplCount: '{n} templates', tplCount1: '1 template',
    filterChannel: 'Channel', allChannels: 'All channels',
    filterStatus: 'Status', allStatuses: 'All statuses',
    filterProduct: 'Product', allProducts: 'All products',
    colActions: 'Actions', clearFilters: 'Clear filters',
    noResultsTitle: 'No templates match', noResultsText: 'Try adjusting your search or filters.',
    detailsAction: 'View details', editAction: 'Edit', updatedByShort: 'by',
    stInactive: 'Inactive',
    // ---- edit-extras.js E.en ----
    crumbEdit: 'Edit',
    editTitle: 'Edit template',
    editSub: 'Update content and configuration. Changes follow maker–checker review before going live.',
    lastUpdated: 'Last updated by', metaOn: 'on', metaSep: '·',
    unsaved: 'Unsaved changes', editing: 'Editing',
    bnDraftTitle: "You're editing draft {ver} directly",
    bnDraftText: "Changes save to this same draft version. Submit it for maker–checker review when it's ready.",
    bnActiveTitle: 'This is the active version ({ver})',
    bnActiveText: 'Saving your edits creates a new draft version ({next}) for maker–checker review. {ver} stays live until the new version is approved.',
    bnErrTitle: 'Some fields need attention',
    bnErrText: 'Resolve the highlighted fields below before saving.',
    saveChanges: 'Save changes', saveNewDraft: 'Save as new draft', submitReview: 'Save & submit for review',
    discard: 'Discard changes', viewHistory: 'View history',
    verTitle: 'Version history', verCurrent: 'Current',
    verDraft: 'Draft',
    verStatus: 'Status',
    verWhen: 'Date',
    verBy: 'By',
    diffTitle: 'Changes from previous version',
    diffPrev: 'Previous',
    diffNew: 'Updated',
    diffAdded: 'Added',
    diffRemoved: 'Removed',
    noChanges: 'No changes yet',
    bnSaveDraft: 'Save draft',
    bnSubmitApproval: 'Submit for approval',
    // ---- delete-extras.js E.en ----
    deleteTpl: 'Delete template',
    delTitle: 'Delete this template?',
    delBody: 'This action cannot be undone. The template and all its versions will be permanently removed.',
    delConfirm: 'Delete permanently',
    delCancel: 'Keep template',
    arcTitle: 'Archive this template?',
    arcBody: 'Archiving will deactivate the template. You can restore it later.',
    arcRUnused: 'Archive',
    arcRUsed: 'Archive anyway',
    arcConfirm: 'Archive',
    arcCancel: 'Cancel',
    arcWarnUsed: 'This template is currently in use by active campaigns.',
    delWarnUsed: 'This template is currently in use. Deleting it may affect active campaigns.',
    // ---- approval-extras.js E.en ----
    apNav: 'Approvals',
    apQueueTitle: 'Approval queue',
    apQueueSubtitle: 'Templates pending your review',
    apMineTitle: 'My submissions',
    apMineSubtitle: 'Templates you have submitted for approval',
    apDecide: 'Decision',
    apApprove: 'Approve',
    apSendBack: 'Send back',
    apReject: 'Reject',
    apReassign: 'Reassign',
    apNoteLbl: 'Note to maker',
    apNotePh: 'Explain your decision…',
    apReasonLbl: 'Reason',
    apAssignLbl: 'Assign to',
    apEvCreated: 'Created',
    apEvEdited: 'Edited',
    apEvSubmitted: 'Submitted',
    apEvApproved: 'Approved',
    apEvPublished: 'Published',
    apEvSentBack: 'Sent back',
    apEvRejected: 'Rejected',
    apEvReassigned: 'Reassigned',
    apKindNew: 'New template',
    apKindEdit: 'Edit',
    apOwnWork: 'Your submission',
    apAssignedTo: 'Assigned to',
    apSubmittedBy: 'Submitted by',
    apSubmittedAt: 'Submitted',
    apLangs: 'Languages',
    apPriority: 'Priority',
    apPrevVer: 'Previous version',
    apNewVer: 'New version',
    apHistory: 'History',
    apEmpty: 'No items pending review',
    apEmptySub: 'Check back later.',
    apMineEmpty: 'No submissions yet',
    apMineEmptySub: 'Templates you submit will appear here.',
    apStateReady: 'Ready to submit',
    apStateReview: 'Under review',
    apStateSentBack: 'Sent back',
    apStateApproved: 'Approved',
    // ---- view-extras.js E.en ----
    readOnly: 'Read-only',
    details: 'Details',
    editTpl: 'Edit template',
    bodyLbl: 'Message body',
    varsHint: 'Variables used',
    sensitiveHint: 'Contains sensitive data',
    verLabel: 'Version',
    verActive: 'Active',
    verArchived: 'Archived',
    createdBy: 'Created by',
    createdAt: 'Created',
    updatedBy: 'Updated by',
    updatedAt: 'Last updated',
    maker: 'Maker',
    checker: 'Checker',
    viewHistory: 'Version history',
    viewPrev: 'Previous version',
    noDesc: 'No description provided.',
    noTags: 'No tags.',
    attachments: 'Attachments',
    imageUrl: 'Image URL',
    pushTitle: 'Notification title',
    emailSubject: 'Subject line',
    validFrom: 'Valid from',
    validTo: 'Valid to',
    validIndefinite: 'Indefinite',
    usedInCampaigns: 'Used in campaigns',
    notUsed: 'Not used yet',
  },
  ar: {
    // ---- template-data.js T.ar ----
    // nav
    nav: { home: 'لوحة التحكم', campaigns: 'الحملات', templates: 'القوالب', approvals: 'الاعتمادات', audiences: 'العملاء', delivery: 'التسليم', settings: 'الإعدادات' },
    navGroup: { workspace: 'مساحة العمل', governance: 'الحوكمة', data: 'الجمهور والتسليم' },
    dir: 'rtl',
    userName: 'عبدالرحمن العمري', userRole: 'الامتثال · مُعِد', toggleNav: 'طي القائمة',
    crumb: 'محرك الإشعارات', crumbHome: 'القوالب', crumbNew: 'قالب جديد',
    draftBadge: 'جديد · مسودة', assumptionsNote: 'القوائم المعلَّمة "افتراضية" تستخدم قيماً منطقية ريثما يُوقَّع عليها.',
    secDetails: 'تفاصيل القالب', secContent: 'محتوى الرسالة', secSettings: 'التسليم والصلاحية',
    stepDetails: 'التفاصيل', stepContent: 'المحتوى', stepReview: 'المراجعة',
    // title / subtitle
    title: 'قالب إشعار جديد',
    subtitle: 'أدخل التفاصيل أدناه، ثم اكتب محتوى رسالتك.',
    // fields
    fName: 'اسم القالب',
    fNamePh: 'مثال: تنبيه عملية البطاقة',
    fDesc: 'الوصف',
    fDescPh: 'ما الذي يُطلق هذا الإشعار؟',
    fProduct: 'المنتج',
    fChannel: 'القناة',
    fType: 'النوع',
    fPriority: 'الأولوية',
    fTags: 'الوسوم',
    tagsPh: 'أضف وسماً…',
    fValidFrom: 'صالح من',
    fValidTo: 'صالح حتى',
    fLangs: 'اللغات',
    // content
    contentLangs: 'لغات المحتوى',
    addLang: 'إضافة لغة',
    messagePh: 'اكتب رسالتك هنا…',
    subjectLbl: 'سطر الموضوع',
    subjectPh: 'موضوع البريد…',
    titleLbl: 'عنوان الإشعار',
    titlePh: 'عنوان الإشعار الفوري…',
    bodyFormatLbl: 'الصياغة', fmtPlain: 'نص عادي', fmtHtml: 'HTML',
    htmlBodyLbl: 'محتوى HTML', htmlHint: 'يدعم HTML المضمَّن — {{المتغيرات}} تُحلَّل وقت الإرسال.',
    htmlPh: '<p>عزيزي {{customer.first_name}}،</p>\n<p>كشف حسابك جاهز للعرض.</p>',
    variables: 'المتغيرات', variablesHint: 'انقر للإدراج عند المؤشر', searchVars: 'ابحث في المتغيرات',
    expand: 'توسيع', expandPreview: 'فتح المعاينة بملء الشاشة', emailFull: 'معاينة البريد الإلكتروني',
    showSample: 'بيانات نموذجية', showRaw: 'عرض الرموز',
    // segment
    segEncoding: 'الترميز',
    segChars: 'الأحرف',
    segSegments: 'الأجزاء',
    segRemaining: 'المتبقي',
    segPerSeg: 'لكل جزء',
    // settings panel
    settingsTitle: 'إعدادات القالب',
    // review / preview
    reviewTitle: 'معاينة',
    reviewSample: 'قيم نموذجية',
    // set / save
    bnSave: 'حفظ كمسودة',
    bnSubmit: 'إرسال للاعتماد',
    bnCancel: 'إلغاء',
    bnDiscard: 'تجاهل التغييرات',
    set: {
      title: 'الإعدادات', subtitle: 'إدارة العناصر التي تعتمد عليها القوالب — المنتجات وأنواع القوالب والمتغيرات الديناميكية.',
      crumb: 'الإعدادات', flowNote: 'تنعكس التغييرات هنا على نماذج إنشاء القوالب وتعديلها.',
      tabProducts: 'المنتجات', tabTypes: 'أنواع القوالب', tabVars: 'المتغيرات',
      descProducts: 'خطوط الأعمال التي يمكن تصنيف القوالب ضمنها.',
      descTypes: 'الفئات التي تصنّف الغرض من الإشعار.',
      descVars: 'رموز مثل {{token}} تُحلَّل ببيانات حية وقت الإرسال.',
      add: 'إضافة', addProduct: 'إضافة منتج', addType: 'إضافة نوع', addVar: 'إضافة متغير',
      edit: 'تعديل', duplicate: 'تكرار', remove: 'حذف', save: 'حفظ', cancel: 'إلغاء',
      editItem: 'تعديل', newItem: 'جديد',
      search: 'بحث', empty: 'لا يوجد عناصر بعد', emptySub: 'أضف أول عنصر للبدء.', noMatch: 'لا توجد نتائج',
      reorderHint: 'اسحب لإعادة الترتيب',
      colName: 'الاسم', colNameEn: 'الاسم (إنجليزي)', colNameAr: 'الاسم (عربي)', colCode: 'الرمز', colToken: 'المفتاح',
      colLabel: 'التسمية', colLabelEn: 'التسمية (إنجليزي)', colLabelAr: 'التسمية (عربي)',
      colSample: 'نموذج', colSampleEn: 'نموذج (إنجليزي)', colSampleAr: 'نموذج (عربي)',
      colLen: 'الطول', colGroup: 'المجموعة', colUsage: 'مستخدم في',
      lenHint: 'الطول المفترض بعد الحل — يُغذّي تقدير أجزاء الرسالة.',
      codeHint: 'معرّف بأحرف صغيرة بلا مسافات.', tokenHint: 'يُشار إليه في الرسائل بـ {{token}}.',
      fName: 'الاسم', fLabel: 'التسمية', fSample: 'قيمة نموذجية', fLen: 'الطول المفترض', fGroup: 'المجموعة', fCode: 'الرمز', fToken: 'المفتاح',
      delTitle: 'حذف {name}؟', delText: 'سيُزال من الكتالوج. القوالب التي تستخدمه ستحتفظ بنسختها المحفوظة.', delConfirm: 'حذف', delKeep: 'إبقاء',
      usedWarn: 'مستخدم في {n} قالب/قوالب',
      savedToast: 'تم تحديث الكتالوج', savedSub: 'ستستخدم نماذج الإنشاء والتعديل القائمة الجديدة.',
      deletedToast: 'تم حذف العنصر', addedToast: 'تم إضافة العنصر', resetCat: 'إعادة الضبط الافتراضي', resetDone: 'تمت إعادة الكتالوج للضبط الافتراضي',
      items1: 'عنصر واحد', itemsN: '{n} عناصر',
    },
    review: { dir: 'التخطيط', a: 'أ · مساحة العمل', b: 'ب · خطوات', state: 'الحالة', compose: 'كتابة', filled: 'مكتمل', errors: 'أخطاء', saved: 'محفوظ', list: 'القائمة', device: 'الجهاز', desktop: 'حاسوب', mobile: 'جوال', theme: 'المظهر', dark: 'داكن', light: 'فاتح', lang: 'اللغة' },
    // ---- list-extras.js E.ar ----
    tplCount: 'قالب',
    tplCountPlural: 'قوالب',
    filterChannel: 'القناة',
    allChannels: 'جميع القنوات',
    filterProduct: 'المنتج',
    allProducts: 'جميع المنتجات',
    filterType: 'النوع',
    allTypes: 'جميع الأنواع',
    filterStatus: 'الحالة',
    allStatuses: 'جميع الحالات',
    searchPh: 'ابحث في القوالب…',
    newTpl: 'قالب جديد',
    listTitle: 'القوالب',
    listSubtitle: 'إدارة قوالب الإشعارات',
    colName: 'الاسم',
    colChannel: 'القناة',
    colProduct: 'المنتج',
    colType: 'النوع',
    colStatus: 'الحالة',
    colVersion: 'الإصدار',
    colUpdated: 'آخر تحديث',
    colBy: 'بواسطة',
    colActions: 'الإجراءات',
    stActive: 'نشط',
    stDraft: 'مسودة',
    stReview: 'قيد المراجعة',
    stArchived: 'مؤرشف',
    stInactive: 'غير نشط',
    stExpired: 'منتهي',
    actionView: 'عرض',
    actionEdit: 'تعديل',
    actionDelete: 'حذف',
    actionArchive: 'أرشفة',
    noResults: 'لا توجد قوالب',
    noResultsSub: 'جرّب تعديل الفلاتر أو مصطلح البحث.',
    // ---- edit-extras.js E.ar ----
    crumbEdit: 'تعديل',
    editTitle: 'تعديل القالب',
    editSubtitle: 'حدّث تفاصيل القالب ومحتواه.',
    bnDraftTitle: 'تم حفظ المسودة',
    bnDraftBody: 'تم حفظ تغييراتك كمسودة.',
    verActed: 'الإصدار',
    verHistory: 'سجل الإصدارات',
    verCurrent: 'الحالي',
    verDraft: 'مسودة',
    verStatus: 'الحالة',
    verWhen: 'التاريخ',
    verBy: 'بواسطة',
    diffTitle: 'التغييرات عن الإصدار السابق',
    diffPrev: 'السابق',
    diffNew: 'المحدَّث',
    diffAdded: 'مضاف',
    diffRemoved: 'محذوف',
    noChanges: 'لا تغييرات بعد',
    bnSaveDraft: 'حفظ كمسودة',
    bnSubmitApproval: 'إرسال للاعتماد',
    // ---- delete-extras.js E.ar ----
    deleteTpl: 'حذف القالب',
    delTitle: 'حذف هذا القالب؟',
    delBody: 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف القالب وجميع إصداراته نهائياً.',
    delConfirm: 'حذف نهائي',
    delCancel: 'الإبقاء على القالب',
    arcTitle: 'أرشفة هذا القالب؟',
    arcBody: 'ستؤدي الأرشفة إلى تعطيل القالب. يمكنك استعادته لاحقاً.',
    arcRUnused: 'أرشفة',
    arcRUsed: 'أرشفة على أي حال',
    arcConfirm: 'أرشفة',
    arcCancel: 'إلغاء',
    arcWarnUsed: 'هذا القالب مستخدم حالياً في حملات نشطة.',
    delWarnUsed: 'هذا القالب مستخدم حالياً. قد يؤثر حذفه على الحملات النشطة.',
    // ---- approval-extras.js E.ar ----
    apNav: 'الاعتمادات',
    apQueueTitle: 'قائمة الاعتماد',
    apQueueSubtitle: 'القوالب بانتظار مراجعتك',
    apMineTitle: 'طلباتي',
    apMineSubtitle: 'القوالب التي أرسلتها للاعتماد',
    apDecide: 'القرار',
    apApprove: 'اعتماد',
    apSendBack: 'إعادة',
    apReject: 'رفض',
    apReassign: 'إعادة تعيين',
    apNoteLbl: 'ملاحظة للمُعِد',
    apNotePh: 'اشرح قرارك…',
    apReasonLbl: 'السبب',
    apAssignLbl: 'تعيين إلى',
    apEvCreated: 'أُنشئ',
    apEvEdited: 'عُدِّل',
    apEvSubmitted: 'أُرسل',
    apEvApproved: 'اعتُمد',
    apEvPublished: 'نُشر',
    apEvSentBack: 'أُعيد',
    apEvRejected: 'رُفض',
    apEvReassigned: 'أُعيد تعيينه',
    apKindNew: 'قالب جديد',
    apKindEdit: 'تعديل',
    apOwnWork: 'طلبك',
    apAssignedTo: 'معيَّن إلى',
    apSubmittedBy: 'أرسله',
    apSubmittedAt: 'تاريخ الإرسال',
    apLangs: 'اللغات',
    apPriority: 'الأولوية',
    apPrevVer: 'الإصدار السابق',
    apNewVer: 'الإصدار الجديد',
    apHistory: 'السجل',
    apEmpty: 'لا يوجد عناصر بانتظار المراجعة',
    apEmptySub: 'تحقق لاحقاً.',
    apMineEmpty: 'لا طلبات بعد',
    apMineEmptySub: 'ستظهر القوالب التي ترسلها هنا.',
    apStateReady: 'جاهز للإرسال',
    apStateReview: 'قيد المراجعة',
    apStateSentBack: 'أُعيد',
    apStateApproved: 'مُعتمد',
    // ---- view-extras.js E.ar ----
    readOnly: 'للقراءة فقط',
    details: 'التفاصيل',
    editTpl: 'تعديل القالب',
    bodyLbl: 'نص الرسالة',
    varsHint: 'المتغيرات المستخدمة',
    sensitiveHint: 'يحتوي على بيانات حساسة',
    verLabel: 'الإصدار',
    verActive: 'نشط',
    verArchived: 'مؤرشف',
    createdBy: 'أنشأه',
    createdAt: 'تاريخ الإنشاء',
    updatedBy: 'حدَّثه',
    updatedAt: 'آخر تحديث',
    maker: 'المُعِد',
    checker: 'المعتمِد',
    viewHistory: 'سجل الإصدارات',
    viewPrev: 'الإصدار السابق',
    noDesc: 'لا يوجد وصف.',
    noTags: 'لا وسوم.',
    attachments: 'المرفقات',
    imageUrl: 'رابط الصورة',
    pushTitle: 'عنوان الإشعار',
    emailSubject: 'سطر الموضوع',
    validFrom: 'صالح من',
    validTo: 'صالح حتى',
    validIndefinite: 'غير محدد',
    usedInCampaigns: 'مستخدم في حملات',
    notUsed: 'غير مستخدم بعد',
    // dashboard
    welcome: 'مرحباً بعودتك، عبدالرحمن', welcomeSub: 'إليك ما يجري عبر قنواتك اليوم.',
    kpiSent: 'أُرسلت اليوم', kpiSched: 'مجدولة', kpiRate: 'نسبة التسليم',
    recent: 'النشاط الأخير',
    a1t: 'إيداع الراتب — رواتب مايو', a1s: 'تنبيه معاملة · 18,400 مستلم',
    a2t: 'عروض العيد — حاملو بطاقة World', a2s: 'تسويق · مجدولة الساعة 09:00',
    a3t: 'كشف الحساب جاهز — أبريل', a3s: 'تحديث حساب · مسودة',
    sent: 'أُرسلت', scheduled: 'مجدول', draft: 'مسودة',
    // misc UI
    cancel: 'إلغاء', saveDraft: 'حفظ كمسودة', save: 'حفظ القالب',
    back: 'رجوع', next: 'متابعة', toReview: 'مراجعة وحفظ',
    justNow: 'الآن',
    close: 'إغلاق', preview: 'معاينة',
    savedTitle: 'تم حفظ القالب كمسودة', savedSub: 'يتطلب مراجعة مُعِد-معتمِد قبل التفعيل.',
    created: 'أنشأه', createdAt: 'تاريخ الإنشاء', maker: 'المُعِد', checker: 'المعتمِد', pending: 'في انتظار التعيين',
    viewList: 'القوالب', createAnother: 'إنشاء قالب آخر',
    errName: 'اسم القالب مطلوب', errProduct: 'اختر منتجاً', errChannel: 'اختر قناة',
    errType: 'اختر نوع القالب', errContent: 'محتوى الرسالة مطلوب', errValidFrom: 'تاريخ بدء الصلاحية مطلوب',
    fixErrors: 'يرجى إكمال الحقول المعلَّمة.',
  },
};

// ---------- Build & export ----------
const TPL = {
  CHANNELS, PRODUCTS, TYPES, PRIORITIES, LANGS, VAR_GROUPS, VAR_INDEX,
  calcSegments, resolveSample, SAMPLE, CATALOG_KEY,
  LIST, EDIT_TPL, VERSIONS, DRAFT_VERSIONS,
  SENSITIVE, VIEW_TEMPLATES,
  AP: { O, N, S: S_person, F, CURRENT: O, CHECKERS: [N, S_person, F], EVENTS, QUEUE, MINE },
  T,
};

export default TPL;
