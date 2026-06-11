/* ============================================================
   Notification Engine — Delete Draft Templates extras
   i18n for the delete flow (confirm / blocked / toast), merged into
   the shared TPL object. MUST load after template-data.js.

   Story: "Delete Draft Templates" (TEMPLATES_MANAGE).
   • Only Draft + never-used templates can be permanently deleted.
   • Confirmation required; deletion is permanent.
   • Non-draft → blocked, suggest Deactivation / Archival.
   • A deletion event is recorded in the audit log (who/when/which).
   ============================================================ */
(function () {
  'use strict';
  if (!window.TPL) { console.error('delete-extras: TPL missing'); return; }

  const E = {
    en: {
      deleteTpl: 'Delete', archiveTpl: 'Archive', deactivateTpl: 'Deactivate', duplicateTpl: 'Duplicate',
      delDraftOnly: 'Only drafts can be deleted',
      // confirm
      delTitle: 'Delete this draft template?',
      delText: 'This permanently deletes “{name}”. This action cannot be undone.',
      delConfirm: 'Delete permanently', delKeep: 'Cancel',
      // blocked — not a draft
      blkNdTitle: 'Only drafts can be deleted',
      blkNdText: 'This template is {status}. Active, in-review, and published templates can’t be deleted — deactivate or archive it instead.',
      // blocked — used in a process
      blkUsedTitle: 'This template has been used',
      blkUsedText: 'It has been used to send notifications, so it can’t be deleted. Archive it to remove it from active listings.',
      blkArchive: 'Archive instead', blkClose: 'Close',
      // toasts
      tDeleted: 'Template deleted', tDeletedSub: 'Recorded in the audit log · by A. Al Amri',
      tArchived: 'Template archived', tArchivedSub: 'Moved out of active listings · by A. Al Amri',
      // detail-page delete
      rvDraft: 'Draft',
      delGoneTitle: 'This template was deleted',
      delGoneText: 'It has been permanently removed and can no longer be used for sending. A deletion event was written to the audit log.',
      delGoneBack: 'Back to templates',
      // archive
      arcTitle: 'Archive this template?',
      arcText: 'Archiving removes “{name}” from active use and makes it unavailable for new notifications. It stays visible for reference and audit — history and previous versions are kept.',
      arcReasonLbl: 'Reason (optional)',
      arcRUnused: 'No longer used', arcRReplaced: 'Replaced', arcROutdated: 'Outdated',
      arcRCompliance: 'Compliance change', arcRDuplicate: 'Duplicate', arcROther: 'Other',
      arcOtherPh: 'Add a short note',
      arcNote: 'Archived templates can’t be edited or used to send, and can’t be restored. You can still duplicate them.',
      arcConfirm: 'Archive template', arcCancel: 'Cancel',
      tArchivedSubReason: 'Recorded in the audit log · {reason} · by A. Al Amri',
      // archived detail banner + lifecycle
      arcBannerTitle: 'This template is archived',
      arcBannerText: 'Kept for reference and audit. It can’t be edited or used for new notifications, and can’t be restored — you can duplicate it to start a new template.',
      lcArchivedBy: 'Archived by', lcArchivedAt: 'Archived at', lcArchivedReason: 'Reason',
      arcDuplicate: 'Duplicate',
      // menu / aria
      rowMenu: 'Actions',
    },
    ar: {
      deleteTpl: 'حذف', archiveTpl: 'أرشفة', deactivateTpl: 'إلغاء التفعيل', duplicateTpl: 'نسخ',
      delDraftOnly: 'يمكن حذف المسودات فقط',
      delTitle: 'حذف هذه المسودة؟',
      delText: 'سيؤدي هذا إلى حذف «{name}» نهائيًا. لا يمكن التراجع عن هذا الإجراء.',
      delConfirm: 'حذف نهائي', delKeep: 'إلغاء',
      blkNdTitle: 'لا يمكن حذف غير المسودات',
      blkNdText: 'حالة هذا القالب {status}. لا يمكن حذف القوالب النشطة أو قيد المراجعة أو المنشورة — قم بإلغاء تفعيله أو أرشفته بدلًا من ذلك.',
      blkUsedTitle: 'تم استخدام هذا القالب',
      blkUsedText: 'تم استخدامه لإرسال إشعارات، لذا لا يمكن حذفه. أرشفه لإزالته من القوائم النشطة.',
      blkArchive: 'الأرشفة بدلًا من ذلك', blkClose: 'إغلاق',
      tDeleted: 'تم حذف القالب', tDeletedSub: 'سُجّل في سجل التدقيق · بواسطة عبدالرحمن العمري',
      tArchived: 'تم أرشفة القالب', tArchivedSub: 'أُزيل من القوائم النشطة · بواسطة عبدالرحمن العمري',
      // detail-page delete
      rvDraft: 'مسودة',
      delGoneTitle: 'تم حذف هذا القالب',
      delGoneText: 'تمت إزالته نهائيًا ولم يعد قابلاً للإرسال. وسُجّل حدث الحذف في سجل التدقيق.',
      delGoneBack: 'العودة إلى القوالب',
      // archive
      arcTitle: 'أرشفة هذا القالب؟',
      arcText: 'تؤدي الأرشفة إلى إزالة «{name}» من الاستخدام النشط وجعله غير متاح للإشعارات الجديدة. يبقى ظاهرًا للرجوع والتدقيق — مع الاحتفاظ بالسجل والإصدارات السابقة.',
      arcReasonLbl: 'السبب (اختياري)',
      arcRUnused: 'لم يعد مستخدمًا', arcRReplaced: 'تم استبداله', arcROutdated: 'قديم',
      arcRCompliance: 'تغيير امتثال', arcRDuplicate: 'مكرر', arcROther: 'أخرى',
      arcOtherPh: 'أضف ملاحظة قصيرة',
      arcNote: 'لا يمكن تعديل القوالب المؤرشفة أو استخدامها للإرسال، ولا يمكن استعادتها. ويمكنك نسخها.',
      arcConfirm: 'أرشفة القالب', arcCancel: 'إلغاء',
      tArchivedSubReason: 'سُجّل في سجل التدقيق · {reason} · بواسطة عبدالرحمن العمري',
      arcBannerTitle: 'هذا القالب مؤرشف',
      arcBannerText: 'محفوظ للرجوع والتدقيق. لا يمكن تعديله أو استخدامه لإشعارات جديدة، ولا يمكن استعادته — يمكنك نسخه لإنشاء قالب جديد.',
      lcArchivedBy: 'أُرشف بواسطة', lcArchivedAt: 'تاريخ الأرشفة', lcArchivedReason: 'السبب',
      arcDuplicate: 'نسخ',
      rowMenu: 'إجراءات',
    },
  };
  Object.keys(E).forEach(l => Object.assign(window.TPL.T[l], E[l]));
})();
