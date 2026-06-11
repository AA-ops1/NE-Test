/* ============================================================
   Template Studio — layouts
   Direction A · Workspace (two-pane)   |   Direction B · Stepper
   plus the shared form hook, Saved card, and Template list glimpse.
   ============================================================ */
import React, { useState, useRef, useMemo, useCallback } from 'react';
import Icon from './Icon';
import TPL from '../data/tpl';
import {
  Field, TextInput, DropSelect, DatePicker, ChannelPicker, ChoiceChips,
  LangTabs, HiTextarea, VariablePanel, SegmentMeter, DevicePreview,
  StatusPill, ChannelTag, L, cx,
} from './TemplateParts';

/* ---------- shared form state ---------- */
export function blank() {
  return {
    name: '', desc: '', product: '', channel: 'sms', type: '', priority: 'normal',
    langs: ['en'], activeLang: 'en',
    content: { en: '', ar: '' }, subject: { en: '', ar: '' }, ntitle: { en: '', ar: '' },
    bodyFormat: 'plain', // email body: 'plain' | 'html'
    validFrom: '2026-06-02', validTo: '', tags: [], notes: '', sampleMode: false,
  };
}

export function useTemplateForm() {
  const [data, setData] = useState(blank);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef(null);

  const setField = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setLangVal = (group, lang, v) => setData(d => ({ ...d, [group]: { ...d[group], [lang]: v } }));
  const addLang = (id) => setData(d => ({ ...d, langs: [...d.langs, id], activeLang: id }));

  const insert = (token) => {
    const lang = data.activeLang;
    const val = data.content[lang] || '';
    const ta = contentRef.current;
    let s = val.length, e = val.length;
    if (ta) { s = ta.selectionStart; e = ta.selectionEnd; }
    const ins = `{{${token}}}`;
    const next = val.slice(0, s) + ins + val.slice(e);
    setLangVal('content', lang, next);
    requestAnimationFrame(() => { if (ta) { ta.focus(); const p = s + ins.length; ta.setSelectionRange(p, p); } });
  };

  const errors = useMemo(() => {
    const e = {};
    if (!data.name.trim()) e.name = 'errName';
    if (!data.product) e.product = 'errProduct';
    if (!data.channel) e.channel = 'errChannel';
    if (!data.type) e.type = 'errType';
    if (!(data.content[data.activeLang] || '').trim()) e.content = 'errContent';
    if (!data.validFrom) e.validFrom = 'errValidFrom';
    return e;
  }, [data]);

  const seed = (mode) => {
    setSubmitted(false);
    if (mode === 'compose') { setData(blank()); return; }
    const s = TPL.SAMPLE;
    const base = {
      ...blank(),
      name: s.name, desc: s.desc, product: s.product, channel: s.channel,
      type: s.type, priority: s.priority,
      langs: ['en', 'ar'], activeLang: 'en',
      content: { en: s.content.en, ar: s.content.ar },
      tags: s.tags.en,
    };
    // store name/desc/tags resolved to a string set per current ui lang at render — keep en here
    if (mode === 'errors') {
      setData({ ...blank(), channel: 'sms', desc: '', content: { en: '', ar: '' }, product: '', type: '' });
      setSubmitted(true);
    } else {
      setData({ ...base, name: s.name.en, desc: s.desc.en, tags: s.tags.en });
    }
  };

  return { data, setData, setField, setLangVal, addLang, insert, contentRef, errors, submitted, setSubmitted, seed };
}

/* localized seed when ui lang flips (names/tags are bilingual in SAMPLE) */
export function localizedSeed(lang) {
  const s = TPL.SAMPLE;
  return {
    ...blank(),
    name: s.name[lang], desc: s.desc[lang], product: s.product, channel: s.channel,
    type: s.type, priority: s.priority,
    langs: ['en', 'ar'], activeLang: lang,
    content: { en: s.content.en, ar: s.content.ar }, tags: s.tags[lang],
  };
}

/* ---------- channel → which content fields show ---------- */
export function channelFields(ch) {
  return {
    subject: ch === 'email',
    title: ch === 'push' || ch === 'inapp',
    segments: ch === 'sms' || ch === 'whatsapp',
  };
}

/* ============================================================
   DETAIL FIELDS (shared)
   ============================================================ */
export function DetailsFields({ f, t, lang }) {
  const err = (k) => f.submitted && f.errors[k] ? t[f.errors[k]] : null;
  return (
    <div className="ts-grid">
      <Field label={t.fName} required error={err('name')} full t={t}>
        <TextInput value={f.data.name} onChange={v => f.setField('name', v)} placeholder={t.fNamePh} error={err('name')} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      </Field>
      <Field label={t.fDesc} full t={t}>
        <TextInput value={f.data.desc} onChange={v => f.setField('desc', v)} placeholder={t.fDescPh} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      </Field>
      <Field label={t.fProduct} required error={err('product')} t={t}>
        <DropSelect value={f.data.product} onChange={v => f.setField('product', v)} options={TPL.PRODUCTS} lang={lang} placeholder={'—'} error={err('product')} icon="package" />
      </Field>
      <Field label={t.fPriority} t={t}>
        <ChoiceChips value={f.data.priority} onChange={v => f.setField('priority', v)} options={TPL.PRIORITIES} lang={lang} prio />
      </Field>
      <Field label={t.fChannel} required error={err('channel')} full t={t}>
        <ChannelPicker value={f.data.channel} onChange={v => f.setField('channel', v)} lang={lang} />
      </Field>
      <Field label={t.fType} required error={err('type')} full t={t}>
        <ChoiceChips value={f.data.type} onChange={v => f.setField('type', v)} options={TPL.TYPES} lang={lang} />
      </Field>
    </div>
  );
}

/* ============================================================
   CONTENT AREA (shared) — lang tabs + subject/title + editor
   ============================================================ */
export function ContentArea({ f, t, lang }) {
  const cf = channelFields(f.data.channel);
  const aLang = f.data.activeLang;
  const cDir = aLang === 'ar' ? 'rtl' : 'ltr';
  const isHtml = f.data.channel === 'email' && f.data.bodyFormat === 'html';
  const err = (k) => f.submitted && f.errors[k] ? t[f.errors[k]] : null;
  return (
    <div className="ts-content">
      <LangTabs langs={f.data.langs} active={aLang} onSelect={id => f.setField('activeLang', id)} onAdd={f.addLang} lang={lang} t={t} />
      {cf.subject && (
        <Field label={t.subjectLbl} t={t}>
          <TextInput value={f.data.subject[aLang] || ''} onChange={v => f.setLangVal('subject', aLang, v)} placeholder={t.subjectPh} dir={cDir} />
        </Field>
      )}
      {cf.title && (
        <Field label={t.titleLbl} t={t}>
          <TextInput value={f.data.ntitle[aLang] || ''} onChange={v => f.setLangVal('ntitle', aLang, v)} placeholder={t.titlePh} dir={cDir} />
        </Field>
      )}
      {cf.subject && (
        <div className="ts-fmt">
          <span className="ts-fmt-lbl">{t.bodyFormatLbl}</span>
          <div className="ajb-seg ts-fmt-seg">
            <button type="button" className={cx(!isHtml && 'is-on')} onClick={() => f.setField('bodyFormat', 'plain')}>{t.fmtPlain}</button>
            <button type="button" className={cx(isHtml && 'is-on')} onClick={() => f.setField('bodyFormat', 'html')}>{t.fmtHtml}</button>
          </div>
        </div>
      )}
      <Field label={isHtml ? t.htmlBodyLbl : t.secContent} required error={err('content')} hint={isHtml ? t.htmlHint : null} t={t}>
        <HiTextarea ref={f.contentRef} code={isHtml} value={f.data.content[aLang] || ''} onChange={v => f.setLangVal('content', aLang, v)} placeholder={isHtml ? t.htmlPh : t.messagePh} dir={cDir} />
      </Field>
    </div>
  );
}

/* ============================================================
   SETTINGS FIELDS (shared) — validity / tags / attachments / notes
   ============================================================ */
function TagEditor({ tags, onChange, t, lang }) {
  const [v, setV] = useState('');
  const add = () => { const x = v.trim(); if (x && !tags.includes(x)) onChange([...tags, x]); setV(''); };
  return (
    <div className="ts-tags">
      {tags.map(tg => (
        <span className="ajb-chip" key={tg}>{tg}
          <span className="ajb-chip__x" onClick={() => onChange(tags.filter(z => z !== tg))}><Icon name="x" /></span>
        </span>
      ))}
      <input className="ts-tag-input" value={v} placeholder={t.tagsPh}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
    </div>
  );
}

export function SettingsFields({ f, t, lang }) {
  const err = (k) => f.submitted && f.errors[k] ? t[f.errors[k]] : null;
  return (
    <div className="ts-grid">
      <Field label={t.fValidFrom} required error={err('validFrom')} t={t}>
        <DatePicker value={f.data.validFrom} onChange={v => f.setField('validFrom', v)} placeholder="—" lang={lang} />
      </Field>
      <Field label={t.fValidTo} hint={!f.data.validTo ? t.validToOpen : null} t={t}>
        <DatePicker value={f.data.validTo} onChange={v => f.setField('validTo', v)} placeholder={t.validToOpen} lang={lang} />
      </Field>
      <Field label={t.fTags} full t={t}>
        <TagEditor tags={f.data.tags} onChange={v => f.setField('tags', v)} t={t} lang={lang} />
      </Field>
      <Field label={t.fAttach} hint={t.attachHint} full t={t}>
        <div className="ts-drop"><Icon name="paperclip" /><span>{t.attachHint}</span></div>
      </Field>
      <Field label={t.fNotes} full t={t}>
        <textarea className="ajb-input ajb-input--boxed ts-notes" value={f.data.notes} placeholder={t.notesPh}
          dir={lang === 'ar' ? 'rtl' : 'ltr'} onChange={e => f.setField('notes', e.target.value)} />
      </Field>
    </div>
  );
}

/* ---------- section card ---------- */
function SectionCard({ n, title, children }) {
  return (
    <section className="ajb-card ts-card">
      <header className="ts-card-h"><span className="ts-card-n">{n}</span>{title}</header>
      {children}
    </section>
  );
}

/* ---------- header actions ---------- */
function HeaderActions({ t, onSave }) {
  return (
    <div className="ts-actions">
      <button type="button" className="ajb-btn ajb-btn--tertiary">{t.cancel}</button>
      <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => onSave('draft')}>{t.saveDraft}</button>
      <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => onSave('save')}><Icon name="check" />{t.save}</button>
    </div>
  );
}

/* ---------- right-rail preview stack (Direction A) ---------- */
function PreviewRail({ f, t, lang }) {
  const aLang = f.data.activeLang;
  return (
    <aside className="ts-rail">
      <DevicePreview channel={f.data.channel} text={f.data.content[aLang]} subject={f.data.subject[aLang]} ntitle={f.data.ntitle[aLang]} lang={aLang} sample={f.data.sampleMode} onToggleSample={() => f.setField('sampleMode', !f.data.sampleMode)} format={f.data.bodyFormat} t={t} />
      {channelFields(f.data.channel).segments && <SegmentMeter text={f.data.content[aLang]} lang={lang} t={t} />}
      <VariablePanel onInsert={f.insert} lang={lang} t={t} />
    </aside>
  );
}

/* ============================================================
   DIRECTION A — Workspace (two-pane)
   ============================================================ */
export function WorkspaceA({ f, t, lang, onSave }) {
  return (
    <div className="ts-page">
      <header className="ts-hd">
        <div className="ts-hd-l">
          <div className="ajb-crumb"><a href="#">{t.crumbHome}</a><span className="ajb-crumb__sep"><Icon name="chevron-right" /></span><span className="ajb-crumb__current">{t.crumbNew}</span></div>
          <h1 className="ts-h1">{t.title}<span className="ts-draftbadge">{t.draftBadge}</span></h1>
          <p className="ts-sub">{t.subtitle}</p>
        </div>
        <HeaderActions t={t} onSave={onSave} />
      </header>
      <div className="ts-work">
        <div className="ts-formcol">
          <SectionCard n="1" title={t.secDetails}><DetailsFields f={f} t={t} lang={lang} /></SectionCard>
          <SectionCard n="2" title={t.secContent}><ContentArea f={f} t={t} lang={lang} /></SectionCard>
          <SectionCard n="3" title={t.secSettings}><SettingsFields f={f} t={t} lang={lang} /></SectionCard>
        </div>
        <PreviewRail f={f} t={t} lang={lang} />
      </div>
    </div>
  );
}

/* ============================================================
   DIRECTION B — Stepper (guided)
   ============================================================ */
function Stepper({ step, t }) {
  const steps = [t.stepDetails, t.stepContent, t.stepReview];
  return (
    <div className="ajb-stepper ts-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={cx('ajb-step', i === step && 'is-on', i < step && 'is-done')}>
            <span className="ajb-step__dot">{i < step ? <Icon name="check" key="chk" /> : <span key="num">{i + 1}</span>}</span>
            <span className="ajb-step__label">{s}</span>
          </div>
          {i < steps.length - 1 && <span className={cx('ajb-step-line', i < step && 'is-done')} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ReviewRow({ k, children }) {
  return <div className="ajb-kv__row"><span className="ajb-kv__key">{k}</span><span className="ajb-kv__val">{children}</span></div>;
}

export function StepperB({ f, t, lang, onSave }) {
  const [step, setStep] = useState(0);
  const aLang = f.data.activeLang;
  const prod = TPL.PRODUCTS.find(p => p.id === f.data.product);
  const type = TPL.TYPES.find(x => x.id === f.data.type);
  const prio = TPL.PRIORITIES.find(x => x.id === f.data.priority);
  return (
    <div className="ts-page wizard">
      <header className="ts-hd center">
        <div className="ajb-crumb"><a href="#">{t.crumbHome}</a><span className="ajb-crumb__sep"><Icon name="chevron-right" /></span><span className="ajb-crumb__current">{t.crumbNew}</span></div>
        <h1 className="ts-h1">{t.title}<span className="ts-draftbadge">{t.draftBadge}</span></h1>
        <Stepper step={step} t={t} />
      </header>

      <div className="ts-wizbody">
        {step === 0 && (
          <div className="ajb-card ts-card"><DetailsFields f={f} t={t} lang={lang} /></div>
        )}
        {step === 1 && (
          <div className="ts-wizcontent">
            <div className="ajb-card ts-card"><ContentArea f={f} t={t} lang={lang} />{channelFields(f.data.channel).segments && <SegmentMeter text={f.data.content[aLang]} lang={lang} t={t} />}</div>
            <div className="ts-wizside">
              <DevicePreview channel={f.data.channel} text={f.data.content[aLang]} subject={f.data.subject[aLang]} ntitle={f.data.ntitle[aLang]} lang={aLang} sample={f.data.sampleMode} onToggleSample={() => f.setField('sampleMode', !f.data.sampleMode)} format={f.data.bodyFormat} t={t} />
              <VariablePanel onInsert={f.insert} lang={lang} t={t} compact />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="ts-wizcontent">
            <div className="ajb-card ts-card">
              <div className="ajb-kv">
                <ReviewRow k={t.fName}>{f.data.name || '—'}</ReviewRow>
                <ReviewRow k={t.fProduct}>{prod ? L(prod, lang) : '—'}</ReviewRow>
                <ReviewRow k={t.fChannel}><ChannelTag id={f.data.channel} lang={lang} /></ReviewRow>
                <ReviewRow k={t.fType}>{type ? L(type, lang) : '—'}</ReviewRow>
                <ReviewRow k={t.fPriority}>{prio ? L(prio, lang) : '—'}</ReviewRow>
                <ReviewRow k={t.contentLangs}>{f.data.langs.map(x => x.toUpperCase()).join(' · ')}</ReviewRow>
                <ReviewRow k={t.fValidFrom}>{f.data.validFrom || '—'}</ReviewRow>
                <ReviewRow k={t.fValidTo}>{f.data.validTo || t.validToOpen}</ReviewRow>
              </div>
              <SettingsFields f={f} t={t} lang={lang} />
            </div>
            <div className="ts-wizside">
              <DevicePreview channel={f.data.channel} text={f.data.content[aLang]} subject={f.data.subject[aLang]} ntitle={f.data.ntitle[aLang]} lang={aLang} sample={f.data.sampleMode} onToggleSample={() => f.setField('sampleMode', !f.data.sampleMode)} format={f.data.bodyFormat} t={t} />
              {channelFields(f.data.channel).segments && <SegmentMeter text={f.data.content[aLang]} lang={lang} t={t} />}
            </div>
          </div>
        )}
      </div>

      <footer className="ts-wizfoot">
        <button type="button" className={cx('ajb-btn ajb-btn--tertiary', step === 0 && 'ts-hidden')} onClick={() => setStep(s => Math.max(0, s - 1))}><Icon name="arrow-left" />{t.back}</button>
        <div className="ts-wizfoot-r">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => onSave('draft')}>{t.saveDraft}</button>
          {step < 2
            ? <button key="adv" type="button" className="ajb-btn ajb-btn--sand" onClick={() => setStep(s => Math.min(2, s + 1))}>{step === 1 ? t.toReview : t.next}<Icon name="arrow-right" /></button>
            : <button key="save" type="button" className="ajb-btn ajb-btn--sand" onClick={() => onSave('save')}><Icon name="check" />{t.save}</button>}
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   SAVED — draft confirmation
   ============================================================ */
export function SavedCard({ f, t, lang, tplId, onList, onAnother }) {
  return (
    <div className="ts-saved">
      <div className="ajb-card ajb-card--raised ts-saved-card">
        <div className="ajb-result ajb-result--success">
          <div className="ajb-result__badge"><Icon name="check" /></div>
          <h2 className="ajb-result__title">{t.savedTitle}</h2>
          <p className="ajb-result__text">{t.savedSub}</p>
        </div>
        <div className="ts-saved-meta">
          <div className="ts-saved-id">
            <span className="ts-saved-id-lbl">{t.fId}</span>
            <span className="ts-saved-id-v ajb-ltr">{tplId}</span>
          </div>
          <div className="ts-saved-tags">
            <span className="ts-mini"><span className="ts-mini-k">{t.fVersion}</span><span className="ts-mini-v ajb-ltr">v1</span></span>
            <span className="ts-mini"><span className="ts-mini-k">{t.fStatus}</span><StatusPill status="draft" t={t} /></span>
          </div>
        </div>
        <div className="ts-saved-rows">
          <div className="ts-saved-row"><span>{t.created}</span><b>A. Al Amri · 100245</b></div>
          <div className="ts-saved-row"><span>{t.createdAt}</span><b className="ajb-ltr">02 Jun 2026, 14:32</b></div>
          <div className="ts-saved-row"><span>{t.maker}</span><b>A. Al Amri</b></div>
          <div className="ts-saved-row"><span>{t.checker}</span><b className="ts-muted">{t.pending}</b></div>
        </div>
        <div className="ts-saved-actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onAnother}>{t.createAnother}</button>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={onList}>{t.viewList}<Icon name="arrow-right" /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TEMPLATE LIST — the "where it lands" glimpse
   ============================================================ */
export function TemplateListGlimpse({ f, t, lang, tplId, justCreated }) {
  const rows = [];
  if (justCreated) {
    rows.push({
      id: tplId, name: f.data.name || (lang === 'ar' ? 'قالب بدون اسم' : 'Untitled template'),
      product: f.data.product || 'cards', channel: f.data.channel, type: f.data.type || 'transaction',
      ver: 'v1', status: 'draft', updated: t.justNow, fresh: true,
    });
  }
  TPL.LIST_SEED.forEach((r, i) => rows.push({
    id: 'TPL-2026-0' + (4410 - i * 7), name: lang === 'ar' ? r.name_ar : r.name_en,
    product: r.product, channel: r.channel, type: r.type, ver: r.ver, status: r.status,
    updated: lang === 'ar' ? r.updated_ar : r.updated_en,
  }));
  return (
    <div className="ts-page">
      <header className="ts-hd">
        <div className="ts-hd-l">
          <div className="ajb-crumb"><span className="ajb-crumb__current">{t.crumbHome}</span></div>
          <h1 className="ts-h1">{t.listTitle}</h1>
        </div>
        <div className="ts-actions">
          <div className="ts-listsearch"><Icon name="search" /><input placeholder={t.searchList} /></div>
          <button type="button" className="ajb-btn ajb-btn--sand"><Icon name="plus" />{t.listNew}</button>
        </div>
      </header>
      <div className="ts-tablewrap">
        <table className="ajb-table ts-table">
          <thead>
            <tr>
              <th>{t.colName}</th><th>{t.colProduct}</th><th>{t.colChannel}</th>
              <th>{t.colType}</th><th>{t.colVer}</th><th>{t.colStatus}</th><th>{t.colUpdated}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const prod = TPL.PRODUCTS.find(p => p.id === r.product);
              const type = TPL.TYPES.find(x => x.id === r.type);
              return (
                <tr key={i} className={cx(r.fresh && 'fresh')}>
                  <td>
                    <div className="ts-tname">{r.name}</div>
                    <div className="ts-tid ajb-ltr">{r.id}</div>
                  </td>
                  <td>{prod ? L(prod, lang) : '—'}</td>
                  <td><ChannelTag id={r.channel} lang={lang} /></td>
                  <td>{type ? L(type, lang) : '—'}</td>
                  <td className="ajb-ltr">{r.ver}</td>
                  <td><StatusPill status={r.status} t={t} /></td>
                  <td className="ts-muted">{r.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   TEMPLATE STUDIO — top-level wrapper (direction switcher)
   ============================================================ */
export function TemplateStudio({ direction = 'workspace', f, t, lang, onSave, tplId, onList, onAnother, saved }) {
  if (saved) return <SavedCard f={f} t={t} lang={lang} tplId={tplId} onList={onList} onAnother={onAnother} />;
  if (direction === 'stepper') return <StepperB f={f} t={t} lang={lang} onSave={onSave} />;
  return <WorkspaceA f={f} t={t} lang={lang} onSave={onSave} />;
}

export default TemplateStudio;
