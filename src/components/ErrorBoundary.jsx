import { Component } from 'react';

// Class component because React error boundaries require one. Uses plain bilingual text
// because it must work even if the i18n provider itself failed.
const copy = {
  en: { title: 'Something went wrong', body: 'This page failed to load. Reload the page, or return to the home page.', reload: 'Reload page' },
  sw: { title: 'Hitilafu imetokea', body: 'Ukurasa huu umeshindwa kupakia. Pakia upya ukurasa, au rudi mwanzo.', reload: 'Pakia upya ukurasa' },
};

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Phase 2: send to an error reporting service. For now, log for developers only.
    console.error('UI error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const lang = document.documentElement.lang === 'sw' ? 'sw' : 'en';
    const c = copy[lang];
    return (
      <div className="container page-center" role="alert">
        <h1>{c.title}</h1>
        <p>{c.body}</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          {c.reload}
        </button>
      </div>
    );
  }
}
