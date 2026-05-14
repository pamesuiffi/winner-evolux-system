import { useState, useEffect } from 'react';
import { MUSCLE_SVG_MAP } from '@/lib/exerciseData';

// Visualizador 2D anatómico del cuerpo humano con músculos resaltados
export default function MuscleBodySVG({
  primaryMuscles = [],
  secondaryMuscles = [],
  highlightColor = '#FF0000',
  view = 'anterior', // anterior | posterior
  interactive = false,
  onMuscleClick,
  selectedMuscles = [],
  size = 'md', // sm | md | lg
}) {
  const [hovered, setHovered] = useState(null);

  const sizes = { sm: { w: 140, h: 320 }, md: { w: 200, h: 460 }, lg: { w: 260, h: 600 } };
  const { w, h } = sizes[size] || sizes.md;
  const scale = w / 320;

  const getColor = (muscleKey) => {
    if (selectedMuscles.includes(muscleKey)) return highlightColor;
    if (primaryMuscles.includes(muscleKey)) return highlightColor;
    if (secondaryMuscles.includes(muscleKey)) return '#FF6B00';
    if (hovered === muscleKey) return 'rgba(255,255,255,0.4)';
    return 'rgba(150,150,150,0.25)';
  };

  const getOpacity = (muscleKey) => {
    if (selectedMuscles.includes(muscleKey) || primaryMuscles.includes(muscleKey)) return 0.85;
    if (secondaryMuscles.includes(muscleKey)) return 0.6;
    if (hovered === muscleKey) return 0.5;
    return 0.3;
  };

  const visibleMuscles = Object.entries(MUSCLE_SVG_MAP).filter(([, m]) => m.view === view);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 320 ${h / scale}`}
        className="overflow-visible"
      >
        {/* Body silhouette */}
        <ellipse cx="160" cy="100" rx="38" ry="42" fill="rgba(100,100,100,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" /> {/* Head */}
        <rect x="125" y="140" width="70" height="10" rx="5" fill="rgba(100,100,100,0.3)" /> {/* Neck */}
        <rect x="90" y="150" width="140" height="155" rx="15" fill="rgba(80,80,80,0.25)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" /> {/* Torso */}
        {/* Arms */}
        <rect x="65" y="155" width="30" height="120" rx="12" fill="rgba(80,80,80,0.2)" />
        <rect x="225" y="155" width="30" height="120" rx="12" fill="rgba(80,80,80,0.2)" />
        {/* Forearms */}
        <rect x="67" y="272" width="26" height="90" rx="10" fill="rgba(80,80,80,0.15)" />
        <rect x="227" y="272" width="26" height="90" rx="10" fill="rgba(80,80,80,0.15)" />
        {/* Legs */}
        <rect x="110" y="305" width="48" height="160" rx="15" fill="rgba(80,80,80,0.2)" />
        <rect x="162" y="305" width="48" height="160" rx="15" fill="rgba(80,80,80,0.2)" />
        {/* Lower legs */}
        <rect x="113" y="462" width="42" height="100" rx="12" fill="rgba(80,80,80,0.15)" />
        <rect x="165" y="462" width="42" height="100" rx="12" fill="rgba(80,80,80,0.15)" />

        {/* Muscle overlays */}
        {visibleMuscles.map(([key, m]) => {
          const color = getColor(key);
          const opacity = getOpacity(key);
          const isPrimary = primaryMuscles.includes(key) || selectedMuscles.includes(key);

          const renderEllipse = (cx, cy, extraKey) => (
            <ellipse
              key={extraKey || key}
              cx={cx} cy={cy} rx={m.rx} ry={m.ry}
              fill={color}
              fillOpacity={opacity}
              stroke={isPrimary ? color : 'transparent'}
              strokeWidth={isPrimary ? 1.5 : 0}
              style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.3s' }}
              onMouseEnter={() => interactive && setHovered(key)}
              onMouseLeave={() => interactive && setHovered(null)}
              onClick={() => interactive && onMuscleClick?.(key, m.label)}
            />
          );

          return (
            <>
              {renderEllipse(m.cx, m.cy)}
              {m.right && renderEllipse(m.right.cx, m.right.cy, `${key}_right`)}
            </>
          );
        })}

        {/* Hover tooltip */}
        {hovered && MUSCLE_SVG_MAP[hovered] && (
          <text
            x="160" y={h / scale - 10}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontFamily="sans-serif"
          >
            {MUSCLE_SVG_MAP[hovered]?.label}
          </text>
        )}
      </svg>

      {/* Pulsing animation for primary */}
      <style>{`
        @keyframes musclePulse {
          0%, 100% { fill-opacity: 0.85; }
          50% { fill-opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}