import React from 'react';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { SettingsConsole } from '../components/Settings';
import TPL from '../data/tpl';

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="settings" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.setTitle || 'Settings'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          <SettingsConsole t={t} lang={lang} view="table" />
        </div>
      </div>
    </div>
  );
}
