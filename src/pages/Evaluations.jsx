import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, BarChart3, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EvaluationFormDialog from '../components/evaluations/EvaluationFormDialog';
import EvaluationDetail from '../components/evaluations/EvaluationDetail';

export default function Evaluations() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [viewEval, setViewEval] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => base44.entities.Student.filter({ coach_id: user?.id }),
    enabled: !!user,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations', user?.id],
    queryFn: () => base44.entities.Evaluation.filter({ coach_id: user?.id }, '-fecha'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evaluation.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evaluations'] }); setShowForm(false); },
  });

  const filtered = selectedStudent === 'all' 
    ? evaluations 
    : evaluations.filter(e => e.student_id === selectedStudent);

  const getStudentName = (id) => students.find(s => s.id === id)?.full_name || 'Desconocido';

  if (viewEval) {
    return <EvaluationDetail evaluation={viewEval} studentName={getStudentName(viewEval.student_id)} onBack={() => setViewEval(null)} />;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Evaluaciones ISAK</h1>
          <p className="text-muted-foreground text-sm">Antropometría y composición corporal</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nueva Evaluación
        </Button>
      </div>

      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
        <SelectTrigger className="w-full sm:w-64 bg-card border-border">
          <User className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Filtrar por alumno" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los alumnos</SelectItem>
          {students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay evaluaciones registradas</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setViewEval(ev)}
              className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold">{getStudentName(ev.student_id)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ev.fecha ? format(new Date(ev.fecha), 'd MMM yyyy', { locale: es }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-secondary/50 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">Peso</p>
                  <p className="text-sm font-bold">{ev.peso || '—'} kg</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">% Grasa</p>
                  <p className="text-sm font-bold text-primary">{ev.grasa_pct ? ev.grasa_pct.toFixed(1) : '—'}%</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">IMC</p>
                  <p className="text-sm font-bold">{ev.imc ? ev.imc.toFixed(1) : '—'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EvaluationFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        students={students}
        onSave={(data) => createMutation.mutate({ ...data, coach_id: user?.id })}
      />
    </div>
  );
}