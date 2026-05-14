import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Dumbbell, TrendingUp, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExerciseFormDialog from '../components/exercises/ExerciseFormDialog';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import ProgressionDashboard from '../components/exercises/ProgressionDashboard';
import { EXERCISES_DB, MUSCLE_GROUPS, EQUIPMENT_TYPES, INTENSITY_TECHNIQUES } from '@/data/exerciseDatabase';
import ExerciseGifPreview from '../components/exercises/ExerciseGifPreview';

const TABS = [
  { id: 'biblioteca', label: '📚 Biblioteca', icon: Dumbbell },
  { id: 'progresion', label: '📈 Progresión', icon: TrendingUp },
];

const levelColors = {
  principiante: 'bg-success/15 text-success border-success/30',
  intermedio: 'bg-accent/15 text-accent border-accent/30',
  avanzado: 'bg-destructive/15 text-destructive border-destructive/30',
};

const equipmentIcon = {
  barra: '🏋️',
  mancuernas: '💪',
  maquina: '🔧',
  cable: '🔗',
  bandas: '🟡',
  peso_corporal: '🤸',
  kettlebell: '⚫',
  trx: '🪢',
  smith: '🔩',
  disco: '⭕',
};

export default function Exercises() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('biblioteca');
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterEnv, setFilterEnv] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editExercise, setEditExercise] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // DB exercises from local database
  const dbExercises = EXERCISES_DB;

  // User-created exercises from server
  const { data: userExercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list('-created_date', 300),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Exercise.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exercises'] }); setShowForm(false); setEditExercise(null); },
    onError: (err) => { console.error('Error creando ejercicio:', err); alert('Error al guardar: ' + (err?.message || 'Intenta de nuevo')); },
  });

  // Merge DB + user exercises
  const allExercises = useMemo(() => {
    const userEx = userExercises.map(e => ({ ...e, _source: 'user' }));
    const dbEx = dbExercises.map(e => ({ ...e, _source: 'db' }));
    return [...userEx, ...dbEx];
  }, [userExercises, dbExercises]);

  const filtered = useMemo(() => allExercises.filter(e => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
      (e.primary_muscles || []).some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchMuscle = filterMuscle === 'all' || e.muscle_group === filterMuscle ||
      (e.disciplines || []).includes(filterMuscle);
    const matchEquip = filterEquipment === 'all' || e.equipment === filterEquipment ||
      (e.equipment_type === filterEquipment);
    const matchLevel = filterLevel === 'all' || e.level === filterLevel;
    const matchEnv = filterEnv === 'all' || e.environment === filterEnv;
    return matchSearch && matchMuscle && matchEquip && matchLevel && matchEnv;
  }), [allExercises, search, filterMuscle, filterEquipment, filterLevel, filterEnv]);

  const hasActiveFilters = filterMuscle !== 'all' || filterEquipment !== 'all' || filterLevel !== 'all' || filterEnv !== 'all';

  const clearFilters = () => {
    setFilterMuscle('all'); setFilterEquipment('all');
    setFilterLevel('all'); setFilterEnv('all');
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Ejercicios</h1>
          <p className="text-muted-foreground text-sm">{allExercises.length} ejercicios en la biblioteca</p>
        </div>
        <Button onClick={() => { setEditExercise(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nuevo Ejercicio
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-border" style={{ background: '#0a0a0a' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'rgba(255,77,0,0.15)' : 'transparent',
              color: tab === t.id ? '#FF4D00' : '#666',
              border: tab === t.id ? '1px solid rgba(255,77,0,0.3)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BIBLIOTECA TAB */}
      {tab === 'biblioteca' && (
        <div className="space-y-4">
          {/* Search + filter row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o músculo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-border flex-shrink-0 relative ${hasActiveFilters ? 'border-primary/50 text-primary' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Grupo muscular</label>
                    <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                      <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(MUSCLE_GROUPS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Equipamiento</label>
                    <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                      <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todo</SelectItem>
                        {Object.entries(EQUIPMENT_TYPES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nivel</label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Entorno</label>
                    <Select value={filterEnv} onValueChange={setFilterEnv}>
                      <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="gym">Gym</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline">
                    <X size={10} /> Limpiar filtros
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats chips */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(MUSCLE_GROUPS).map(([k, v]) => {
              const count = allExercises.filter(e => e.muscle_group === k).length;
              if (count === 0) return null;
              return (
                <button
                  key={k}
                  onClick={() => setFilterMuscle(filterMuscle === k ? 'all' : k)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: filterMuscle === k ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filterMuscle === k ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    color: filterMuscle === k ? '#FF4D00' : '#666',
                  }}
                >
                  {v} <span style={{ color: filterMuscle === k ? '#FF4D00' : '#444' }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <p className="text-xs text-muted-foreground">{filtered.length} ejercicios mostrados</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.slice(0, 60).map((exercise, i) => (
                <motion.div
                  key={exercise.id || exercise.name + i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.6) }}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  {/* GIF / Video preview */}
                  <ExerciseGifPreview exercise={exercise} />
                  <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-sm leading-tight truncate">{exercise.name}</h3>
                      {exercise.alternate_name && (
                        <p className="text-[10px] text-muted-foreground truncate">{exercise.alternate_name}</p>
                      )}
                    </div>
                    {exercise.level && (
                      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${levelColors[exercise.level] || ''}`}>
                        {exercise.level}
                      </Badge>
                    )}
                  </div>

                  {/* Muscle */}
                  {(exercise.primary_muscles || []).length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 truncate">
                      💪 {exercise.primary_muscles.slice(0, 2).join(', ')}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exercise.muscle_group && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
                        {MUSCLE_GROUPS[exercise.muscle_group] || exercise.muscle_group}
                      </Badge>
                    )}
                    {exercise.tempo && (
                      <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent border-0">
                        ⏱ {exercise.tempo}
                      </Badge>
                    )}
                    {exercise.sets_range && (
                      <Badge variant="secondary" className="text-[10px]">
                        {exercise.sets_range}×{exercise.reps_range}
                      </Badge>
                    )}
                    {exercise._source === 'user' && (
                      <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                        Tuyo
                      </Badge>
                    )}
                  </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length > 60 && (
            <p className="text-center text-xs text-muted-foreground py-2">
              Mostrando 60 de {filtered.length}. Usá los filtros para refinar.
            </p>
          )}
        </div>
      )}

      {/* PROGRESSION TAB */}
      {tab === 'progresion' && (
        <ProgressionDashboard user={user} />
      )}

      {/* Exercise detail modal */}
      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Create form */}
      <ExerciseFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        exercise={editExercise}
        onSave={(data) => createMutation.mutate({ ...data, coach_id: user?.id })}
      />
    </div>
  );
}