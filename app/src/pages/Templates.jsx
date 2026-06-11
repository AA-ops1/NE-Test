import React from 'react';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { TemplateStore } from '../components/TemplateList';
import TPL from '../data/tpl';

export default function TemplatesPage() {
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="templates" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.listTitle || 'Templates'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          <TemplateStore t={t} lang={lang} />
        </div>
      </div>
    </div>
  );
}
