/* ============================================================
   Notification Engine — Template Studio
   Shared data: channels, products, types, languages, the predefined
   dynamic-variable catalogue, the SMS segment/encoding calculator,
   and EN/AR i18n strings.

   ASSUMPTIONS (story marks several lists "TO BE COMPLETED" — these are
   reasonable banking-sensible defaults, surfaced in the UI as such):
     • Channel categories, template types, products, priorities below.
     • Each variable carries an assumed resolved length used for the
       SMS segment estimate ("configured variable length values").
     • Validity default: valid-from = today, valid-to = empty (open).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Channels ---------- */
  const CHANNELS = [
    { id: 'sms',      icon: 'message-square-text', en: 'SMS',        ar: 'رسالة نصية' },
    { id: 'email',    icon: 'mail',                en: 'Email',      ar: 'بريد إلكتروني' },
    { id: 'push',     icon: 'smartphone',          en: 'Push',       ar: 'إشعار' },
    { id: 'inapp',    icon: 'bell-ring',           en: 'In-App',     ar: 'داخل التطبيق' },
    { id: 'whatsapp', icon: 'message-circle',      en: 'WhatsApp',   ar: 'واتساب' },
  ];

  /* ---------- Products ---------- */
  let PRODUCTS = [
    { id: 'accounts',  en: 'Personal Accounts',        ar: 'الحسابات الشخصية' },
    { id: 'cards',     en: 'Credit Cards',             ar: 'البطاقات الائتمانية' },
    { id: 'finance',   en: 'Personal Finance',         ar: 'التمويل الشخصي' },
    { id: 'mortgage',  en: 'Home Finance',             ar: 'تمويل المنازل' },
    { id: 'wealth',    en: 'Investment & Wealth',      ar: 'الاستثمار والثروة' },
    { id: 'digital',   en: 'Digital Banking',          ar: 'الخدمات المصرفية الرقمية' },
    { id: 'transfers', en: 'Transfers & Remittances',  ar: 'التحويلات والحوالات' },
  ];

  /* ---------- Template types ---------- */
  let TYPES = [
    { id: 'otp',         en: 'OTP / Verification',  ar: 'رمز التحقق' },
    { id: 'transaction', en: 'Transaction Alert',   ar: 'تنبيه عملية' },
    { id: 'reminder',    en: 'Reminder',            ar: 'تذكير' },
    { id: 'security',    en: 'Security Alert',      ar: 'تنبيه أمني' },
    { id: 'service',     en: 'Service Notice',      ar: 'إشعار خدمة' },
    { id: 'statement',   en: 'Statement / Document', ar: 'كشف / مستند' },
    { id: 'marketing',   en: 'Marketing',           ar: 'تسويقي' },
  ];

  /* ---------- Priority ---------- */
  const PRIORITIES = [
    { id: 'low',      en: 'Low',      ar: 'منخفضة' },
    { id: 'normal',   en: 'Normal',   ar: 'عادية' },
    { id: 'high',     en: 'High',     ar: 'عالية' },
    { id: 'critical', en: 'Critical', ar: 'حرجة' },
  ];

  /* ---------- Languages (template content languages) ---------- */
  const LANGS = [
    { id: 'en', en: 'English', ar: 'الإنجليزية', native: 'English', dir: 'ltr' },
    { id: 'ar', en: 'Arabic',  ar: 'العربية',    native: 'العربية',  dir: 'rtl' },
  ];

  /* ---------- Predefined dynamic variables ----------
     `len` = assumed resolved character length for the segment estimate.
     `en`/`ar` = sample values for the "sample data" preview toggle. */
  let VAR_GROUPS = [
    {
      id: 'customer', en: 'Customer', ar: 'العميل', icon: 'user',
      vars: [
        { token: 'customer.first_name', len: 7,  en: 'Omar',         ar: 'عمر',           lbl_en: 'First name',     lbl_ar: 'الاسم الأول' },
        { token: 'customer.full_name',  len: 16, en: 'Omar Al Otaibi', ar: 'عمر العتيبي',  lbl_en: 'Full name',      lbl_ar: 'الاسم الكامل' },
        { token: 'customer.cif',        len: 9,  en: '100245982',     ar: '100245982',     lbl_en: 'CIF number',     lbl_ar: 'رقم العميل' },
      ],
    },
    {
      id: 'account', en: 'Account', ar: 'الحساب', icon: 'wallet',
      vars: [
        { token: 'account.masked',  len: 8,  en: '••••4416',          ar: '••••٤٤١٦',          lbl_en: 'Masked number', lbl_ar: 'رقم محجوب' },
        { token: 'account.balance', len: 12, en: 'SAR 18,420.00',     ar: '١٨٬٤٢٠٫٠٠ ر.س',     lbl_en: 'Balance',       lbl_ar: 'الرصيد' },
        { token: 'account.iban',    len: 24, en: 'SA03 8000 0000 6080', ar: 'SA03 8000 0000 6080', lbl_en: 'IBAN',        lbl_ar: 'الآيبان' },
      ],
    },
    {
      id: 'transaction', en: 'Transaction', ar: 'العملية', icon: 'arrow-left-right',
      vars: [
        { token: 'txn.amount',   len: 10, en: 'SAR 250.00',  ar: '٢٥٠٫٠٠ ر.س',  lbl_en: 'Amount',   lbl_ar: 'المبلغ' },
        { token: 'txn.merchant', len: 14, en: 'Jarir Bookstore', ar: 'مكتبة جرير', lbl_en: 'Merchant', lbl_ar: 'التاجر' },
        { token: 'txn.datetime', len: 16, en: '02 Jun, 14:32', ar: '٠٢ يونيو، ١٤:٣٢', lbl_en: 'Date & time', lbl_ar: 'التاريخ والوقت' },
        { token: 'txn.ref',      len: 10, en: 'TRX8841902',   ar: 'TRX8841902',  lbl_en: 'Reference', lbl_ar: 'المرجع' },
      ],
    },
    {
      id: 'security', en: 'Security', ar: 'الأمان', icon: 'shield-check',
      vars: [
        { token: 'otp.code',    len: 6, en: '784512', ar: '٧٨٤٥١٢', lbl_en: 'OTP code',     lbl_ar: 'رمز التحقق' },
        { token: 'otp.expiry',  len: 2, en: '10',     ar: '١٠',     lbl_en: 'Expiry (min)', lbl_ar: 'مدة الصلاحية (دقيقة)' },
        { token: 'card.last4',  len: 4, en: '4416',   ar: '٤٤١٦',   lbl_en: 'Card last 4',  lbl_ar: 'آخر ٤ أرقام' },
      ],
    },
    {
      id: 'general', en: 'General', ar: 'عام', icon: 'building-2',
      vars: [
        { token: 'bank.name',      len: 13, en: 'Aljazira Bank', ar: 'بنك الجزيرة', lbl_en: 'Bank name',    lbl_ar: 'اسم البنك' },
        { token: 'support.number', len: 9,  en: '8001160001',    ar: '٨٠٠١١٦٠٠٠١',  lbl_en: 'Support line', lbl_ar: 'خط الدعم' },
        { token: 'date.today',     len: 10, en: '02 Jun 2026',   ar: '٠٢ يونيو ٢٠٢٦', lbl_en: 'Today',       lbl_ar: 'تاريخ اليوم' },
      ],
    },
  ];

  /* ---------- merge saved catalog overrides ----------
     The Settings → catalog manager writes products / types / variable
     groups to localStorage. Apply them here (before VAR_INDEX is built)
     so the Create / Edit / List journeys all see the edited catalogue. */
  const CATALOG_KEY = 'ne-catalog-v1';
  try {
    const saved = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (Array.isArray(saved.products) && saved.products.length) PRODUCTS = saved.products;
      if (Array.isArray(saved.types) && saved.types.length) TYPES = saved.types;
      if (Array.isArray(saved.varGroups) && saved.varGroups.length) VAR_GROUPS = saved.varGroups;
    }
  } catch (e) { /* corrupt store — fall back to defaults */ }

  /* flat token -> meta lookup */
  const VAR_INDEX = {};
  VAR_GROUPS.forEach(g => g.vars.forEach(v => { VAR_INDEX[v.token] = v; }));

  /* ---------- GSM-7 charset (for encoding detection) ---------- */
  const GSM7_BASIC =
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
    "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
  const GSM7_EXT = "^{}\\[~]|€";

  const VAR_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

  /* Replace every {{token}} with `len` filler chars (assumed resolved length). */
  function resolveForCount(text) {
    return text.replace(VAR_RE, (m, tok) => {
      const v = VAR_INDEX[tok];
      const n = v ? v.len : 10;
      return 'x'.repeat(n);
    });
  }

  /* Replace every {{token}} with its sample value in the given language. */
  function resolveSample(text, lang) {
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

  /* Full segment calculation on raw template text. */
  function calcSegments(rawText) {
    const resolved = resolveForCount(rawText);
    const gsm = isGsm7(resolved);
    // count length (GSM-7 ext chars cost 2)
    let len = 0;
    if (gsm) {
      for (const ch of resolved) len += GSM7_EXT.indexOf(ch) > -1 ? 2 : 1;
    } else {
      len = [...resolved].length; // code points; UCS-2
    }
    const single = gsm ? 160 : 70;
    const multi  = gsm ? 153 : 67;
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

  /* ---------- i18n ---------- */
  const T = {
    en: {
      dir: 'ltr',
      // shell / nav
      nav: { home: 'Dashboard', campaigns: 'Campaigns', templates: 'Templates', approvals: 'Approvals', audiences: 'Customers', delivery: 'Delivery', settings: 'Settings' },
      navGroup: { workspace: 'Workspace', governance: 'Governance', data: 'Audience & delivery' },
      userName: 'Abdulrahman Al Amri', userRole: 'Compliance · Maker', toggleNav: 'Collapse menu',
      acct: {
        open: 'Open account menu', myAccount: 'My account', signedInAs: 'Signed in as',
        viewProfile: 'View profile', accountSettings: 'Account settings', signOut: 'Sign out',
        logoutTitle: 'Sign out of the console?',
        logoutText: 'You’ll be returned to the sign-in screen. Make sure any work in progress is saved before you leave.',
        logoutCancel: 'Stay signed in', logoutConfirm: 'Sign out',
      },
      prof: {
        title: 'Profile', subtitle: 'Your account details, role and active sessions.',
        back: 'Back to console', signOut: 'Sign out', readOnly: 'Read-only',
        secPersonal: 'Personal information', secRole: 'Role & permissions', secSessions: 'Active sessions',
        fName: 'Full name', fEmail: 'Email', fPhone: 'Phone', fJob: 'Job title',
        fDept: 'Department', fEmployee: 'Employee ID', fJoined: 'Member since',
        roleLbl: 'Role', permsLbl: 'Permissions',
        permView: 'View templates', permCreate: 'Create & edit templates', permSubmit: 'Submit for approval',
        permApprove: 'Approve / reject', permManage: 'Manage delivery',
        granted: 'Granted', notGranted: 'Not granted',
        thisDevice: 'This device', current: 'Current',
        sessionsNote: 'Sessions are managed by IT — contact support to revoke a device.',
      },
      crumbHome: 'Templates', crumbNew: 'New template',
      // header
      title: 'Create template', subtitle: 'Define a reusable notification for a product and channel.',
      draftBadge: 'New · Draft', assumptionsNote: 'Lists marked “assumed” use sensible defaults pending business sign-off.',
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
      messagePh: 'Type your message. Insert variables from the panel — they’re replaced with live data at send time.',
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
      // list glimpse
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
    },
    ar: {
      dir: 'rtl',
      nav: { home: 'لوحة التحكم', campaigns: 'الحملات', templates: 'القوالب', approvals: 'الاعتمادات', audiences: 'العملاء', delivery: 'التسليم', settings: 'الإعدادات' },
      navGroup: { workspace: 'مساحة العمل', governance: 'الحوكمة', data: 'الجمهور والتسليم' },
      userName: 'عبدالرحمن العمري', userRole: 'الالتزام · مُنشئ', toggleNav: 'طيّ القائمة',
      acct: {
        open: 'فتح قائمة الحساب', myAccount: 'حسابي', signedInAs: 'تسجيل الدخول باسم',
        viewProfile: 'عرض الملف الشخصي', accountSettings: 'إعدادات الحساب', signOut: 'تسجيل الخروج',
        logoutTitle: 'تسجيل الخروج من المنصة؟',
        logoutText: 'ستتم إعادتك إلى شاشة تسجيل الدخول. تأكد من حفظ أي عمل قيد التنفيذ قبل المغادرة.',
        logoutCancel: 'البقاء مسجلاً', logoutConfirm: 'تسجيل الخروج',
      },
      prof: {
        title: 'الملف الشخصي', subtitle: 'تفاصيل حسابك ودورك والجلسات النشطة.',
        back: 'العودة إلى المنصة', signOut: 'تسجيل الخروج', readOnly: 'للعرض فقط',
        secPersonal: 'المعلومات الشخصية', secRole: 'الدور والصلاحيات', secSessions: 'الجلسات النشطة',
        fName: 'الاسم الكامل', fEmail: 'البريد الإلكتروني', fPhone: 'الهاتف', fJob: 'المسمى الوظيفي',
        fDept: 'الإدارة', fEmployee: 'الرقم الوظيفي', fJoined: 'عضو منذ',
        roleLbl: 'الدور', permsLbl: 'الصلاحيات',
        permView: 'عرض القوالب', permCreate: 'إنشاء وتعديل القوالب', permSubmit: 'إرسال للاعتماد',
        permApprove: 'الاعتماد / الرفض', permManage: 'إدارة التسليم',
        granted: 'ممنوحة', notGranted: 'غير ممنوحة',
        thisDevice: 'هذا الجهاز', current: 'الحالية',
        sessionsNote: 'تُدار الجلسات بواسطة تقنية المعلومات — تواصل مع الدعم لإلغاء جهاز.',
      },
      crumbHome: 'القوالب', crumbNew: 'قالب جديد',
      title: 'إنشاء قالب', subtitle: 'حدّد إشعارًا قابلاً لإعادة الاستخدام لمنتج وقناة.',
      draftBadge: 'جديد · مسودة', assumptionsNote: 'القوائم المعلّمة بـ«افتراضي» تستخدم قيمًا مبدئية بانتظار اعتماد الأعمال.',
      secDetails: 'تفاصيل القالب', secContent: 'محتوى الرسالة', secSettings: 'التسليم والصلاحية',
      stepDetails: 'التفاصيل', stepContent: 'المحتوى', stepReview: 'المراجعة',
      fName: 'اسم القالب', fNamePh: 'مثال: تنبيه عملية البطاقة',
      fDesc: 'الوصف', fDescPh: 'ملخص قصير لوقت استخدام هذا القالب',
      fProduct: 'المنتج المرتبط', fChannel: 'فئة القناة', fType: 'نوع القالب', fPriority: 'الأولوية',
      fId: 'معرّف القالب', fVersion: 'الإصدار', fStatus: 'الحالة',
      assumed: 'افتراضي', autoGen: 'يُنشأ تلقائيًا عند الحفظ',
      contentLangs: 'لغات المحتوى', addLang: 'إضافة لغة',
      messagePh: 'اكتب رسالتك. أدرج المتغيرات من اللوحة — تُستبدل ببيانات حية عند الإرسال.',
      subjectLbl: 'سطر الموضوع', subjectPh: 'موضوع البريد',
      titleLbl: 'العنوان', titlePh: 'عنوان الإشعار',
      bodyFormatLbl: 'التنسيق', fmtPlain: 'نص عادي', fmtHtml: 'HTML', htmlBodyLbl: 'محتوى HTML',
      htmlHint: 'يدعم HTML المضمّن — وتبقى المتغيرات {{variables}} تُستبدل عند الإرسال.',
      htmlPh: '<p>عزيزي {{customer.first_name}}،</p>\n<p>كشف حسابك جاهز للاطلاع.</p>',
      expand: 'تكبير', expandPreview: 'فتح المعاينة بملء الشاشة', emailFull: 'معاينة البريد', close: 'إغلاق',
      variables: 'المتغيرات', variablesHint: 'انقر للإدراج عند المؤشر', searchVars: 'بحث المتغيرات',
      showSample: 'بيانات تجريبية', showRaw: 'إظهار الرموز',
      preview: 'المعاينة', segTitle: 'طول الرسالة',
      encoding: 'الترميز', characters: 'الأحرف', segments: 'المقاطع', perSeg: 'لكل مقطع', remaining: 'متبقٍ في آخر مقطع',
      segGsm: 'نص لاتيني يستخدم GSM-7 · ١٦٠ لرسالة واحدة / ١٥٣ لكل مقطع متصل.',
      segUni: 'عربي / يونيكود يستخدم UCS-2 · ٧٠ لرسالة واحدة / ٦٧ لكل مقطع متصل.',
      fValidFrom: 'صالح من', fValidTo: 'صالح حتى', validToOpen: 'بدون تاريخ انتهاء (مفتوح)',
      fTags: 'الوسوم', tagsPh: 'أضف وسمًا واضغط Enter',
      fAttach: 'المرفقات', attachHint: 'أفلت الملفات أو تصفح — PDF أو PNG أو JPG حتى ٥ ميجابايت',
      fNotes: 'ملاحظات داخلية', notesPh: 'ملاحظات للمراجعين (لا تُرسل للعملاء)',
      cancel: 'إلغاء', saveDraft: 'حفظ كمسودة', save: 'حفظ القالب',
      back: 'رجوع', next: 'متابعة', toReview: 'المراجعة والحفظ',
      errName: 'اسم القالب مطلوب', errProduct: 'اختر منتجًا', errChannel: 'اختر قناة',
      errType: 'اختر نوع القالب', errContent: 'محتوى الرسالة مطلوب', errValidFrom: 'تاريخ بدء الصلاحية مطلوب',
      fixErrors: 'يرجى إكمال الحقول المحددة.',
      savedTitle: 'تم حفظ القالب كمسودة', savedSub: 'تلزم مراجعة المُنشئ والمُدقّق قبل التفعيل.',
      created: 'أنشئ بواسطة', createdAt: 'تاريخ الإنشاء', maker: 'المُنشئ', checker: 'المُدقّق', pending: 'بانتظار التعيين',
      viewList: 'الذهاب إلى القوالب', createAnother: 'إنشاء قالب آخر',
      listTitle: 'القوالب', listNew: 'قالب جديد', searchList: 'بحث القوالب',
      colName: 'الاسم', colProduct: 'المنتج', colChannel: 'القناة', colType: 'النوع', colVer: 'الإصدار', colStatus: 'الحالة', colUpdated: 'آخر تحديث',
      stDraft: 'مسودة', stReview: 'قيد المراجعة', stActive: 'نشط', stExpired: 'منتهٍ',
      justNow: 'الآن',
      review: { dir: 'التخطيط', a: 'أ · مساحة العمل', b: 'ب · خطوات', state: 'الحالة', compose: 'تحرير', filled: 'معبأ', errors: 'أخطاء', saved: 'محفوظ', list: 'القائمة', device: 'الجهاز', desktop: 'سطح المكتب', mobile: 'جوال', theme: 'السمة', dark: 'داكن', light: 'فاتح', lang: 'اللغة' },
      set: {
        title: 'الإعدادات', subtitle: 'أدر العناصر الأساسية التي تعتمد عليها القوالب — المنتجات وأنواع القوالب والمتغيرات الديناميكية.',
        crumb: 'الإعدادات', flowNote: 'تنعكس التغييرات هنا على نموذجَي إنشاء القالب وتحريره.',
        tabProducts: 'المنتجات', tabTypes: 'أنواع القوالب', tabVars: 'المتغيرات',
        descProducts: 'خطوط الأعمال التي يمكن تصنيف القالب ضمنها.',
        descTypes: 'فئات تُصنّف الغرض من الإشعار.',
        descVars: 'رموز مثل {{token}} تُستبدل ببيانات حية عند الإرسال.',
        add: 'إضافة', addProduct: 'إضافة منتج', addType: 'إضافة نوع', addVar: 'إضافة متغير',
        edit: 'تحرير', duplicate: 'نسخ', remove: 'حذف', save: 'حفظ', cancel: 'إلغاء',
        editItem: 'تحرير', newItem: 'جديد',
        search: 'بحث', empty: 'لا يوجد شيء بعد', emptySub: 'أضف العنصر الأول للبدء.', noMatch: 'لا نتائج',
        reorderHint: 'اسحب لإعادة الترتيب',
        colName: 'الاسم', colNameEn: 'الاسم (إنجليزي)', colNameAr: 'الاسم (عربي)', colCode: 'الرمز', colToken: 'الرمز',
        colLabel: 'التسمية', colLabelEn: 'التسمية (إنجليزي)', colLabelAr: 'التسمية (عربي)',
        colSample: 'مثال', colSampleEn: 'مثال (إنجليزي)', colSampleAr: 'مثال (عربي)',
        colLen: 'الطول', colGroup: 'المجموعة', colUsage: 'مُستخدم في',
        lenHint: 'الطول المفترض بعد الاستبدال — يُستخدم في تقدير مقاطع الرسائل النصية.',
        codeHint: 'معرّف بأحرف صغيرة بدون مسافات.', tokenHint: 'يُشار إليه في الرسائل بـ {{token}}.',
        fName: 'الاسم', fLabel: 'التسمية', fSample: 'قيمة تجريبية', fLen: 'الطول المفترض', fGroup: 'المجموعة', fCode: 'الرمز', fToken: 'الرمز',
        delTitle: 'حذف {name}؟', delText: 'سيُزال من الكتالوج. القوالب التي تستخدمه تحتفظ بنسختها المحفوظة.', delConfirm: 'حذف', delKeep: 'إبقاء',
        usedWarn: 'مُستخدم في {n} قالب',
        savedToast: 'تم تحديث الكتالوج', savedSub: 'ستستخدم نماذج الإنشاء والتحرير القائمة الجديدة.',
        deletedToast: 'تم حذف العنصر', addedToast: 'تمت الإضافة', resetCat: 'إعادة للافتراضي', resetDone: 'أُعيد الكتالوج إلى الإعدادات الافتراضية',
        items1: 'عنصر واحد', itemsN: '{n} عناصر',
      },
    },
  };

  /* sample seed content for the "Filled" state (an OTP SMS) */
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

  /* template list seed (the "where it lands" glimpse) */
  const LIST_SEED = [
    { name_en: 'OTP — login verification', name_ar: 'رمز الدخول', product: 'digital', channel: 'sms', type: 'otp', ver: 'v3', status: 'active', updated_en: '2 days ago', updated_ar: 'قبل يومين' },
    { name_en: 'Salary credited', name_ar: 'إيداع الراتب', product: 'accounts', channel: 'push', type: 'transaction', ver: 'v2', status: 'active', updated_en: '5 days ago', updated_ar: 'قبل ٥ أيام' },
    { name_en: 'Card statement ready', name_ar: 'كشف البطاقة جاهز', product: 'cards', channel: 'email', type: 'statement', ver: 'v1', status: 'review', updated_en: '1 week ago', updated_ar: 'قبل أسبوع' },
    { name_en: 'Ramadan offer', name_ar: 'عرض رمضان', product: 'cards', channel: 'whatsapp', type: 'marketing', ver: 'v4', status: 'expired', updated_en: '2 months ago', updated_ar: 'قبل شهرين' },
  ];

  /* signed-in user — profile, role/permissions, sessions (read-only demo data) */
  const PROFILE = {
    initial: 'A',
    name: { en: 'Abdulrahman Al Amri', ar: 'عبدالرحمن العمري' },
    role: { en: 'Compliance · Maker', ar: 'الالتزام · مُنشئ' },
    roleTag: { en: 'Maker', ar: 'مُنشئ' },
    email: 'a.alamri@aljazira.sa',
    phone: '+966 50 123 4567',
    job: { en: 'Compliance Officer', ar: 'مسؤول التزام' },
    dept: { en: 'Compliance & Governance', ar: 'الالتزام والحوكمة' },
    employeeId: 'AJB-04821',
    joined: { en: 'March 2021', ar: 'مارس 2021' },
    perms: [
      { id: 'permView', granted: true },
      { id: 'permCreate', granted: true },
      { id: 'permSubmit', granted: true },
      { id: 'permApprove', granted: false },
      { id: 'permManage', granted: false },
    ],
    sessions: [
      { id: 1, icon: 'monitor', device: { en: 'Chrome · macOS', ar: 'Chrome · macOS' }, loc: { en: 'Riyadh, SA', ar: 'الرياض، السعودية' }, last: { en: 'Active now', ar: 'نشطة الآن' }, current: true },
      { id: 2, icon: 'smartphone', device: { en: 'aljazira app · iOS', ar: 'تطبيق الجزيرة · iOS' }, loc: { en: 'Riyadh, SA', ar: 'الرياض، السعودية' }, last: { en: '2 hours ago', ar: 'قبل ساعتين' }, current: false },
      { id: 3, icon: 'tablet', device: { en: 'Safari · iPadOS', ar: 'Safari · iPadOS' }, loc: { en: 'Jeddah, SA', ar: 'جدة، السعودية' }, last: { en: 'Yesterday', ar: 'أمس' }, current: false },
    ],
  };

  window.TPL = {
    CHANNELS, PRODUCTS, TYPES, PRIORITIES, LANGS, VAR_GROUPS, VAR_INDEX,
    calcSegments, resolveSample, T, SAMPLE, LIST_SEED, CATALOG_KEY, PROFILE,
  };
})();
