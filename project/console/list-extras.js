/* ============================================================
   Notification Engine — Templates list extras
   The Template Store list dataset + filter/list i18n, merged into
   the shared TPL object. MUST load after template-data.js.

   Story context: "Template list (search, filter, statuses)" — the
   entry point. Rows route to View (Details) and Edit.
   ============================================================ */
(function () {
  'use strict';
  if (!window.TPL) { console.error('list-extras: TPL missing'); return; }

  const E = {
    en: {
      tplCount: '{n} templates', tplCount1: '1 template',
      filterChannel: 'Channel', allChannels: 'All channels',
      filterStatus: 'Status', allStatuses: 'All statuses',
      filterProduct: 'Product', allProducts: 'All products',
      colActions: 'Actions', clearFilters: 'Clear filters',
      noResultsTitle: 'No templates match', noResultsText: 'Try adjusting your search or filters.',
      detailsAction: 'View details', editAction: 'Edit', updatedByShort: 'by',
      stInactive: 'Inactive', stExpired: 'Expired',
    },
    ar: {
      tplCount: '{n} قالبًا', tplCount1: 'قالب واحد',
      filterChannel: 'القناة', allChannels: 'كل القنوات',
      filterStatus: 'الحالة', allStatuses: 'كل الحالات',
      filterProduct: 'المنتج', allProducts: 'كل المنتجات',
      colActions: 'إجراءات', clearFilters: 'مسح عوامل التصفية',
      noResultsTitle: 'لا توجد قوالب مطابقة', noResultsText: 'جرّب تعديل البحث أو عوامل التصفية.',
      detailsAction: 'عرض التفاصيل', editAction: 'تعديل', updatedByShort: 'بواسطة',
      stInactive: 'غير نشط', stExpired: 'منتهٍ',
    },
  };
  Object.keys(E).forEach(l => Object.assign(window.TPL.T[l], E[l]));

  const O = { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' };
  const N = { en: 'N. Al Harbi', ar: 'ناصر الحربي' };
  const S = { en: 'S. Al Qahtani', ar: 'سارة القحطاني' };

  /* the three with full detail data carry their real ids + ?ch= route */
  const LIST = [
    { id: 'TPL-2026-03318', ch: 'sms',      product: 'cards',     type: 'transaction', ver: 'v3', status: 'active',   by: N, name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' }, upd: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' }, detail: 'sms' },
    { id: 'TPL-2026-04102', ch: 'email',    product: 'cards',     type: 'statement',   ver: 'v2', status: 'active',   by: S, name: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' }, upd: { en: '20 Apr 2026', ar: '٢٠ أبريل ٢٠٢٦' }, detail: 'email' },
    { id: 'TPL-2026-03907', ch: 'push',     product: 'accounts',  type: 'transaction', ver: 'v2', status: 'active',   by: O, name: { en: 'Salary credited', ar: 'إيداع الراتب' }, upd: { en: '02 May 2026', ar: '٠٢ مايو ٢٠٢٦' }, detail: 'push' },
    { id: 'TPL-2026-04410', ch: 'sms',      product: 'digital',   type: 'otp',         ver: 'v5', status: 'active',   by: N, name: { en: 'OTP — login verification', ar: 'رمز التحقق للدخول' }, upd: { en: '2 days ago', ar: 'قبل يومين' }, detail: 'sms' },
    { id: 'TPL-2026-04388', ch: 'push',     product: 'transfers', type: 'security',    ver: 'v1', status: 'review',   by: S, name: { en: 'Beneficiary added', ar: 'تمت إضافة مستفيد' }, upd: { en: '1 week ago', ar: 'قبل أسبوع' }, detail: 'push' },
    { id: 'TPL-2026-04401', ch: 'sms',      product: 'finance',   type: 'reminder',    ver: 'v2', status: 'draft',    used: false, by: O, name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' }, upd: { en: 'just now', ar: 'الآن' }, detail: 'sms' },
    { id: 'TPL-2026-04210', ch: 'inapp',    product: 'digital',   type: 'security',    ver: 'v3', status: 'active',   by: N, name: { en: 'New device sign-in', ar: 'دخول من جهاز جديد' }, upd: { en: 'yesterday', ar: 'أمس' }, detail: 'push' },
    { id: 'TPL-2026-03980', ch: 'whatsapp', product: 'cards',     type: 'marketing',   ver: 'v4', status: 'expired',  by: O, name: { en: 'Ramadan cashback offer', ar: 'عرض كاش باك رمضان' }, upd: { en: '2 months ago', ar: 'قبل شهرين' }, detail: 'sms' },
    { id: 'TPL-2026-04150', ch: 'email',    product: 'accounts',  type: 'service',     ver: 'v1', status: 'draft',    used: true,  by: S, name: { en: 'IBAN ready', ar: 'الآيبان جاهز' }, upd: { en: '3 days ago', ar: 'قبل ٣ أيام' }, detail: 'email' },
    { id: 'TPL-2026-04075', ch: 'push',     product: 'digital',   type: 'security',    ver: 'v2', status: 'active',   by: N, name: { en: 'Password changed', ar: 'تم تغيير كلمة المرور' }, upd: { en: '5 days ago', ar: 'قبل ٥ أيام' }, detail: 'push' },
    { id: 'TPL-2026-03450', ch: 'email',    product: 'cards',     type: 'service',     ver: 'v1', status: 'archived', by: O, name: { en: 'Statement archive notice', ar: 'إشعار أرشفة الكشوف' }, upd: { en: '6 months ago', ar: 'قبل ٦ أشهر' }, detail: 'email' },
    { id: 'TPL-2026-04299', ch: 'sms',      product: 'wealth',    type: 'reminder',    ver: 'v1', status: 'inactive', by: S, name: { en: 'Investment maturity', ar: 'استحقاق الاستثمار' }, upd: { en: '1 month ago', ar: 'قبل شهر' }, detail: 'sms' },
  ];

  window.TPL.LIST = LIST;
})();
