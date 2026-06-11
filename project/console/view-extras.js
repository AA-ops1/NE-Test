/* ============================================================
   Notification Engine — View Template Details extras
   Read-only detail data + i18n, merged into the shared TPL object.
   MUST load after template-data.js.

   Story: "View Template Details" (TEMPLATES_VIEW). Read-only view,
   per the Notification Attributes Matrix: details vary by template
   TYPE + CHANNEL. Email → subject + attachments; Push → title +
   image URL; SMS/WhatsApp → body + segments. Historical versions
   are accessible via a version switcher. Sensitive variables are
   masked per data-protection policy.
   ============================================================ */
(function () {
  'use strict';
  if (!window.TPL) { console.error('view-extras: TPL missing'); return; }

  const E = {
    en: {
      // read-only chrome
      readOnly: 'Read-only', readOnlyHint: 'Viewing only — opening details makes no changes.',
      details: 'Details', editTpl: 'Edit template', moreActions: 'More',
      duplicate: 'Duplicate', exportTpl: 'Export', archive: 'Archive',
      // version switcher
      viewingVer: 'Viewing', switchVer: 'Switch version', latest: 'Latest', historical: 'Historical',
      olderTitle: 'You’re viewing an older version', olderText: '{ver} is archived. The latest version is {latest}.',
      viewLatest: 'View latest version',
      // sections
      secOverview: 'Overview', secStructure: 'Content structure', secVarsUsed: 'Variables in this template',
      vwBoth: 'Both',
      secLifecycle: 'Lifecycle & audit', secAttrs: 'Attributes',
      // content structure labels
      bodyLbl: 'Message body', imageLbl: 'Image (EN)', imageUrlLbl: 'Image URL', ctaLbl: 'Action button',
      attachLbl: 'Attachments', attachNone: 'No attachments', noContent: 'No content for this language.',
      // variables
      varsHint: 'Resolved with live customer data at send time.',
      noVars: 'This template uses no dynamic variables.', sensitive: 'Sensitive',
      sensitiveNote: 'Sensitive values are masked in non-production previews, audit logs, and to users without elevated access.',
      varCount: '{n} variables', varCount1: '1 variable',
      // lifecycle
      lcCreated: 'Created', lcUpdated: 'Last updated', lcApproval: 'Approval',
      lcApproved: 'Approved & published', lcMaker: 'Maker', lcChecker: 'Checker',
      // review bar
      rvTemplate: 'Template',
    },
    ar: {
      readOnly: 'للعرض فقط', readOnlyHint: 'العرض فقط — فتح التفاصيل لا يُجري أي تغيير.',
      details: 'التفاصيل', editTpl: 'تعديل القالب', moreActions: 'المزيد',
      duplicate: 'نسخ', exportTpl: 'تصدير', archive: 'أرشفة',
      viewingVer: 'تعرض', switchVer: 'تبديل الإصدار', latest: 'الأحدث', historical: 'أرشيفي',
      olderTitle: 'أنت تعرض إصدارًا أقدم', olderText: '{ver} مؤرشف. أحدث إصدار هو {latest}.',
      viewLatest: 'عرض أحدث إصدار',
      secOverview: 'نظرة عامة', secStructure: 'بنية المحتوى', secVarsUsed: 'المتغيرات في هذا القالب',
      vwBoth: 'كلاهما',
      secLifecycle: 'دورة الحياة والتدقيق', secAttrs: 'الخصائص',
      bodyLbl: 'نص الرسالة', imageLbl: 'الصورة (إنجليزي)', imageUrlLbl: 'رابط الصورة', ctaLbl: 'زر الإجراء',
      attachLbl: 'المرفقات', attachNone: 'لا مرفقات', noContent: 'لا يوجد محتوى لهذه اللغة.',
      varsHint: 'تُستبدل ببيانات العميل الحية عند الإرسال.',
      noVars: 'لا يستخدم هذا القالب متغيرات ديناميكية.', sensitive: 'حساس',
      sensitiveNote: 'تُخفى القيم الحساسة في معاينات غير الإنتاج وسجلات التدقيق وللمستخدمين دون صلاحية مرتفعة.',
      varCount: '{n} متغيرات', varCount1: 'متغير واحد',
      lcCreated: 'أُنشئ', lcUpdated: 'آخر تحديث', lcApproval: 'الاعتماد',
      lcApproved: 'مُعتمد ومنشور', lcMaker: 'المُنشئ', lcChecker: 'المُدقّق',
      rvTemplate: 'القالب',
    },
  };
  Object.keys(E).forEach(l => Object.assign(window.TPL.T[l], E[l]));

  /* sensitive tokens — masked in non-prod previews & to low-access users */
  const SENSITIVE = ['account.balance', 'account.iban', 'account.masked', 'otp.code', 'customer.cif', 'card.last4'];

  const O = { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' };
  const N = { en: 'N. Al Harbi', ar: 'ناصر الحربي' };
  const S = { en: 'S. Al Qahtani', ar: 'سارة القحطاني' };
  const PENDING = { en: 'Pending assignment', ar: 'بانتظار التعيين' };

  /* per-channel sample templates, each with a versioned history.
     The version switcher swaps the displayed version's content. */
  const VIEW_TEMPLATES = {
    sms: {
      id: 'TPL-2026-03318', channel: 'sms', product: 'cards', type: 'transaction', priority: 'high',
      name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' },
      desc: { en: 'Sent when a card purchase is authorised.', ar: 'يُرسل عند اعتماد عملية شراء بالبطاقة.' },
      tags: { en: ['cards', 'alert', 'realtime'], ar: ['بطاقات', 'تنبيه', 'فوري'] },
      validFrom: '2026-01-14', validTo: '',
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
          updatedBy: O, updatedAt: { en: '03 Mar 2026, 16:40', ar: '٠٣ مارس ٢٠٢٦، ١٦:٤٠' }, maker: O, checker: S,
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
      validFrom: '2026-02-01', validTo: '',
      langs: ['en', 'ar'],
      createdBy: S, createdAt: { en: '01 Feb 2026, 08:30', ar: '٠١ فبراير ٢٠٢٦، ٠٨:٣٠' },
      versions: [
        {
          ver: 'v2', status: 'active', acted: 'approved', current: true,
          who: N, when: { en: '20 Apr 2026', ar: '٢٠ أبريل ٢٠٢٦' },
          updatedBy: S, updatedAt: { en: '20 Apr 2026, 10:05', ar: '٢٠ أبريل ٢٠٢٦، ١٠:٠٥' }, maker: S, checker: N,
          subject: { en: 'Your {{bank.name}} card statement is ready', ar: 'كشف بطاقة {{bank.name}} جاهز' },
          content: {
            en: 'Dear {{customer.first_name}},\n\nYour statement for the card ending {{card.last4}} is now available. Outstanding balance: {{account.balance}}, due on {{date.today}}.\n\nView it securely in the aljazira app.',
            ar: 'عزيزي {{customer.first_name}}،\n\nكشف البطاقة المنتهية بـ {{card.last4}} متاح الآن. الرصيد المستحق: {{account.balance}}، يستحق في {{date.today}}.\n\nاطّلع عليه بأمان عبر تطبيق الجزيرة.',
          },
          attachments: [{ name: 'Statement-May-2026.pdf', size: '212 KB' }],
        },
        {
          ver: 'v1', status: 'archived', acted: 'created',
          who: S, when: { en: '01 Feb 2026', ar: '٠١ فبراير ٢٠٢٦' },
          updatedBy: S, updatedAt: { en: '01 Feb 2026, 08:30', ar: '٠١ فبراير ٢٠٢٦، ٠٨:٣٠' }, maker: S, checker: N,
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
      validFrom: '2026-03-10', validTo: '',
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
          updatedBy: O, updatedAt: { en: '10 Mar 2026, 13:15', ar: '١٠ مارس ٢٠٢٦، ١٣:١٥' }, maker: O, checker: S,
          ntitle: { en: 'Salary credited', ar: 'تم إيداع الراتب' },
          content: {
            en: 'Your salary of {{txn.amount}} has been credited.',
            ar: 'تم إيداع راتبك البالغ {{txn.amount}}.',
          },
          imageUrl: '',
        },
      ],
    },
  };

  /* a Draft, never-used template — the deletable case for the delete story.
     Mirrors list row TPL-2026-04401. `used:false` + status draft → can delete. */
  VIEW_TEMPLATES.draft = {
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
  };

  /* mark the published samples as used in a notification process (block delete) */
  ['sms', 'email', 'push'].forEach(k => { VIEW_TEMPLATES[k].used = true; });

  window.TPL.SENSITIVE = SENSITIVE;
  window.TPL.VIEW_TEMPLATES = VIEW_TEMPLATES;
})();
