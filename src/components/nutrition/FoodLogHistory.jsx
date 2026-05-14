import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Flame, Calendar, Beef, Wheat, Droplets } from 'lucide-react';
import moment from 'moment';

const MEAL_LABELS = {
  desayuno: '🌅 Desayuno',
  almuerzo: '☀️ Almuerzo',
  merienda: '🍎 Merienda',
  cena: '🌙 Cena',
  snack: '🍿 Snack',
};

export default function FoodLogHistory({ user }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['foodLogs', user?.id],
    queryFn: () => base44.entities.FoodLog.filter({ student_id: user?.id }, '-fecha', 50),
    enabled: !!user?.id,
  });

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    const d = log.fecha;
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Flame size={36} className="text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">Sin registros aún</p>
        <p className="text-gray-600 text-sm mt-1">Tomá una foto de tu comida para empezar</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {dates.map(date => {
        const dayLogs = grouped[date];
        const totalCal = dayLogs.reduce((s, l) => s + (l.calories || 0), 0);
        const totalProt = dayLogs.reduce((s, l) => s + (l.protein_g || 0), 0);
        const totalCarbs = dayLogs.reduce((s, l) => s + (l.carbs_g || 0), 0);
        const totalFat = dayLogs.reduce((s, l) => s + (l.fat_g || 0), 0);

        return (
          <div key={date} className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Day header */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(255,77,0,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                <span className="text-sm font-semibold text-white">{moment(date).format('dddd DD [de] MMMM')}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-primary font-bold">{Math.round(totalCal)} kcal</span>
                <span className="text-gray-500 hidden sm:block">P:{Math.round(totalProt)}g C:{Math.round(totalCarbs)}g G:{Math.round(totalFat)}g</span>
              </div>
            </div>

            {/* Meals */}
            <div className="divide-y divide-white/5">
              {dayLogs.map(log => (
                <div key={log.id} className="px-5 py-4 flex gap-4 items-start">
                  {log.photo_url && (
                    <img src={log.photo_url} alt="comida" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">{MEAL_LABELS[log.meal_type] || log.meal_type}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{log.food_description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-orange-400"><Flame size={10} />{Math.round(log.calories)} kcal</span>
                      <span className="flex items-center gap-1 text-xs text-yellow-400"><Beef size={10} />{Math.round(log.protein_g)}g prot</span>
                      <span className="flex items-center gap-1 text-xs text-green-400"><Wheat size={10} />{Math.round(log.carbs_g)}g carbs</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Droplets size={10} />{Math.round(log.fat_g)}g grasas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}