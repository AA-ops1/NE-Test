import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ne-theme') || 'dark'; } catch (e) { return 'dark'; }
  });
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('ne-lang') || 'en'; } catch (e) { return 'en'; }
  });

  const setThemeAndSave = (t) => {
    setTheme(t);
    try { localStorage.setItem('ne-theme', t); } catch (e) {}
  };
  const setLangAndSave = (l) => {
    setLang(l);
    try { localStorage.setItem('ne-lang', l); } catch (e) {}
  };

  return (
    <AppContext.Provider value={{ theme, setTheme: setThemeAndSave, lang, setLang: setLangAndSave }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
