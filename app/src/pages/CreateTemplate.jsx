import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { TemplateStudio, useTemplateForm } from '../components/TemplateStudio';
import TPL from '../data/tpl';

const NEW_TPL_ID = 'NE-NEW-001';

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  const f = useTemplateForm();
  const [saved, setSaved] = useState(false);

  const onSave = useCallback(() => setSaved(true), []);

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="templates" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.title || 'Create template'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          <TemplateStudio
            f={f}
            t={t}
            lang={lang}
            onSave={onSave}
            saved={saved}
            tplId={NEW_TPL_ID}
            onList={() => navigate('/templates')}
            onAnother={() => { setSaved(false); f.seed('compose'); }}
          />
        </div>
      </div>
    </div>
  );
}
