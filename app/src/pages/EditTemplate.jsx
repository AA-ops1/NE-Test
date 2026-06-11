import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { useTemplateForm, blank, localizedSeed } from '../components/TemplateStudio';
import { EditWorkspace, LockedState, EditSaved, DiscardDialog } from '../components/EditTemplate';
import TPL from '../data/tpl';

function fingerprint(d) {
  const { activeLang, sampleMode, ...rest } = d;
  return JSON.stringify(rest);
}

export default function EditTemplatePage() {
  const { detail } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  const tpl = TPL.EDIT_TPL;
  const [scenario, setScenario] = useState('active');
  const [showDiscard, setShowDiscard] = useState(false);
  const [savedInfo, setSavedInfo] = useState({ kind: 'submit', ver: 'v4' });

  const f = useTemplateForm();
  const seedRef = useRef('');

  useEffect(() => {
    if (scenario === 'locked' || scenario === 'saved') return;
    const d = localizedSeed(lang);
    f.setData(d);
    f.setSubmitted(false);
    seedRef.current = fingerprint(d);
  }, [scenario, lang]);

  const isEditing = scenario === 'active' || scenario === 'draft';
  const dirty = isEditing && fingerprint(f.data) !== seedRef.current;

  const verLabel = scenario === 'draft' ? 'v' + tpl.draftVer : 'v' + tpl.activeVer;
  const nextLabel = 'v' + (tpl.activeVer + 1);
  const status = scenario === 'draft' ? 'draft' : 'active';
  const versions = scenario === 'draft' ? TPL.DRAFT_VERSIONS : TPL.VERSIONS;
  const newVer = isEditing && dirty
    ? { ver: nextLabel, status: 'draft', acted: 'edited', who: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, when: { en: 'just now', ar: 'الآن' }, isNew: true }
    : null;

  const onSave = useCallback((kind) => {
    const ver = (kind === 'submit' || kind === 'draftNew') ? 'v' + (tpl.activeVer + 1) : 'v' + tpl.draftVer;
    setSavedInfo({ kind, ver });
    setScenario('saved');
  }, [tpl]);

  const onCancel = useCallback(() => {
    if (dirty) setShowDiscard(true);
    else navigate(`/templates/${detail}`);
  }, [dirty, navigate, detail]);

  const onDiscard = useCallback(() => {
    setShowDiscard(false);
    navigate(`/templates/${detail}`);
  }, [navigate, detail]);

  let body;
  if (scenario === 'locked') {
    body = <LockedState t={t} lang={lang} tpl={tpl} onList={() => navigate('/templates')} />;
  } else if (scenario === 'saved') {
    body = (
      <EditSaved t={t} lang={lang} tpl={tpl} kind={savedInfo.kind} verLabel={savedInfo.ver}
        onBack={() => navigate('/templates')} onView={() => navigate(`/templates/${detail}`)} />
    );
  } else {
    body = (
      <EditWorkspace f={f} t={t} lang={lang} scenario={scenario} tpl={tpl}
        status={status} verLabel={verLabel} nextLabel={nextLabel} dirty={dirty}
        onCancel={onCancel} onSave={onSave} versions={versions} newVer={newVer} />
    );
  }

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="templates" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.editTitle || 'Edit template'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          {body}
          {showDiscard && <DiscardDialog t={t} onKeep={() => setShowDiscard(false)} onDiscard={onDiscard} />}
        </div>
      </div>
    </div>
  );
}
