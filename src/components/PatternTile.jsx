// Placeholder artwork. Real photography is added in a later phase; these tiles are
// light SVG so they load fast on slow connections.
const palettes = {
  a: ['#17402B', '#E5B320'],
  b: ['#1D4E89', '#CFE0F5'],
  c: ['#7A4B1E', '#F2D9A8'],
  d: ['#1F5A3C', '#BFE3C9'],
  e: ['#8A3B2E', '#F4C9B8'],
  f: ['#2F5F4F', '#E5B320'],
  g: ['#3B4A5A', '#D6DEE6'],
};

const motifs = {
  a: (fg) => [0, 1, 2, 3, 4].map((i) => <circle key={i} cx="150" cy="95" r={20 + i * 22} fill="none" stroke={fg} strokeOpacity={0.5 - i * 0.07} strokeWidth="2" />),
  b: (fg) => [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="-10" y={8 + i * 20} width="230" height="9" fill={fg} fillOpacity={0.35 - i * 0.04} />),
  c: (fg) => [0, 1, 2, 3, 4, 5, 6].flatMap((r) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => <circle key={`${r}-${c}`} cx={14 + c * 24} cy={14 + r * 17} r="3" fill={fg} fillOpacity="0.5" />)),
  d: (fg) => [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}-${c}`} x={10 + c * 40} y={8 + r * 28} width="30" height="20" fill="none" stroke={fg} strokeOpacity="0.55" strokeWidth="1.6" />)),
  e: (fg) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={-20 + i * 36} y1="130" x2={40 + i * 36} y2="-10" stroke={fg} strokeOpacity="0.45" strokeWidth="5" />),
  f: (fg) => [0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-10 ${22 + i * 22} Q 40 ${2 + i * 22} 90 ${22 + i * 22} T 210 ${22 + i * 22}`} fill="none" stroke={fg} strokeOpacity="0.55" strokeWidth="2.4" />),
  g: (fg) => [0, 1, 2, 3, 4].map((i) => <polygon key={i} points={`${20 + i * 40},100 ${40 + i * 40},50 ${60 + i * 40},100`} fill={fg} fillOpacity="0.4" />),
};

export default function PatternTile({ tone = 'a', children, className = '' }) {
  const [bg, fg] = palettes[tone] ?? palettes.a;
  const draw = motifs[tone] ?? motifs.a;
  return (
    <div className={`tile ${className}`.trim()} style={{ background: bg }}>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        {draw(fg)}
      </svg>
      {children && <div className="tile__overlay">{children}</div>}
    </div>
  );
}
