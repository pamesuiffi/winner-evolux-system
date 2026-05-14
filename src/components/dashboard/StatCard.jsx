import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, unit, trend, trendValue, color = '#FF4D00', gradient }) {
  const isPositive = trend === 'up';
  return (
    <div className="card-hover rounded-xl p-4 flex flex-col gap-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'stat-up' : 'stat-down'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-bebas text-3xl text-white">{value}</span>
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
        </div>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}