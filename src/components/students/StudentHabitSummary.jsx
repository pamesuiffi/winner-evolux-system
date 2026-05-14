import { Heart, Moon, Zap, Brain } from 'lucide-react';

const metrics = [
  { key: 'energia', icon: Zap, label: 'Energía', color: '#FFB800' },
  { key: 'animo', icon: Heart, label: 'Ánimo', color: '#FF4D00' },
  { key: 'calidad_sueno', icon: Moon, label: 'Sueño', color: '#00C896' },
  { key: 'estres', icon: Brain, label: 'Estrés', color: '#6366f1', invert: true },
];

export default function StudentHabitSummary({ habits = [] }) {
  const today = habits[0];

  const avg = (key) => {
    if (!habits.length) return 0;
    return Math.round(habits.reduce((a, h) => a + (h[key] || 0), 0) / habits.length);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary" /> Bienestar Semanal
        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">últimos 7 días</span>
      </h3>
      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin registros de hábitos esta semana</p>
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map(m => {
            const val = avg(m.key);
            const display = m.invert ? 10 - val : val;
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                    {m.label}
                  </div>
                  <span className="text-xs font-bold" style={{ color: m.color }}>{display}/10</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${display * 10}%`, background: m.color }}
                  />
                </div>
              </div>
            );
          })}
          {today?.notas && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
              "{today.notas}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}