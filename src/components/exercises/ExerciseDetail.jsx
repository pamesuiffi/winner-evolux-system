import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Zap, AlertTriangle, Plus, Clock, ChevronRight, Upload, Loader2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INTENSITY_TECHNIQUES, EXERCISES_DB } from '@/data/exerciseDatabase';
import AddToRoutineDialog from './AddToRoutineDialog';

const TABS = [
  { id: 'instrucciones', label: '📋 Instrucciones', icon: null },
  { id: 'variantes', label: '🔄 Variantes', icon: null },
  { id: 'tecnica', label: '⚡ Técnica', icon: null },
  { id: 'errores', label: '⚠️ Errores', icon: null },
];

const TEMPO_LABELS = ['↓ Excéntrica', '⏸ Pausa abajo', '↑ Concéntrica', '⏸ Pausa arriba'];

export default function ExerciseDetail({ exercise, onClose, user }) {
  const [tab, setTab] = useState('instrucciones');
  const [showAddToRoutine, setShowAddToRoutine] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await base44.integrations.Core.UploadFile({ file });
      setVideoPreview(resp.file_url);
      
      // Save to database
      if (exercise.id && exercise._source === 'user') {
        await base44.entities.Exercise.update(exercise.id, { video_url: resp.file_url });
      } else if (exercise._source === 'db') {
        // Create exercise record from DB template if uploading video
        await base44.entities.Exercise.create({
          name: exercise.name,
          alternate_name: exercise.alternate_name,
          muscle_group: exercise.muscle_group,
          equipment: exercise.equipment,
          level: exercise.level,
          video_url: resp.file_url,
          description: exercise.description,
          tips: exercise.tips,
          metric_type: exercise.metric_type || 'weight_reps',
          _source_db: true
        });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
    setUploading(false);
  };

  if (!exercise) return null;

  const tempoPhases = exercise.tempo ? exercise.tempo.split('-') : ['2', '0', '2', '0'];

  // Find variants (same muscle group, different equipment)
  const variants = EXERCISES_DB.filter(
    e => e.muscle_group === exercise.muscle_group &&
         e.equipment !== exercise.equipment &&
         e.id !== exercise.id
  ).slice(0, 6);

  const technique = exercise.intensity_technique;
  const techniqueLabel = INTENSITY_TECHNIQUES[technique] || 'Normal';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-start justify-between flex-shrink-0">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] border-primary/50 text-primary bg-primary/10">
                  {exercise.muscle_group}
                </Badge>
                {exercise.level && (
                  <Badge variant="outline" className="text-[10px]">
                    {exercise.level}
                  </Badge>
                )}
                {exercise.equipment && (
                  <Badge variant="secondary" className="text-[10px]">
                    🏋️ {exercise.equipment}
                  </Badge>
                )}
              </div>
              <h2 className="font-display font-bold text-xl text-foreground leading-tight">{exercise.name}</h2>
              {exercise.alternate_name && (
                <p className="text-sm text-muted-foreground mt-0.5">{exercise.alternate_name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="px-5 py-3 flex gap-4 border-b border-border bg-secondary/30 flex-wrap flex-shrink-0">
            {exercise.sets_range && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Series</p>
                <p className="font-display font-bold text-primary">{exercise.sets_range}</p>
              </div>
            )}
            {exercise.reps_range && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Reps</p>
                <p className="font-display font-bold text-foreground">{exercise.reps_range}</p>
              </div>
            )}
            {exercise.tempo && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tempo</p>
                <p className="font-display font-bold text-accent">{exercise.tempo}</p>
              </div>
            )}
            {exercise.calories_per_minute && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">kcal/min</p>
                <p className="font-display font-bold text-foreground">{exercise.calories_per_minute}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-border flex-shrink-0 scrollbar-none">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="overflow-y-auto flex-1 p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >

                {/* INSTRUCCIONES */}
                {tab === 'instrucciones' && (
                  <div className="space-y-4">
                    {/* Video en bucle */}
                    {exercise.video_url && (
                      <div className="rounded-xl overflow-hidden bg-black aspect-video group cursor-pointer relative" onClick={() => setVideoPreview(exercise.video_url)}>
                        <video
                          src={exercise.video_url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                          <Play size={24} className="text-white" fill="white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Upload video button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 text-sm font-medium text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Subir video técnico
                        </>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/mpeg,.mp4,.webm" onChange={handleVideoUpload} className="hidden" />
                    {exercise.tips && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-primary font-semibold mb-1 flex items-center gap-1">
                          <Target size={12} /> Clave técnica
                        </p>
                        <p className="text-sm text-foreground">{exercise.tips}</p>
                      </div>
                    )}
                    {exercise.description && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Descripción</h4>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      </div>
                    )}
                    {exercise.coaching_cues && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Cues de coaching</h4>
                        <p className="text-sm text-muted-foreground">{exercise.coaching_cues}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Patrón de movimiento</h4>
                      <Badge variant="secondary" className="capitalize">
                        {exercise.movement_pattern?.replace(/_/g, ' ') || 'Otro'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* VARIANTES */}
                {tab === 'variantes' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Mismos músculos, diferente equipamiento:
                    </p>
                    {variants.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No hay variantes disponibles en la biblioteca local
                      </p>
                    ) : (
                      variants.map(v => (
                        <div key={v.id} className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{v.name}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">{v.equipment}</Badge>
                              <Badge variant="outline" className="text-[10px]">{v.level}</Badge>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                        </div>
                      ))
                    )}
                    {exercise.easier_variation && (
                      <div className="p-3 rounded-xl border border-success/30 bg-success/5">
                        <p className="text-xs text-success font-semibold mb-1">Más fácil</p>
                        <p className="text-sm">{exercise.easier_variation}</p>
                      </div>
                    )}
                    {exercise.harder_variation && (
                      <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                        <p className="text-xs text-destructive font-semibold mb-1">Más difícil</p>
                        <p className="text-sm">{exercise.harder_variation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TÉCNICA */}
                {tab === 'tecnica' && (
                  <div className="space-y-4">
                    {/* Tempo visual */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-accent" />
                        Tempo: {exercise.tempo || '2-0-2-0'}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {tempoPhases.map((phase, i) => (
                          <div key={i} className="text-center p-3 rounded-xl bg-secondary/50 border border-border">
                            <p className="font-display font-bold text-2xl text-primary">{phase}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">seg</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{TEMPO_LABELS[i]}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Técnica de intensidad */}
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <p className="text-xs text-accent font-semibold mb-1 flex items-center gap-1">
                        <Zap size={12} /> Técnica recomendada
                      </p>
                      <p className="font-medium">{techniqueLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {technique === 'drop_set' && 'Reducir el peso inmediatamente al fallo y continuar la serie sin descanso.'}
                        {technique === 'rest_pause' && 'Llegar al fallo, descansar 10-20 seg, continuar con más reps.'}
                        {technique === 'super_set' && 'Dos ejercicios seguidos sin descanso entre ellos.'}
                        {technique === 'cluster' && 'Series de 2-3 reps con mini-descansos de 10-15 seg entre clusters.'}
                        {technique === 'negativas' && 'Fase excéntrica muy lenta (4-6 seg) con énfasis en el descenso.'}
                        {technique === 'myo_reps' && 'Serie de activación al fallo, luego mini-series de 3-5 reps.'}
                        {(!technique || technique === 'normal') && 'Ejecución estándar con tempo controlado.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ERRORES COMUNES */}
                {tab === 'errores' && (
                  <div className="space-y-3">
                    {(Array.isArray(exercise.common_mistakes) ? exercise.common_mistakes :
                      exercise.common_errors ? [exercise.common_errors] : []
                    ).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Sin errores registrados
                      </p>
                    ) : (
                      (Array.isArray(exercise.common_mistakes) ? exercise.common_mistakes :
                        [exercise.common_errors]).map((error, i) => (
                        <div key={i} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                          <AlertTriangle size={14} className="text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{error}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer action */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <Button
              onClick={() => setShowAddToRoutine(true)}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus size={16} /> Agregar a mi Rutina
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {showAddToRoutine && (
        <AddToRoutineDialog
          exercise={exercise}
          user={user}
          onClose={() => setShowAddToRoutine(false)}
        />
      )}

      {/* Video Preview Modal */}
      {videoPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setVideoPreview(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Reproductor de video</h2>
              <button onClick={() => setVideoPreview(null)} className="text-white hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video width="100%" height="100%" controls className="w-full h-full">
                <source src={videoPreview} type="video/mp4" />
                Tu navegador no soporta videos
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}