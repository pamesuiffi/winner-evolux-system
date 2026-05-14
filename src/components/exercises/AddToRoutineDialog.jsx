import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Plus, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AddToRoutineDialog({ exercise, user, onClose }) {
  const queryClient = useQueryClient();
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [sets, setSets] = useState(exercise.sets_range?.split('-')[0] || '3');
  const [reps, setReps] = useState(exercise.reps_range || '10-12');
  const [rest, setRest] = useState('90');
  const [done, setDone] = useState(false);

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines', user?.email],
    queryFn: () => base44.entities.Routine.filter({ coach_id: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (routineId) => {
      const routine = routines.find(r => r.id === routineId);
      if (!routine) throw new Error('Rutina no encontrada');

      // Build enriched exercise entry
      const exerciseEntry = {
        exercise_id: exercise.id || exercise.name,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: exercise.secondary_muscles,
        equipment: exercise.equipment,
        tempo: exercise.tempo || '2-0-2-0',
        intensity_technique: exercise.intensity_technique || 'normal',
        sets: parseInt(sets),
        reps: reps,
        rest_seconds: parseInt(rest),
        difficulty: exercise.level || exercise.difficulty,
        notes: '',
      };

      // Append to existing exercises_json
      let existingExercises = [];
      if (routine.exercises_json) {
        try {
          existingExercises = JSON.parse(routine.exercises_json);
        } catch {}
      }
      existingExercises.push(exerciseEntry);

      await base44.entities.Routine.update(routineId, {
        exercises_json: JSON.stringify(existingExercises),
      });

      return routineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      setDone(true);
      toast.success('Ejercicio agregado a la rutina');
      setTimeout(onClose, 1500);
    },
    onError: () => toast.error('Error al agregar el ejercicio'),
  });

  const handleAdd = () => {
    if (!selectedRoutineId) return;
    addMutation.mutate(selectedRoutineId);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-display font-bold">Agregar a Rutina</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{exercise.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 size={40} className="text-success" />
              <p className="font-medium text-success">¡Agregado correctamente!</p>
            </div>
          ) : (
            <>
              {/* Params */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Series</label>
                  <Input value={sets} onChange={e => setSets(e.target.value)} className="bg-secondary border-border text-center" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Reps</label>
                  <Input value={reps} onChange={e => setReps(e.target.value)} className="bg-secondary border-border text-center" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Descanso (s)</label>
                  <Input value={rest} onChange={e => setRest(e.target.value)} className="bg-secondary border-border text-center" />
                </div>
              </div>

              {/* Routine selector */}
              <div>
                <p className="text-sm font-medium mb-2">Seleccionar rutina:</p>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  </div>
                ) : routines.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <ClipboardList size={28} className="mx-auto mb-2" />
                    <p className="text-sm">No tenés rutinas creadas</p>
                    <p className="text-xs">Creá una rutina primero en la sección Rutinas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {routines.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRoutineId(r.id)}
                        className="w-full p-3 rounded-xl border text-left transition-all"
                        style={{
                          background: selectedRoutineId === r.id ? 'rgba(255,77,0,0.1)' : 'rgba(255,255,255,0.03)',
                          borderColor: selectedRoutineId === r.id ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!done && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <Button
              onClick={handleAdd}
              disabled={!selectedRoutineId || addMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              {addMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Agregando...</>
              ) : (
                <><Plus size={14} /> Confirmar</>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}