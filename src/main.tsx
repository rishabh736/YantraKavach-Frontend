import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlantProvider } from './context/PlantContext';
import { A11yProvider } from './context/A11yContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <A11yProvider>
      <ToastProvider>
        <AuthProvider>
          <PlantProvider>
            <App />
          </PlantProvider>
        </AuthProvider>
      </ToastProvider>
      </A11yProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
