import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { ViewDetails } from '../components/ViewTemplate';
import TPL from '../data/tpl';

export default function ViewTemplatePage() {
  const { detail } = useParams();
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const [idx, setIdx] = useState(0);
  const t = { ...TPL.T[lang] };

  const tpl = TPL.VIEW_TEMPLATES[detail] || TPL.VIEW_TEMPLATES.sms;

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="templates" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={tpl ? (tpl.name[lang] || tpl.name.en) : (t.details || 'Template details')}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          <ViewDetails
            tpl={tpl}
            idx={idx}
            onPick={setIdx}
            t={t}
            lang={lang}
            editHref={`/templates/${detail}/edit`}
            backHref="/templates"
          />
        </div>
      </div>
    </div>
  );
}
