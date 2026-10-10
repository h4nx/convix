import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'use-intl';
import '@fontsource-variable/inter';
import './globals.css';
import { ThemeProvider } from '@/hooks/use-theme';
import { ThemedToaster } from '@/components/themed-toaster';
import { locale, messages } from '@/i18n/messages';
import { App } from './App';

document.documentElement.lang = locale;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ThemedToaster />
      </ThemeProvider>
    </IntlProvider>
  </StrictMode>,
);
