import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';

// Global layout reset (must come first)
import './styles/reset.css';
// Design system + component styles
import './styles/colors_and_type.css';
import './styles/components.css';
import './styles/login.css';
import './styles/template-studio.css';
import './styles/template-tweaks.css';
import './styles/template-list.css';
import './styles/view-template.css';
import './styles/edit-template.css';
import './styles/template-delete.css';
import './styles/approvals.css';
import './styles/settings.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
