import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Save, TrendingUp, MessageSquare, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const WHEEL_AREAS = [
  { name: 'Salud', emoji: '💪', color: '#FF4D00' },
  { name: 'Familia', emoji: '👨‍👩‍👧‍👦', color: '#FFB800' },
  { name: 'Trabajo', emoji: '💼', color: '#00C896' },
  { name: 'Finanzas', emoji: '💰', color: '#6C9EFF' },
  { name: 'Diversión', emoji: '🎮', color: '#9B6DFF' },
  { name: 'Relaciones', emoji: '❤️', color: '#FF6B9D' },
  { name: 'Desarrollo', emoji: '📚', color: '#4ECDC4' },
  { name: 'Espiritualidad', emoji: '🧘', color: '#FFD93D' },
];

export default function WheelEvaluator({ user }) {
  const queryClient = useQueryClient();
  const [expandedArea, setExpandedArea] = useState(null);
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [goals, setGoals] = useState({});
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: evaluations = [] } = useQuery({
    queryKey: ['wheel-evaluations'],
    queryFn: () => base44.entities.LifeWheelEvaluation.list('-fecha', 200),
  });

  const saveMutation = useMutation({
    mutationFn: async (area) => {
      const existingEval = evaluations.find(
        e => e.area === area && e.fecha === today && e.user_id === user?.id
      );

      const previousEval = evaluations.find(
        e => e.area === area && e.user_id === user?.id && e.fecha !== today
      );

      let progressText = '';
      if (previousEval) {
        const diff = ratings[area] - previousEval.rating;
        if (diff > 0) {
          progressText = `+${diff} puntos respecto a la última evaluación`;
        } else if (diff < 0) {
          progressText = `${diff} puntos respecto a la última evaluación`;
        } else {
          progressText = 'Sin cambios respecto a la última evaluación';
        }
      }

      const data = {
        user_id: user?.id,
        coach_id: user?.id,
        fecha: today,
        area,
        rating: ratings[area],
        notes: notes[area] || '',
        goals: goals[area] || '',
        progress: progressText,
      };

      if (existingEval) {
        return base44.entities.LifeWheelEvaluation.update(existingEval.id, data);
      } else {
        return base44.entities.LifeWheelEvaluation.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wheel-evaluations'] });
    },
  });

  useEffect(() => {
    const todayEvals = evaluations.filter(e => e.fecha === today && e.user_id === user?.id);
    const initialRatings = {};
    const initialNotes = {};
    const initialGoals = {};

    WHEEL_AREAS.forEach(area => {
      const areaEval = todayEvals.find(e => e.area === area.name);
      initialRatings[area.name] = areaEval?.rating || 5;
      initialNotes[area.name] = areaEval?.notes || '';
      initialGoals[area.name] = areaEval?.goals || '';
    });

    setRatings(initialRatings);
    setNotes(initialNotes);
    setGoals(initialGoals);
  }, [evaluations, user?.id]);

  const chartData = WHEEL_AREAS.map(area => ({
    subject: area.name,
    value: ratings[area.name] || 5,
    fullMark: 10,
  }));

  const avgRating = WHEEL_AREAS.length > 0
    ? (WHEEL_AREAS.reduce((sum, area) => sum + (ratings[area.name] || 5), 0) / WHEEL_AREAS.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.1), rgba(255,184,0,0.1))', border: '1px solid rgba(255,77,0,0.2)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Score promedio de la vida</p>
            <p className="text-5xl font-display font-black mt-2" style={{ color: '#FF4D00' }}>{avgRating}/10</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-2">Hoy: {format(new Date(), 'd \'de\' MMMM', { locale: es })}</p>
            <div className="grid grid-cols-4 gap-1">
              {WHEEL_AREAS.map(area => (
                <div key={area.name} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{area.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: area.color }}>
                    {ratings[area.name] || 5}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {WHEEL_AREAS.map(area => {
          const isExpanded = expandedArea === area.name;
          const todayEval = evaluations.find(
            e => e.area === area.name && e.fecha === today && e.user_id === user?.id
          );
          const isSaving = saveMutation.isPending && saveMutation.variables?.area === area.name;

          return (
            <motion.div
              key={area.name}
              layout
              className="rounded-xl overflow-hidden transition-all"
              style={{
                background: '#111',
                border: `1px solid ${isExpanded ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => setExpandedArea(isExpanded ? null : area.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{area.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{area.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(ratings[area.name] || 5) * 10}%`,
                            background: area.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: area.color, minWidth: '24px' }}>
                        {ratings[area.name] || 5}/10
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-500 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-4 space-y-4">
                      {/* Rating Slider */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">
                          Calificación: {ratings[area.name] || 5}/10
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={ratings[area.name] || 5}
                          onChange={e => setRatings(r => ({ ...r, [area.name]: parseInt(e.target.value) }))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-color"
                          style={{
                            accentColor: area.color,
                            background: `linear-gradient(to right, ${area.color}20, ${area.color}40)`,
                          }}
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>Muy bajo</span>
                          <span>Excelente</span>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2 flex items-center gap-1">
                          <MessageSquare size={13} /> Notas personales
                        </label>
                        <textarea
                          value={notes[area.name] || ''}
                          onChange={e => setNotes(n => ({ ...n, [area.name]: e.target.value }))}
                          placeholder="¿Cómo te sientes en esta área? ¿Qué observas?"
                          rows={2}
                          className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>

                      {/* Goals */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2 flex items-center gap-1">
                          <TrendingUp size={13} /> Objetivos para mejorar
                        </label>
                        <textarea
                          value={goals[area.name] || ''}
                          onChange={e => setGoals(g => ({ ...g, [area.name]: e.target.value }))}
                          placeholder="¿Qué acciones puedes tomar para mejorar en esta área?"
                          rows={2}
                          className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>

                      {/* Previous Progress */}
                      {todayEval?.progress && (
                        <div className="rounded-lg p-3" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)' }}>
                          <p className="text-xs text-gray-300">
                            <span style={{ color: '#00C896' }} className="font-semibold">Progreso: </span>
                            {todayEval.progress}
                          </p>
                        </div>
                      )}

                      {/* Save Button */}
                      <button
                        onClick={() => saveMutation.mutate(area.name)}
                        disabled={isSaving}
                        className="w-full py-2 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: area.color }}
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'Guardando...' : 'Guardar evaluación'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Historical Analysis */}
      <div className="rounded-xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-semibold text-white mb-4">📊 Análisis histórico</h3>
        <div className="space-y-3">
          {WHEEL_AREAS.map(area => {
            const areaEvals = evaluations
              .filter(e => e.area === area.name && e.user_id === user?.id)
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .slice(0, 5);

            if (areaEvals.length === 0) {
              return (
                <div key={area.name} className="text-xs text-gray-400 italic">
                  {area.name}: Sin evaluaciones previas
                </div>
              );
            }

            const trend = areaEvals.length > 1
              ? areaEvals[0].rating > areaEvals[areaEvals.length - 1].rating
                ? '📈 Mejorando'
                : areaEvals[0].rating < areaEvals[areaEvals.length - 1].rating
                ? '📉 Bajando'
                : '➡️ Estable'
              : '';

            return (
              <div key={area.name} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm flex items-center gap-2">
                    <span>{area.emoji}</span> {area.name}
                  </span>
                  <span className="text-xs" style={{ color: area.color }}>
                    {trend}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  {areaEvals.map((evaluation, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs">
                      <div
                        className="px-2 py-1 rounded"
                        style={{ background: `${area.color}30`, border: `1px solid ${area.color}50` }}
                      >
                        <span style={{ color: area.color }} className="font-bold">
                          {evaluation.rating}
                        </span>
                        <span className="text-gray-400 text-[10px] ml-1">
                          {format(new Date(evaluation.fecha), 'd/M')}
                        </span>
                      </div>
                      {idx < areaEvals.length - 1 && <span className="text-gray-500">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}