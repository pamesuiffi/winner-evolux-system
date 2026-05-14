export default function WinnerScore({ score = 78 }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative winner-score-ring rounded-full">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="8" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke="url(#fireGradient)"
            strokeWidth="8"
            strokeDasharray={`${progress} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
          <defs>
            <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D00" />
              <stop offset="100%" stopColor="#FFB800" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bebas text-4xl" style={{ background: 'linear-gradient(135deg,#FF4D00,#FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {score}
          </span>
          <span className="text-xs text-gray-400 font-condensed tracking-widest">WINNER</span>
          <span className="text-xs text-gray-400 font-condensed tracking-widest">SCORE</span>
        </div>
      </div>
    </div>
  );
}