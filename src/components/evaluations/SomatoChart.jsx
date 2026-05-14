import React from 'react';

// Subsomatotype regions: label, x range, y range (in somatochart coords)
const REGIONS = [
  { label: 'Central', xMin: -1, xMax: 1, yMin: -1, yMax: 1, color: 'hsl(0,0%,50%)' },
  { label: 'Meso-Endo', xMin: -3, xMax: -1, yMin: 0, yMax: 4, color: 'hsl(340,70%,55%)' },
  { label: 'Endomórfico', xMin: -6, xMax: -3, yMin: -2, yMax: 2, color: 'hsl(0,80%,55%)' },
  { label: 'Endo-Ecto', xMin: -3, xMax: 0, yMin: -4, yMax: -1, color: 'hsl(20,80%,50%)' },
  { label: 'Meso-Ecto', xMin: 1, xMax: 3, yMin: 0, yMax: 4, color: 'hsl(160,70%,42%)' },
  { label: 'Ectomórfico', xMin: 3, xMax: 6, yMin: -2, yMax: 2, color: 'hsl(200,75%,50%)' },
  { label: 'Ecto-Meso', xMin: 0, xMax: 3, yMin: -4, yMax: -1, color: 'hsl(180,65%,45%)' },
  { label: 'Mesomórfico', xMin: -1, xMax: 1, yMin: 3, yMax: 7, color: 'hsl(43,100%,49%)' },
  { label: 'Balance Meso', xMin: -2, xMax: 2, yMin: 1, yMax: 3, color: 'hsl(43,80%,55%)' },
];

function getSomatotypeLabel(x, y) {
  const ax = Math.abs(x);
  const ay = Math.abs(y);

  if (ax <= 1 && ay <= 1) return 'Central';
  if (y >= 3) return 'Mesomórfico';
  if (y >= 1 && x < -1) return 'Meso-Endo';
  if (y >= 1 && x > 1) return 'Meso-Ecto';
  if (y <= -1 && x < 0) return 'Endo-Ecto';
  if (y <= -1 && x > 0) return 'Ecto-Meso';
  if (x < -2) return 'Endomórfico';
  if (x > 2) return 'Ectomórfico';
  return 'Balance Meso';
}

export default function SomatoChart({ endo = 0, meso = 0, ecto = 0 }) {
  const x = ecto - endo;
  const y = 2 * meso - ecto - endo;

  const scale = 12;
  const cx = 150 + x * scale;
  const cy = 150 - y * scale;

  const label = getSomatotypeLabel(x, y);

  // Zone polygons (approximate visual regions)
  const zones = [
    {
      label: 'ENDOMÓRFICO', color: 'hsl(0,70%,50%)',
      points: '54,150 78,126 78,174',
    },
    {
      label: 'ECTOMÓRFICO', color: 'hsl(200,70%,50%)',
      points: '246,150 222,126 222,174',
    },
    {
      label: 'MESOMÓRFICO', color: 'hsl(43,90%,49%)',
      points: '150,54 126,78 174,78',
    },
    {
      label: 'MESO-ENDO', color: 'hsl(340,60%,50%)',
      points: '126,78 78,126 114,114',
    },
    {
      label: 'MESO-ECTO', color: 'hsl(160,65%,42%)',
      points: '174,78 186,114 222,126',
    },
    {
      label: 'ENDO-ECTO', color: 'hsl(20,75%,50%)',
      points: '78,174 114,186 150,246',
    },
    {
      label: 'ECTO-MESO', color: 'hsl(180,60%,45%)',
      points: '150,246 186,186 222,174',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
        <rect x="0" y="0" width="300" height="300" fill="transparent" />

        {/* Zone fills */}
        {zones.map(z => (
          <polygon key={z.label} points={z.points} fill={z.color} opacity="0.12" />
        ))}

        {/* Grid */}
        {[-8,-6,-4,-2,0,2,4,6,8].map(v => (
          <g key={v}>
            <line x1={150 + v * scale} y1="20" x2={150 + v * scale} y2="280" stroke="hsl(0,0%,20%)" strokeWidth="0.5" />
            <line x1="20" y1={150 - v * scale} x2="280" y2={150 - v * scale} stroke="hsl(0,0%,20%)" strokeWidth="0.5" />
          </g>
        ))}

        {/* Axes */}
        <line x1="150" y1="20" x2="150" y2="280" stroke="hsl(0,0%,35%)" strokeWidth="1" />
        <line x1="20" y1="150" x2="280" y2="150" stroke="hsl(0,0%,35%)" strokeWidth="1" />

        {/* Axis Labels */}
        <text x="18" y="155" fill="hsl(0,70%,55%)" fontSize="8" textAnchor="start" fontWeight="bold">ENDO</text>
        <text x="282" y="155" fill="hsl(200,70%,55%)" fontSize="8" textAnchor="end" fontWeight="bold">ECTO</text>
        <text x="150" y="14" fill="hsl(43,100%,49%)" fontSize="8" textAnchor="middle" fontWeight="bold">MESO</text>

        {/* Zone labels */}
        <text x="72" y="152" fill="hsl(0,70%,60%)" fontSize="6.5" textAnchor="middle" opacity="0.8">Endo</text>
        <text x="228" y="152" fill="hsl(200,70%,60%)" fontSize="6.5" textAnchor="middle" opacity="0.8">Ecto</text>
        <text x="150" y="72" fill="hsl(43,90%,55%)" fontSize="6.5" textAnchor="middle" opacity="0.8">Meso</text>
        <text x="100" y="108" fill="hsl(340,70%,65%)" fontSize="6" textAnchor="middle" opacity="0.8">M-Endo</text>
        <text x="200" y="108" fill="hsl(160,70%,55%)" fontSize="6" textAnchor="middle" opacity="0.8">M-Ecto</text>
        <text x="108" y="205" fill="hsl(20,80%,60%)" fontSize="6" textAnchor="middle" opacity="0.8">E-Endo</text>
        <text x="192" y="205" fill="hsl(180,65%,55%)" fontSize="6" textAnchor="middle" opacity="0.8">E-Ecto</text>
        <text x="150" y="155" fill="hsl(0,0%,55%)" fontSize="6" textAnchor="middle" opacity="0.7">Central</text>

        {/* Point glow */}
        <circle cx={cx} cy={cy} r="14" fill="hsl(18,100%,50%)" opacity="0.12" />
        <circle cx={cx} cy={cy} r="7" fill="hsl(18,100%,50%)" opacity="0.25" />

        {/* Point */}
        <circle cx={cx} cy={cy} r="5" fill="hsl(18,100%,50%)" stroke="white" strokeWidth="1.5" />

        {/* Coords */}
        <text x={cx + 10} y={cy - 8} fill="hsl(18,100%,70%)" fontSize="9" fontWeight="bold">
          ({endo?.toFixed(1)}-{meso?.toFixed(1)}-{ecto?.toFixed(1)})
        </text>
      </svg>

      {/* Subsomatotype label */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground">Subsomatotipo: </span>
        <span className="text-sm font-semibold text-accent">{label}</span>
      </div>
    </div>
  );
}