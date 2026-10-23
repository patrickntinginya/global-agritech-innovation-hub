import DemoBadge from './DemoBadge.jsx';

export default function SectionHeader({ id, title, description, demo = false, children }) {
  return (
    <header className="section-header">
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p className="lede">{description}</p>}
      </div>
      <div className="section-header__aside">
        {demo && <DemoBadge />}
        {children}
      </div>
    </header>
  );
}
