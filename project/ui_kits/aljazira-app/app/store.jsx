/* global React */
const { useState, useContext, createContext } = React;

const AppCtx = createContext(null);

function AppProvider({ children }) {
  const [screen, setScreen] = useState('onboarding');
  const [tab, setTab] = useState('home');
  const [transferStep, setTransferStep] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState(null);

  const go = (s) => setScreen(s);
  const resetTransfer = () => { setTransferStep(0); setTransferAmount(''); setTransferRecipient(null); };

  return (
    <AppCtx.Provider value={{
      screen, setScreen: go, tab, setTab,
      transferStep, setTransferStep,
      transferAmount, setTransferAmount,
      transferRecipient, setTransferRecipient,
      resetTransfer,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

function useApp() { return useContext(AppCtx); }

window.AppProvider = AppProvider;
window.useApp = useApp;
