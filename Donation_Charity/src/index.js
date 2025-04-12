import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './assets/css/App.css';
import '@aws-amplify/ui-react/styles.css';

import App from './App';
// import reportWebVitals from './reportWebVitals'; // ❌ 注释掉或删除这行

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// reportWebVitals(); // ❌ 注释掉或删除这行
