import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Dumbbell, ClipboardList, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/dashboard/StatCard';
import StudentStatusList from '../components/dashboard/StudentStatusList';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const demoChartData = [
  { month: 'Ene', sesiones: 45 }, { month: 'Feb', sesiones: 52 },
  { month: 'Mar', sesiones: 48 }, { month: 'Abr', sesiones: 61 },
];

export default function CoachDashboard() {
  const { user } = useOutletContext();

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.email],
    queryFn: () => base44.entities.Student.filter({ coach_id: user?.email }),
    enabled: !!user,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['workout-logs', user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ coach_id: user?.email }, '-fecha', 50),
    enabled: !!user,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations', user?.email],
    queryFn: () => base44.entities.Evaluation.filter({ coach_id: user?.email }),
    enabled: !!user,
  });

  const activeStudents = students.filter(s => {
    if (!s.last_activity_date) return false;
    return (new Date() - new Date(s.last_activity_date)) / (1000*60*60*24) <= 7;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Hola, <span className="text-primary">{user?.display_name || user?.full_name || 'Coach'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Resumen de tu academia</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Alumnos" 
          value={students.length} 
          icon={Users} 
          color="primary" 
          subtitle={`${activeStudents.length} activos`}
          delay={0}
        />
        <StatCard 
          title="Sesiones Mes" 
          value={logs.filter(l => {
            const d = new Date(l.fecha);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length} 
          icon={Dumbbell} 
          color="success"
          delay={0.1}
        />
        <StatCard 
          title="Evaluaciones" 
          value={evaluations.length} 
          icon={BarChart3} 
          color="accent"
          delay={0.2}
        />
        <StatCard 
          title="Tasa Activos" 
          value={students.length ? Math.round((activeStudents.length / students.length) * 100) + '%' : '0%'}
          icon={TrendingUp} 
          color={activeStudents.length / (students.length || 1) >= 0.7 ? 'success' : 'destructive'}
          delay={0.3}
        />
      </div>

      {/* Charts + Students */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Sesiones por Mes</h3>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={demoChartData}>
              <defs>
                <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(18, 100%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(18, 100%, 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="sesiones" stroke="hsl(18, 100%, 50%)" fillOpacity={1} fill="url(#colorSesiones)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Students list */}
        <StudentStatusList students={students} />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed logs={logs.slice(0, 5)} />
    </div>
  );
}