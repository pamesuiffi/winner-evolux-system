import { Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PRTracker({ logs = [] }) {
  const prs = logs.filter(l => l.is_pr);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-accent" /> Mis PRs
        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{prs.length} total</span>
      </h3>
      {prs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Todavía no hay PRs registrados</p>
          <p className="text-xs mt-1">¡Seguí entrenando, el primero está cerca!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prs.slice(0, 6).map((pr, i) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/5 border border-accent/10"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pr.exercise_name}</p>
                <p className="text-xs text-muted-foreground truncate">{pr.notas_alumno || pr.resultado_tipo}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{pr.fecha}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}