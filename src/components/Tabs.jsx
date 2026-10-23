import { useRef } from 'react';

// Accessible tab list (arrow keys, Home/End). The caller renders the matching panel with
// id={`${idPrefix}-panel-${value}`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${value}`}.
export default function Tabs({ tabs, value, onChange, idPrefix, label }) {
  const refs = useRef({});
  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => (refs.current[tab.id] = el)}
          id={`${idPrefix}-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          tabIndex={value === tab.id ? 0 : -1}
          className={`tab ${value === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
