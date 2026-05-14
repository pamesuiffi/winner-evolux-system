import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Apple, Brain, Users, Flame, Trophy, Star, Target, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import WinnerScore from '../components/dashboard/WinnerScore';
import StatCard from '../components/dashboard/StatCard';

const weightData = [
  { mes: 'Feb', peso: 87, grasa: 22 },
  { mes: 'Mar', peso: 85, grasa: 20 },
  { mes: 'Abr', peso: 83, grasa: 18.5 },
  { mes: 'May', peso: 81, grasa: 17 },
];

const sessionsData = [
  { semana: 'S1', sesiones: 4 },
  { semana: 'S2', sesiones: 5 },
  { semana: 'S3', sesiones: 3 },
  { semana: 'S4', sesiones: 6 },
  { semana: 'S5', sesiones: 5 },
];

const ruedaData = [
  { dimension: 'Salud', value: 8 },
  { dimension: 'Familia', value: 7 },
  { dimension: 'Trabajo', value: 6 },
  { dimension: 'Finanzas', value: 5 },
  { dimension: 'Diversión', value: 7 },
  { dimension: 'Relaciones', value: 8 },
  { dimension: 'Desarrollo', value: 9 },
  { dimension: 'Espirit.', value: 6 },
];

const tooltipStyle = { background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' };

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    base44.entities.Student.list().then(setStudents).catch(() => {});
    base44.entities.FeedPost.list('-created_date', 3).then(setPosts).catch(() => {});
  }, []);

  const activeStudents = students.filter(s => {
    if (!s.last_activity) return false;
    const diff = (new Date() - new Date(s.last_activity)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">DASHBOARD</h1>
          <p className="text-gray-400 text-sm font-barlow">Bienvenido, <span style={{ color: '#FF4D00' }}>Carlos Mendez</span></p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)' }}>
          <Flame size={16} style={{ color: '#FF4D00' }} />
          <span className="font-condensed text-sm text-white">Racha actual: <strong style={{ color: '#FFB800' }}>12 días</strong></span>
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Alumnos activos" value={activeStudents.length || 3} unit="/ 5" trend="up" trendValue="+2 este mes" color="#00C896" />
        <StatCard icon={Dumbbell} label="Sesiones este mes" value={24} trend="up" trendValue="+8%" color="#FF4D00" />
        <StatCard icon={Trophy} label="PRs este mes" value={7} trend="up" trendValue="🔥 récord" color="#FFB800" />
        <StatCard icon={Target} label="Cumplimiento rutinas" value={87} unit="%" trend="up" trendValue="+5%" color="#00C896" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Winner Score */}
        <div className="rounded-2xl p-5 flex flex-col items-center justify-center" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.15)' }}>
          <h3 className="font-bebas text-xl text-white tracking-wider mb-2">WINNER SCORE</h3>
          <WinnerScore score={78} />
          <div className="grid grid-cols-3 gap-2 w-full mt-3">
            {[
              { label: 'Cuerpo', val: 82 },
              { label: 'Entreno', val: 90 },
              { label: 'Nutrición', val: 65 },
              { label: 'Mente', val: 75 },
              { label: 'Social', val: 70 },
              { label: 'Hábitos', val: 80 },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm font-bold" style={{ color: val >= 80 ? '#00C896' : val >= 60 ? '#FFB800' : '#FF3B3B' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight / Fat Progress */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-xl text-white tracking-wider mb-4">PROGRESO CORPORAL</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grasaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="peso" stroke="#FF4D00" fill="url(#weightGrad)" strokeWidth={2} name="Peso (kg)" />
              <Area type="monotone" dataKey="grasa" stroke="#00C896" fill="url(#grasaGrad)" strokeWidth={2} name="% Grasa" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#FF4D00' }}></span><span className="text-xs text-gray-400">Peso (kg)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#00C896' }}></span><span className="text-xs text-gray-400">% Grasa</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sessions chart */}
        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-lg text-white tracking-wider mb-4">SESIONES POR SEMANA</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={sessionsData}>
              <XAxis dataKey="semana" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="sesiones" stroke="#FF4D00" strokeWidth={2} dot={{ fill: '#FF4D00', r: 4 }} name="Sesiones" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rueda de la vida */}
        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-lg text-white tracking-wider mb-2">RUEDA DE LA VIDA</h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={ruedaData}>
              <PolarGrid stroke="#222" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#666', fontSize: 9 }} />
              <Radar dataKey="value" stroke="#FFB800" fill="#FFB800" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent PRs */}
        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bebas text-lg text-white tracking-wider mb-4">RÉCORDS PERSONALES 🏆</h3>
          <div className="space-y-3">
            {[
              { exercise: 'Sentadilla', value: '120 kg', date: 'Hoy', isNew: true },
              { exercise: 'Press Banca', value: '95 kg', date: 'Hace 3 días', isNew: false },
              { exercise: 'Fran', value: '4:32 min', date: 'Hace 1 sem', isNew: false },
              { exercise: 'Peso Muerto', value: '155 kg', date: 'Hace 2 sem', isNew: false },
            ].map((pr, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{pr.exercise}</p>
                  <p className="text-xs text-gray-500">{pr.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-condensed font-bold text-sm" style={{ color: '#FFB800' }}>{pr.value}</span>
                  {pr.isNew && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>NEW</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hábitos y Bienestar */}
      <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bebas text-xl text-white tracking-wider mb-4">HÁBITOS HOY</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '💧 Agua 2L', done: true },
            { label: '😴 Sueño 8hs', done: true },
            { label: '🧘 Meditación', done: false },
            { label: '🏋️ Entrenamiento', done: true },
            { label: '📚 Lectura', done: false },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
              style={{
                background: done ? 'rgba(0,200,150,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${done ? 'rgba(0,200,150,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${done ? 'border-emerald' : 'border-gray-600'}`}
                style={{ borderColor: done ? '#00C896' : '#444' }}>
                {done && <div className="w-2 h-2 rounded-full" style={{ background: '#00C896' }}></div>}
              </div>
              <span className="text-sm font-medium" style={{ color: done ? '#00C896' : '#888' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feed */}
      <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bebas text-xl text-white tracking-wider mb-4">ÚLTIMOS DEL FEED</h3>
        <div className="space-y-3">
          {(posts.length > 0 ? posts : [
            { author_name: 'Carlos Mendez', content: '🔥 Semana brutal de entrenamientos. ¡Todos los alumnos rompiendo récords! Esto es WINNER.', post_type: 'post', reactions: { strong: 12, fire: 8, star: 5 } },
            { author_name: 'Laura García', content: '💪 ¡Primera dominada sin asistencia! Primer muscle-up incoming 🎯', post_type: 'achievement', reactions: { strong: 20, fire: 15, star: 10 } },
            { author_name: 'Miguel Torres', content: '⭐ PR en Sentadilla: 120kg × 3 reps. Fórmula Epley → 1RM estimado: 130kg!', post_type: 'pr', reactions: { strong: 18, fire: 22, star: 8 } },
          ]).map((post, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
                  {post.author_name?.[0] || 'C'}
                </div>
                <span className="text-sm font-medium text-white">{post.author_name}</span>
                {post.post_type === 'achievement' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,184,0,0.2)', color: '#FFB800' }}>Logro</span>}
                {post.post_type === 'pr' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>PR</span>}
              </div>
              <p className="text-sm text-gray-300">{post.content}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-gray-500">💪 {post.reactions?.strong || 0}</span>
                <span className="text-xs text-gray-500">🔥 {post.reactions?.fire || 0}</span>
                <span className="text-xs text-gray-500">⭐ {post.reactions?.star || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}