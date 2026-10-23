import { useId } from 'react';
import Icon from './Icon.jsx';
import { LANGUAGES, useI18n } from '../i18n/index.jsx';

export default function LanguageSelect({ tone = 'light' }) {
  const { lang, setLang, t } = useI18n();
  const id = useId();
  return (
    <div className={`lang-select lang-select--${tone}`}>
      <label htmlFor={id} className="visually-hidden">
        {t('a11y.language')}
      </label>
      <Icon name="globe" size={18} />
      <select id={id} value={lang} onChange={(e) => setLang(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
