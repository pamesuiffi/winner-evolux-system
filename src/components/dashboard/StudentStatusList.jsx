import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

function getStatusInfo(lastActivity) {
  if (!lastActivity) return { color: 'bg-destructive', label: 'Sin actividad', ring: 'ring-destructive/30' };
  const diff = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
  if (diff <= 7) return { color: 'bg-success', label: 'Activo', ring: 'ring-success/30' };
  if (diff <= 14) return { color: 'bg-accent', label: `${diff}d inactivo`, ring: 'ring-accent/30' };
  return { color: 'bg-destructive', label: `${diff}d inactivo`, ring: 'ring-destructive/30' };
}

export default function StudentStatusList({ students }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Alumnos</h3>
        <Link to="/students" className="text-xs text-primary hover:underline">Ver todos</Link>
      </div>
      <div className="divide-y divide-border">
        {students.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground text-center">No hay alumnos registrados</p>
        )}
        {students.slice(0, 8).map((student, i) => {
          const status = getStatusInfo(student.last_activity_date);
          return (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 px-5 hover:bg-secondary/50 transition-colors group"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${status.color} ring-4 ${status.ring}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{student.full_name}</p>
                <p className="text-xs text-muted-foreground">{status.label}</p>
              </div>
              {student.winner_score != null && (
                <span className="text-xs font-bold text-accent">{student.winner_score}</span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}