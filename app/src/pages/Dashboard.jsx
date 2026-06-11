import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Icon from '../components/Icon';
import { SideNav, Topbar, useSideCollapse } from '../components/Shell';
import TPL from '../data/tpl';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useApp();
  const [collapsed, toggleSide] = useSideCollapse();
  const t = { ...TPL.T[lang] };

  const acts = [
    { icon: 'banknote', title: t.a1t, sub: t.a1s, pill: 'sent', label: t.sent },
    { icon: 'gift', title: t.a2t, sub: t.a2s, pill: 'sched', label: t.scheduled },
    { icon: 'receipt', title: t.a3t, sub: t.a3s, pill: 'draft', label: t.draft },
  ];

  return (
    <div className="ne-home ne-enter" data-collapsed={collapsed ? '' : undefined}>
      <SideNav page="home" t={t} collapsed={collapsed} />
      <div className="ne-main">
        <Topbar
          t={t}
          title={t.crumb || 'Notification engine'}
          collapsed={collapsed}
          onToggle={toggleSide}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
        <div className="ne-content">
          <h1 className="ne-welcome">{t.welcome}</h1>
          <p className="ne-welcome-sub">{t.welcomeSub}</p>
          <div className="ne-kpis">
            <div className="ajb-card">
              <div className="ajb-stat">
                <div className="ajb-stat__label">{t.kpiSent}</div>
                <div className="ajb-stat__value ajb-ltr">24,180</div>
                <div className="ajb-stat__delta ajb-stat__delta--up">+8.2%</div>
              </div>
            </div>
            <div className="ajb-card">
              <div className="ajb-stat">
                <div className="ajb-stat__label">{t.kpiSched}</div>
                <div className="ajb-stat__value ajb-ltr">7</div>
              </div>
            </div>
            <div className="ajb-card">
              <div className="ajb-stat">
                <div className="ajb-stat__label">{t.kpiRate}</div>
                <div className="ajb-stat__value ajb-ltr">99.4%</div>
                <div className="ajb-stat__delta ajb-stat__delta--up">+0.3%</div>
              </div>
            </div>
          </div>
          <div className="ajb-card ne-panel">
            <h3 className="ne-panel-h">{t.recent}</h3>
            <div className="ne-acts">
              {acts.map((a, i) => {
                const variant = { sent: 'success', sched: 'info', draft: 'neutral' }[a.pill];
                return (
                  <div className="ajb-li" key={i}>
                    <div className="ajb-li__ico"><Icon name={a.icon} /></div>
                    <div className="ajb-li__mid">
                      <div className="ajb-li__title">{a.title}</div>
                      <div className="ajb-li__sub">{a.sub}</div>
                    </div>
                    <span className={`ajb-badge ajb-badge--${variant}`}>{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
