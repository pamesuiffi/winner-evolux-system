import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const HABIT_EMOJIS = ['💪', '🧘', '💧', '📖', '🏃', '🥗', '😴', '🚫', '🧠', '❤️', '🎯', '⏰'];

export default function Habits() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({});
  const [habitLogs, setHabitLogs] = useState({});
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.HabitTracker.list('-created_date', 100),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['habit-logs'],
    queryFn: () => base44.entities.HabitLog.list('-fecha', 365),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HabitTracker.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingHabit) {
        return base44.entities.HabitTracker.update(editingHabit.id, data);
      } else {
        return base44.entities.HabitTracker.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setEditingHabit(null);
      setFormData({});
    },
  });

  const checkMutation = useMutation({
    mutationFn: async (habitId) => {
      const existingLog = logs.find(l => l.fecha === today && l.habits_json?.includes(habitId));
      const allHabitsForToday = logs.find(l => l.fecha === today);
      
      if (allHabitsForToday) {
        const habitsData = JSON.parse(allHabitsForToday.habits_json || '[]');
        const habitIndex = habitsData.findIndex(h => h.id === habitId);
        
        if (habitIndex >= 0) {
          habitsData[habitIndex].completed = !habitsData[habitIndex].completed;
        } else {
          habitsData.push({ id: habitId, completed: true });
        }
        
        return base44.entities.HabitLog.update(allHabitsForToday.id, {
          habits_json: JSON.stringify(habitsData),
        });
      } else {
        return base44.entities.HabitLog.create({
          student_id: user?.id,
          coach_id: user?.id,
          fecha: today,
          habits_json: JSON.stringify([{ id: habitId, completed: true }]),
          energia: 5,
          animo: 5,
          estres: 5,
          calidad_sueno: 5,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
    },
  });

  const openCreate = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      description: '',
      icon: '💪',
      frequency: 'diario',
    });
    setShowForm(true);
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setFormData(habit);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    saveMutation.mutate({
      ...formData,
      coach_id: user?.id,
      created_date: new Date().toISOString().split('T')[0],
    });
  };

  const todayLog = logs.find(l => l.fecha === today);
  const habitsData = todayLog ? JSON.parse(todayLog.habits_json || '[]') : [];
  const completedHabits = new Set(habitsData.filter(h => h.completed).map(h => h.id));

  const completedCount = completedHabits.size;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display font-black text-4xl text-white tracking-wider">HÁBITOS</h1>
        <p className="text-muted-foreground text-sm">Construye y monitorea tus hábitos diarios</p>
      </div>

      {/* Daily Progress */}
      {habits.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.1), rgba(255,184,0,0.1))', border: '1px solid rgba(255,77,0,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Progreso de hoy</h2>
              <p className="text-xs text-gray-400 mt-1">{format(new Date(), 'd \'de\' MMMM yyyy', { locale: { formatters: {} } })}</p>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-3xl" style={{ color: '#FF4D00' }}>{completedCount}/{totalCount}</div>
              <p className="text-xs text-gray-500">completados</p>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-secondary/40 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #FF4D00, #FFB800)',
            }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progress}% completado</p>
        </div>
      )}

      {/* Habits List */}
      <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-2xl text-white">Mis Hábitos</h2>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#FF4D00' }}>
            <Plus size={16} /> Nuevo hábito
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-2">🎯</p>
            <p className="text-gray-500 text-sm">Aún no tienes hábitos. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {habits.map(habit => {
              const isCompleted = completedHabits.has(habit.id);
              return (
                <div key={habit.id}
                  className="rounded-xl p-4 transition-all cursor-pointer group"
                  style={{
                    background: isCompleted ? 'rgba(0,200,150,0.15)' : '#0D0D0D',
                    border: isCompleted ? '1px solid rgba(0,200,150,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={() => checkMutation.mutate(habit.id)}>
                  
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{habit.icon || '💪'}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                          {habit.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{habit.frequency}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(habit); }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(habit.id); }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{habit.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isCompleted ? 'bg-success/20 text-success' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {isCompleted ? <Check size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                      {isCompleted ? 'Completado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.3)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-2xl text-white">
                {editingHabit ? 'Editar hábito' : 'Nuevo hábito'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-semibold">Nombre del hábito *</label>
                <input type="text" value={formData.name || ''}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Ej: Meditar, Beber agua, Ejercicio..." />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block font-semibold">Descripción</label>
                <textarea value={formData.description || ''}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Detalles sobre este hábito..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold">Icono</label>
                  <div className="grid grid-cols-3 gap-2">
                    {HABIT_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => setFormData(f => ({ ...f, icon: emoji }))}
                        className="p-2 rounded-lg text-2xl transition-all"
                        style={{
                          background: formData.icon === emoji ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
                          border: formData.icon === emoji ? '1px solid #FF4D00' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold">Frecuencia</label>
                  <select value={formData.frequency || 'diario'}
                    onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="diario">Diario</option>
                    <option value="lunes_viernes">Lunes a Viernes</option>
                    <option value="fin_semana">Fin de semana</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!formData.name || saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: '#FF4D00' }}>
                {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}