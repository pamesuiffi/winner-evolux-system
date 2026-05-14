import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Trophy, Dumbbell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EXERCISES_DB } from '@/data/exerciseDatabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const today = format(new Date(), 'yyyy-MM-dd');

export default function WorkoutLogger({ student }) {
  const queryClient = useQueryClient();
  const [searchEx, setSearchEx] = useState('');
  const [selectedEx, setSelectedEx] = useState(null);
  const [sets, setSets] = useState([{ reps: '', weight: '', rir: '' }]);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);

  const { data: logs = [] } = useQuery({
    queryKey: ['workout-logs', student?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ student_id: student?.id }, '-fecha', 50),
    enabled: !!student?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validSets = sets.filter(s => s.reps || s.weight);
      if (!selectedEx || validSets.length === 0) return;

      // Detect PR
      const prevLogs = logs.filter(l => l.exercise_name === selectedEx.name);
      const prevMaxWeight = Math.max(0, ...prevLogs.map(l => {
        try { return Math.max(...JSON.parse(l.sets_data || '[]').map(s => parseFloat(s.weight) || 0)); } catch { return 0; }
      }));
      const thisMaxWeight = Math.max(...validSets.map(s => parseFloat(s.weight) || 0));
      const isPR = thisMaxWeight > prevMaxWeight && prevMaxWeight > 0;

      return base44.entities.WorkoutLog.create({
        student_id: student.id,
        coach_id: student.coach_id,
        fecha: today,
        exercise_name: selectedEx.name,
        metric_type: selectedEx.metric_type || 'weight_reps',
        sets_data: JSON.stringify(validSets),
        notas_alumno: notes,
        is_pr: isPR,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs', student?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-logs', student?.id] });
      setSelectedEx(null);
      setSets([{ reps: '', weight: '', rir: '' }]);
      setNotes('');
      setSearchEx('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkoutLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout-logs', student?.id] }),
  });

  const filteredExercises = searchEx.length > 1
    ? [...EXERCISES_DB, ...[]].filter(e => e.name.toLowerCase().includes(searchEx.toLowerCase())).slice(0, 8)
    : [];

  const addSet = () => setSets(prev => [...prev, { reps: '', weight: '', rir: '' }]);
  const removeSet = (i) => setSets(prev => prev.filter((_, idx) => idx !== i));
  const updateSet = (i, field, val) => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const todayLogs = logs.filter(l => l.fecha === today);
  const pastLogs = logs.filter(l => l.fecha !== today);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" /> Registrar Cargas
        </h3>
        <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE d MMM", { locale: es })}</span>
      </div>

      {/* Buscador de ejercicio */}
      {!selectedEx ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicio..."
            value={searchEx}
            onChange={e => setSearchEx(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
          <AnimatePresence>
            {filteredExercises.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-10 top-full mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden"
              >
                {filteredExercises.map(ex => (
                  <button
                    key={ex.id || ex.name}
                    onClick={() => { setSelectedEx(ex); setSearchEx(''); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                  >
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">{ex.muscle_group} · {ex.equipment}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Ejercicio seleccionado */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30">
            <div>
              <p className="font-semibold text-sm">{selectedEx.name}</p>
              <p className="text-xs text-muted-foreground">{selectedEx.muscle_group} · {selectedEx.sets_range} series × {selectedEx.reps_range} reps</p>
            </div>
            <button onClick={() => setSelectedEx(null)} className="text-xs text-muted-foreground hover:text-foreground underline">cambiar</button>
          </div>

          {/* Tabla de series */}
          <div>
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-muted-foreground px-1">
              <span>Serie</span><span>Peso (kg)</span><span>Reps</span><span>RIR</span>
            </div>
            <div className="space-y-2">
              {sets.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <span className="text-sm font-bold text-primary text-center">{i + 1}</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={s.weight}
                    onChange={e => updateSet(i, 'weight', e.target.value)}
                    className="bg-secondary border-border h-9 text-center"
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={s.reps}
                    onChange={e => updateSet(i, 'reps', e.target.value)}
                    className="bg-secondary border-border h-9 text-center"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="—"
                      value={s.rir}
                      onChange={e => updateSet(i, 'rir', e.target.value)}
                      className="bg-secondary border-border h-9 text-center"
                    />
                    {sets.length > 1 && (
                      <button onClick={() => removeSet(i)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addSet} className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline">
              <Plus size={11} /> Agregar serie
            </button>
          </div>

          <Input
            placeholder="Notas (sensaciones, RPE, etc...)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="bg-secondary border-border"
          />

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <CheckCircle size={16} />
            {saveMutation.isPending ? 'Guardando...' : 'Guardar Ejercicio'}
          </Button>
        </motion.div>
      )}

      {/* Sesión de hoy */}
      {todayLogs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">HOY</p>
          <div className="space-y-2">
            {todayLogs.map(log => {
              const setsData = (() => { try { return JSON.parse(log.sets_data || '[]'); } catch { return []; } })();
              const maxWeight = Math.max(0, ...setsData.map(s => parseFloat(s.weight) || 0));
              return (
                <div key={log.id} className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{log.exercise_name}</p>
                      {log.is_pr && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">🏆 PR</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{setsData.length} series · max {maxWeight}kg</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(log.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {pastLogs.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Historial ({pastLogs.length} registros)
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 space-y-1.5"
              >
                {pastLogs.slice(0, 20).map(log => {
                  const setsData = (() => { try { return JSON.parse(log.sets_data || '[]'); } catch { return []; } })();
                  const maxWeight = Math.max(0, ...setsData.map(s => parseFloat(s.weight) || 0));
                  const isExpanded = expandedLog === log.id;
                  return (
                    <div key={log.id} className="rounded-xl border border-border overflow-hidden">
                      <button
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
                      >
                        <div>
                          <span className="text-sm font-medium">{log.exercise_name}</span>
                          {log.is_pr && <span className="ml-2 text-[10px] text-accent">🏆 PR</span>}
                          <p className="text-xs text-muted-foreground">{log.fecha} · {setsData.length} series · max {maxWeight}kg</p>
                        </div>
                        {isExpanded ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
                      </button>
                      {isExpanded && setsData.length > 0 && (
                        <div className="px-3 pb-3">
                          <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground mb-1 px-1">
                            <span>Serie</span><span>Peso</span><span>Reps</span>
                          </div>
                          {setsData.map((s, i) => (
                            <div key={i} className="grid grid-cols-3 gap-1 text-xs px-1 py-0.5">
                              <span className="text-primary font-bold">{i + 1}</span>
                              <span>{s.weight || '—'}kg</span>
                              <span>{s.reps || '—'} reps</span>
                            </div>
                          ))}
                          {log.notas_alumno && <p className="text-xs text-muted-foreground mt-2 italic">"{log.notas_alumno}"</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}