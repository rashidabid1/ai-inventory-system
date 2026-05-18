import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AuthProvider from './components/AuthProvider'
import './index.css'
import axios from 'axios'

// Configure a global axios request interceptor to automatically sanitize double slashes in API URLs
// (e.g. https://domain.com//api/products -> https://domain.com/api/products)
axios.interceptors.request.use((config) => {
  if (config.url) {
    config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

