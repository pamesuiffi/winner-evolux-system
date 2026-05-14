import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Dumbbell, Trophy, Flame, TrendingUp, Calendar, Heart, Target, Star } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import PRTracker from '@/components/students/PRTracker';
import StudentHabitSummary from '@/components/students/StudentHabitSummary';
import WorkoutLogger from '@/components/students/WorkoutLogger';
import ChatNotificationBubble from '@/components/chat/ChatNotificationBubble';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StudentDashboard() {
  const { user } = useOutletContext();

  const { data: student } = useQuery({
    queryKey: ['my-student', user?.email],
    queryFn: () => base44.entities.Student.filter({ email: user?.email }),
    enabled: !!user,
    select: (d) => d[0],
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['my-logs', student?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ student_id: student?.id }, '-fecha', 20),
    enabled: !!student?.id,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['my-evals', student?.id],
    queryFn: () => base44.entities.Evaluation.filter({ student_id: student?.id }, '-fecha', 5),
    enabled: !!student?.id,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['my-habits', student?.id],
    queryFn: () => base44.entities.HabitLog.filter({ student_id: student?.id }, '-fecha', 7),
    enabled: !!student?.id,
  });

  const prs = workoutLogs.filter(l => l.is_pr);
  const lastEval = evaluations[0];

  const weightData = evaluations.slice().reverse().map(e => ({
    fecha: format(parseISO(e.fecha), 'MMM yy', { locale: es }),
    peso: e.peso,
    grasa: e.grasa_pct,
  }));

  const wellbeingData = habits.slice().reverse().map(h => ({
    fecha: format(parseISO(h.fecha), 'dd/MM', { locale: es }),
    energia: h.energia || 0,
    animo: h.animo || 0,
    sueno: h.calidad_sueno || 0,
  }));

  const radarData = [
    { subject: 'Energía', A: habits[0]?.energia || 0, fullMark: 10 },
    { subject: 'Ánimo', A: habits[0]?.animo || 0, fullMark: 10 },
    { subject: 'Sueño', A: habits[0]?.calidad_sueno || 0, fullMark: 10 },
    { subject: 'Entrenamiento', A: Math.min(workoutLogs.length * 1.5, 10), fullMark: 10 },
    { subject: 'Nutrición', A: lastEval ? 7 : 4, fullMark: 10 },
    { subject: 'Mindset', A: habits[0] ? 10 - (habits[0].estres || 5) : 5, fullMark: 10 },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Burbuja de notificaciones de chat */}
      <ChatNotificationBubble user={user} />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Hola {student?.full_name || user?.full_name} 👋 — {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Dumbbell, label: 'Sesiones', value: workoutLogs.length, color: '#FF4D00' },
          { icon: Trophy, label: 'PRs Totales', value: prs.length, color: '#FFB800' },
          { icon: Target, label: 'Peso Actual', value: lastEval ? `${lastEval.peso}kg` : '—', color: '#00C896' },
          { icon: Flame, label: 'Winner Score', value: student?.winner_score ? Math.round(student.winner_score) : '—', color: '#FF4D00' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}20` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-display font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar bienestar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" /> Bienestar Hoy
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
              <Radar dataKey="A" stroke="#FF4D00" fill="#FF4D00" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Peso evolución */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" /> Evolución Corporal
          </h3>
          {weightData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weightData}>
                <XAxis dataKey="fecha" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                <Line type="monotone" dataKey="peso" stroke="#FF4D00" strokeWidth={2} dot={{ fill: '#FF4D00', r: 4 }} name="Peso (kg)" />
                <Line type="monotone" dataKey="grasa" stroke="#FFB800" strokeWidth={2} dot={{ fill: '#FFB800', r: 4 }} name="% Grasa" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Se necesitan al menos 2 evaluaciones para ver la evolución
            </div>
          )}
        </div>
      </div>

      {/* Registro de cargas */}
      <WorkoutLogger student={student} />

      {/* PRs + Habitos */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PRTracker logs={workoutLogs} />
        <StudentHabitSummary habits={habits} />
      </div>

      {/* Últimas sesiones */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" /> Últimas Sesiones
        </h3>
        {workoutLogs.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No hay sesiones registradas</p>
        ) : (
          <div className="space-y-2">
            {workoutLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.exercise_name}</p>
                    <p className="text-xs text-muted-foreground">{log.notas_alumno || log.modalidad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.is_pr && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">PR</span>
                  )}
                  <span className="text-xs text-muted-foreground">{log.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}