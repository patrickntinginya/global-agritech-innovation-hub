import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { I18nProvider } from './i18n/index.jsx';
import { BookmarksProvider } from './context/BookmarksContext.jsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.jsx';
import './styles/global.css';
import './styles/pages.css';
import './styles/ui.css';
import './styles/ui.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <BookmarksProvider>
          <RecentlyViewedProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </RecentlyViewedProvider>
        </BookmarksProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
