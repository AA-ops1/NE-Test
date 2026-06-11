/* ============================================================
   Notification Engine — Edit Template extras
   Merges edit-specific i18n + version-history data into the shared
   TPL object defined in template-data.js. MUST load after it.

   Story: "Edit Notification Templates" (TEMPLATES_MANAGE).
   Editing rules depend on status:
     • Draft   → edit the same version directly (Save / Save as draft).
     • Active / Inactive-versioned → editing creates a NEW draft version
       (e.g. v4 Draft) for maker–checker review; the active version
       stays live until the new one is approved.
     • Approved/Active versions are never modified in place.
     • Archived templates are not editable (locked).
   ============================================================ */
(function () {
  'use strict';
  if (!window.TPL) { console.error('edit-extras: TPL missing'); return; }

  /* ---------- edit i18n (merged into TPL.T) ---------- */
  const E = {
    en: {
      crumbEdit: 'Edit',
      editTitle: 'Edit template',
      editSub: 'Update content and configuration. Changes follow maker–checker review before going live.',
      // header meta
      lastUpdated: 'Last updated by', metaOn: 'on', metaSep: '·',
      unsaved: 'Unsaved changes', editing: 'Editing',
      // status-aware banner
      bnDraftTitle: 'You’re editing draft {ver} directly',
      bnDraftText: 'Changes save to this same draft version. Submit it for maker–checker review when it’s ready.',
      bnActiveTitle: 'This is the active version ({ver})',
      bnActiveText: 'Saving your edits creates a new draft version ({next}) for maker–checker review. {ver} stays live until the new version is approved.',
      bnErrTitle: 'Some fields need attention',
      bnErrText: 'Resolve the highlighted fields below before saving.',
      // actions
      saveChanges: 'Save changes', saveNewDraft: 'Save as new draft', submitReview: 'Save & submit for review',
      discard: 'Discard changes', viewHistory: 'View history',
      // version history
      verTitle: 'Version history', verCurrent: 'Current', verNew: 'New', verBy: 'by',
      verActed: { created: 'Created', edited: 'Edited', submitted: 'Submitted for review', approved: 'Approved & published', superseded: 'Superseded', archived: 'Archived', rejected: 'Returned' },
      // discard dialog
      dgTitle: 'Discard your changes?', dgText: 'Your edits to this template will be lost and cannot be recovered.',
      dgKeep: 'Keep editing', dgDiscard: 'Discard',
      // locked
      lkTitle: 'This template can’t be edited', lkArchived: 'It’s archived. Restore it from version history before making changes.',
      lkRestore: 'Restore template', lkBackList: 'Back to templates',
      // saved (new version path)
      svNewTitle: 'New version submitted for review', svNewSub: 'It’s now a draft awaiting maker–checker approval. The active version stays live until the new one is approved.',
      svDraftTitle: 'Draft updated', svDraftSub: 'Your changes were saved to this draft version. Submit it for review when it’s ready.',
      svViewVer: 'View version', svBackTemplate: 'Back to template',
      updatedBy: 'Updated by', updatedAt: 'Updated at',
      stArchived: 'Archived', stInactive: 'Inactive',
      revActive: 'Active', revDraft: 'Draft', revErrors: 'Errors', revLocked: 'Locked', revSaved: 'Saved', revScenario: 'Scenario',
    },
    ar: {
      crumbEdit: 'تعديل',
      editTitle: 'تعديل القالب',
      editSub: 'حدّث المحتوى والإعدادات. تخضع التغييرات لمراجعة المُنشئ والمُدقّق قبل النشر.',
      lastUpdated: 'آخر تحديث بواسطة', metaOn: 'في', metaSep: '·',
      unsaved: 'تغييرات غير محفوظة', editing: 'قيد التعديل',
      bnDraftTitle: 'أنت تعدّل المسودة {ver} مباشرة',
      bnDraftText: 'تُحفظ التغييرات في نفس المسودة. أرسلها لمراجعة المُنشئ والمُدقّق عند جاهزيتها.',
      bnActiveTitle: 'هذا هو الإصدار النشط ({ver})',
      bnActiveText: 'حفظ تعديلاتك يُنشئ مسودة إصدار جديدة ({next}) لمراجعة المُنشئ والمُدقّق. يبقى {ver} نشطًا حتى اعتماد الإصدار الجديد.',
      bnErrTitle: 'بعض الحقول تحتاج إلى مراجعة',
      bnErrText: 'صحّح الحقول المحددة أدناه قبل الحفظ.',
      saveChanges: 'حفظ التغييرات', saveNewDraft: 'حفظ كمسودة جديدة', submitReview: 'حفظ وإرسال للمراجعة',
      discard: 'تجاهل التغييرات', viewHistory: 'عرض السجل',
      verTitle: 'سجل الإصدارات', verCurrent: 'الحالي', verNew: 'جديد', verBy: 'بواسطة',
      verActed: { created: 'أُنشئ', edited: 'عُدّل', submitted: 'أُرسل للمراجعة', approved: 'اعتُمد ونُشر', superseded: 'استُبدل', archived: 'أُرشف', rejected: 'أُعيد' },
      dgTitle: 'تجاهل تغييراتك؟', dgText: 'ستفقد تعديلاتك على هذا القالب ولا يمكن استرجاعها.',
      dgKeep: 'متابعة التعديل', dgDiscard: 'تجاهل',
      lkTitle: 'لا يمكن تعديل هذا القالب', lkArchived: 'إنه مؤرشف. استعِده من سجل الإصدارات قبل إجراء التغييرات.',
      lkRestore: 'استعادة القالب', lkBackList: 'العودة إلى القوالب',
      svNewTitle: 'تم إرسال إصدار جديد للمراجعة', svNewSub: 'أصبح الآن مسودة بانتظار اعتماد المُنشئ والمُدقّق. يبقى الإصدار النشط حتى اعتماد الإصدار الجديد.',
      svDraftTitle: 'تم تحديث المسودة', svDraftSub: 'حُفظت تغييراتك في هذه المسودة. أرسلها للمراجعة عند جاهزيتها.',
      svViewVer: 'عرض الإصدار', svBackTemplate: 'العودة إلى القالب',
      updatedBy: 'حُدّث بواسطة', updatedAt: 'تاريخ التحديث',
      stArchived: 'مؤرشف', stInactive: 'غير نشط',
      revActive: 'نشط', revDraft: 'مسودة', revErrors: 'أخطاء', revLocked: 'مقفل', revSaved: 'محفوظ', revScenario: 'السيناريو',
    },
  };
  Object.keys(E).forEach(l => Object.assign(window.TPL.T[l], E[l]));

  /* ---------- the template being edited ----------
     A real, published template with a multi-version history. */
  const EDIT_TPL = {
    id: 'TPL-2026-03318',
    name: { en: 'Card transaction alert', ar: 'تنبيه عملية البطاقة' },
    activeVer: 3,          // highest published version
    draftVer: 4,           // an open draft (used by the Draft scenario)
    updatedBy: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' },
    updatedAt: { en: '12 May 2026, 09:18', ar: '١٢ مايو ٢٠٢٦، ٠٩:١٨' },
  };

  /* ---------- version history (most-recent first) ----------
     `acted` keys into T.verActed; who/when are bilingual. */
  const VERSIONS = [
    { ver: 'v3', status: 'active',   acted: 'approved', who: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, when: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' }, current: true },
    { ver: 'v2', status: 'archived', acted: 'superseded', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: '03 Mar 2026', ar: '٠٣ مارس ٢٠٢٦' } },
    { ver: 'v1', status: 'archived', acted: 'created', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: '14 Jan 2026', ar: '١٤ يناير ٢٠٢٦' } },
  ];

  /* a standalone open draft history (Draft scenario) */
  const DRAFT_VERSIONS = [
    { ver: 'v4', status: 'draft',    acted: 'edited', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: '2 days ago', ar: 'قبل يومين' }, current: true, isDraft: true },
    { ver: 'v3', status: 'active',   acted: 'approved', who: { en: 'N. Al Harbi', ar: 'ناصر الحربي' }, when: { en: '12 May 2026', ar: '١٢ مايو ٢٠٢٦' } },
    { ver: 'v2', status: 'archived', acted: 'superseded', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: '03 Mar 2026', ar: '٠٣ مارس ٢٠٢٦' } },
    { ver: 'v1', status: 'archived', acted: 'created', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: '14 Jan 2026', ar: '١٤ يناير ٢٠٢٦' } },
  ];

  window.TPL.EDIT_TPL = EDIT_TPL;
  window.TPL.VERSIONS = VERSIONS;
  window.TPL.DRAFT_VERSIONS = DRAFT_VERSIONS;
})();
