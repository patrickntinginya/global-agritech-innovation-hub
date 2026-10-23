import Icon from './Icon.jsx';

// kind: 'info' (neutral), 'demo' (sample content), 'backend' (needs a server, arrives in a later phase)
export default function Notice({ kind = 'info', title, children }) {
  return (
    <aside className={`notice notice--${kind}`} role="note">
      <Icon name={kind === 'backend' ? 'shield' : 'leaf'} size={20} />
      <div>
        {title && <p className="notice__title">{title}</p>}
        <div className="notice__body">{children}</div>
      </div>
    </aside>
  );
}
