import { useId } from 'react';
import Icon from './Icon.jsx';

export default function SearchField({ label, value, onChange, placeholder }) {
  const id = useId();
  return (
    <div className="field field--search">
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        <Icon name="search" size={18} />
        <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" />
      </div>
    </div>
  );
}
