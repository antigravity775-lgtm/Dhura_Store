import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import { SWRConfig } from 'swr';
import App from './App';
import './index.css';

function localStorageProvider() {
  if (typeof window === 'undefined') return new Map();
  // Initialize with data from localStorage
  const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'));
  // Save cache back to localStorage on window unload
  window.addEventListener('beforeunload', () => {
    // Only persist strings to avoid massive bloat
    const appCache = JSON.stringify(Array.from(map.entries()).slice(0, 50));
    localStorage.setItem('app-cache', appCache);
  });
  return map;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <SWRConfig
                  value={{
                    provider: localStorageProvider,
                    keepPreviousData: true,
                    revalidateOnFocus: false, // Prevent aggressive re-fetching on tab switch
                    revalidateIfStale: true,
                    dedupingInterval: 10000, // Global dedupe interval
                    errorRetryCount: 3,
                    shouldRetryOnError: true
                  }}
                >
                  <App />
                </SWRConfig>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
