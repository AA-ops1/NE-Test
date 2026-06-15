import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';

const LoginPage = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const TemplatesPage = lazy(() => import('./pages/Templates'));
const CreateTemplatePage = lazy(() => import('./pages/CreateTemplate'));
const ViewTemplatePage = lazy(() => import('./pages/ViewTemplate'));
const EditTemplatePage = lazy(() => import('./pages/EditTemplate'));
const ApprovalsPage = lazy(() => import('./pages/Approvals'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const ProfilePage = lazy(() => import('./pages/Profile'));

function AppShell({ page, children }) {
  const { theme, lang } = useApp();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return (
    <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
      {children}
    </div>
  );
}

export default function App() {
  const { theme, lang } = useApp();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <Suspense fallback={<div className="ne-page" data-theme={theme} />}>
      <Routes>
        <Route path="/" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <LoginPage />
          </div>
        } />
        <Route path="/home" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <DashboardPage />
          </div>
        } />
        <Route path="/templates" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <TemplatesPage />
          </div>
        } />
        <Route path="/templates/new" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <CreateTemplatePage />
          </div>
        } />
        <Route path="/templates/:detail" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <ViewTemplatePage />
          </div>
        } />
        <Route path="/templates/:detail/edit" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <EditTemplatePage />
          </div>
        } />
        <Route path="/approvals" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <ApprovalsPage />
          </div>
        } />
        <Route path="/settings" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <SettingsPage />
          </div>
        } />
        <Route path="/profile" element={
          <div className="ne-console" data-theme={theme} lang={lang} dir={dir}>
            <ProfilePage />
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
