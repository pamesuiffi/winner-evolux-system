import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Play, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ExerciseFormDialog from '@/components/exercises/ExerciseFormDialog';

export default function ExerciseLibrary() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const { data: exercises = [] } = useQuery({
    queryKey: ['user-exercises', user?.id],
    queryFn: () => base44.entities.Exercise.filter({ coach_id: user?.id }),
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const data = { ...formData, coach_id: user?.id };
      if (editingExercise?.id) {
        return base44.entities.Exercise.update(editingExercise.id, data);
      } else {
        return base44.entities.Exercise.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-exercises', user?.id] });
      setShowForm(false);
      setEditingExercise(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-exercises', user?.id] }),
  });

  const filteredExercises = exercises.filter(ex =>
    ex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (exercise = null) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleSave = (formData) => {
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Mi Biblioteca de Ejercicios</h1>
        <p className="text-muted-foreground text-sm">Crea y gestiona tu base de datos personal de ejercicios con videos</p>
      </div>

      {/* Search & Add */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ejercicios..."
            className="bg-secondary border-border pl-10"
          />
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Ejercicio
        </Button>
      </div>

      {/* Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-border/50 bg-secondary/20">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron ejercicios' : 'Aún no hay ejercicios. Crea el primero'}
          </p>
          {!searchTerm && (
            <Button onClick={() => handleOpenForm()} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Crear ejercicio
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all group"
              >
                {/* Video Preview */}
                <div className="relative h-40 bg-secondary overflow-hidden">
                  {exercise.video_url ? (
                    <>
                      <video
                        src={exercise.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-xs">Sin video</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{exercise.name}</h3>
                    {exercise.alternate_name && (
                      <p className="text-xs text-muted-foreground mt-1">{exercise.alternate_name}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_group && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">
                        {exercise.muscle_group}
                      </span>
                    )}
                    {exercise.equipment_type && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs capitalize">
                        {exercise.equipment_type}
                      </span>
                    )}
                    {exercise.level && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs capitalize">
                        {exercise.level}
                      </span>
                    )}
                  </div>

                  {exercise.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {exercise.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleOpenForm(exercise)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-all"
                    >
                      <Edit2 className="w-3 h-3 inline mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(exercise.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" /> Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <ExerciseFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        exercise={editingExercise}
        onSave={handleSave}
      />
    </div>
  );
}