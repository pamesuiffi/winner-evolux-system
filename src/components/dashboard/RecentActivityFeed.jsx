import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RecentActivityFeed({ logs }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-border bg-card"
    >
      <div className="p-5 border-b border-border">
        <h3 className="font-display font-semibold text-lg">Actividad Reciente</h3>
      </div>
      <div className="divide-y divide-border">
        {logs.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground text-center">No hay actividad reciente</p>
        ) : (
          logs.map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-4 p-4 px-5"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {log.exercise_name || 'Entrenamiento'} 
                  {log.is_pr && <span className="text-accent ml-2">🏆 PR!</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {log.resultado_valor && `${log.resultado_valor} • `}
                  {log.modalidad && <span className="uppercase">{log.modalidad}</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {log.fecha ? format(new Date(log.fecha), 'd MMM', { locale: es }) : ''}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}