// Small stroke icon set drawn for this project. Decorative by default (aria-hidden).
const paths = {
  sprout: 'M12 21V11M12 11c0-3.5 2.6-6 7-6 0 3.6-2.6 6-7 6ZM12 15c0-2.6-2-4.5-6-4.5 0 2.7 2 4.5 6 4.5Z',
  target: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z',
  chip: 'M8 8h8v8H8ZM10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3',
  drone: 'M9 9l-3-3M15 9l3-3M9 15l-3 3M15 15l3 3M10 10h4v4h-4ZM3.5 5h5M15.5 5h5M3.5 19h5M15.5 19h5',
  droplet: 'M12 3.5C9 7.5 6.5 10.3 6.5 13.5a5.5 5.5 0 0 0 11 0C17.5 10.3 15 7.5 12 3.5Z',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
  robot: 'M6 9h12v9H6ZM12 9V5M12 5h.01M9.5 13h.01M14.5 13h.01M9.5 16h5M3.5 12.5v3M20.5 12.5v3',
  greenhouse: 'M3 20V11l9-6 9 6v9ZM3 11h18M9 20v-6h6v6M12 5V3',
  shield: 'M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6L12 3ZM9 12l2.2 2.2L15.5 10',
  cow: 'M4 8l2-2.5L8 8M16 8l2-2.5L20 8M7 8h10v6a5 5 0 0 1-10 0V8ZM10 15.5h.01M14 15.5h.01',
  laptop: 'M5 6h14v9H5ZM2.5 18.5h19M9 18.5h6',
  factory: 'M3 20V10l6 3.5V10l6 3.5V6h3v14ZM3 20h18M8 17h.01M12 17h.01M16 17h.01',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4',
  cart: 'M3 4h2.5l2 10h10l2-7.5H7M9.5 19.5h.01M16.5 19.5h.01',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5L20 20',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6L6 18',
  bookmark: 'M7 4h10v16l-5-3.5L7 20V4Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21M12 3C9.5 5.7 8.2 8.7 8.2 12S9.5 18.3 12 21',
  users: 'M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11ZM3 19c.4-3 2.7-4.7 6-4.7s5.6 1.7 6 4.7M16.5 5a3 3 0 0 1 0 6M18.5 14.6c1.5.6 2.3 1.9 2.5 4.4',
  book: 'M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5ZM5 17a3 3 0 0 1 3-3h10',
  rocket: 'M14.5 4.5c3-.8 5 .2 5 .2s1 2-.2 5L14 15l-5-5 5.5-5.5ZM9 10l-3.5 1 2-3.5 3-.5M14 15l-1 3.5 3.5-2 .5-3M5 19c0-1.7.8-2.5 2.5-2.5',
  building: 'M5 21V4h9v17M14 9h5v12M3 21h18M8.5 8h2M8.5 12h2M8.5 16h2',
  handshake: 'M3 11l3.5-3 4 1.5 3-1.5 4 1 3.5 2.5-3 3-2 2-3.5 1-3-1-4-3-2.5-1.5ZM7 14.5l3 2',
  leaf: 'M5 19c0-8 4-13 14-14 0 9-4 14-12 14M5 19c2-4 4.5-6.5 8-8',
  mail: 'M4 6h16v12H4ZM4 7l8 6 8-6',
};

export default function Icon({ name, size = 22, strokeWidth = 1.7, className = '', title }) {
  const d = paths[name] ?? paths.leaf;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
