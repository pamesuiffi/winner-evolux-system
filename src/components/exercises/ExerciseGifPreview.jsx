import { Play } from 'lucide-react';

const MUSCLE_COLORS = {
  pecho:        { from: '#1a0800', to: '#2d1000', accent: '#ff4d00' },
  espalda:      { from: '#001a0d', to: '#002d1a', accent: '#00c896' },
  hombros:      { from: '#0d0d1a', to: '#1a1a2d', accent: '#6655ff' },
  biceps:       { from: '#1a0a00', to: '#2d1500', accent: '#ff8800' },
  triceps:      { from: '#1a0010', to: '#2d0020', accent: '#ff0066' },
  cuadriceps:   { from: '#001a1a', to: '#002d2d', accent: '#00c8c8' },
  gluteos:      { from: '#1a0d00', to: '#2d1a00', accent: '#ffaa00' },
  pantorrillas: { from: '#001a00', to: '#002d00', accent: '#00ee44' },
  core:         { from: '#1a1a00', to: '#2d2d00', accent: '#eeee00' },
  antebrazos:   { from: '#0a0a1a', to: '#1a1a2d', accent: '#aaaaff' },
};

export default function ExerciseGifPreview({ exercise }) {
  const colors = MUSCLE_COLORS[exercise.muscle_group] || MUSCLE_COLORS.pecho;

  if (exercise.video_url) {
    return (
      <div className="relative w-full h-36 bg-black overflow-hidden">
        <video
          src={exercise.video_url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
      </div>
    );
  }

  // Placeholder limpio — sin video aún
  return (
    <div
      className="relative w-full h-36 flex flex-col items-center justify-center overflow-hidden gap-2"
      style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center border"
        style={{ borderColor: colors.accent + '55', background: colors.accent + '15' }}
      >
        <Play size={16} style={{ color: colors.accent }} className="ml-0.5" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40" style={{ color: colors.accent }}>
        Sin video
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}