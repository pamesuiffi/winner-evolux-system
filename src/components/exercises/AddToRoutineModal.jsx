import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddToRoutineModal({ open, onOpenChange, exercise }) {
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [sets, setSets] = useState(exercise?.sets_range?.split('-')[0] || '3');
  const [reps, setReps] = useState(exercise?.reps_range || '10-12');
  const [rest, setRest] = useState('90');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines-for-exercise'],
    queryFn: () => base44.entities.Routine.list('-created_date', 50),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoutineId) throw new Error('Selecciona una rutina');
      const routine = routines.find(r => r.id === selectedRoutineId);
      if (!routine) throw new Error('Rutina no encontrada');

      // Parse existing exercises_json
      let existingExercises = [];
      if (routine.exercises_json) {
        try { existingExercises = JSON.parse(routine.exercises_json); } catch {}
      }

      const newExerciseEntry = {
        exercise_id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment_type,
        tempo: exercise.tempo || '2-0-2-0',
        intensity_technique: exercise.intensity_technique || 'normal',
        sets: parseInt(sets),
        reps: reps,
        rest_seconds: parseInt(rest),
        difficulty: exercise.level,
        primary_muscles: exercise.primary_muscles || [],
        secondary_muscles: exercise.secondary_muscles || [],
        muscle_3d_map: exercise.muscle_3d_map || [],
        notes: '',
        order: existingExercises.length,
      };

      await base44.entities.Routine.update(selectedRoutineId, {
        exercises_json: JSON.stringify([...existingExercises, newExerciseEntry]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      setSaved(true);
      toast.success(`${exercise.name} agregado a la rutina`);
      setTimeout(() => { setSaved(false); onOpenChange(false); }, 1500);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}>
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" />
            Agregar a Rutina
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)' }}>
            <p className="text-sm font-semibold text-white">{exercise?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{exercise?.muscle_group} · {exercise?.equipment_type}</p>
          </div>

          <div>
            <Label className="text-xs text-gray-300">Seleccionar rutina</Label>
            {isLoading ? (
              <div className="h-10 rounded-lg bg-secondary animate-pulse mt-1" />
            ) : routines.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No tienes rutinas creadas. Crea una primero en la sección Rutinas.</p>
            ) : (
              <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                <SelectTrigger className="bg-secondary border-border mt-1">
                  <SelectValue placeholder="Elegir rutina..." />
                </SelectTrigger>
                <SelectContent>
                  {routines.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="flex items-center gap-2">
                        <ClipboardList size={12} className="text-primary" />
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-300">Series</Label>
              <Input value={sets} onChange={e => setSets(e.target.value)} className="bg-secondary border-border mt-1" placeholder="3" />
            </div>
            <div>
              <Label className="text-xs text-gray-300">Reps</Label>
              <Input value={reps} onChange={e => setReps(e.target.value)} className="bg-secondary border-border mt-1" placeholder="10-12" />
            </div>
            <div>
              <Label className="text-xs text-gray-300">Descanso (seg)</Label>
              <Input value={rest} onChange={e => setRest(e.target.value)} className="bg-secondary border-border mt-1" placeholder="90" />
            </div>
          </div>

          {exercise?.tempo && (
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>⏱ Tempo heredado:</span>
              <span className="text-white font-mono">{exercise.tempo}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!selectedRoutineId || addMutation.isPending || saved}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            {saved ? <Check size={14} /> : addMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saved ? 'Agregado' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}