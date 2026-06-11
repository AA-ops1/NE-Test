/* global React, useApp */

function BottomTabs() {
  const { tab, setTab, setScreen } = useApp();
  const tabs = [
    { id: 'home',     label: 'Home',     icon: 'home',          screen: 'home' },
    { id: 'cards',    label: 'Cards',    icon: 'credit-card',   screen: 'card' },
    { id: 'invest',   label: 'Invest',   icon: 'trending-up',   screen: 'home' },
    { id: 'more',     label: 'More',     icon: 'menu',          screen: 'home' },
  ];
  return (
    <div className="ajb-app-tabbar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={tab === t.id ? 'on' : ''}
          onClick={() => { setTab(t.id); setScreen(t.screen); }}>
          <i data-lucide={t.icon}></i>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

window.BottomTabs = BottomTabs;
