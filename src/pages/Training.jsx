import { useState } from 'react';
import { Dumbbell, Plus, Target, TrendingUp, Clock, Zap, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const tooltipStyle = { background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' };

const volumeData = [
  { dia: 'Lun', vol: 4200 },
  { dia: 'Mar', vol: 3800 },
  { dia: 'Mié', vol: 5100 },
  { dia: 'Jue', vol: 0 },
  { dia: 'Vie', vol: 4600 },
  { dia: 'Sáb', vol: 6200 },
  { dia: 'Dom', vol: 0 },
];

const prData = [
  { mes: 'Feb', sentadilla: 100, banca: 80, muerto: 130 },
  { mes: 'Mar', sentadilla: 107, banca: 85, muerto: 140 },
  { mes: 'Abr', sentadilla: 115, banca: 90, muerto: 147 },
  { mes: 'May', sentadilla: 120, banca: 95, muerto: 155 },
];

const disciplines = [
  { id: 'musculacion', label: 'Musculación', icon: '🏋️' },
  { id: 'crossfit', label: 'CrossFit', icon: '⚡' },
  { id: 'calistenia', label: 'Calistenia', icon: '🤸' },
  { id: 'hiit', label: 'HIIT', icon: '🔥' },
  { id: 'movilidad', label: 'Movilidad', icon: '🧘' },
  { id: 'powerlifting', label: 'Powerlifting', icon: '💪' },
  { id: 'atletismo', label: 'Atletismo', icon: '🏃' },
  { id: 'kettlebell', label: 'Kettlebell', icon: '🎯' },
];

const recentLogs = [
  { exercise: 'Sentadilla Trasera', sets: 4, reps: '5×5', weight: '115 kg', date: 'Hoy', pr: false, modalidad: 'rx' },
  { exercise: 'Press Banca', sets: 4, reps: '4×6', weight: '90 kg', date: 'Hoy', pr: false, modalidad: 'rx' },
  { exercise: 'Peso Muerto', sets: 3, reps: '3×3', weight: '155 kg', date: 'Hoy', pr: true, modalidad: 'rx' },
  { exercise: 'Fran (21-15-9)', sets: 1, reps: '1 round', weight: '43 kg', date: 'Hace 2 días', pr: false, modalidad: 'scaled' },
];

export default function Training() {
  const [activeDiscipline, setActiveDiscipline] = useState('musculacion');
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">ENTRENAMIENTO</h1>
          <p className="text-gray-400 text-sm">Sistema universal de entrenamiento</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
          <Plus size={16} /> Registrar Sesión
        </button>
      </div>

      {/* Discipline Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {disciplines.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDiscipline(d.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all"
            style={{
              background: activeDiscipline === d.id ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeDiscipline === d.id ? '#FF4D00' : 'rgba(255,255,255,0.08)'}`,
              color: activeDiscipline === d.id ? '#FF4D00' : '#888'
            }}
          >
            <span>{d.icon}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: 'Sesiones esta semana', value: '4', color: '#FF4D00' },
          { icon: TrendingUp, label: 'Volumen total (kg)', value: '23.9k', color: '#FFB800' },
          { icon: Target, label: 'PRs esta semana', value: '2', color: '#00C896' },
          { icon: Clock, label: 'Tiempo total (hs)', value: '5.2', color: '#888' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon size={16} className="mb-2" style={{ color }} />
            <div className="font-bebas text-2xl text-white">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-lg text-white tracking-wider mb-4">VOLUMEN SEMANAL (kg)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volumeData}>
              <XAxis dataKey="dia" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${(v/1000).toFixed(1)}t`, 'Volumen']} />
              <Bar dataKey="vol" fill="#FF4D00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-lg text-white tracking-wider mb-4">PROGRESIÓN 1RM ESTIMADO (kg)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={prData}>
              <XAxis dataKey="mes" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="sentadilla" stroke="#FF4D00" strokeWidth={2} dot={false} name="Sentadilla" />
              <Line type="monotone" dataKey="banca" stroke="#FFB800" strokeWidth={2} dot={false} name="Banca" />
              <Line type="monotone" dataKey="muerto" stroke="#00C896" strokeWidth={2} dot={false} name="Peso Muerto" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[['#FF4D00', 'Sentadilla'], ['#FFB800', 'Banca'], ['#00C896', 'Peso Muerto']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: c }}></div>
                <span className="text-xs text-gray-400">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1RM Calculator */}
      <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,184,0,0.15)' }}>
        <h3 className="font-bebas text-lg text-white tracking-wider mb-4">⚡ CALCULADORA 1RM — FÓRMULA EPLEY</h3>
        <EpleyCalc />
      </div>

      {/* Recent Logs */}
      <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bebas text-xl text-white tracking-wider mb-4">REGISTROS RECIENTES</h3>
        <div className="space-y-3">
          {recentLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,77,0,0.1)' }}>
                  <Dumbbell size={16} style={{ color: '#FF4D00' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{log.exercise}</p>
                    {log.pr && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(255,184,0,0.2)', color: '#FFB800' }}>🏆 PR</span>}
                    <span className="text-xs px-1.5 py-0.5 rounded uppercase" style={{
                      background: log.modalidad === 'rx' ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.08)',
                      color: log.modalidad === 'rx' ? '#00C896' : '#888'
                    }}>{log.modalidad}</span>
                  </div>
                  <p className="text-xs text-gray-500">{log.sets} series · {log.reps} · {log.weight}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{log.date}</p>
                <ChevronRight size={14} className="text-gray-600 ml-auto mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calistenia Skill Tree */}
      <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bebas text-xl text-white tracking-wider mb-4">🤸 ÁRBOL DE HABILIDADES — CALISTENIA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { skill: 'Dominadas', levels: ['Colgado pasivo', 'Negativas', 'Asistidas', 'Dominadas', 'Archer', 'Muscle-up'], current: 3 },
            { skill: 'Core', levels: ['Plancha', 'L-sit', 'Dragon Flag', 'Front Lever', 'Back Lever'], current: 2 },
          ].map(({ skill, levels, current }) => (
            <div key={skill}>
              <p className="text-sm font-semibold text-white mb-2">{skill}</p>
              <div className="flex gap-1.5 flex-wrap">
                {levels.map((level, i) => (
                  <div key={i} className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: i < current ? 'rgba(0,200,150,0.2)' : i === current ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
                      color: i < current ? '#00C896' : i === current ? '#FF4D00' : '#444',
                      border: `1px solid ${i < current ? 'rgba(0,200,150,0.3)' : i === current ? 'rgba(255,77,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {i < current ? '✓ ' : i === current ? '→ ' : ''}{level}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EpleyCalc() {
  const [peso, setPeso] = useState('');
  const [reps, setReps] = useState('');
  const rm = peso && reps ? (parseFloat(peso) * (1 + parseFloat(reps) / 30)).toFixed(1) : null;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Peso levantado (kg)</label>
        <input type="number" value={peso} onChange={e => setPeso(e.target.value)}
          placeholder="100"
          className="w-28 rounded-lg px-3 py-2 text-sm text-white outline-none"
          style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Repeticiones</label>
        <input type="number" value={reps} onChange={e => setReps(e.target.value)}
          placeholder="5"
          className="w-28 rounded-lg px-3 py-2 text-sm text-white outline-none"
          style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>
      {rm && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)' }}>
          <span className="text-gray-400 text-sm">1RM estimado:</span>
          <span className="font-bebas text-2xl" style={{ color: '#FFB800' }}>{rm} kg</span>
        </div>
      )}
    </div>
  );
}