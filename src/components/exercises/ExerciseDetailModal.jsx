import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, AlertCircle, Dumbbell, Brain, Zap, ChevronRight } from 'lucide-react';
import MuscleBodySVG from './MuscleBodySVG';
import AddToRoutineModal from './AddToRoutineModal';
import { INTENSITY_TECHNIQUES, EQUIPMENT_TYPES, MUSCLE_GROUPS } from '@/lib/exerciseData';

const TABS = [
  { id: 'instrucciones', label: 'Instrucciones' },
  { id: 'musculos', label: 'Músculos' },
  { id: 'tecnica', label: 'Técnica' },
  { id: 'variantes', label: 'Variantes' },
  { id: 'errores', label: 'Errores' },
];

const TempoBar = ({ tempo }) => {
  if (!tempo) return null;
  const parts = tempo.split('-');
  const labels = ['↓ Excéntrica', '⏸ Pausa', '↑ Concéntrica', '⏸ Pausa'];
  const colors = ['#FF4D00', '#FFB800', '#00C896', '#888'];
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tempo: {tempo}</p>
      <div className="flex gap-1">
        {parts.map((val, i) => {
          const w = parseInt(val) || 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: w === 0 ? '10%' : '100%', background: colors[i], opacity: w === 0 ? 0.3 : 1 }}
                />
              </div>
              <span className="text-[9px] text-gray-400">{labels[i]}</span>
              <span className="text-xs font-bold" style={{ color: colors[i] }}>{val}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ExerciseDetailModal({ exercise, open, onOpenChange, relatedExercises = [] }) {
  const [tab, setTab] = useState('instrucciones');
  const [view, setView] = useState('anterior');
  const [highlightColor, setHighlightColor] = useState('#FF0000');
  const [showAddRoutine, setShowAddRoutine] = useState(false);

  if (!exercise) return null;

  const technique = INTENSITY_TECHNIQUES.find(t => t.value === exercise.intensity_technique);
  const equipmentLabel = EQUIPMENT_TYPES.find(e => e.value === exercise.equipment_type)?.label;
  const muscleGroupInfo = MUSCLE_GROUPS[exercise.muscle_group];
  const variants = relatedExercises.filter(e => e.muscle_group === exercise.muscle_group && e.id !== exercise.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Header */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-white">{exercise.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {exercise.level && (
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">{exercise.level}</Badge>
                  )}
                  {equipmentLabel && (
                    <Badge variant="secondary" className="text-[10px]">{equipmentLabel}</Badge>
                  )}
                  {muscleGroupInfo && (
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: muscleGroupInfo.color + '60', color: muscleGroupInfo.color }}>
                      {muscleGroupInfo.label}
                    </Badge>
                  )}
                  {exercise.environment && (
                    <Badge variant="secondary" className="text-[10px]">{exercise.environment === 'gym' ? '🏋️ Gym' : exercise.environment === 'casa' ? '🏠 Casa' : '🔄 Ambos'}</Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowAddRoutine(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1 flex-shrink-0"
              >
                <Plus size={14} /> Agregar a Rutina
              </Button>
            </div>

            {/* Quick stats */}
            {(exercise.sets_range || exercise.reps_range || exercise.tempo) && (
              <div className="flex gap-4 mt-4 text-xs">
                {exercise.sets_range && <span className="text-gray-400">📋 <span className="text-white">{exercise.sets_range} series</span></span>}
                {exercise.reps_range && <span className="text-gray-400">🔁 <span className="text-white">{exercise.reps_range} reps</span></span>}
                {exercise.tempo && <span className="text-gray-400">⏱ <span className="text-white">{exercise.tempo}</span></span>}
                {exercise.calories_per_minute && <span className="text-gray-400">🔥 <span className="text-white">{exercise.calories_per_minute} kcal/min</span></span>}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  color: tab === t.id ? '#FF4D00' : '#888',
                  borderBottom: tab === t.id ? '2px solid #FF4D00' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {/* INSTRUCCIONES */}
            {tab === 'instrucciones' && (
              <div className="space-y-4">
                {exercise.description && (
                  <p className="text-sm text-gray-400 leading-relaxed">{exercise.description}</p>
                )}
                {exercise.instructions_steps?.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Pasos de ejecución</p>
                    {exercise.instructions_steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin instrucciones detalladas. Agrega pasos en el formulario de edición.</p>
                )}
                {exercise.tips && (
                  <div className="rounded-xl p-4 mt-4" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }}>
                    <p className="text-xs font-semibold text-accent mb-1">💡 Tip del coach</p>
                    <p className="text-sm text-gray-300">{exercise.tips}</p>
                  </div>
                )}
              </div>
            )}

            {/* MÚSCULOS */}
            {tab === 'musculos' && (
              <div className="space-y-4">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    {['anterior', 'posterior'].map(v => (
                      <button key={v} onClick={() => setView(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: view === v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)', color: view === v ? '#FF4D00' : '#888', border: `1px solid ${view === v ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {['#FF0000', '#FFD700'].map(c => (
                      <button key={c} onClick={() => setHighlightColor(c)} className="w-6 h-6 rounded-full border-2 transition-all" style={{ background: c, borderColor: highlightColor === c ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <MuscleBodySVG
                    primaryMuscles={exercise.muscle_3d_map || []}
                    secondaryMuscles={exercise.secondary_muscles_3d || []}
                    highlightColor={highlightColor}
                    view={view}
                    size="md"
                  />
                  <div className="flex-1 space-y-3">
                    {exercise.primary_muscles?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: highlightColor }}>
                          ● Músculos principales
                        </p>
                        {exercise.primary_muscles.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: highlightColor }} />
                            <span className="text-sm text-gray-200">{m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {exercise.secondary_muscles?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-orange-400">○ Músculos secundarios</p>
                        {exercise.secondary_muscles.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm text-gray-400">{m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TÉCNICA */}
            {tab === 'tecnica' && (
              <div className="space-y-5">
                {exercise.tempo && <TempoBar tempo={exercise.tempo} />}

                {technique && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-primary" />
                      <p className="text-sm font-semibold text-white">{technique.label}</p>
                    </div>
                    <p className="text-sm text-gray-400">{technique.description}</p>
                  </div>
                )}

                {exercise.coaching_cues && (
                  <div>
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">Cues de coaching</p>
                    <p className="text-sm text-gray-400">{exercise.coaching_cues}</p>
                  </div>
                )}

                {!exercise.tempo && !technique && !exercise.coaching_cues && (
                  <p className="text-sm text-gray-500">Sin datos de técnica configurados.</p>
                )}
              </div>
            )}

            {/* VARIANTES */}
            {tab === 'variantes' && (
              <div className="space-y-3">
                {exercise.easier_variation && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)' }}>
                    <p className="text-xs text-success font-semibold mb-1">↓ Variante más fácil</p>
                    <p className="text-sm text-gray-300">{exercise.easier_variation}</p>
                  </div>
                )}
                {exercise.harder_variation && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)' }}>
                    <p className="text-xs text-primary font-semibold mb-1">↑ Variante más difícil</p>
                    <p className="text-sm text-gray-300">{exercise.harder_variation}</p>
                  </div>
                )}
                {variants.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">Otros ejercicios del mismo grupo</p>
                    <div className="space-y-2">
                      {variants.slice(0, 6).map(v => (
                        <div key={v.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div>
                            <p className="text-sm text-white">{v.name}</p>
                            <p className="text-xs text-gray-500">{EQUIPMENT_TYPES.find(e => e.value === v.equipment_type)?.label}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!exercise.easier_variation && !exercise.harder_variation && variants.length === 0 && (
                  <p className="text-sm text-gray-500">Sin variantes configuradas.</p>
                )}
              </div>
            )}

            {/* ERRORES */}
            {tab === 'errores' && (
              <div className="space-y-3">
                {exercise.common_mistakes_list?.length > 0 ? (
                  exercise.common_mistakes_list.map((err, i) => (
                    <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.15)' }}>
                      <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{err}</p>
                    </div>
                  ))
                ) : exercise.common_errors ? (
                  <p className="text-sm text-gray-300">{exercise.common_errors}</p>
                ) : (
                  <p className="text-sm text-gray-500">Sin errores comunes configurados.</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddToRoutineModal
        open={showAddRoutine}
        onOpenChange={setShowAddRoutine}
        exercise={exercise}
      />
    </>
  );
}