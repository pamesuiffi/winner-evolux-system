import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Moon, Zap, Target, BarChart3, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MUSCLE_GROUPS, PERIODIZATION_METHODS } from '@/data/exerciseDatabase';

const ALERTS = [
  {
    type: 'increase',
    icon: TrendingUp,
    color: '#00C896',
    title: '¡Listo para subir peso!',
    desc: 'Completaste 12 reps en todas las series de Press Banca 2 sesiones seguidas.',
    suggestion: 'Siguiente sesión: probá con +2.5 kg',
    exercise: 'Press de banca plano',
  },
  {
    type: 'tempo',
    icon: Zap,
    color: '#FFB800',
    title: 'Cambio de tempo sugerido',
    desc: 'Llevas 3 semanas con tempo 2-0-2-0 en Curl Bíceps sin cambios.',
    suggestion: 'Probá 3-0-2-0 para mayor tensión mecánica',
    exercise: 'Curl de bíceps con barra',
  },
  {
    type: 'plateau',
    icon: AlertTriangle,
    color: '#FF4D00',
    title: 'Meseta detectada',
    desc: 'Semana 4 sin cambios en Sentadilla.',
    suggestion: 'Sugerimos agregar Rest-Pause esta semana',
    exercise: 'Sentadilla libre con barra',
  },
  {
    type: 'deload',
    icon: Moon,
    color: '#888',
    title: 'Semana de Deload recomendada',
    desc: 'Llevas 5 semanas de carga continua.',
    suggestion: 'Reducí volumen 40-50%, mantené la intensidad',
    exercise: null,
  },
];

const SEMAFORO = [
  { name: 'Press Banca', status: 'green', label: 'Progresando', note: '+2.5 kg pendiente' },
  { name: 'Sentadilla', status: 'yellow', label: 'Meseta', note: 'Sugerencia activa' },
  { name: 'Peso Muerto', status: 'green', label: 'Progresando', note: '+5 kg en 2 sem' },
  { name: 'Curl Bíceps', status: 'yellow', label: 'Cambio de tempo', note: '3 sem sin cambios' },
  { name: 'Press Militar', status: 'red', label: 'Regresión', note: 'Revisar recuperación' },
];

const STATUS_COLORS = { green: '#00C896', yellow: '#FFB800', red: '#FF4444' };

const mockVolumeData = [
  { week: 'S1', pecho: 12, espalda: 14, piernas: 16 },
  { week: 'S2', pecho: 14, espalda: 16, piernas: 18 },
  { week: 'S3', pecho: 16, espalda: 18, piernas: 20 },
  { week: 'S4', pecho: 18, espalda: 20, piernas: 22 },
  { week: 'S5', pecho: 20, espalda: 22, piernas: 18 },
  { week: 'S6', pecho: 16, espalda: 18, piernas: 14 },
];

export default function ProgressionDashboard({ user }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [quizStep, setQuizStep] = useState('days'); // days | goal | level | result
  const [quiz, setQuiz] = useState({ days: null, goal: null, level: null });

  const getRecommendedMethod = () => {
    const { days, goal, level } = quiz;
    if (!days || !goal || !level) return null;
    if (level === 'principiante') return PERIODIZATION_METHODS.find(m => m.id === 'linear');
    if (level === 'intermedio' && days === '3') return PERIODIZATION_METHODS.find(m => m.id === 'dup');
    if (level === 'intermedio' && days === '4') return PERIODIZATION_METHODS.find(m => m.id === 'high_frequency');
    if (level === 'avanzado' && (days === '4' || days === '5')) return PERIODIZATION_METHODS.find(m => m.id === 'block');
    if (level === 'avanzado' && days === '6') return PERIODIZATION_METHODS.find(m => m.id === 'volume_mev_mav');
    if (goal === 'especialización') return PERIODIZATION_METHODS.find(m => m.id === 'specialization');
    return PERIODIZATION_METHODS.find(m => m.id === 'rir_rpe');
  };

  const recommended = getRecommendedMethod();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <div>
        <h3 className="font-display font-bold mb-3">🔔 Alertas de Progresión</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {ALERTS.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-4 rounded-xl border"
                style={{ background: '#111', borderColor: `${alert.color}25` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${alert.color}15` }}>
                    <Icon size={14} style={{ color: alert.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                    <p className="text-xs mt-1.5 font-medium" style={{ color: alert.color }}>→ {alert.suggestion}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Semáforo */}
      <div>
        <h3 className="font-display font-bold mb-3">🚦 Estado por Ejercicio</h3>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {SEMAFORO.map((ex, i) => (
            <div key={i} className={`px-5 py-3 flex items-center justify-between ${i < SEMAFORO.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[ex.status] }} />
                <p className="text-sm font-medium">{ex.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold" style={{ color: STATUS_COLORS[ex.status] }}>{ex.label}</p>
                <p className="text-[10px] text-muted-foreground">{ex.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volume chart */}
      <div>
        <h3 className="font-display font-bold mb-3">📊 Volumen Semanal por Músculo</h3>
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockVolumeData}>
              <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }} itemStyle={{ color: '#aaa' }} />
              <Line type="monotone" dataKey="pecho" stroke="#FF4D00" strokeWidth={2} dot={false} name="Pecho" />
              <Line type="monotone" dataKey="espalda" stroke="#FFB800" strokeWidth={2} dot={false} name="Espalda" />
              <Line type="monotone" dataKey="piernas" stroke="#00C896" strokeWidth={2} dot={false} name="Piernas" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            {[['Pecho', '#FF4D00'], ['Espalda', '#FFB800'], ['Piernas', '#00C896']].map(([name, color]) => (
              <div key={name} className="flex items-center gap-1">
                <span className="w-3 h-0.5 rounded-full" style={{ background: color }} />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Method selector quiz */}
      <div>
        <h3 className="font-display font-bold mb-3">🎯 Selector de Método de Periodización</h3>
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Days */}
          <div>
            <p className="text-sm font-medium mb-2">¿Cuántos días podés entrenar?</p>
            <div className="flex gap-2">
              {[['3', '2-3 días'], ['4', '4 días'], ['6', '5-6 días']].map(([val, label]) => (
                <button key={val} onClick={() => setQuiz(q => ({ ...q, days: val }))}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: quiz.days === val ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${quiz.days === val ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: quiz.days === val ? '#FF4D00' : '#888',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Goal */}
          <div>
            <p className="text-sm font-medium mb-2">¿Cuál es tu objetivo?</p>
            <div className="flex gap-2">
              {[['hipertrofia', 'Hipertrofia'], ['fuerza', 'Fuerza'], ['ambos', 'Ambos']].map(([val, label]) => (
                <button key={val} onClick={() => setQuiz(q => ({ ...q, goal: val }))}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: quiz.goal === val ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${quiz.goal === val ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: quiz.goal === val ? '#FF4D00' : '#888',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Level */}
          <div>
            <p className="text-sm font-medium mb-2">¿Cuánto tiempo llevas entrenando?</p>
            <div className="flex gap-2">
              {[['principiante', '< 1 año'], ['intermedio', '1-3 años'], ['avanzado', '3+ años']].map(([val, label]) => (
                <button key={val} onClick={() => setQuiz(q => ({ ...q, level: val }))}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: quiz.level === val ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${quiz.level === val ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: quiz.level === val ? '#FF4D00' : '#888',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {recommended && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)' }}>
              <p className="text-xs text-primary font-semibold mb-1">✅ Método recomendado para tu perfil:</p>
              <p className="font-display font-bold text-lg">{recommended.icon} {recommended.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{recommended.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">Ref: {recommended.ref}</p>
              <button onClick={() => setSelectedMethod(recommended)}
                className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                Ver plan completo <ChevronRight size={12} />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* All methods */}
      <div>
        <h3 className="font-display font-bold mb-3">📚 Todos los Métodos Científicos</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {PERIODIZATION_METHODS.map((method, i) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMethod(method)}
              className="p-4 rounded-xl border text-left hover:border-primary/40 transition-all"
              style={{ background: '#111', borderColor: selectedMethod?.id === method.id ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.06)' }}
            >
              <p className="text-2xl mb-1">{method.icon}</p>
              <p className="font-display font-semibold text-sm">{method.name}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{method.description}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{method.ref}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Method detail */}
      {selectedMethod && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.2)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl mb-1">{selectedMethod.icon}</p>
              <h3 className="font-display font-bold text-lg">{selectedMethod.name}</h3>
              <p className="text-xs text-muted-foreground italic">{selectedMethod.ref}</p>
            </div>
            <button onClick={() => setSelectedMethod(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs">×</span>
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{selectedMethod.description}</p>

          {selectedMethod.phases && (
            <div>
              <p className="text-xs font-semibold text-primary mb-2">FASES DEL PROGRAMA:</p>
              <div className="space-y-2">
                {selectedMethod.phases.map((phase, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{phase.name}</p>
                      {phase.weeks && <p className="text-xs text-muted-foreground">Semana {phase.weeks}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {phase.sets && <span>📦 {phase.sets} series</span>}
                      {phase.reps && <span>🔄 {phase.reps} reps</span>}
                      {phase.intensity && <span>💪 {phase.intensity}</span>}
                      {phase.tempo && <span>⏱ Tempo {phase.tempo}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMethod.volume_table && (
            <div>
              <p className="text-xs font-semibold text-primary mb-2">RANGOS DE VOLUMEN (series/semana):</p>
              <div className="rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <th className="text-left px-3 py-2 text-muted-foreground">Músculo</th>
                      <th className="text-center px-3 py-2 text-muted-foreground">MEV</th>
                      <th className="text-center px-3 py-2 text-muted-foreground">MAV</th>
                      <th className="text-center px-3 py-2 text-muted-foreground">MRV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedMethod.volume_table).map(([muscle, vol], i) => (
                      <tr key={muscle} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td className="px-3 py-2 capitalize">{muscle}</td>
                        <td className="px-3 py-2 text-center text-success">{vol.mev}</td>
                        <td className="px-3 py-2 text-center text-accent">{vol.mav[0]}-{vol.mav[1]}</td>
                        <td className="px-3 py-2 text-center text-destructive">{vol.mrv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}