import Breadcrumbs from './Breadcrumbs.jsx';
import DemoBadge from './DemoBadge.jsx';

export default function PageHeader({ title, description, crumbs, demo = false, children, tone = 'default' }) {
  return (
    <div className={`page-header page-header--${tone}`}>
      <div className="container">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="page-header__row">
          <div>
            <h1>{title}</h1>
            {description && <p className="lede">{description}</p>}
          </div>
          <div className="page-header__aside">
            {demo && <DemoBadge />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
