import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Trash2, Edit, Trophy, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

function getStatusInfo(lastActivity) {
  if (!lastActivity) return { color: 'bg-destructive', label: 'Sin actividad' };
  const diff = Math.floor((new Date() - new Date(lastActivity)) / (1000*60*60*24));
  if (diff <= 7) return { color: 'bg-success', label: 'Activo' };
  if (diff <= 14) return { color: 'bg-accent', label: `${diff}d sin actividad` };
  return { color: 'bg-destructive', label: `${diff}d sin actividad` };
}

const goalLabels = {
  deficit: '🔻 Déficit',
  mantenimiento: '⚖️ Mantenimiento',
  superavit: '🔺 Superávit',
};

export default function StudentCard({ student, index, onEdit, onDelete }) {
  const status = getStatusInfo(student.last_activity_date);
  const initials = student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{initials}</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">{student.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-xs text-muted-foreground">{status.label}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-secondary/50 rounded-lg p-2 px-3">
          <p className="text-[10px] text-muted-foreground uppercase">Objetivo</p>
          <p className="text-xs font-medium">{goalLabels[student.goal] || '—'}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 px-3">
          <p className="text-[10px] text-muted-foreground uppercase">Score</p>
          <p className="text-xs font-bold text-accent flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {student.winner_score || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
}