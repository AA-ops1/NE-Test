import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import { ApprovalsConsole } from '../components/Approvals';
import TPL from '../data/tpl';

const DEFAULT_TWEAKS = { reviewLayout: 'split', queueView: 'table' };

export default function ApprovalsPage() {
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  const [role, setRole] = useState('checker');
  const [queue, setQueue] = useState(() => TPL.AP.QUEUE.map(x => ({ ...x })));
  const [mine, setMine] = useState(() => TPL.AP.MINE.map(x => ({ ...x })));

  const pending = queue.length;

  return (
    <div className="ne-home" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="approvals" t={t} collapsed={collapsed} pending={pending} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.apTitle || 'Approvals'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          extra={
            <div className="ap-role-toggle">
              <span className="ap-role-lbl">{t.apRole || 'Role'}</span>
              {['checker', 'maker'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`ajb-chip ajb-chip--filter${role === r ? ' is-on' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r === 'checker' ? (t.apChecker || 'Checker') : (t.apMaker || 'Maker')}
                </button>
              ))}
            </div>
          }
        />
        <div className="ne-content">
          <ApprovalsConsole
            role={role}
            lang={lang}
            t={t}
            tweaks={DEFAULT_TWEAKS}
            queue={queue}
            setQueue={setQueue}
            mine={mine}
            setMine={setMine}
          />
        </div>
      </div>
    </div>
  );
}
