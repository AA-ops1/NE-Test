/* ============================================================
   Edit Template — layout + edit-specific parts.
   Reuses the studio field groups (DetailsFields / ContentArea /
   SettingsFields) and preview parts; adds the status-aware banner,
   version history, locked state, saved confirmation, discard dialog.
   ============================================================ */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import TPL from '../data/tpl';
import { L, cx, DevicePreview, SegmentMeter, VariablePanel, StatusPill } from './TemplateParts';
import { DetailsFields, ContentArea, SettingsFields } from './TemplateStudio';

function fmt(str, map) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

/* ---------- status-aware banner ---------- */
export function StatusBanner({ scenario, t, verLabel, nextLabel }) {
  if (scenario === 'errors') {
    return (
      <div className="ajb-alert ajb-alert--danger et-banner">
        <span className="ajb-alert__ico"><Icon name="alert-circle" /></span>
        <div className="et-banner-body">
          <p className="ajb-alert__title">{t.bnErrTitle}</p>
          <p className="ajb-alert__text">{t.bnErrText}</p>
        </div>
      </div>
    );
  }
  if (scenario === 'draft') {
    return (
      <div className="ajb-alert ajb-alert--info et-banner">
        <span className="ajb-alert__ico"><Icon name="file-pen-line" /></span>
        <div className="et-banner-body">
          <p className="ajb-alert__title">{fmt(t.bnDraftTitle, { ver: verLabel })}</p>
          <p className="ajb-alert__text">{t.bnDraftText}</p>
        </div>
      </div>
    );
  }
  // active (and inactive-versioned) → new version on edit
  return (
    <div className="ajb-alert ajb-alert--warning et-banner">
      <span className="ajb-alert__ico"><Icon name="git-branch" /></span>
      <div className="et-banner-body">
        <p className="ajb-alert__title">{fmt(t.bnActiveTitle, { ver: verLabel })}</p>
        <p className="ajb-alert__text">{fmt(t.bnActiveText, { ver: verLabel, next: nextLabel })}</p>
      </div>
    </div>
  );
}

/* ---------- version history (rail) ---------- */
export function VersionHistory({ versions, newVer, t, lang }) {
  const rows = newVer ? [newVer, ...versions] : versions;
  return (
    <div className="et-ver">
      <div className="et-ver-head"><Icon name="history" />{t.verTitle}</div>
      <div className="et-ver-list">
        {rows.map((v, i) => (
          <div key={i} className={cx('et-vrow', v.current && 'is-current', v.isNew && 'is-new')}>
            <span className="et-vdot" />
            <div className="et-vbody">
              <div className="et-vtop">
                <span className="et-vver ajb-ltr">{v.ver}</span>
                {v.isNew ? <span className="et-vtag new">{t.verNew}</span>
                  : v.current ? <span className="et-vtag cur">{t.verCurrent}</span>
                  : <StatusPill status={v.status} t={t} />}
              </div>
              <div className="et-vact">{t.verActed[v.acted] || v.acted}</div>
              <div className="et-vmeta">{t.verBy} {L(v.who, lang)} {t.metaSep} {L(v.when, lang)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- header actions, contextual to scenario ---------- */
export function EditActions({ scenario, t, onCancel, onSave }) {
  if (scenario === 'draft') {
    return (
      <div className="ts-actions">
        <button type="button" className="ajb-btn ajb-btn--tertiary" onClick={onCancel}>{t.cancel}</button>
        <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => onSave('draftSame')}>{t.saveDraft}</button>
        <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => onSave('changes')}><Icon name="check" />{t.saveChanges}</button>
      </div>
    );
  }
  // active / errors → creates a new version
  return (
    <div className="ts-actions">
      <button type="button" className="ajb-btn ajb-btn--tertiary" onClick={onCancel}>{t.cancel}</button>
      <button type="button" className="ajb-btn ajb-btn--secondary" onClick={() => onSave('draftNew')}>{t.saveNewDraft}</button>
      <button type="button" className="ajb-btn ajb-btn--sand" onClick={() => onSave('submit')}><Icon name="send" />{t.submitReview}</button>
    </div>
  );
}

/* ---------- edit rail = preview + segment + variables + history ---------- */
export function EditRail({ f, t, lang, versions, newVer }) {
  const aLang = f.data.activeLang;
  return (
    <aside className="ts-rail">
      <DevicePreview channel={f.data.channel} text={f.data.content[aLang]} subject={f.data.subject[aLang]} ntitle={f.data.ntitle[aLang]} lang={aLang} sample={f.data.sampleMode} onToggleSample={() => f.setField('sampleMode', !f.data.sampleMode)} t={t} />
      <SegmentMeter text={f.data.content[aLang]} lang={lang} t={t} />
      <VariablePanel onInsert={f.insert} lang={lang} t={t} compact />
      <VersionHistory versions={versions} newVer={newVer} t={t} lang={lang} />
    </aside>
  );
}

/* ============================================================
   EDIT WORKSPACE — two-pane, mirrors Direction A
   ============================================================ */
export function EditWorkspace({ f, t, lang, scenario, tpl, status, verLabel, nextLabel, dirty, onCancel, onSave, versions, newVer }) {
  return (
    <div className="ts-page">
      <header className="ts-hd">
        <div className="ts-hd-l">
          <div className="ajb-crumb">
            <Link to="/">{t.crumbHome}</Link>
            <span className="ajb-crumb__sep"><Icon name="chevron-right" /></span>
            <Link to={`/templates/${tpl.id}`}>{L(tpl.name, lang)}</Link>
            <span className="ajb-crumb__sep"><Icon name="chevron-right" /></span>
            <span className="ajb-crumb__current">{t.crumbEdit}</span>
          </div>
          <div className="et-titlerow">
            <h1 className="ts-h1">{L(tpl.name, lang)}</h1>
            <StatusPill status={status} t={t} />
            <span className="et-vchip ajb-ltr">{verLabel}</span>
          </div>
          <div className="et-meta">
            <span>{t.lastUpdated} <b>{L(tpl.updatedBy, lang)}</b></span>
            <span className="et-meta-sep">{t.metaSep}</span>
            <span className="ajb-ltr">{L(tpl.updatedAt, lang)}</span>
            {dirty && <span className="et-unsaved">{t.unsaved}</span>}
          </div>
        </div>
        <EditActions scenario={scenario} t={t} onCancel={onCancel} onSave={onSave} />
      </header>

      <StatusBanner scenario={scenario} t={t} verLabel={verLabel} nextLabel={nextLabel} />

      <div className="ts-work">
        <div className="ts-formcol">
          <section className="ajb-card ts-card">
            <header className="ts-card-h"><span className="ts-card-n">1</span>{t.secDetails}</header>
            <DetailsFields f={f} t={t} lang={lang} />
          </section>
          <section className="ajb-card ts-card">
            <header className="ts-card-h"><span className="ts-card-n">2</span>{t.secContent}</header>
            <ContentArea f={f} t={t} lang={lang} />
          </section>
          <section className="ajb-card ts-card">
            <header className="ts-card-h"><span className="ts-card-n">3</span>{t.secSettings}</header>
            <SettingsFields f={f} t={t} lang={lang} />
          </section>
        </div>
        <EditRail f={f} t={t} lang={lang} versions={versions} newVer={newVer} />
      </div>
    </div>
  );
}

/* ============================================================
   LOCKED — archived template can't be edited
   ============================================================ */
export function LockedState({ t, lang, tpl, onList }) {
  return (
    <div className="et-locked">
      <div className="ajb-card ajb-card--raised et-locked-card">
        <div className="et-lock-badge"><Icon name="lock" /></div>
        <h2 className="et-lock-title">{t.lkTitle}</h2>
        <p className="et-lock-text">{t.lkArchived}</p>
        <div className="et-lock-meta">
          <Icon name="file-text" />
          <span>{L(tpl.name, lang)}</span>
          <span className="et-meta-sep">{t.metaSep}</span>
          <StatusPill status="archived" t={t} />
        </div>
        <div className="et-lock-actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onList}>{t.lkBackList}</button>
          <button type="button" className="ajb-btn ajb-btn--sand"><Icon name="rotate-ccw" />{t.lkRestore}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SAVED — confirmation (new version submitted, or draft updated)
   ============================================================ */
export function EditSaved({ t, lang, tpl, kind, verLabel, onBack, onView }) {
  const newVersion = kind === 'submit' || kind === 'draftNew';
  const title = kind === 'submit' ? t.svNewTitle : (kind === 'draftNew' ? t.svNewTitle : t.svDraftTitle);
  const sub = kind === 'submit' ? t.svNewSub : (kind === 'draftNew' ? t.svDraftSub : t.svDraftSub);
  const showStatus = kind === 'submit' ? 'review' : 'draft';
  return (
    <div className="ts-saved">
      <div className="ajb-card ajb-card--raised ts-saved-card">
        <div className="ajb-result ajb-result--success">
          <div className="ajb-result__badge"><Icon name={kind === 'submit' ? 'send' : 'check'} /></div>
          <h2 className="ajb-result__title">{title}</h2>
          <p className="ajb-result__text">{sub}</p>
        </div>
        <div className="ts-saved-meta">
          <div className="ts-saved-id">
            <span className="ts-saved-id-lbl">{L(tpl.name, lang)}</span>
            <span className="ts-saved-id-v ajb-ltr">{tpl.id}</span>
          </div>
          <div className="ts-saved-tags">
            <span className="ts-mini"><span className="ts-mini-k">{t.fVersion}</span><span className="ts-mini-v ajb-ltr et-saved-ver">{verLabel}</span></span>
            <span className="ts-mini"><span className="ts-mini-k">{t.fStatus}</span><StatusPill status={showStatus} t={t} /></span>
          </div>
        </div>
        <div className="ts-saved-rows">
          <div className="ts-saved-row"><span>{t.updatedBy}</span><b>A. Al Amri · 100245</b></div>
          <div className="ts-saved-row"><span>{t.updatedAt}</span><b className="ajb-ltr">04 Jun 2026, 14:32</b></div>
          {newVersion && <div className="ts-saved-row"><span>{t.maker}</span><b>A. Al Amri</b></div>}
          {kind === 'submit' && <div className="ts-saved-row"><span>{t.checker}</span><b className="ts-muted">{t.pending}</b></div>}
        </div>
        <div className="ts-saved-actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onBack}>{t.svBackTemplate}</button>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={onView}>{t.svViewVer}<Icon name="arrow-right" /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DISCARD DIALOG
   ============================================================ */
export function DiscardDialog({ t, onKeep, onDiscard }) {
  return (
    <div className="et-overlay">
      <div className="ajb-scrim" onClick={onKeep} />
      <div className="ajb-dialog" role="dialog" aria-modal="true">
        <div className="ajb-dialog__ico"><Icon name="trash-2" /></div>
        <h3 className="ajb-dialog__title">{t.dgTitle}</h3>
        <p className="ajb-dialog__text">{t.dgText}</p>
        <div className="ajb-dialog__actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onKeep}>{t.dgKeep}</button>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={onDiscard}>{t.dgDiscard}</button>
        </div>
      </div>
    </div>
  );
}

export default EditWorkspace;
