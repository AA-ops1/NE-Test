/* ============================================================
   View Template Details — read-only detail view.
   Presents a template per the Notification Attributes Matrix:
   attributes + channel-specific content structure + variables +
   lifecycle, with a version switcher and an Edit hand-off.
   ============================================================ */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import TPL from '../data/tpl';
import { L, cx, DevicePreview, SegmentMeter, StatusPill, ChannelTag } from './TemplateParts';
import { KebabMenu, DeleteModal, NeToast, ArchiveModal, deleteMode } from './TemplateDelete';
import { ApprovalTimeline, historyFromVersions, SubmitModal, apfmt } from './ApprovalParts';
import { VersionHistory } from './EditTemplate';

function vfmt(str, map) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m)); }
function isSensitive(tok) { return (TPL.SENSITIVE || []).includes(tok); }

/* ---------- read-only body with token chips (sensitive marked) ---------- */
export function TokenText({ text, lang }) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const parts = useMemo(() => {
    const str = text || '';
    const out = []; let last = 0, i = 0;
    const re = /\{\{\s*([\w.]+)\s*\}\}/g; let m;
    while ((m = re.exec(str))) {
      if (m.index > last) out.push(str.slice(last, m.index));
      const tok = m[1];
      out.push(<span key={i++} className={cx('vw-tok', isSensitive(tok) && 'sens')}>{`{{${tok}}}`}</span>);
      last = re.lastIndex;
    }
    if (last < str.length) out.push(str.slice(last));
    return out;
  }, [text]);
  if (!text) return <span className="vw-empty-line">—</span>;
  return <span dir={dir}>{parts}</span>;
}

export function ReadBox({ label, icon, children, subj }) {
  return (
    <div>
      <div className="vw-block-lbl">{icon && <Icon name={icon} />}{label}</div>
      <div className={cx('vw-readbox', subj && 'subj')}>{children}</div>
    </div>
  );
}

/* ---------- channel-specific content structure (one language) ---------- */
export function ChannelFields({ tpl, ver, lang, t }) {
  const ch = tpl.channel;
  const body = ver.content ? ver.content[lang] : '';
  const bodyEl = body ? <TokenText text={body} lang={lang} /> : <span className="vw-empty-line">{t.noContent}</span>;

  if (ch === 'email') {
    const atts = ver.attachments || [];
    return (
      <div className="vw-struct">
        <ReadBox label={t.subjectLbl} icon="type" subj>
          {ver.subject ? <TokenText text={ver.subject[lang]} lang={lang} /> : <span className="vw-empty-line">—</span>}
        </ReadBox>
        <ReadBox label={t.bodyLbl} icon="align-left">{bodyEl}</ReadBox>
        <div>
          <div className="vw-block-lbl"><Icon name="paperclip" />{t.attachLbl}</div>
          {atts.length ? (
            <div className="vw-attach">
              {atts.map((a, i) => (
                <div className="vw-attach-item" key={i}>
                  <span className="vw-attach-ico"><Icon name="file-text" /></span>
                  <div>
                    <div className="vw-attach-name ajb-ltr">{a.name}</div>
                    <div className="vw-attach-size ajb-ltr">{a.size}</div>
                  </div>
                  <span className="vw-attach-dl"><Icon name="download" /></span>
                </div>
              ))}
            </div>
          ) : <div className="vw-readbox"><span className="vw-empty-line">{t.attachNone}</span></div>}
        </div>
      </div>
    );
  }

  if (ch === 'push' || ch === 'inapp') {
    return (
      <div className="vw-struct">
        <ReadBox label={t.titleLbl} icon="type" subj>
          {ver.ntitle ? <TokenText text={ver.ntitle[lang]} lang={lang} /> : <span className="vw-empty-line">—</span>}
        </ReadBox>
        <ReadBox label={t.bodyLbl} icon="align-left">{bodyEl}</ReadBox>
        {ch === 'push' && (
          <div>
            <div className="vw-block-lbl"><Icon name="image" />{t.imageLbl}</div>
            {ver.imageUrl ? (
              <div className="vw-image">
                <span className="vw-image-thumb"><Icon name="image" /></span>
                <div>
                  <div className="vw-block-lbl" style={{ marginBottom: 4 }}>{t.imageUrlLbl}</div>
                  <div className="vw-image-url ajb-ltr">{ver.imageUrl}</div>
                </div>
              </div>
            ) : <div className="vw-readbox"><span className="vw-empty-line">—</span></div>}
          </div>
        )}
      </div>
    );
  }

  // sms / whatsapp
  return (
    <div className="vw-struct">
      <ReadBox label={t.bodyLbl} icon="align-left">{bodyEl}</ReadBox>
    </div>
  );
}

/* ---------- content structure: single language or both stacked ---------- */
export function ContentStructure({ tpl, ver, lang, t, mode }) {
  const langs = tpl.langs || ['en'];
  if (mode === 'both' && langs.length > 1) {
    return (
      <div className="vw-bothlangs">
        {langs.map(l => {
          const meta = TPL.LANGS.find(x => x.id === l);
          return (
            <div className="vw-langgroup" key={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
              <div className="vw-langgroup-h">
                <span className="ajb-tab-badge">{l.toUpperCase()}</span>
                <span>{meta ? meta.native : l}</span>
              </div>
              <ChannelFields tpl={tpl} ver={ver} lang={l} t={t} />
            </div>
          );
        })}
      </div>
    );
  }
  const one = langs.includes(mode) ? mode : lang;
  return <ChannelFields tpl={tpl} ver={ver} lang={one} t={t} />;
}

/* ---------- variables used (extracted from this version) ---------- */
export function VariablesUsed({ ver, lang, t }) {
  const tokens = useMemo(() => {
    const seen = []; const re = /\{\{\s*([\w.]+)\s*\}\}/g;
    const scan = (s) => { let m; while ((m = re.exec(s || ''))) { if (!seen.includes(m[1])) seen.push(m[1]); } };
    ['en', 'ar'].forEach(l => {
      if (ver.content) scan(ver.content[l]);
      if (ver.subject) scan(ver.subject[l]);
      if (ver.ntitle) scan(ver.ntitle[l]);
    });
    return seen;
  }, [ver]);

  const hasSensitive = tokens.some(isSensitive);
  if (!tokens.length) return <p className="vw-empty-line" style={{ margin: 0 }}>{t.noVars}</p>;

  return (
    <div>
      <div className="vw-varhead">
        <span className="vw-varhint">{t.varsHint}</span>
        <span className="vw-varhint">{tokens.length === 1 ? t.varCount1 : vfmt(t.varCount, { n: tokens.length })}</span>
      </div>
      <div className="vw-vars">
        {tokens.map(tok => {
          const meta = TPL.VAR_INDEX[tok];
          const sens = isSensitive(tok);
          return (
            <div className="vw-varrow" key={tok}>
              <span className="vw-vartok">{`{{${tok}}}`}</span>
              <span className="vw-varlbl">{meta ? (meta['lbl_' + lang] || meta.lbl_en) : '—'}</span>
              {sens && <span className="vw-sens"><Icon name="shield-alert" />{t.sensitive}</span>}
            </div>
          );
        })}
      </div>
      {hasSensitive && <p className="vw-sensnote"><Icon name="lock" />{t.sensitiveNote}</p>}
    </div>
  );
}

/* ---------- version switcher dropdown ---------- */
export function VersionSwitcher({ versions, idx, onPick, lang, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const cur = versions[idx];
  return (
    <div className="vw-verpick" ref={ref}>
      <div className={cx('vw-verpick-trig', open && 'is-open')} onClick={() => setOpen(o => !o)}>
        <Icon name="history" />
        <span className="vw-verpick-ver ajb-ltr">{cur.ver}</span>
        <StatusPill status={cur.status} t={t} />
        <Icon name="chevron-down" className="vw-caret" />
      </div>
      {open && (
        <div className="ajb-menu vw-verpop">
          {versions.map((v, i) => (
            <div key={v.ver} className={cx('vw-veropt', i === idx && 'is-on')} onClick={() => { onPick(i); setOpen(false); }}>
              <span className="vw-veropt-ver ajb-ltr">{v.ver}</span>
              <div className="vw-veropt-meta">
                <div className="vw-veropt-when">{L(v.when, lang)} {v.current ? `· ${t.latest}` : ''}</div>
                <div className="vw-veropt-who">{t.verBy} {L(v.who, lang)}</div>
              </div>
              <StatusPill status={v.status} t={t} />
              {i === idx && <span className="ajb-menu__check"><Icon name="check" /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- attribute overview (read-only kv) ---------- */
export function AttrOverview({ tpl, ver, lang, t }) {
  const prod = TPL.PRODUCTS.find(p => p.id === tpl.product);
  const type = TPL.TYPES.find(x => x.id === tpl.type);
  const prio = TPL.PRIORITIES.find(x => x.id === tpl.priority);
  const Row = ({ k, children }) => <div className="ajb-kv__row"><span className="ajb-kv__key">{k}</span><span className="ajb-kv__val">{children}</span></div>;
  return (
    <div className="vw-attrs">
      <div className="ajb-kv">
        <Row k={t.fProduct}>{prod ? L(prod, lang) : '—'}</Row>
        <Row k={t.fType}>{type ? L(type, lang) : '—'}</Row>
        <Row k={t.fChannel}><ChannelTag id={tpl.channel} lang={lang} /></Row>
        <Row k={t.fPriority}>{prio ? L(prio, lang) : '—'}</Row>
      </div>
      <div className="ajb-kv">
        <Row k={t.fValidFrom}><span className="ajb-ltr">{tpl.validFrom || '—'}</span></Row>
        <Row k={t.fValidTo}>{tpl.validTo ? <span className="ajb-ltr">{tpl.validTo}</span> : t.validToOpen}</Row>
        <Row k={t.contentLangs}><span className="ajb-ltr">{tpl.langs.map(x => x.toUpperCase()).join(' · ')}</span></Row>
        <Row k={t.fTags}><span className="vw-tags">{tpl.tags[lang].map(tg => <span className="ajb-chip" key={tg}>{tg}</span>)}</span></Row>
      </div>
    </div>
  );
}

/* ---------- lifecycle / audit ---------- */
export function Lifecycle({ tpl, ver, lang, t, archivedMeta }) {
  const Row = ({ k, children }) => <div className="ajb-kv__row"><span className="ajb-kv__key">{k}</span><span className="ajb-kv__val">{children}</span></div>;
  const reason = archivedMeta && archivedMeta.reason;
  return (
    <div className="ajb-kv">
      <Row k={t.lcCreated}>{L(tpl.createdBy, lang)} · <span className="ajb-ltr">{L(tpl.createdAt, lang)}</span></Row>
      <Row k={t.lcUpdated}>{L(ver.updatedBy, lang)} · <span className="ajb-ltr">{L(ver.updatedAt, lang)}</span></Row>
      <Row k={t.lcMaker}>{L(ver.maker, lang)}</Row>
      <Row k={t.lcChecker}>{ver.status === 'active' ? L(ver.checker, lang) : L(ver.checker, lang)}</Row>
      <Row k={t.lcApproval}>{archivedMeta ? <StatusPill status="archived" t={t} /> : (ver.status === 'active' ? <span className="ajb-badge ajb-badge--success">{t.lcApproved}</span> : <StatusPill status={ver.status} t={t} />)}</Row>
      {archivedMeta && <Row k={t.lcArchivedBy}>{L(archivedMeta.by, lang)}</Row>}
      {archivedMeta && <Row k={t.lcArchivedAt}><span className="ajb-ltr">{L(archivedMeta.at, lang)}</span></Row>}
      {reason && <Row k={t.lcArchivedReason}>{reason.label}{reason.note ? ' — ' + reason.note : ''}</Row>}
    </div>
  );
}

/* ============================================================
   VIEW DETAILS — layout
   ============================================================ */
export function ViewDetails({ tpl, idx, onPick, lang, t, editHref, backHref }) {
  const navigate = useNavigate();
  const ver = tpl.versions[idx];
  const latest = tpl.versions.find(v => v.current) || tpl.versions[0];
  const [sample, setSample] = useState(false);
  const [clang, setClang] = useState(lang);
  const [del, setDel] = useState(null);
  const [arc, setArc] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [archivedMeta, setArchivedMeta] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submittedTo, setSubmittedTo] = useState(null);

  useEffect(() => {
    setDel(null); setArc(null); setToast(null); setDeleted(false);
    setArchivedMeta(null); setClang(lang); setSubmitOpen(false); setSubmittedTo(null);
  }, [tpl.id]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  // delete eligibility is judged on the template as a whole (its latest version)
  const archived = !!archivedMeta || latest.status === 'archived';
  const isDraft = latest.status === 'draft';
  const inReview = !!submittedTo;
  const effStatus = inReview ? 'review' : (archived ? 'archived' : ver.status);

  const doSubmit = (checker, note) => {
    setSubmitOpen(false);
    setSubmittedTo(checker);
    setToast({ tone: 'neutral', title: t.apTSubmitted, sub: apfmt(t.apTSubmittedSub, { who: L(checker, lang) }) });
  };

  const delRow = { status: latest.status, used: !!tpl.used, name: tpl.name, id: tpl.id, ver: latest.ver };
  const arcRow = { name: tpl.name, id: tpl.id, ver: latest.ver };
  const askDelete = () => setDel({ mode: deleteMode(delRow), row: delRow });
  const askArchive = () => { setDel(null); setArc(arcRow); };
  const doDelete = () => { setDel(null); setDeleted(true); setToast({ tone: 'danger', title: t.tDeleted, sub: t.tDeletedSub }); };
  const doArchive = (reason) => {
    setArc(null);
    setArchivedMeta({ by: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, at: { en: '04 Jun 2026, 09:40', ar: '٠٤ يونيو ٢٠٢٦، ٠٩:٤٠' }, reason });
    const sub = reason ? vfmt(t.tArchivedSubReason, { reason: reason.label + (reason.note ? ' — ' + reason.note : '') }) : t.tArchivedSub;
    setToast({ tone: 'neutral', title: t.tArchived, sub });
  };

  if (deleted) {
    return (
      <div className="ts-page">
        <header className="ts-hd">
          <div className="ts-hd-l">
            <div className="ajb-crumb">
              <a href={backHref} onClick={e => { e.preventDefault(); navigate(backHref); }}>{t.crumbHome}</a>
              <span className="ajb-crumb__sep"><Icon name="chevron-right" /></span>
              <span className="ajb-crumb__current">{L(tpl.name, lang)}</span>
            </div>
          </div>
        </header>
        <div className="ts-tablewrap">
          <div className="tl-empty">
            <div className="ajb-empty">
              <div className="ajb-empty__badge"><Icon name="trash-2" /></div>
              <h3 className="ajb-empty__title">{t.delGoneTitle}</h3>
              <p className="ajb-empty__text">{t.delGoneText}</p>
              <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => navigate(backHref)}><Icon name="arrow-left" />{t.delGoneBack}</button>
            </div>
          </div>
        </div>
        {toast && <NeToast tone={toast.tone} title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="ts-page">
      <header className="ts-hd">
        <div className="ts-hd-l">
          <div className="ajb-crumb">
            <a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>{t.crumbHome}</a>
            <span className="ajb-crumb__sep"><Icon name="chevron-right" /></span>
            <span className="ajb-crumb__current">{L(tpl.name, lang)}</span>
          </div>
          <div className="vw-titlerow">
            <h1 className="ts-h1">{L(tpl.name, lang)}</h1>
            <StatusPill status={effStatus} t={t} />
            <span className="vw-vchip ajb-ltr">{ver.ver}</span>
            <span className="vw-ro"><Icon name="eye" />{t.readOnly}</span>
          </div>
          <div className="vw-meta">
            <span className="ajb-ltr">{tpl.id}</span>
            <span className="vw-meta-sep">·</span>
            <span>{t.lcUpdated} <b>{L(ver.updatedBy, lang)}</b></span>
            <span className="vw-meta-sep">·</span>
            <span className="ajb-ltr">{L(ver.updatedAt, lang)}</span>
          </div>
        </div>
        <div className="ts-actions">
          <KebabMenu t={t} triggerClass="ajb-btn ajb-btn--icon" triggerIcon="more-horizontal" items={archived
            ? [
              { icon: 'copy', label: t.duplicateTpl, onClick: () => {} },
              { icon: 'download', label: t.exportTpl, onClick: () => {} },
            ]
            : [
              { icon: 'copy', label: t.duplicateTpl, onClick: () => {} },
              { icon: 'download', label: t.exportTpl, onClick: () => {} },
              { icon: 'archive', label: t.archiveTpl, onClick: askArchive },
              { sep: true },
              { icon: 'trash-2', label: t.deleteTpl, danger: latest.status === 'draft', disabled: latest.status !== 'draft', hint: latest.status !== 'draft' ? t.delDraftOnly : undefined, onClick: askDelete },
            ]} />
          {archived
            ? <button type="button" className="ajb-btn ajb-btn--sand"><Icon name="copy" />{t.arcDuplicate}</button>
            : inReview
              ? <span className="ajb-badge ajb-badge--info vw-inreview"><Icon name="clock" />{apfmt(t.apAwaiting, { who: L(submittedTo, lang) })}</span>
              : isDraft
                ? <React.Fragment>
                    <a href={editHref} className="ajb-btn ajb-btn--secondary" onClick={e => { e.preventDefault(); navigate(editHref); }}><Icon name="pencil" />{t.editTpl}</a>
                    <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => setSubmitOpen(true)}><Icon name="send" />{t.apSubmitForReview}</button>
                  </React.Fragment>
                : <a href={editHref} className="ajb-btn ajb-btn--sand" onClick={e => { e.preventDefault(); navigate(editHref); }}><Icon name="pencil" />{t.editTpl}</a>}
        </div>
      </header>

      <div className="vw-verbar">
        <div className="vw-verbar-l">
          <span className="vw-verbar-lbl">{t.viewingVer}</span>
          <VersionSwitcher versions={tpl.versions} idx={idx} onPick={onPick} lang={lang} t={t} />
        </div>
        <div className="vw-verbar-r"><Icon name="eye" />{t.readOnlyHint}</div>
      </div>

      {inReview && (
        <div className="ajb-alert ajb-alert--info vw-older">
          <span className="ajb-alert__ico"><Icon name="clock" /></span>
          <div>
            <p className="ajb-alert__title">{t.apStReview}</p>
            <p className="ajb-alert__text">{apfmt(t.apTSubmittedSub, { who: L(submittedTo, lang) })}</p>
          </div>
        </div>
      )}

      {archived && (
        <div className="ajb-alert ajb-alert--warning vw-arc">
          <span className="ajb-alert__ico"><Icon name="archive" /></span>
          <div>
            <p className="ajb-alert__title">{t.arcBannerTitle}</p>
            <p className="ajb-alert__text">{t.arcBannerText}</p>
          </div>
        </div>
      )}

      {!ver.current && (
        <div className="ajb-alert ajb-alert--info vw-older">
          <span className="ajb-alert__ico"><Icon name="clock" /></span>
          <div>
            <p className="ajb-alert__title">{t.olderTitle}</p>
            <p className="ajb-alert__text">{vfmt(t.olderText, { ver: ver.ver, latest: latest.ver })}</p>
            <button type="button" className="vw-older-link" onClick={() => onPick(tpl.versions.indexOf(latest))}>{t.viewLatest}<Icon name="arrow-right" /></button>
          </div>
        </div>
      )}

      <div className="vw-work">
        <div className="vw-col">
          <section className="ajb-card ts-card">
            <header className="vw-card-h"><Icon name="info" />{t.secOverview}</header>
            <AttrOverview tpl={tpl} ver={ver} lang={lang} t={t} />
          </section>
          <section className="ajb-card ts-card">
            <header className="vw-card-h">
              <Icon name="message-square-text" />{t.secStructure}
              {(tpl.langs && tpl.langs.length > 1) && (
                <div className="ajb-seg vw-langseg vw-card-trail">
                  {tpl.langs.map(l => (
                    <button type="button" key={l} className={cx(clang === l && 'is-on')} onClick={() => setClang(l)}>{l.toUpperCase()}</button>
                  ))}
                  <button type="button" className={cx(clang === 'both' && 'is-on')} onClick={() => setClang('both')}>{t.vwBoth}</button>
                </div>
              )}
            </header>
            <ContentStructure tpl={tpl} ver={ver} lang={lang} t={t} mode={clang} />
          </section>
          <section className="ajb-card ts-card">
            <header className="vw-card-h"><Icon name="braces" />{t.secVarsUsed}</header>
            <VariablesUsed ver={ver} lang={lang} t={t} />
          </section>
          <section className="ajb-card ts-card">
            <header className="vw-card-h"><Icon name="history" />{t.secLifecycle}</header>
            <Lifecycle tpl={tpl} ver={ver} lang={lang} t={t} archivedMeta={archivedMeta} />
          </section>
          <section className="ajb-card ts-card">
            <header className="vw-card-h"><Icon name="git-commit-horizontal" />{t.apHistory}</header>
            <ApprovalTimeline events={historyFromVersions(tpl, lang)} lang={lang} awaiting={inReview ? { who: submittedTo } : null} />
          </section>
        </div>
        <aside className="vw-rail">
          <DevicePreview channel={tpl.channel} text={ver.content && ver.content[lang]} subject={ver.subject && ver.subject[lang]} ntitle={ver.ntitle && ver.ntitle[lang]} lang={lang} sample={sample} onToggleSample={() => setSample(s => !s)} t={t} />
          {(tpl.channel === 'sms' || tpl.channel === 'whatsapp') && <SegmentMeter text={ver.content && ver.content[lang]} lang={lang} t={t} />}
          <VersionHistory versions={tpl.versions} t={t} lang={lang} />
        </aside>
      </div>

      {del && <DeleteModal mode={del.mode} row={del.row} lang={lang} t={t} onClose={() => setDel(null)} onConfirm={doDelete} onArchive={askArchive} />}
      {arc && <ArchiveModal row={arc} lang={lang} t={t} onClose={() => setArc(null)} onConfirm={doArchive} />}
      {submitOpen && <SubmitModal name={L(tpl.name, lang)} lang={lang} t={t} onClose={() => setSubmitOpen(false)} onConfirm={doSubmit} />}
      {toast && <NeToast tone={toast.tone} title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
    </div>
  );
}

export default ViewDetails;
