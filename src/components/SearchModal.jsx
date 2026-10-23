import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function SearchModal({ open, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      setQuery('');
      inputRef.current?.focus();
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('search.title')} titleId="search-title">
      <form className="search-form" onSubmit={submit} role="search">
        <label htmlFor="global-search" className="visually-hidden">
          {t('a11y.searchLabel')}
        </label>
        <input
          id="global-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary">
          <Icon name="search" size={18} />
          {t('search.submit')}
        </button>
      </form>
      <p className="muted small">{t('search.hint')}</p>
    </Modal>
  );
}
