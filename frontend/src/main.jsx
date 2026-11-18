import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { store } from './store/index.js';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
