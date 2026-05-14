import { useState } from 'react';
import { Plus, Clock, Users, Zap, Star } from 'lucide-react';

const SAMPLE_WODS = [
  {
    id: '1', name: 'FRAN', format: 'for_time', time_cap_minutes: 10, is_benchmark: true, is_hero: false,
    description: 'Benchmark WOD clásico de CrossFit',
    movements_rx: ['21-15-9 Thrusters (43kg H / 29kg M)', '21-15-9 Pull-ups'],
    movements_scaled: ['21-15-9 Thrusters (29kg H / 20kg M)', '21-15-9 Ring Rows'],
    movements_beginner: ['21-15-9 Goblet Squats (14kg)', '21-15-9 Jumping Pull-ups'],
    warm_up: '10 min movilidad de cadera y hombros. 3 rondas: 10 push-ups, 10 air squats, 5 pull-ups asistidas',
    skill_strength: 'Thruster técnico 5×3 @75% del peso del WOD. Foco: codo alto en rack, drive de cadera',
    cool_down: 'Elongación de cuádriceps, pectorales y dorsales. Foam rolling de espalda baja',
    results: [
      { athlete: 'Miguel Torres', time: '4:32', modalidad: 'rx' },
      { athlete: 'Laura García', time: '6:15', modalidad: 'scaled' },
    ]
  },
  {
    id: '2', name: 'MURPH', format: 'for_time', time_cap_minutes: 60, is_benchmark: true, is_hero: true,
    description: '⭐ Hero WOD en honor a Lt. Michael Murphy',
    movements_rx: ['1 Mile Run', '100 Pull-ups', '200 Push-ups', '300 Air Squats', '1 Mile Run', '(con chaleco 9kg opcional)'],
    movements_scaled: ['800m Run', '50 Pull-ups asistidas', '100 Push-ups de rodillas', '150 Air Squats', '800m Run'],
    movements_beginner: ['400m Walk', '50 Ring Rows', '100 Push-ups de pared', '150 Sit-ups', '400m Walk'],
    warm_up: '15 min movilidad dinámica completa. Activación de escapulares y cadera',
    skill_strength: 'Estrategia de partición: 20 rondas de 5 pull-ups + 10 push-ups + 15 squats',
    cool_down: '15 min de estiramiento total. Mucho foam rolling',
    results: [
      { athlete: 'Miguel Torres', time: '42:18', modalidad: 'rx' },
    ]
  },
  {
    id: '3', name: 'CINDY', format: 'amrap', time_cap_minutes: 20, is_benchmark: true, is_hero: false,
    description: 'AMRAP 20 min — Girl WOD',
    movements_rx: ['5 Pull-ups', '10 Push-ups', '15 Air Squats'],
    movements_scaled: ['5 Ring Rows', '10 Push-ups de rodillas', '15 Air Squats'],
    movements_beginner: ['5 Jumping Pull-ups', '10 Box Push-ups', '15 Air Squats'],
    warm_up: '8 min movilidad de hombros y tobillos',
    skill_strength: 'Foco en kipping pull-up y butterfly si hay nivel',
    cool_down: 'Elongación de dorsales, pectorales y cuádriceps',
    results: [
      { athlete: 'Laura García', time: '18 rondas', modalidad: 'rx' },
      { athlete: 'Ana Rodríguez', time: '14 rondas', modalidad: 'scaled' },
    ]
  },
];

const FORMAT_LABELS = {
  amrap: { label: 'AMRAP', color: '#FF4D00' },
  for_time: { label: 'FOR TIME', color: '#FFB800' },
  emom: { label: 'EMOM', color: '#00C896' },
  tabata: { label: 'TABATA', color: '#888' },
  chipper: { label: 'CHIPPER', color: '#FF4D00' },
};

export default function WODs() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = SAMPLE_WODS.filter(w => {
    if (filter === 'benchmark') return w.is_benchmark;
    if (filter === 'hero') return w.is_hero;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">WODs</h1>
          <p className="text-gray-400 text-sm">Workouts of the Day — CrossFit Box</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
          <Plus size={16} /> Crear WOD
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['all', 'Todos'], ['benchmark', '🏆 Benchmarks'], ['hero', '⭐ Heroes']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: filter === id ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', color: filter === id ? '#FF4D00' : '#888', border: `1px solid ${filter === id ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
            {label}
          </button>
        ))}
      </div>

      {/* WOD Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(wod => {
          const fmt = FORMAT_LABELS[wod.format] || { label: wod.format?.toUpperCase(), color: '#888' };
          return (
            <div key={wod.id} onClick={() => setSelected(wod)}
              className="card-hover cursor-pointer rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bebas text-2xl text-white">{wod.name}</h3>
                    {wod.is_hero && <Star size={16} fill="#FFB800" style={{ color: '#FFB800' }} />}
                    {wod.is_benchmark && !wod.is_hero && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>BENCHMARK</span>}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: `${fmt.color}20`, color: fmt.color }}>{fmt.label}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} /> {wod.time_cap_minutes} min
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-3">{wod.description}</p>

              <div className="space-y-1">
                {wod.movements_rx?.slice(0, 3).map((m, i) => (
                  <p key={i} className="text-xs text-gray-300">• {m}</p>
                ))}
                {wod.movements_rx?.length > 3 && <p className="text-xs text-gray-500">+{wod.movements_rx.length - 3} más...</p>}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Users size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">{wod.results?.length || 0} resultados registrados</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* WOD Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="max-w-2xl mx-auto my-8 rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.3)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bebas text-4xl text-white">{selected.name}</h2>
                  {selected.is_hero && <Star size={20} fill="#FFB800" style={{ color: '#FFB800' }} />}
                </div>
                <p className="text-gray-400 text-sm">{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Structure */}
            {[
              { label: '🔥 WARM UP', content: selected.warm_up, color: 'rgba(255,77,0,0.1)' },
              { label: '⚡ SKILL / STRENGTH', content: selected.skill_strength, color: 'rgba(255,184,0,0.1)' },
              { label: '🎯 COOL DOWN', content: selected.cool_down, color: 'rgba(0,200,150,0.1)' },
            ].map(({ label, content, color }) => content && (
              <div key={label} className="rounded-xl p-3 mb-3" style={{ background: color }}>
                <p className="font-bebas text-sm tracking-widest text-gray-300 mb-1">{label}</p>
                <p className="text-xs text-gray-400">{content}</p>
              </div>
            ))}

            {/* WOD versions */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'RX', movements: selected.movements_rx, color: '#00C896' },
                { label: 'SCALED', movements: selected.movements_scaled, color: '#FFB800' },
                { label: 'BEGINNER', movements: selected.movements_beginner, color: '#888' },
              ].map(({ label, movements, color }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30` }}>
                  <p className="font-bebas text-sm mb-2" style={{ color }}>{label}</p>
                  {movements?.map((m, i) => <p key={i} className="text-xs text-gray-300 mb-0.5">• {m}</p>)}
                </div>
              ))}
            </div>

            {/* Results */}
            {selected.results?.length > 0 && (
              <div>
                <h4 className="font-bebas text-lg text-white tracking-wider mb-2">RESULTADOS</h4>
                {selected.results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg mb-1"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-sm text-white">{r.athlete}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded uppercase" style={{ background: r.modalidad === 'rx' ? 'rgba(0,200,150,0.2)' : 'rgba(255,255,255,0.08)', color: r.modalidad === 'rx' ? '#00C896' : '#888' }}>{r.modalidad}</span>
                      <span className="font-bebas text-lg" style={{ color: '#FF4D00' }}>{r.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-4 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
              Registrar Mi Resultado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}