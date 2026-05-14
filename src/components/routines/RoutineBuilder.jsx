import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Dumbbell, GripVertical, ChevronDown, ChevronUp,
  Check, Layers, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const typeLabels = {
  fuerza: '🏋️ Fuerza', wod: '⚡ WOD', hibrido: '🔄 Híbrido', calistenia: '🤸 Calistenia',
  hiit: '🔥 HIIT', movilidad: '🧘 Movilidad', custom: '✏️ Custom', hipertrofia: '💪 Hipertrofia',
};

const muscleLabels = {
  pecho: 'Pecho', espalda: 'Espalda', hombros: 'Hombros', biceps: 'Bíceps',
  triceps: 'Tríceps', cuadriceps: 'Cuádriceps', gluteos: 'Glúteos',
  pantorrillas: 'Pantorrillas', core: 'Core', antebrazos: 'Antebrazos',
};

// Construct exercise entry for the routine
function makeExerciseEntry(ex) {
  return {
    exercise_id: ex.id,
    name: ex.name,
    muscle_group: ex.muscle_group || '',
    metric_type: ex.metric_type || 'weight_reps',
    sets: 3,
    reps: '10',
    weight: '',
    rest_seconds: 90,
    notes: '',
  };
}

export default function RoutineBuilder({ open, onClose, routine, onSave, isSaving }) {
  // Form state
  const [meta, setMeta] = useState({
    name: routine?.name || '',
    type: routine?.type || 'fuerza',
    format: routine?.format || '',
    time_cap_minutes: routine?.time_cap_minutes || '',
    description: routine?.description || '',
  });

  const [selectedExercises, setSelectedExercises] = useState(() => {
    try { return JSON.parse(routine?.exercises_json || '[]'); } catch { return []; }
  });

  const [showPicker, setShowPicker] = useState(false);
  const [exSearch, setExSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Fetch exercise library
  const { data: dbExercises = [] } = useQuery({
    queryKey: ['exercises-library'],
    queryFn: () => base44.entities.Exercise.list('-created_date', 200),
  });

  const filteredLibrary = useMemo(() => {
    return dbExercises.filter(ex => {
      const matchSearch = ex.name?.toLowerCase().includes(exSearch.toLowerCase());
      const matchMuscle = filterMuscle === 'all' || ex.muscle_group === filterMuscle;
      return matchSearch && matchMuscle;
    });
  }, [dbExercises, exSearch, filterMuscle]);

  const addExercise = (ex) => {
    setSelectedExercises(prev => [...prev, makeExerciseEntry(ex)]);
    setShowPicker(false);
    setExSearch('');
  };

  const removeExercise = (idx) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const updateExField = (idx, field, val) => {
    setSelectedExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, [field]: val } : ex));
  };

  // Volume preview per exercise (sets × reps × weight)
  const calcVolPreview = (ex) => {
    const w = parseFloat(ex.weight) || 0;
    const r = parseFloat(ex.reps) || 0;
    const s = parseInt(ex.sets) || 0;
    return w > 0 ? (w * r * s).toLocaleString('es-AR') + ' kg·rep' : null;
  };

  const handleSave = () => {
    onSave({ ...meta, exercises_json: JSON.stringify(selectedExercises) });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 border-b border-border flex-shrink-0">
            <DialogTitle className="font-display text-lg">
              {routine?.id ? 'Editar Rutina' : 'Nueva Rutina'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Meta section */}
            <div className="p-5 border-b border-border space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Nombre</Label>
                  <Input value={meta.name} onChange={e => setMeta({ ...meta, name: e.target.value })}
                    placeholder="Ej: Push Day A" className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={meta.type} onValueChange={v => setMeta({ ...meta, type: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato</Label>
                  <Input value={meta.format} onChange={e => setMeta({ ...meta, format: e.target.value })}
                    placeholder="AMRAP, FOR TIME..." className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label>Time Cap (min)</Label>
                  <Input type="number" value={meta.time_cap_minutes} onChange={e => setMeta({ ...meta, time_cap_minutes: e.target.value })}
                    className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input value={meta.description} onChange={e => setMeta({ ...meta, description: e.target.value })}
                    placeholder="Opcional..." className="bg-secondary border-border mt-1" />
                </div>
              </div>
            </div>

            {/* Exercises section */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm">
                  Ejercicios <span className="text-muted-foreground font-normal">({selectedExercises.length})</span>
                </h3>
                <Button size="sm" variant="outline" onClick={() => setShowPicker(true)} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <Plus className="w-3.5 h-3.5" /> Agregar ejercicio
                </Button>
              </div>

              {selectedExercises.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin ejercicios. Agregá desde la biblioteca.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedExercises.map((ex, idx) => {
                    const isOpen = expandedIdx === idx;
                    const vol = calcVolPreview(ex);
                    return (
                      <div key={idx} className="rounded-xl border border-border overflow-hidden">
                        {/* Exercise header */}
                        <div className="flex items-center gap-2 p-3 bg-secondary/20">
                          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <button
                            className="flex-1 text-left flex items-center gap-3"
                            onClick={() => setExpandedIdx(isOpen ? null : idx)}
                          >
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Dumbbell size={13} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{ex.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {ex.sets} series × {ex.reps} reps
                                {ex.weight && ` · ${ex.weight} kg`}
                                {vol && <span className="ml-1 text-accent">· {vol}</span>}
                              </p>
                            </div>
                          </button>
                          <button onClick={() => setExpandedIdx(isOpen ? null : idx)} className="text-muted-foreground p-1">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button onClick={() => removeExercise(idx)} className="text-destructive p-1">
                            <X size={14} />
                          </button>
                        </div>

                        {/* Exercise config */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden border-t border-border"
                            >
                              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">Series</label>
                                  <input
                                    type="number" min="1" max="20"
                                    value={ex.sets}
                                    onChange={e => updateExField(idx, 'sets', parseInt(e.target.value) || 1)}
                                    className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">Reps</label>
                                  <input
                                    type="text"
                                    value={ex.reps}
                                    onChange={e => updateExField(idx, 'reps', e.target.value)}
                                    placeholder="10 / 8-12"
                                    className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">Peso (kg)</label>
                                  <input
                                    type="number"
                                    value={ex.weight}
                                    onChange={e => updateExField(idx, 'weight', e.target.value)}
                                    placeholder="—"
                                    className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">Descanso (seg)</label>
                                  <input
                                    type="number"
                                    value={ex.rest_seconds}
                                    onChange={e => updateExField(idx, 'rest_seconds', parseInt(e.target.value) || 0)}
                                    className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-4">
                                  <label className="text-[10px] text-muted-foreground block mb-1">Notas / técnica</label>
                                  <input
                                    type="text"
                                    value={ex.notes}
                                    onChange={e => updateExField(idx, 'notes', e.target.value)}
                                    placeholder="Ej: tempo 3-1-1, RPE 8..."
                                    className="h-8 w-full rounded-md bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                {/* Volume preview */}
                                {vol && (
                                  <div className="col-span-2 sm:col-span-4 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 flex items-center gap-2">
                                    <Layers size={13} className="text-accent" />
                                    <span className="text-xs text-accent font-semibold">Volumen planificado: {vol}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !meta.name} className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : routine?.id ? 'Guardar cambios' : 'Crear rutina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker Modal */}
      <Dialog open={showPicker} onOpenChange={() => { setShowPicker(false); setExSearch(''); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border flex-shrink-0">
            <DialogTitle className="font-display">Biblioteca de Ejercicios</DialogTitle>
          </DialogHeader>

          {/* Search + filter */}
          <div className="p-4 space-y-2 flex-shrink-0 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejercicio..."
                value={exSearch}
                onChange={e => setExSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
                autoFocus
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterMuscle('all')}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border transition-colors ${filterMuscle === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                Todos
              </button>
              {Object.entries(muscleLabels).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFilterMuscle(filterMuscle === k ? 'all' : k)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border transition-colors ${filterMuscle === k ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredLibrary.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Sin resultados</div>
            ) : (
              filteredLibrary.map(ex => {
                const alreadyAdded = selectedExercises.some(s => s.exercise_id === ex.id || s.name === ex.name);
                return (
                  <button
                    key={ex.id}
                    onClick={() => !alreadyAdded && addExercise(ex)}
                    disabled={alreadyAdded}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      alreadyAdded
                        ? 'border-success/30 bg-success/5 opacity-60 cursor-default'
                        : 'border-border hover:border-primary/40 hover:bg-secondary/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {alreadyAdded ? <Check size={14} className="text-success" /> : <Dumbbell size={14} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ex.name}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {ex.muscle_group && (
                          <Badge variant="secondary" className="text-[9px] py-0 px-1.5">{muscleLabels[ex.muscle_group] || ex.muscle_group}</Badge>
                        )}
                        {ex.equipment && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5">{ex.equipment}</Badge>
                        )}
                        {ex.level && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5">{ex.level}</Badge>
                        )}
                      </div>
                    </div>
                    {!alreadyAdded && (
                      <Plus size={16} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}