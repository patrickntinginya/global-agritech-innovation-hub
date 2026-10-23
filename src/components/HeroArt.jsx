import { useI18n } from '../i18n/index.jsx';

// Hand-drawn SVG scene: crop rows seen from above, a survey drone, a pivot-irrigation arc and a
// livestock tag. The readout chips are labelled as sample values.
export default function HeroArt() {
  const { t } = useI18n();
  const rows = Array.from({ length: 11 }, (_, i) => i);
  return (
    <figure className="hero-art">
      <svg viewBox="0 0 520 420" role="img" aria-label={t('hero.artLabel')} focusable="false">
        <defs>
          <clipPath id="field-clip">
            <rect x="0" y="0" width="520" height="420" rx="22" />
          </clipPath>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#274F3A" />
            <stop offset="1" stopColor="#1B4430" />
          </linearGradient>
        </defs>
        <g clipPath="url(#field-clip)">
          <rect width="520" height="420" fill="url(#sky)" />
          {/* crop rows */}
          {rows.map((i) => (
            <path
              key={i}
              d={`M${-20 + i * 52} 420 L${210 + i * 9} 120`}
              stroke={i % 2 ? '#3F7A55' : '#4C8A62'}
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          ))}
          {/* pivot irrigation arc */}
          <circle cx="150" cy="300" r="92" fill="none" stroke="#9CC7E8" strokeWidth="2" strokeDasharray="2 9" />
          <path d="M150 300 L238 262" stroke="#CFE0F5" strokeWidth="3" strokeLinecap="round" />
          <circle cx="150" cy="300" r="6" fill="#CFE0F5" />
          {/* drone scan cone */}
          <path d="M360 110 L300 250 L430 250 Z" fill="#E5B320" opacity="0.18" />
          <path d="M360 110 L300 250 M360 110 L430 250" stroke="#E5B320" strokeWidth="1.5" strokeDasharray="4 5" />
          {/* drone */}
          <g transform="translate(360 100)" stroke="#F2F5EF" strokeWidth="3" strokeLinecap="round">
            <rect x="-11" y="-7" width="22" height="14" rx="4" fill="#F2F5EF" />
            <path d="M-11 -4 L-26 -14 M11 -4 L26 -14 M-11 4 L-26 14 M11 4 L26 14" fill="none" />
            <path d="M-36 -14 H-16 M16 -14 H36 M-36 14 H-16 M16 14 H36" fill="none" stroke="#E5B320" />
          </g>
          {/* livestock tag */}
          <g transform="translate(420 330)">
            <circle r="26" fill="#E5B320" opacity="0.22" />
            <circle r="15" fill="#E5B320" opacity="0.4" />
            <circle r="7" fill="#E5B320" />
          </g>
        </g>
      </svg>
      <div className="hero-art__chips" aria-hidden="true">
        <div className="hero-chip hero-chip--moisture">
          <span>{t('hero.moisture')}</span>
          <strong>34%</strong>
        </div>
        <div className="hero-chip hero-chip--drone">
          <span>{t('hero.drone')}</span>
          <strong>12 ha</strong>
        </div>
        <div className="hero-chip hero-chip--herd">
          <span>{t('hero.herd')}</span>
          <strong>48 / 50</strong>
        </div>
      </div>
      <figcaption>{t('hero.artSample')}</figcaption>
    </figure>
  );
}
