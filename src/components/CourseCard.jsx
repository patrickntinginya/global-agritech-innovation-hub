import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import DemoBadge from './DemoBadge.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function CourseCard({ course }) {
  const { t, loc } = useI18n();
  return (
    <article className="card course-card">
      <div className="card__body">
        <div className="course-card__top">
          <span className="course-card__icon">
            <Icon name={course.icon} size={24} />
          </span>
          <DemoBadge compact />
        </div>
        <h3>{loc(course.title)}</h3>
        <p>{loc(course.description)}</p>
        <ul className="chips">
          <li>{t(`learning.level.${course.level}`)}</li>
          <li>{t('learning.duration', { n: course.weeks })}</li>
        </ul>
        <Link className="btn btn--primary btn--sm" to={`/courses/${course.id}`}>
          {t('actions.viewCourse')}
          <span className="visually-hidden">: {loc(course.title)}</span>
        </Link>
      </div>
    </article>
  );
}
