import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ClipboardList, Clock, Users, Trash2, Play, Pencil } from 'lucide-react';
import RoutineChecklist from '@/components/routines/RoutineChecklist';
import RoutineBuilder from '@/components/routines/RoutineBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const typeLabels = {
  fuerza: '🏋️ Fuerza', wod: '⚡ WOD', hibrido: '🔄 Híbrido', calistenia: '🤸 Calistenia',
  hiit: '🔥 HIIT', movilidad: '🧘 Movilidad', custom: '✏️ Custom', hipertrofia: '💪 Hipertrofia',
};

export default function Routines() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [activeRoutine, setActiveRoutine] = useState(null);

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines', user?.email],
    queryFn: () => base44.entities.Routine.filter({ coach_id: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Routine.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routines'] }); setShowBuilder(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Routine.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routines'] }); setEditingRoutine(null); setShowBuilder(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Routine.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const handleSave = (formData) => {
    if (editingRoutine?.id) {
      updateMutation.mutate({ id: editingRoutine.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, coach_id: user.email });
    }
  };

  const filtered = routines.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Rutinas</h1>
          <p className="text-muted-foreground text-sm">{routines.length} rutinas creadas</p>
        </div>
        <Button onClick={() => { setEditingRoutine(null); setShowBuilder(true); }} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nueva Rutina
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar rutina..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay rutinas creadas</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((routine, i) => (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card p-5 group hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{routine.name}</h3>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {typeLabels[routine.type] || routine.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground"
                      onClick={() => { setEditingRoutine(routine); setShowBuilder(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => deleteMutation.mutate(routine.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {routine.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{routine.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {routine.format && <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" /> {routine.format}</span>}
                  {routine.time_cap_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routine.time_cap_minutes} min</span>}
                  {routine.assigned_students?.length > 0 && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {routine.assigned_students.length}</span>
                  )}
                  {routine.is_benchmark && <Badge variant="outline" className="text-[10px] text-accent border-accent/30">Benchmark</Badge>}
                </div>
                <Button
                  size="sm"
                  className="mt-4 w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                  variant="ghost"
                  onClick={() => setActiveRoutine(routine)}
                >
                  <Play className="w-3.5 h-3.5" /> Iniciar Rutina
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {activeRoutine && (
        <RoutineChecklist
          routine={activeRoutine}
          student={{ id: user?.id, coach_id: user?.email, email: user?.email }}
          open={!!activeRoutine}
          onClose={() => setActiveRoutine(null)}
        />
      )}

      <RoutineBuilder
        open={showBuilder}
        onClose={() => { setShowBuilder(false); setEditingRoutine(null); }}
        routine={editingRoutine}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}