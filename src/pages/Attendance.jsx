import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Clock, Users, Calendar, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoLabels = {
  clase_grupal: '👥 Clase Grupal',
  open_gym: '🏋️ Open Gym',
  competencia: '🏆 Competencia',
  otro: '📌 Otro',
};

const feelingEmoji = ['', '😩', '😕', '😐', '😊', '🔥'];

export default function Attendance() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'clase_grupal',
    hora_entrada: format(new Date(), 'HH:mm'),
    feeling: '',
    notas_del_coach: '',
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.email],
    queryFn: () => base44.entities.Student.filter({ coach_id: user?.email, status: 'activo' }),
    enabled: !!user,
  });

  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ['attendances', user?.email],
    queryFn: () => base44.entities.Attendance.filter({ coach_id: user?.email }, '-fecha', 50),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Attendance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setShowForm(false);
      setForm({ student_id: '', fecha: today, tipo: 'clase_grupal', hora_entrada: format(new Date(), 'HH:mm'), feeling: '', notas_del_coach: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Attendance.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendances'] }),
  });

  const todayAttendances = attendances.filter(a => a.fecha === today);
  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

  const filtered = attendances.filter(a => {
    const st = studentMap[a.student_id];
    return st?.full_name?.toLowerCase().includes(search.toLowerCase()) || a.fecha.includes(search);
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Asistencia</h1>
          <p className="text-muted-foreground text-sm">
            Hoy: <span className="text-foreground font-semibold">{todayAttendances.length}</span> check-ins
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Registrar Asistencia
        </Button>
      </div>

      {/* Today summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Hoy — {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        {todayAttendances.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay asistencias registradas hoy</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {todayAttendances.map(a => {
              const st = studentMap[a.student_id];
              return (
                <div key={a.id} className="flex items-center gap-1.5 bg-card rounded-lg px-3 py-1.5 border border-border text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>{st?.full_name || 'Alumno'}</span>
                  {a.feeling && <span>{feelingEmoji[a.feeling]}</span>}
                  <span className="text-xs text-muted-foreground">{a.hora_entrada}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por alumno o fecha..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      {/* Attendance list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-border bg-secondary/30 text-xs text-muted-foreground font-medium">
            <span>Alumno</span>
            <span>Tipo</span>
            <span>Hora</span>
            <span>Feeling</span>
            <span></span>
          </div>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay asistencias registradas</p>
              </div>
            ) : (
              filtered.map((a, i) => {
                const st = studentMap[a.student_id];
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium">{st?.full_name || 'Alumno eliminado'}</p>
                      <p className="text-xs text-muted-foreground">{a.fecha}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {tipoLabels[a.tipo] || a.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.hora_entrada || '—'}
                    </span>
                    <span className="text-lg">{a.feeling ? feelingEmoji[a.feeling] : '—'}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => deleteMutation.mutate(a.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Registrar Asistencia</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Alumno</Label>
              <Select value={form.student_id} onValueChange={v => setForm({ ...form, student_id: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar alumno..." /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Hora entrada</Label>
                <Input type="time" value={form.hora_entrada} onChange={e => setForm({ ...form, hora_entrada: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label>Tipo de clase</Label>
              <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Feeling del alumno (1–5)</Label>
              <div className="flex gap-2 mt-2">
                {[1,2,3,4,5].map(f => (
                  <button
                    key={f}
                    onClick={() => setForm({ ...form, feeling: f })}
                    className={`text-2xl rounded-lg p-2 transition-all ${form.feeling === f ? 'bg-primary/20 scale-110' : 'bg-secondary hover:bg-secondary/80'}`}
                  >
                    {feelingEmoji[f]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Notas del coach (opcional)</Label>
              <Input value={form.notas_del_coach} onChange={e => setForm({ ...form, notas_del_coach: e.target.value })} placeholder="Observaciones..." className="bg-secondary border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button
              onClick={() => createMutation.mutate({ ...form, coach_id: user.email })}
              disabled={!form.student_id || createMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createMutation.isPending ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}