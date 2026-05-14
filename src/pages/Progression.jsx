import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, BarChart2, Zap, CheckCircle2, AlertTriangle, RefreshCw, Target, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const METHODS = [
  { id: 'lineal', name: 'Periodización Lineal', icon: '📈', level: 'principiante', days: '2-3', desc: 'Progresión clásica semana a semana. Ideal para comenzar.', science: 'Zatsiorsky, 1995 / NSCA', weeks: 13, phases: [{ w: '1-4', label: 'Adaptación', sets: 3, reps: '15', pct: '60%', tempo: '2-0-2-0' }, { w: '5-8', label: 'Hipertrofia', sets: 4, reps: '10', pct: '70%', tempo: '3-1-2-0' }, { w: '9-12', label: 'Fuerza', sets: 5, reps: '6', pct: '80%', tempo: '4-1-1-0' }, { w: '13', label: 'Deload', sets: 3, reps: '8', pct: '50%', tempo: '2-0-2-0' }] },
  { id: 'dup', name: 'DUP — Ondulante Diaria', icon: '🔄', level: 'intermedio', days: '3', desc: 'Distintos estímulos cada día. Mayor adaptación neuromuscular.', science: 'Rhea et al., 2002', weeks: 12, phases: [{ w: 'Día Fuerza', label: 'Fuerza', sets: 4, reps: '4-6', pct: '85%', tempo: '3-0-1-0' }, { w: 'Día Hipert', label: 'Hipertrofia', sets: 4, reps: '8-12', pct: '70%', tempo: '3-1-2-0' }, { w: 'Día Resist', label: 'Resistencia', sets: 3, reps: '15-20', pct: '55%', tempo: '2-0-2-1' }] },
  { id: 'bloques', name: 'Bloques de Periodización', icon: '🧱', level: 'avanzado', days: '4-5', desc: 'Bloques de 3-4 semanas con objetivo específico por bloque.', science: 'Issurin, 2008 / Kiely, 2012', weeks: 9, phases: [{ w: 'Sem 1-3', label: 'Acumulación', sets: '4-6', reps: '12-15', pct: '60-65%', tempo: 'Super sets' }, { w: 'Sem 4-6', label: 'Intensificación', sets: '3-5', reps: '6-10', pct: '75-85%', tempo: 'Rest-pause' }, { w: 'Sem 7-8', label: 'Peak', sets: '3-4', reps: '4-6', pct: '85-90%', tempo: 'Negativas' }, { w: 'Sem 9', label: 'Deload', sets: 2, reps: '8', pct: '-50% vol', tempo: 'Normal' }] },
  { id: 'rir_rpe', name: 'RIR / RPE', icon: '🎯', level: 'intermedio', days: '3-4', desc: 'Basado en esfuerzo percibido. Alta adaptabilidad al estado diario.', science: 'Zourdos et al., 2016 / Helms et al., 2016', weeks: 10, phases: [{ w: 'Sem 1-2', label: 'RIR 4', sets: 4, reps: 'RIR 4', pct: '~70%', tempo: '3-0-2-0' }, { w: 'Sem 3-4', label: 'RIR 3', sets: 4, reps: 'RIR 3', pct: '~75%', tempo: '3-1-2-0' }, { w: 'Sem 5-6', label: 'RIR 2', sets: 4, reps: 'RIR 2', pct: '~80%', tempo: '3-1-2-0' }, { w: 'Sem 7-8', label: 'RIR 1', sets: 4, reps: 'RIR 1', pct: '~85%', tempo: '4-1-1-0' }, { w: 'Sem 9', label: 'RIR 0', sets: 4, reps: 'Al fallo', pct: '~90%', tempo: '3-1-2-0' }, { w: 'Sem 10', label: 'Deload', sets: 2, reps: 'RIR 5+', pct: '~50%', tempo: '2-0-2-0' }] },
  { id: 'alta_frecuencia', name: 'Alta Frecuencia', icon: '⚡', level: 'intermedio', days: '4', desc: 'Cada músculo 3-4x por semana con bajo volumen por sesión.', science: 'Colquhoun et al., 2018', weeks: 12, phases: [{ w: 'Frecuencia', label: '3-4x/semana', sets: '2-3', reps: '6-15', pct: '55-80%', tempo: 'Varía por sesión' }] },
  { id: 'mev_mav_mrv', name: 'RP Volume (MEV/MAV/MRV)', icon: '📊', level: 'avanzado', days: '5-6', desc: 'Progresión de volumen semanal desde mínimo hasta máximo recuperable.', science: 'Dr. Mike Israetel — Renaissance Periodization', weeks: 6, phases: [{ w: 'Sem 1', label: 'MEV', sets: 'mínimo', reps: '10-15', pct: '65%', tempo: '2-0-2-0' }, { w: 'Sem 2-3', label: 'MAV', sets: 'óptimo', reps: '8-12', pct: '70%', tempo: '3-1-2-0' }, { w: 'Sem 4-5', label: 'cerca MRV', sets: 'máximo', reps: '6-10', pct: '75%', tempo: '3-1-2-0' }, { w: 'Sem 6', label: 'Deload', sets: 'MEV', reps: '15', pct: '50%', tempo: '2-0-2-0' }] },
  { id: 'especializacion', name: 'Especialización Muscular', icon: '🎯', level: 'avanzado', days: '4-6', desc: 'Máximo volumen en un grupo muscular prioritario por 6-8 semanas.', science: 'Layne Norton / PHAT / PHUL', weeks: 8, phases: [{ w: 'Músculo prioritario', label: '20-24 series/sem', sets: '20-24', reps: '6-15', pct: '65-85%', tempo: 'Varía' }, { w: 'Resto muscular', label: 'Mantenimiento', sets: '8-10', reps: '8-12', pct: '65%', tempo: '2-0-2-0' }] },
];

const MEV_DATA = [
  { muscle: 'Pecho', mev: 8, mav_low: 12, mav_high: 20, mrv: 22 },
  { muscle: 'Espalda', mev: 10, mav_low: 14, mav_high: 22, mrv: 25 },
  { muscle: 'Hombros', mev: 8, mav_low: 16, mav_high: 22, mrv: 26 },
  { muscle: 'Bíceps', mev: 8, mav_low: 14, mav_high: 20, mrv: 26 },
  { muscle: 'Tríceps', mev: 6, mav_low: 10, mav_high: 14, mrv: 18 },
  { muscle: 'Cuádriceps', mev: 8, mav_low: 12, mav_high: 18, mrv: 20 },
  { muscle: 'Isquiotibiales', mev: 6, mav_low: 10, mav_high: 16, mrv: 20 },
  { muscle: 'Glúteos', mev: 4, mav_low: 8, mav_high: 16, mrv: 20 },
  { muscle: 'Pantorrillas', mev: 8, mav_low: 12, mav_high: 16, mrv: 20 },
  { muscle: 'Core', mev: 4, mav_low: 8, mav_high: 16, mrv: 20 },
];

const SPECIALIZATIONS = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos'];

export default function Progression() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('selector');
  const [answers, setAnswers] = useState({ days: null, objective: null, experience: null });
  const [recommendation, setRecommendation] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [specialization, setSpecialization] = useState('Pecho');
  const [currentWeek] = useState(1);

  const { data: plans = [] } = useQuery({
    queryKey: ['training-plans', user?.id],
    queryFn: () => base44.entities.TrainingPlan.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workout-logs', user?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ student_id: user?.id }, '-fecha', 100),
    enabled: !!user,
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingPlan.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training-plans'] }); toast.success('Plan creado'); setTab('mis-planes'); },
  });

  const getRecommendation = () => {
    const { days, objective, experience } = answers;
    if (!days || !objective || !experience) return;
    let method = 'lineal';
    if (experience === 'principiante') method = 'lineal';
    else if (experience === 'intermedio' && days === '3') method = objective === 'fuerza' ? 'dup' : 'rir_rpe';
    else if (experience === 'intermedio' && days === '4') method = 'alta_frecuencia';
    else if (experience === 'avanzado' && days === '4-5') method = 'bloques';
    else if (experience === 'avanzado' && days === '5-6') method = 'mev_mav_mrv';
    setRecommendation(method);
    setSelectedMethod(METHODS.find(m => m.id === method));
  };

  const createPlan = () => {
    if (!selectedMethod) return;
    createPlanMutation.mutate({
      user_id: user?.id,
      name: selectedMethod.name,
      method: selectedMethod.id,
      objective: answers.objective || 'hipertrofia',
      days_per_week: parseInt(answers.days) || 3,
      experience_level: answers.experience || 'intermedio',
      start_date: new Date().toISOString().split('T')[0],
      current_week: 1,
      total_weeks: selectedMethod.weeks,
      current_phase: selectedMethod.phases[0]?.label,
      specialization_muscle: selectedMethod.id === 'especializacion' ? specialization : null,
      is_active: true,
    });
  };

  // Progression suggestions based on workout logs
  const getProgressionSuggestions = () => {
    const suggestions = [];
    // Analyze workout trends
    const exerciseLogs = workouts.reduce((acc, w) => {
      const key = w.exercise_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(w);
      return acc;
    }, {});

    Object.entries(exerciseLogs).forEach(([name, logs]) => {
      if (logs.length >= 2) {
        const recent = logs.slice(0, 2);
        const allMax = recent.every(l => l.resultado_valor?.includes('12'));
        if (allMax) {
          suggestions.push({ type: 'weight', icon: '🔼', exercise: name, msg: `Completaste 12 reps en ${name} 2 sesiones seguidas. Intenta aumentar el peso.`, color: '#00C896' });
        }
      }
      if (logs.length >= 14) {
        suggestions.push({ type: 'deload', icon: '😴', exercise: name, msg: `Llevas varias semanas de carga continua. Considera una semana de Deload para recuperarte.`, color: '#FFB800' });
      }
    });

    if (suggestions.length === 0) {
      suggestions.push({ type: 'info', icon: '📊', exercise: null, msg: 'Completa más sesiones de entrenamiento para recibir sugerencias de progresión personalizadas.', color: '#666' });
    }
    return suggestions;
  };

  const suggestions = getProgressionSuggestions();

  const TABS = [
    { id: 'selector', label: '🧠 Elegir Método' },
    { id: 'progresion', label: '📈 Progresión' },
    { id: 'volumen', label: '📊 MEV/MAV/MRV' },
    { id: 'mis-planes', label: '📋 Mis Planes' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Planificación Científica</h1>
        <p className="text-muted-foreground text-sm">Motor de progresión y periodización basado en evidencia científica</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all" style={{ color: tab === t.id ? '#FF4D00' : '#666', borderBottom: tab === t.id ? '2px solid #FF4D00' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SELECTOR */}
      {tab === 'selector' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display font-bold text-lg text-white mb-5">¿Cuál es tu perfil?</h3>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">¿Cuántos días puedes entrenar?</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: '3', l: '2-3 días' }, { v: '4', l: '4 días' }, { v: '5-6', l: '5-6 días' }].map(o => (
                    <button key={o.v} onClick={() => setAnswers(a => ({ ...a, days: o.v }))} className="px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: answers.days === o.v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${answers.days === o.v ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`, color: answers.days === o.v ? '#FF4D00' : '#aaa' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">¿Cuál es tu objetivo principal?</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: 'hipertrofia', l: '💪 Hipertrofia' }, { v: 'fuerza', l: '🏋️ Fuerza' }, { v: 'ambos', l: '🔄 Ambos' }].map(o => (
                    <button key={o.v} onClick={() => setAnswers(a => ({ ...a, objective: o.v }))} className="px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: answers.objective === o.v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${answers.objective === o.v ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`, color: answers.objective === o.v ? '#FF4D00' : '#aaa' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">¿Cuánto tiempo llevas entrenando?</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: 'principiante', l: '< 1 año' }, { v: 'intermedio', l: '1-3 años' }, { v: 'avanzado', l: '3+ años' }].map(o => (
                    <button key={o.v} onClick={() => setAnswers(a => ({ ...a, experience: o.v }))} className="px-4 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: answers.experience === o.v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${answers.experience === o.v ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`, color: answers.experience === o.v ? '#FF4D00' : '#aaa' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={getRecommendation} disabled={!answers.days || !answers.objective || !answers.experience} className="bg-primary hover:bg-primary/90 gap-2">
                <Brain size={14} /> Obtener recomendación
              </Button>
            </div>
          </div>

          {recommendation && selectedMethod && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={{ background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.3)' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-primary" />
                <p className="text-sm font-semibold text-primary">Método recomendado para tu perfil</p>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-1">{selectedMethod.icon} {selectedMethod.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{selectedMethod.desc}</p>
              <p className="text-xs text-gray-600 mb-4">Base científica: {selectedMethod.science}</p>

              <div className="space-y-2 mb-5">
                {selectedMethod.phases.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs font-mono text-gray-500 w-20 flex-shrink-0">{p.w}</div>
                    <div className="flex-1">
                      <span className="text-sm text-white font-medium">{p.label}</span>
                      <span className="text-xs text-gray-500 ml-2">{p.sets} × {p.reps} · {p.pct}</span>
                    </div>
                    {p.tempo && <span className="text-xs font-mono text-primary">{p.tempo}</span>}
                  </div>
                ))}
              </div>

              {selectedMethod.id === 'especializacion' && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Músculo a especializar:</p>
                  <div className="flex gap-2 flex-wrap">
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} onClick={() => setSpecialization(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: specialization === s ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${specialization === s ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`, color: specialization === s ? '#FF4D00' : '#aaa' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={createPlan} disabled={createPlanMutation.isPending} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus size={14} /> Crear plan de {selectedMethod.weeks} semanas
              </Button>
            </motion.div>
          )}

          {/* All methods */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Todos los métodos disponibles</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {METHODS.map(m => (
                <div key={m.id} className="rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all" style={{ background: '#111', border: `1px solid ${selectedMethod?.id === m.id ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.06)'}` }} onClick={() => setSelectedMethod(m)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-2xl">{m.icon}</span>
                      <h4 className="font-display font-semibold text-white text-sm mt-1">{m.name}</h4>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="outline" className="text-[10px]">{m.level}</Badge>
                      <span className="text-[10px] text-gray-600">{m.days} días</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROGRESIÓN */}
      {tab === 'progresion' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Sugerencias de Progresión Automática
            </h3>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl p-4 flex items-start gap-3" style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    {s.exercise && <p className="text-xs font-semibold text-gray-400 mb-0.5">{s.exercise}</p>}
                    <p className="text-sm text-gray-200">{s.msg}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Traffic light per exercise */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" /> Estado por Ejercicio
            </h3>
            {workouts.length === 0 ? (
              <p className="text-sm text-gray-500">Sin sesiones registradas aún. Registra entrenamientos para ver el estado de progresión.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(workouts.reduce((acc, w) => { if (!acc[w.exercise_name]) acc[w.exercise_name] = 0; acc[w.exercise_name]++; return acc; }, {})).slice(0, 8).map(([name, count]) => {
                  const status = count >= 8 ? { color: '#00C896', icon: '🟢', label: 'Progresando' } : count >= 4 ? { color: '#FFB800', icon: '🟡', label: 'En seguimiento' } : { color: '#888', icon: '⚪', label: 'Pocas sesiones' };
                  return (
                    <div key={name} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span className="text-sm text-gray-200">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{count} sesiones</span>
                        <span className="text-xs font-medium" style={{ color: status.color }}>{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEV/MAV/MRV VOLUME */}
      {tab === 'volumen' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display font-semibold text-white mb-2">Rangos de Volumen Semanal (Renaissance Periodization)</h3>
            <p className="text-xs text-gray-500 mb-5">MEV = Mínimo Efectivo · MAV = Máximo Adaptativo · MRV = Máximo Recuperable</p>

            <div className="space-y-4">
              {MEV_DATA.map(({ muscle, mev, mav_low, mav_high, mrv }) => {
                const currentSeries = Math.round((mev + mav_low) / 2); // Mock current
                const pct = (currentSeries / mrv) * 100;
                const zone = currentSeries < mev ? 'bajo' : currentSeries > mrv ? 'exceso' : currentSeries >= mav_low ? 'optimo' : 'mev';
                const zoneColor = zone === 'optimo' ? '#00C896' : zone === 'bajo' ? '#888' : zone === 'exceso' ? '#FF4D00' : '#FFB800';

                return (
                  <div key={muscle}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-200">{muscle}</span>
                      <span className="text-xs" style={{ color: zoneColor }}>~{currentSeries} series/sem</span>
                    </div>
                    <div className="relative h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {/* MEV marker */}
                      <div className="absolute top-0 h-full w-0.5 bg-yellow-500/50" style={{ left: `${(mev / mrv) * 100}%` }} />
                      {/* MAV range */}
                      <div className="absolute top-0 h-full rounded-sm" style={{ left: `${(mav_low / mrv) * 100}%`, width: `${((mav_high - mav_low) / mrv) * 100}%`, background: 'rgba(0,200,150,0.15)' }} />
                      {/* Current fill */}
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: zoneColor, opacity: 0.7 }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                      <span>MEV: {mev}</span>
                      <span className="text-success">MAV: {mav_low}-{mav_high}</span>
                      <span className="text-destructive">MRV: {mrv}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MIS PLANES */}
      {tab === 'mis-planes' && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Target size={36} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Sin planes activos</p>
              <p className="text-gray-600 text-sm mt-1">Usa el selector de método para crear tu plan</p>
              <Button onClick={() => setTab('selector')} className="mt-4 bg-primary hover:bg-primary/90">Crear mi plan</Button>
            </div>
          ) : (
            plans.map(plan => {
              const method = METHODS.find(m => m.id === plan.method);
              const progress = ((plan.current_week || 1) / (plan.total_weeks || 12)) * 100;
              return (
                <div key={plan.id} className="rounded-2xl p-5" style={{ background: '#111', border: `1px solid ${plan.is_active ? 'rgba(255,77,0,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{method?.icon || '📋'}</span>
                        <h3 className="font-display font-bold text-white">{plan.name}</h3>
                        {plan.is_active && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Activo</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Semana {plan.current_week || 1} de {plan.total_weeks} · {plan.objective} · {plan.days_per_week} días/sem</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {plan.current_phase && <p className="text-xs text-gray-400">Fase actual: <span className="text-white">{plan.current_phase}</span></p>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}