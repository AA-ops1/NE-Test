/* ============================================================
   Notification Engine — Maker–Checker (Approvals) extras
   Adds the approval-workflow dataset + i18n to the shared TPL object.
   MUST load after template-data.js.

   Story batch: "Approval workflow (submit, review, approve)" +
   Governance "Role separation (maker–checker)" + "Audit trail".
   Segregation of duties: a Maker creates/edits a template and submits
   it; a different Checker approves, sends back, rejects, or reassigns.
   A maker may never approve their own work.

   ASSUMPTIONS (reasonable banking-sensible defaults, surfaced as such):
     • Checkers are assigned per submission; auto-assignment can land a
       maker on their own item — the UI then blocks approval and offers
       reassignment.
     • "Send back" returns the template to the maker as a draft with the
       checker's reason. "Reject" is terminal. "Approve" activates.
   ============================================================ */
(function () {
  'use strict';
  if (!window.TPL) { console.error('approval-extras: TPL missing'); return; }

  /* ---------- people ---------- */
  const O = { id: 'o', en: 'A. Al Amri', ar: 'عبدالرحمن العمري', init: 'A' };
  const N = { id: 'n', en: 'N. Al Harbi',  ar: 'ناصر الحربي',  init: 'N' };
  const S = { id: 's', en: 'S. Al Qahtani', ar: 'سارة القحطاني', init: 'S' };
  const F = { id: 'f', en: 'F. Al Dossari', ar: 'فيصل الدوسري', init: 'F' };
  const CURRENT = O;                 // the signed-in user (avatar "O")
  const CHECKERS = [N, S, F];        // assignable checkers (≠ current as maker)

  /* ---------- approval-history event helper data ---------- */
  /* event types → icon + i18n key (label) + actor role + timeline node tint */
  const EVENTS = {
    created:    { icon: 'file-plus',     key: 'apEvCreated',    role: 'maker',   tint: '' },
    edited:     { icon: 'pencil',        key: 'apEvEdited',     role: 'maker',   tint: '' },
    submitted:  { icon: 'send',          key: 'apEvSubmitted',  role: 'maker',   tint: 'sand' },
    approved:   { icon: 'check',         key: 'apEvApproved',   role: 'checker', tint: 'success' },
    published:  { icon: 'circle-check',  key: 'apEvPublished',  role: 'system',  tint: 'success' },
    sent_back:  { icon: 'corner-up-left', key: 'apEvSentBack',  role: 'checker', tint: 'warning' },
    rejected:   { icon: 'x',             key: 'apEvRejected',   role: 'checker', tint: 'danger' },
    reassigned: { icon: 'users',         key: 'apEvReassigned', role: 'checker', tint: 'info' },
  };

  /* ---------- checker queue (items awaiting review) ----------
     `kind`: 'new' (first activation) | 'edit' (change to an active template).
     For 'edit', `prev` carries the currently-live content for the diff.
     `ownWork: true` marks the segregation-of-duties demo (maker === current). */
  const QUEUE = [
    {
      id: 'TPL-2026-04388', detail: 'push', channel: 'push', product: 'transfers', type: 'security', priority: 'high',
      name: { en: 'Beneficiary added', ar: 'تمت إضافة مستفيد' },
      kind: 'new', ver: 'v1', maker: S, assignedTo: O,
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
        { type: 'created',   who: S, when: { en: '03 Jun 2026, 16:20', ar: '٠٣ يونيو ٢٠٢٦، ١٦:٢٠' } },
        { type: 'submitted', who: S, when: { en: '04 Jun 2026, 08:42', ar: '٠٤ يونيو ٢٠٢٦، ٠٨:٤٢' }, note: { en: 'For the beneficiary-management release.', ar: 'لإصدار إدارة المستفيدين.' } },
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
        { type: 'approved',  who: S, when: { en: '02 Apr 2026', ar: '٠٢ أبريل ٢٠٢٦' }, note: { en: 'v5 approved & activated.', ar: 'تم اعتماد وتفعيل الإصدار ٥.' } },
        { type: 'edited',    who: N, when: { en: '04 Jun 2026, 07:02', ar: '٠٤ يونيو ٢٠٢٦، ٠٧:٠٢' } },
        { type: 'submitted', who: N, when: { en: '04 Jun 2026, 07:15', ar: '٠٤ يونيو ٢٠٢٦، ٠٧:١٥' } },
      ],
    },
    {
      id: 'TPL-2026-04102', detail: 'email', channel: 'email', product: 'cards', type: 'statement', priority: 'normal',
      name: { en: 'Card statement ready', ar: 'كشف البطاقة جاهز' },
      kind: 'edit', ver: 'v3', prevVer: 'v2', maker: S, assignedTo: O,
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
        { type: 'edited',    who: S, when: { en: '03 Jun 2026, 13:50', ar: '٠٣ يونيو ٢٠٢٦، ١٣:٥٠' } },
        { type: 'submitted', who: S, when: { en: '03 Jun 2026, 14:08', ar: '٠٣ يونيو ٢٠٢٦، ١٤:٠٨' } },
      ],
    },
    {
      id: 'TPL-2026-04503', detail: 'sms', channel: 'whatsapp', product: 'cards', type: 'marketing', priority: 'low',
      name: { en: 'Summer cashback offer', ar: 'عرض كاش باك الصيف' },
      kind: 'new', ver: 'v1', maker: N, assignedTo: O,
      submittedAt: { en: '03 Jun 2026, 11:30', ar: '٠٣ يونيو ٢٠٢٦، ١١:٣٠' },
      ago: { en: 'yesterday', ar: 'أمس' },
      langs: ['en', 'ar'],
      note: { en: 'Seasonal WhatsApp promo. Marketing copy approved by brand; needs compliance sign-off.', ar: 'عرض موسمي عبر واتساب. اعتمد التسويق النص؛ يحتاج موافقة الالتزام.' },
      content: {
        en: 'Hi {{customer.first_name}} — earn 10% cashback in style this summer on your card ending {{card.last4}}. Tap to opt in before {{date.today}}.',
        ar: 'مرحبًا {{customer.first_name}} — احصل على ١٠٪ كاش باك بأناقة هذا الصيف على بطاقتك المنتهية بـ {{card.last4}}. اضغط للاشتراك قبل {{date.today}}.',
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
        en: 'Aljazira: A reminder that your finance installment of {{txn.amount}} is due on {{date.today}}. Pay via the aljazira app to avoid any late fees.',
        ar: 'الجزيرة: نذكّرك بأن قسط تمويلك البالغ {{txn.amount}} يستحق بتاريخ {{date.today}}. ادفع عبر تطبيق الجزيرة لتجنّب أي رسوم تأخير.',
      },
      history: [
        { type: 'created',   who: O, when: { en: '01 Jun 2026, 10:24', ar: '٠١ يونيو ٢٠٢٦، ١٠:٢٤' } },
        { type: 'edited',    who: O, when: { en: '04 Jun 2026, 09:08', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:٠٨' } },
        { type: 'submitted', who: O, when: { en: '04 Jun 2026, 09:12', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:١٢' } },
      ],
    },
  ];

  /* ---------- maker home (the current user's own submissions) ----------
     `state`: 'ready' (draft, not yet submitted) | 'review' | 'sent_back' | 'approved'. */
  const MINE = [
    {
      id: 'TPL-2026-04401', detail: 'sms', channel: 'sms', product: 'finance', type: 'reminder', priority: 'normal',
      name: { en: 'Loan installment reminder', ar: 'تذكير قسط التمويل' },
      state: 'ready', ver: 'v2',
      updated: { en: 'just now', ar: 'الآن' },
      content: {
        en: 'Aljazira: A reminder that your finance installment of {{txn.amount}} is due on {{date.today}}. Pay via the aljazira app to avoid any late fees.',
        ar: 'الجزيرة: نذكّرك بأن قسط تمويلك البالغ {{txn.amount}} يستحق بتاريخ {{date.today}}. ادفع عبر تطبيق الجزيرة لتجنّب أي رسوم تأخير.',
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
      reason: { en: 'Please include the masked account and a support number so the customer can act if this wasn’t them.', ar: 'يرجى تضمين الحساب المحجوب ورقم الدعم ليتمكن العميل من التصرف إذا لم يكن هو.' },
    },
    {
      id: 'TPL-2026-03907', detail: 'push', channel: 'push', product: 'accounts', type: 'transaction', priority: 'normal',
      name: { en: 'Salary credited', ar: 'إيداع الراتب' },
      state: 'approved', ver: 'v2', checker: N,
      updated: { en: '2 May 2026', ar: '٢ مايو ٢٠٢٦' },
      decisionAt: { en: '02 May 2026, 09:40', ar: '٠٢ مايو ٢٠٢٦، ٠٩:٤٠' },
    },
  ];

  /* ---------- i18n (flat merge — never include a `review` key here, it
     would clobber the existing chrome `review` object) ---------- */
  const E = {
    en: {
      // nav + chrome
      apNav: 'Approvals',
      apRole: 'Role', apMaker: 'Maker', apChecker: 'Checker',
      apViewQueue: 'Approvals', apViewReview: 'Review',

      // checker queue
      apQueueTitle: 'Approvals', apQueueSub: 'Templates submitted for your review.',
      apPending: '{n} awaiting your review', apPending1: '1 awaiting your review',
      apColTemplate: 'Template', apColChange: 'Change', apColMaker: 'Maker', apColSubmitted: 'Submitted', apColPriority: 'Priority',
      apKindNew: 'New template', apKindEdit: 'Content change', apEditVers: '{prev} to {ver}',
      apReviewBtn: 'Review', apOpenReview: 'Open review',
      apQueueEmptyTitle: 'You’re all caught up', apQueueEmptyText: 'No templates are waiting for your review right now.',
      apOwnTag: 'Your template', apFilterAll: 'All', apHighPrio: 'Priority',

      // review screen
      apBackToQueue: 'Back to approvals',
      apReviewing: 'In review', apSubmittedBy: 'Submitted by', apSubmittedOn: 'on',
      apMakerNote: 'Maker’s note',
      apWhatChanged: 'What changed', apChangedFields: '{n} fields changed', apChangedField1: '1 field changed',
      apNewTitle: 'New template', apNewText: 'This is the first version — approving it activates the template for sending.',
      apNoChanges: 'No content changes in this version.',
      apCurrent: 'Current', apProposed: 'Proposed', apField: 'Field',
      apContentReview: 'Content under review', apVarsReview: 'Variables used',

      // decision
      apDecide: 'Your decision', apDecideSub: 'Segregation of duties — the maker cannot approve.',
      apApprove: 'Approve & activate', apSendBack: 'Send back', apReject: 'Reject', apReassign: 'Reassign',
      apAddNote: 'Add a note', apNoteOptional: 'optional',
      apApproveNotePh: 'Optional note recorded with the approval…',
      apSendBackHd: 'Send back for changes', apRejectHd: 'Reject template',
      apReasonReqSend: 'Tell the maker what needs to change. A reason is required.',
      apReasonReqReject: 'Give a reason for rejecting this template. A reason is required.',
      apSendBackPh: 'What should the maker change?', apRejectPh: 'Why is this being rejected?',
      apConfirmSendBack: 'Send back to maker', apConfirmReject: 'Reject template', apCancel: 'Cancel',

      // role-separation guard
      apGuardTitle: 'You can’t approve your own template',
      apGuardText: 'Segregation of duties requires a different checker to approve a template you created or edited. You can reassign it for review.',
      apGuardReassign: 'Reassign to another checker',

      // reassign
      apReassignTitle: 'Reassign for review', apReassignText: 'Choose another checker to review {name}.',
      apReassignPick: 'Assign to', apReassignConfirm: 'Reassign',

      // submit for review (maker)
      apSubmitTitle: 'Submit for review',
      apSubmitText: 'Send {name} to a checker for approval. You won’t be able to edit it while it’s in review.',
      apSubmitChecker: 'Assign checker', apSubmitCheckerPh: 'Choose a checker',
      apSubmitNote: 'Note to checker', apSubmitNotePh: 'Add context for the reviewer…',
      apSubmitConfirm: 'Submit for review', apSubmitGuardSelf: 'You can’t assign a template to yourself for review.',
      apSubmitForReview: 'Submit for review',

      // maker home
      apMakerTitle: 'My submissions', apMakerSub: 'Templates you’ve sent for approval and their status.',
      apStReady: 'Ready to submit', apStReview: 'In review', apStSentBack: 'Sent back', apStApproved: 'Approved',
      apReadyHint: 'Draft complete — submit it for a checker to review.',
      apAwaiting: 'Awaiting {who}', apReturnedBy: 'Returned by {who}', apApprovedBy: 'Approved by {who}',
      apCheckerNote: 'Checker’s note', apResubmit: 'Edit & resubmit', apViewTpl: 'View template',
      apMakerEmptyTitle: 'Nothing submitted yet', apMakerEmptyText: 'Templates you send for review will appear here.',

      // timeline / audit
      apHistory: 'Approval history', apAuditTrail: 'Audit trail',
      apEvCreated: 'Created', apEvEdited: 'Edited', apEvSubmitted: 'Submitted for review',
      apEvApproved: 'Approved', apEvPublished: 'Activated', apEvSentBack: 'Sent back for changes',
      apEvRejected: 'Rejected', apEvReassigned: 'Reassigned', apEvAwaiting: 'Awaiting decision',
      apRoleTagMaker: 'Maker', apRoleTagChecker: 'Checker', apRoleTagSystem: 'System',

      // toasts
      apTApproved: 'Approved & activated', apTApprovedSub: '{name} is now live — the maker has been notified.',
      apTSentBack: 'Sent back to maker', apTSentBackSub: '{name} returned to {who} with your note.',
      apTRejected: 'Template rejected', apTRejectedSub: '{name} was rejected and will not be activated.',
      apTReassigned: 'Reassigned for review', apTReassignedSub: '{name} is now assigned to {who}.',
      apTSubmitted: 'Submitted for review', apTSubmittedSub: 'Assigned to {who}. You’ll be notified of the decision.',
    },
    ar: {
      apNav: 'الاعتمادات',
      apRole: 'الدور', apMaker: 'مُنشئ', apChecker: 'مُدقّق',
      apViewQueue: 'الاعتمادات', apViewReview: 'المراجعة',

      apQueueTitle: 'الاعتمادات', apQueueSub: 'القوالب المُرسلة لمراجعتك.',
      apPending: '{n} بانتظار مراجعتك', apPending1: 'واحد بانتظار مراجعتك',
      apColTemplate: 'القالب', apColChange: 'التغيير', apColMaker: 'المُنشئ', apColSubmitted: 'أُرسل', apColPriority: 'الأولوية',
      apKindNew: 'قالب جديد', apKindEdit: 'تغيير المحتوى', apEditVers: '{prev} إلى {ver}',
      apReviewBtn: 'مراجعة', apOpenReview: 'فتح المراجعة',
      apQueueEmptyTitle: 'لا جديد لديك', apQueueEmptyText: 'لا توجد قوالب بانتظار مراجعتك حاليًا.',
      apOwnTag: 'قالبك', apFilterAll: 'الكل', apHighPrio: 'الأولوية',

      apBackToQueue: 'العودة إلى الاعتمادات',
      apReviewing: 'قيد المراجعة', apSubmittedBy: 'أرسله', apSubmittedOn: 'بتاريخ',
      apMakerNote: 'ملاحظة المُنشئ',
      apWhatChanged: 'التغييرات', apChangedFields: 'تغيّرت {n} حقول', apChangedField1: 'تغيّر حقل واحد',
      apNewTitle: 'قالب جديد', apNewText: 'هذا أول إصدار — اعتماده يُفعّل القالب للإرسال.',
      apNoChanges: 'لا تغييرات في محتوى هذا الإصدار.',
      apCurrent: 'الحالي', apProposed: 'المقترح', apField: 'الحقل',
      apContentReview: 'المحتوى قيد المراجعة', apVarsReview: 'المتغيرات المستخدمة',

      apDecide: 'قرارك', apDecideSub: 'الفصل بين المهام — لا يمكن للمُنشئ الاعتماد.',
      apApprove: 'اعتماد وتفعيل', apSendBack: 'إعادة', apReject: 'رفض', apReassign: 'إعادة تعيين',
      apAddNote: 'إضافة ملاحظة', apNoteOptional: 'اختياري',
      apApproveNotePh: 'ملاحظة اختيارية تُسجّل مع الاعتماد…',
      apSendBackHd: 'إعادة للتعديل', apRejectHd: 'رفض القالب',
      apReasonReqSend: 'أخبر المُنشئ بما يجب تغييره. السبب مطلوب.',
      apReasonReqReject: 'اذكر سبب رفض هذا القالب. السبب مطلوب.',
      apSendBackPh: 'ما الذي يجب أن يغيّره المُنشئ؟', apRejectPh: 'ما سبب الرفض؟',
      apConfirmSendBack: 'إعادة إلى المُنشئ', apConfirmReject: 'رفض القالب', apCancel: 'إلغاء',

      apGuardTitle: 'لا يمكنك اعتماد قالبك',
      apGuardText: 'يتطلب الفصل بين المهام أن يعتمد القالب الذي أنشأته أو عدّلته مدقّق آخر. يمكنك إعادة تعيينه للمراجعة.',
      apGuardReassign: 'إعادة التعيين لمدقّق آخر',

      apReassignTitle: 'إعادة التعيين للمراجعة', apReassignText: 'اختر مدقّقًا آخر لمراجعة {name}.',
      apReassignPick: 'تعيين إلى', apReassignConfirm: 'إعادة تعيين',

      apSubmitTitle: 'إرسال للمراجعة',
      apSubmitText: 'أرسل {name} إلى مدقّق للاعتماد. لن تتمكن من تعديله أثناء المراجعة.',
      apSubmitChecker: 'تعيين مدقّق', apSubmitCheckerPh: 'اختر مدقّقًا',
      apSubmitNote: 'ملاحظة للمدقّق', apSubmitNotePh: 'أضف سياقًا للمراجع…',
      apSubmitConfirm: 'إرسال للمراجعة', apSubmitGuardSelf: 'لا يمكنك تعيين قالب لنفسك للمراجعة.',
      apSubmitForReview: 'إرسال للمراجعة',

      apMakerTitle: 'طلباتي', apMakerSub: 'القوالب التي أرسلتها للاعتماد وحالتها.',
      apStReady: 'جاهز للإرسال', apStReview: 'قيد المراجعة', apStSentBack: 'أُعيدت', apStApproved: 'مُعتمد',
      apReadyHint: 'اكتملت المسودة — أرسلها ليراجعها مدقّق.',
      apAwaiting: 'بانتظار {who}', apReturnedBy: 'أعادها {who}', apApprovedBy: 'اعتمدها {who}',
      apCheckerNote: 'ملاحظة المُدقّق', apResubmit: 'تعديل وإعادة إرسال', apViewTpl: 'عرض القالب',
      apMakerEmptyTitle: 'لا شيء مُرسل بعد', apMakerEmptyText: 'ستظهر هنا القوالب التي ترسلها للمراجعة.',

      apHistory: 'سجل الاعتماد', apAuditTrail: 'سجل التدقيق',
      apEvCreated: 'أُنشئ', apEvEdited: 'عُدّل', apEvSubmitted: 'أُرسل للمراجعة',
      apEvApproved: 'اعتُمد', apEvPublished: 'فُعّل', apEvSentBack: 'أُعيد للتعديل',
      apEvRejected: 'رُفض', apEvReassigned: 'أُعيد تعيينه', apEvAwaiting: 'بانتظار القرار',
      apRoleTagMaker: 'مُنشئ', apRoleTagChecker: 'مُدقّق', apRoleTagSystem: 'النظام',

      apTApproved: 'تم الاعتماد والتفعيل', apTApprovedSub: '{name} أصبح فعّالًا — تم إشعار المُنشئ.',
      apTSentBack: 'أُعيد إلى المُنشئ', apTSentBackSub: '{name} أُعيد إلى {who} مع ملاحظتك.',
      apTRejected: 'تم رفض القالب', apTRejectedSub: '{name} رُفض ولن يتم تفعيله.',
      apTReassigned: 'أُعيد تعيينه للمراجعة', apTReassignedSub: '{name} مُعيّن الآن إلى {who}.',
      apTSubmitted: 'أُرسل للمراجعة', apTSubmittedSub: 'مُعيّن إلى {who}. ستُشعر بالقرار.',
    },
  };
  Object.keys(E).forEach(l => Object.assign(window.TPL.T[l], E[l]));

  window.TPL.AP = { O, N, S, F, CURRENT, CHECKERS, EVENTS, QUEUE, MINE };
})();
