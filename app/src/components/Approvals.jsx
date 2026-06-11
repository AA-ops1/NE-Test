import React, { useState, useMemo, useEffect } from 'react';
import Icon from './Icon';
import TPL from '../data/tpl';
import { L, cx, StatusPill, ChannelTag, DevicePreview, SegmentMeter } from './TemplateParts';
import { apfmt, Avatar, PersonChip, PriorityTag, withTokens, FieldDiff, changedFields, ApprovalTimeline, historyFromVersions, DecisionBar, ReassignModal, SubmitModal } from './ApprovalParts';
import { NeToast } from './TemplateDelete';
/* ============================================================
   Approvals — page surfaces (checker queue, review screen, maker home).
   Composed by <ApprovalsConsole> which owns queue/mine state + toasts.
   ============================================================ */
const useApS = useState, useApM = useMemo, useApE = useEffect;

/* version delta — prev → ver shown with a Lucide arrow (icon, not a Unicode
   glyph; flips direction under RTL). Version numbers stay LTR. */
function VersDelta({ prev, ver }) {
  return (
    <React.Fragment>
      <span className="ajb-ltr">{prev}</span>
      <Icon name="arrow-right" className="ap-vers-arrow" />
      <span className="ajb-ltr">{ver}</span>
    </React.Fragment>
  );
}

/* ---------- read-only content (proposed version) ---------- */
function ContentRead({ sub, lang, clang, t }) {
  const langs = sub.langs || ['en'];
  const renderOne = (l) => {
    const dir = l === 'ar' ? 'rtl' : 'ltr';
    const Box = ({ label, icon, text, subj }) => (
      <div className="ap-cr-block">
        <div className="vw-block-lbl">{icon && <Icon name={icon} />}{label}</div>
        <div className={cx('vw-readbox', subj && 'subj')} dir={dir}>{text ? withTokens(text, label + l) : <span className="vw-empty-line">—</span>}</div>
      </div>
    );
    const body = sub.content ? (sub.content[l] ?? sub.content.en) : '';
    if (sub.channel === 'email') {
      return (
        <div className="ap-cr">
          <Box label={t.subjectLbl} icon="type" subj text={sub.subject ? (sub.subject[l] ?? sub.subject.en) : ''} />
          <Box label={t.bodyLbl} icon="align-left" text={body} />
        </div>
      );
    }
    if (sub.channel === 'push' || sub.channel === 'inapp') {
      return (
        <div className="ap-cr">
          <Box label={t.titleLbl} icon="type" subj text={sub.ntitle ? (sub.ntitle[l] ?? sub.ntitle.en) : ''} />
          <Box label={t.bodyLbl} icon="align-left" text={body} />
        </div>
      );
    }
    return <div className="ap-cr"><Box label={t.bodyLbl} icon="align-left" text={body} /></div>;
  };

  if (clang === 'both' && langs.length > 1) {
    return (
      <div className="vw-bothlangs">
        {langs.map(l => {
          const meta = TPL.LANGS.find(x => x.id === l);
          return (
            <div className="vw-langgroup" key={l}>
              <div className="vw-langgroup-h"><span className="ajb-tab-badge">{l.toUpperCase()}</span><span>{meta ? meta.native : l}</span></div>
              {renderOne(l)}
            </div>
          );
        })}
      </div>
    );
  }
  return renderOne(langs.includes(clang) ? clang : lang);
}

/* ---------- variables used in a submission ---------- */
function SubVariables({ sub, lang, t }) {
  const tokens = useApM(() => {
    const seen = []; const re = /\{\{\s*([\w.]+)\s*\}\}/g; let m;
    const scan = (o) => { if (!o) return; ['en', 'ar'].forEach(l => { let s = o[l] || ''; while ((m = re.exec(s))) { if (!seen.includes(m[1])) seen.push(m[1]); } }); };
    scan(sub.content); scan(sub.subject); scan(sub.ntitle);
    return seen;
  }, [sub]);
  if (!tokens.length) return null;
  const SENS = TPL.SENSITIVE || [];
  return (
    <div className="ap-vars">
      {tokens.map(tok => {
        const meta = TPL.VAR_INDEX[tok];
        const sens = SENS.includes(tok);
        return (
          <span className={cx('ap-varchip', sens && 'is-sens')} key={tok}>
            <span className="ap-varchip-tok">{`{{${tok}}}`}</span>
            <span className="ap-varchip-lbl">{meta ? (meta['lbl_' + lang] || meta.lbl_en) : '—'}</span>
            {sens && <Icon name="shield-alert" />}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- "what changed" or "new template" ---------- */
function ChangesSection({ sub, lang, clang, t }) {
  if (sub.kind === 'new') {
    return (
      <div className="ajb-alert ajb-alert--info ap-newalert">
        <span className="ajb-alert__ico"><Icon name="sparkles" /></span>
        <div className="ajb-alert__body">
          <p className="ajb-alert__title">{t.apNewTitle}</p>
          <p className="ajb-alert__desc">{t.apNewText}</p>
        </div>
      </div>
    );
  }
  const langs = sub.langs || ['en'];
  const renderForLang = (l) => {
    const fields = changedFields(sub, l, t);
    if (!fields.length) return <p className="ap-nochanges"><Icon name="equal" />{t.apNoChanges}</p>;
    return (
      <div className="ap-changes">
        <div className="ap-changes-count">{fields.length === 1 ? t.apChangedField1 : apfmt(t.apChangedFields, { n: fields.length })}</div>
        {fields.map(f => <FieldDiff key={f.key} label={f.label} before={f.before} after={f.after} lang={l} />)}
      </div>
    );
  };
  if (clang === 'both' && langs.length > 1) {
    return (
      <div className="vw-bothlangs">
        {langs.map(l => {
          const meta = TPL.LANGS.find(x => x.id === l);
          return (
            <div className="vw-langgroup" key={l}>
              <div className="vw-langgroup-h"><span className="ajb-tab-badge">{l.toUpperCase()}</span><span>{meta ? meta.native : l}</span></div>
              {renderForLang(l)}
            </div>
          );
        })}
      </div>
    );
  }
  return renderForLang(langs.includes(clang) ? clang : lang);
}

/* ---------- submission summary header (shared by both variants) ---------- */
function ReviewSummary({ sub, lang, t }) {
  const type = TPL.TYPES.find(x => x.id === sub.type);
  const prod = TPL.PRODUCTS.find(p => p.id === sub.product);
  return (
    <div className="ap-rs">
      <div className="ap-rs-top">
        <span className="ap-rs-chico"><Icon name={(TPL.CHANNELS.find(c => c.id === sub.channel) || {}).icon} /></span>
        <div className="ap-rs-titleblock">
          <h1 className="ts-h1 ap-rs-title">{L(sub.name, lang)}</h1>
          <div className="ap-rs-meta">
            <span className="ajb-ltr">{sub.id}</span>
            <span className="vw-meta-sep">·</span>
            <ChannelTag id={sub.channel} lang={lang} />
            <span className="vw-meta-sep">·</span>
            <span>{prod ? L(prod, lang) : ''}</span>
          </div>
        </div>
        <div className="ap-rs-tags">
          <StatusPill status="review" t={t} />
          <span className={cx('ap-kind', sub.kind === 'new' ? 'is-new' : 'is-edit')}>
            <Icon name={sub.kind === 'new' ? 'file-plus' : 'file-diff'} />
            {sub.kind === 'new' ? t.apKindNew : <VersDelta prev={sub.prevVer} ver={sub.ver} />}
          </span>
          <PriorityTag id={sub.priority} lang={lang} />
        </div>
      </div>
      <div className="ap-rs-submit">
        <PersonChip p={sub.maker} lang={lang} sub={t.apMaker} />
        <span className="ap-rs-when">{t.apSubmittedBy} <b>{L(sub.maker, lang)}</b> {t.apSubmittedOn} <span className="ajb-ltr">{L(sub.submittedAt, lang)}</span></span>
      </div>
      {sub.note && (
        <div className="ap-makernote">
          <div className="ap-makernote-lbl"><Icon name="message-square-quote" />{t.apMakerNote}</div>
          <p className="ap-makernote-txt">{L(sub.note, lang)}</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   REVIEW SCREEN — variant 'split' (two-pane) | 'stacked' (single column)
   ============================================================ */
function ReviewScreen({ sub, lang, t, variant, onBack, onApprove, onSendBack, onReject, onReassign }) {
  const blocked = sub.ownWork === true;
  const [clang, setClang] = useApS(lang);
  useApE(() => { setClang(lang); }, [sub.id, lang]);
  const langs = sub.langs || ['en'];
  const showLangSeg = langs.length > 1;
  const LangSeg = () => showLangSeg ? (
    <div className="ajb-seg vw-langseg vw-card-trail">
      {langs.map(l => (
        <button type="button" key={l} className={cx(clang === l && 'is-on')} onClick={() => setClang(l)}>{l.toUpperCase()}</button>
      ))}
      <button type="button" className={cx(clang === 'both' && 'is-on')} onClick={() => setClang('both')}>{t.vwBoth}</button>
    </div>
  ) : null;
  const decision = (
    <DecisionBar lang={lang} t={t} blocked={blocked} variant={variant}
      onApprove={onApprove} onSendBack={onSendBack} onReject={onReject} onReassign={onReassign} />
  );
  const preview = (
    <div className="ap-prevwrap">
      <DevicePreview channel={sub.channel} text={sub.content && (sub.content[lang] ?? sub.content.en)}
        subject={sub.subject && (sub.subject[lang] ?? sub.subject.en)}
        ntitle={sub.ntitle && (sub.ntitle[lang] ?? sub.ntitle.en)}
        lang={lang} sample={false} onToggleSample={() => {}} t={t} />
    </div>
  );
  const timeline = (
    <section className="ajb-card ts-card ap-tlcard">
      <header className="vw-card-h"><Icon name="history" />{t.apHistory}</header>
      <ApprovalTimeline events={sub.history || []} lang={lang} awaiting={{ who: sub.assignedTo }} />
    </section>
  );
  const changes = (
    <section className="ajb-card ts-card">
      <header className="vw-card-h"><Icon name="git-compare" />{t.apWhatChanged}{sub.kind === 'edit' && <LangSeg />}</header>
      <ChangesSection sub={sub} lang={lang} clang={clang} t={t} />
    </section>
  );
  const content = (
    <section className="ajb-card ts-card">
      <header className="vw-card-h"><Icon name="message-square-text" />{t.apContentReview}<LangSeg /></header>
      <ContentRead sub={sub} lang={lang} clang={clang} t={t} />
      <div className="ap-varsblock">
        <div className="vw-block-lbl"><Icon name="braces" />{t.apVarsReview}</div>
        <SubVariables sub={sub} lang={lang} t={t} />
      </div>
    </section>
  );

  const header = (
    <header className="ts-hd ap-review-hd">
      <div className="ts-hd-l">
        <button type="button" className="ap-back" onClick={onBack}><Icon name="arrow-left" />{t.apBackToQueue}</button>
      </div>
    </header>
  );

  if (variant === 'stacked') {
    return (
      <div className="ts-page ap-stacked">
        {header}
        <div className="ap-stack-body">
          <section className="ajb-card ts-card ap-summary-card"><ReviewSummary sub={sub} lang={lang} t={t} /></section>
          {changes}
          {content}
          <div className="ap-stack-grid">
            {preview}
            {timeline}
          </div>
        </div>
        <div className="ap-decision-dock">
          <div className="ap-decision-dock-inner">{decision}</div>
        </div>
      </div>
    );
  }

  // split (default)
  return (
    <div className="ts-page">
      {header}
      <div className="vw-work ap-split">
        <div className="vw-col">
          <section className="ajb-card ts-card ap-summary-card"><ReviewSummary sub={sub} lang={lang} t={t} /></section>
          {changes}
          {content}
          {timeline}
        </div>
        <aside className="vw-rail">
          {decision}
          {preview}
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   CHECKER QUEUE (inbox)
   ============================================================ */
function CheckerQueue({ queue, lang, t, view, onOpen }) {
  if (!queue.length) {
    return (
      <div className="ts-page">
        <QueueHead queue={queue} lang={lang} t={t} />
        <div className="ts-tablewrap"><div className="tl-empty"><div className="ajb-empty">
          <div className="ajb-empty__badge"><Icon name="check-check" /></div>
          <h3 className="ajb-empty__title">{t.apQueueEmptyTitle}</h3>
          <p className="ajb-empty__text">{t.apQueueEmptyText}</p>
        </div></div></div>
      </div>
    );
  }
  if (view === 'cards') {
    return (
      <div className="ts-page">
        <QueueHead queue={queue} lang={lang} t={t} />
        <div className="ap-qcards">
          {queue.map(s => <QueueCard key={s.id + s.ver} s={s} lang={lang} t={t} onOpen={onOpen} />)}
        </div>
      </div>
    );
  }
  return (
    <div className="ts-page">
      <QueueHead queue={queue} lang={lang} t={t} />
      <div className="ts-tablewrap">
        <table className="ajb-table ts-table ap-qtable">
          <thead>
            <tr>
              <th>{t.apColTemplate}</th>
              <th className="tl-hide">{t.apColChange}</th>
              <th className="tl-hide2">{t.apColMaker}</th>
              <th className="tl-hide">{t.apColSubmitted}</th>
              <th>{t.apColPriority}</th>
              <th className="tl-actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {queue.map(s => {
              const ch = TPL.CHANNELS.find(x => x.id === s.channel);
              const type = TPL.TYPES.find(x => x.id === s.type);
              return (
                <tr key={s.id + s.ver} onClick={() => onOpen(s)}>
                  <td>
                    <div className="tl-namecell">
                      <span className="tl-chico"><Icon name={ch.icon} /></span>
                      <div className="tl-nameblock">
                        <div className="ts-tname">{L(s.name, lang)}
                          {s.ownWork && <span className="ap-owntag"><Icon name="user" />{t.apOwnTag}</span>}
                        </div>
                        <div className="ts-tid ajb-ltr">{s.id} · {type ? L(type, lang) : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tl-hide">
                    <span className={cx('ap-kind', s.kind === 'new' ? 'is-new' : 'is-edit')}>
                      <Icon name={s.kind === 'new' ? 'file-plus' : 'file-diff'} />
                      {s.kind === 'new' ? t.apKindNew : <VersDelta prev={s.prevVer} ver={s.ver} />}
                    </span>
                  </td>
                  <td className="tl-hide2"><PersonChip p={s.maker} lang={lang} /></td>
                  <td className="tl-hide ts-muted"><span className="ajb-ltr">{L(s.ago, lang)}</span></td>
                  <td><PriorityTag id={s.priority} lang={lang} /></td>
                  <td className="tl-actions-col" onClick={e => e.stopPropagation()}>
                    <button type="button" className="ajb-btn ajb-btn--sand ap-reviewbtn" onClick={() => onOpen(s)}>
                      {t.apReviewBtn}<Icon name="arrow-right" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QueueHead({ queue, lang, t }) {
  const n = queue.length;
  return (
    <header className="tl-head">
      <div className="tl-head-l">
        <div className="ajb-crumb"><span className="ajb-crumb__current">{t.apQueueTitle}</span></div>
        <h1 className="ts-h1" style={{ marginTop: 6 }}>{t.apQueueTitle}</h1>
        <p className="tl-count">{n === 1 ? t.apPending1 : apfmt(t.apPending, { n })}</p>
      </div>
    </header>
  );
}

function QueueCard({ s, lang, t, onOpen }) {
  const ch = TPL.CHANNELS.find(x => x.id === s.channel);
  const type = TPL.TYPES.find(x => x.id === s.type);
  return (
    <div className="ajb-card ap-qcard" onClick={() => onOpen(s)}>
      <div className="ap-qcard-top">
        <span className="tl-chico"><Icon name={ch.icon} /></span>
        <div className="ap-qcard-name">
          <div className="ts-tname">{L(s.name, lang)}{s.ownWork && <span className="ap-owntag"><Icon name="user" />{t.apOwnTag}</span>}</div>
          <div className="ts-tid ajb-ltr">{s.id} · {type ? L(type, lang) : ''}</div>
        </div>
        <PriorityTag id={s.priority} lang={lang} />
      </div>
      <div className="ap-qcard-mid">
        <span className={cx('ap-kind', s.kind === 'new' ? 'is-new' : 'is-edit')}>
          <Icon name={s.kind === 'new' ? 'file-plus' : 'file-diff'} />
          {s.kind === 'new' ? t.apKindNew : <VersDelta prev={s.prevVer} ver={s.ver} />}
        </span>
      </div>
      <div className="ap-qcard-foot">
        <PersonChip p={s.maker} lang={lang} sub={L(s.ago, lang)} />
        <button type="button" className="ajb-btn ajb-btn--sand ap-reviewbtn" onClick={(e) => { e.stopPropagation(); onOpen(s); }}>{t.apReviewBtn}<Icon name="arrow-right" /></button>
      </div>
    </div>
  );
}

/* ============================================================
   MAKER HOME — "My submissions"
   ============================================================ */
const MAKER_STATE = {
  ready:     { badge: 'neutral', key: 'apStReady',    icon: 'file-check' },
  review:    { badge: 'info',    key: 'apStReview',   icon: 'clock' },
  sent_back: { badge: 'warning', key: 'apStSentBack', icon: 'corner-up-left' },
  approved:  { badge: 'success', key: 'apStApproved', icon: 'circle-check' },
};

function MakerHome({ mine, lang, t, onSubmit }) {
  const [filter, setFilter] = useApS('all');
  const order = { ready: 0, sent_back: 1, review: 2, approved: 3 };
  const rows = useApM(() =>
    mine.filter(m => filter === 'all' || m.state === filter)
      .slice().sort((a, b) => order[a.state] - order[b.state]),
  [mine, filter]);
  const filters = [
    { v: 'all', l: t.apFilterAll },
    { v: 'ready', l: t.apStReady },
    { v: 'review', l: t.apStReview },
    { v: 'sent_back', l: t.apStSentBack },
    { v: 'approved', l: t.apStApproved },
  ];
  return (
    <div className="ts-page">
      <header className="tl-head">
        <div className="tl-head-l">
          <div className="ajb-crumb"><span className="ajb-crumb__current">{t.apMakerTitle}</span></div>
          <h1 className="ts-h1" style={{ marginTop: 6 }}>{t.apMakerTitle}</h1>
          <p className="tl-count">{t.apMakerSub}</p>
        </div>
      </header>
      <div className="ap-mfilter ajb-seg">
        {filters.map(f => <button type="button" key={f.v} className={cx(filter === f.v && 'is-on')} onClick={() => setFilter(f.v)}>{f.l}</button>)}
      </div>
      {rows.length === 0 ? (
        <div className="ts-tablewrap"><div className="tl-empty"><div className="ajb-empty">
          <div className="ajb-empty__badge"><Icon name="inbox" /></div>
          <h3 className="ajb-empty__title">{t.apMakerEmptyTitle}</h3>
          <p className="ajb-empty__text">{t.apMakerEmptyText}</p>
        </div></div></div>
      ) : (
        <div className="ap-mcards">
          {rows.map(m => <MakerCard key={m.id + m.ver} m={m} lang={lang} t={t} onSubmit={onSubmit} />)}
        </div>
      )}
    </div>
  );
}

function MakerCard({ m, lang, t, onSubmit }) {
  const ch = TPL.CHANNELS.find(x => x.id === m.channel);
  const type = TPL.TYPES.find(x => x.id === m.type);
  const st = MAKER_STATE[m.state];
  return (
    <div className={cx('ajb-card ap-mcard', 'ap-mcard--' + m.state)}>
      <div className="ap-mcard-top">
        <span className="tl-chico"><Icon name={ch.icon} /></span>
        <div className="ap-qcard-name">
          <div className="ts-tname">{L(m.name, lang)}</div>
          <div className="ts-tid ajb-ltr">{m.id} · {m.ver} · {type ? L(type, lang) : ''}</div>
        </div>
        <span className={cx('ajb-badge', 'ajb-badge--' + st.badge)}><Icon name={st.icon} />{t[st.key]}</span>
      </div>

      {m.state === 'ready' && (
        <div className="ap-mcard-foot">
          <span className="ap-mcard-hint">{t.apReadyHint}</span>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => onSubmit(m)}><Icon name="send" />{t.apSubmitForReview}</button>
        </div>
      )}
      {m.state === 'review' && (
        <div className="ap-mcard-foot">
          <span className="ap-mcard-status"><Icon name="clock" />{apfmt(t.apAwaiting, { who: L(m.checker, lang) })} · <span className="ajb-ltr">{L(m.updated, lang)}</span></span>
        </div>
      )}
      {m.state === 'sent_back' && (
        <React.Fragment>
          <div className="ap-checkernote">
            <div className="ap-checkernote-h"><Avatar p={m.checker} size="xs" />{apfmt(t.apReturnedBy, { who: L(m.checker, lang) })}<span className="ap-checkernote-when ajb-ltr">{L(m.decisionAt, lang)}</span></div>
            <div className="ap-checkernote-lbl">{t.apCheckerNote}</div>
            <p className="ap-checkernote-txt">{L(m.reason, lang)}</p>
          </div>
          <div className="ap-mcard-foot">
            <span />
            <button type="button" className="ajb-btn ajb-btn--sand"><Icon name="pencil" />{t.apResubmit}</button>
          </div>
        </React.Fragment>
      )}
      {m.state === 'approved' && (
        <div className="ap-mcard-foot">
          <span className="ap-mcard-status is-ok"><Icon name="circle-check" />{apfmt(t.apApprovedBy, { who: L(m.checker, lang) })} · <span className="ajb-ltr">{L(m.decisionAt, lang)}</span></span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APPROVALS CONSOLE — orchestrates role + selection + decisions
   queue/mine state is lifted to the page (App) so the nav badge stays live.
   ============================================================ */
function ApprovalsConsole({ role, lang, t, tweaks, queue, setQueue, mine, setMine }) {
  const [sel, setSel] = useApS(null);            // selected submission (checker review)
  const [reassign, setReassign] = useApS(null);  // submission pending reassign
  const [submit, setSubmit] = useApS(null);      // maker template pending submit
  const [toast, setToast] = useApS(null);

  useApE(() => { setSel(null); }, [role]);
  useApE(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4400);
    return () => clearTimeout(id);
  }, [toast]);

  const name = (s) => L(s.name, lang);
  const removeFromQueue = (s) => setQueue(q => q.filter(x => !(x.id === s.id && x.ver === s.ver)));

  const doApprove = (note) => { const s = sel; removeFromQueue(s); setSel(null); setToast({ tone: 'ok', icon: 'circle-check', title: t.apTApproved, sub: apfmt(t.apTApprovedSub, { name: name(s) }) }); };
  const doSendBack = (reason) => { const s = sel; removeFromQueue(s); setSel(null); setToast({ tone: 'neutral', icon: 'corner-up-left', title: t.apTSentBack, sub: apfmt(t.apTSentBackSub, { name: name(s), who: L(s.maker, lang) }) }); };
  const doReject = (reason) => { const s = sel; removeFromQueue(s); setSel(null); setToast({ tone: 'danger', icon: 'x-circle', title: t.apTRejected, sub: apfmt(t.apTRejectedSub, { name: name(s) }) }); };
  const doReassign = (checker) => {
    const s = reassign; setReassign(null);
    setQueue(q => q.filter(x => !(x.id === s.id && x.ver === s.ver)));
    setSel(null);
    setToast({ tone: 'neutral', icon: 'users', title: t.apTReassigned, sub: apfmt(t.apTReassignedSub, { name: name(s), who: L(checker, lang) }) });
  };
  const doSubmit = (checker, note) => {
    const m = submit; setSubmit(null);
    setMine(list => list.map(x => x.id === m.id
      ? { ...x, state: 'review', checker, submittedAt: { en: 'just now', ar: 'الآن' }, updated: { en: 'just now', ar: 'الآن' } }
      : x));
    setToast({ tone: 'ok', icon: 'send', title: t.apTSubmitted, sub: apfmt(t.apTSubmittedSub, { who: L(checker, lang) }) });
  };

  let body;
  if (role === 'maker') {
    body = <MakerHome mine={mine} lang={lang} t={t} onSubmit={(m) => setSubmit(m)} />;
  } else if (sel) {
    body = (
      <ReviewScreen sub={sel} lang={lang} t={t} variant={tweaks.reviewLayout}
        onBack={() => setSel(null)}
        onApprove={doApprove} onSendBack={doSendBack} onReject={doReject}
        onReassign={() => setReassign(sel)} />
    );
  } else {
    body = <CheckerQueue queue={queue} lang={lang} t={t} view={tweaks.queueView} onOpen={(s) => setSel(s)} />;
  }

  return (
    <React.Fragment>
      {body}
      {reassign && <ReassignModal name={name(reassign)} lang={lang} t={t} onClose={() => setReassign(null)} onConfirm={doReassign} />}
      {submit && <SubmitModal name={name(submit)} lang={lang} t={t} onClose={() => setSubmit(null)} onConfirm={doSubmit} />}
      {toast && <ApToast tone={toast.tone} icon={toast.icon} title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
    </React.Fragment>
  );
}

/* toast variant (extends the delete-flow toast styling with success/danger tones) */
function ApToast({ tone, icon, title, sub, onClose }) {
  const toneCls = { ok: 'ap-toast--ok', danger: 'ap-toast--danger', neutral: 'nd-toast__ico--neutral' }[tone] || 'nd-toast__ico--neutral';
  return (
    <div className="nd-toastwrap">
      <div className="ajb-toast">
        <span className={cx('ajb-toast__ico', toneCls)}><Icon name={icon} /></span>
        <div className="ajb-toast__body">
          <div className="ajb-toast__title">{title}</div>
          {sub && <div className="nd-toast-sub">{sub}</div>}
        </div>
        <span className="nd-toast-x" onClick={onClose}><Icon name="x" /></span>
      </div>
    </div>
  );
}

export { ApprovalsConsole };
