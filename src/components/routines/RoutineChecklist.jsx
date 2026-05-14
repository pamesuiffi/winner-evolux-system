import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Trophy, Dumbbell, Star, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SharePanel from './SharePanel';

const EX_MESSAGES = [
  { icon: '🔥', text: '¡Ejercicio completado! Eso es mentalidad de campeón.' },
  { icon: '💪', text: '¡Lo lograste! Los Winners no paran.' },
  { icon: '⚡', text: '¡Brutal! Cada serie te hace más fuerte.' },
  { icon: '🏆', text: '¡Ejercicio destruido! Seguís creciendo.' },
  { icon: '🚀', text: '¡Así se hace! La constancia es el secreto.' },
  { icon: '🦁', text: '¡Rugiste! Eso fue potencia pura.' },
  { icon: '💥', text: '¡Boom! Otro ejercicio en el bolsillo.' },
];

const ROUTINE_MESSAGES = [
  '¡RUTINA COMPLETA! Hoy demostraste quién sos.',
  '¡Lo hiciste! Otros duermen, vos entrenas.',
  '¡Rutina dominada! Esto es lo que te separa del resto.',
  '¡Imparable! Cada entrenamiento te acerca a tu mejor versión.',
  '¡Completaste todo! No hay techo para un Winner.',
];

const today = format(new Date(), 'yyyy-MM-dd');

export default function RoutineChecklist({ routine, student, open, onClose }) {
  const queryClient = useQueryClient();

  const exercises = (() => {
    try { return JSON.parse(routine?.exercises_json || '[]'); } catch { return []; }
  })();

  const buildInitial = () =>
    exercises.map(ex => ({
      ...ex,
      sets: Array.from(
        { length: parseInt(ex.sets) || parseInt((ex.sets_range || '3').split('-')[0]) || 3 },
        () => ({ checked: false, weight: ex.weight || '', reps: ex.reps || ex.reps_range || '' })
      ),
    }));

  const [exState, setExState] = useState(buildInitial);
  const [expanded, setExpanded] = useState(0);
  const [saved, setSaved] = useState(false);
  const [exToast, setExToast] = useState(null);
  // 'training' | 'winner' | 'review'
  const [screen, setScreen] = useState('training');
  const [winnerMsg] = useState(() => ROUTINE_MESSAGES[Math.floor(Math.random() * ROUTINE_MESSAGES.length)]);
  const completedExRef = useRef(new Set());
  const toastTimerRef = useRef(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [feedPosted, setFeedPosted] = useState(false);

  const getShareText = () => {
    const exerciseSummary = exState
      .filter(ex => ex.sets.some(s => s.checked))
      .map(ex => {
        const done = ex.sets.filter(s => s.checked);
        const maxWeight = Math.max(...done.map(s => parseFloat(s.weight) || 0));
        return `${ex.name || ex.exercise_name}: ${done.length} series${maxWeight > 0 ? ` · ${maxWeight}kg` : ''}`;
      })
      .join('\n');

    return [
      `🏆 WINNER — ${routine.name}`,
      `📅 ${format(new Date(), "d 'de' MMMM yyyy", { locale: es })}`,
      '',
      `📊 Series: ${completedSets} · Reps: ${Math.round(totalReps)} · Volumen: ${Math.round(totalVolumen)}kg`,
      '',
      exerciseSummary,
      '',
      '💪 ¡Entrenado con Winner Evolux!',
    ].join('\n');
  };

  const postToFeed = async () => {
    if (!student?.id || feedPosted) return;
    const content = getShareText();
    await base44.entities.FeedPost.create({
      author_id: student.id,
      author_name: student.full_name,
      author_role: 'student',
      coach_id: student.coach_id,
      content,
      post_type: 'logro',
    });
    setFeedPosted(true);
    queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}&u=https://winnereolux.com`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText().slice(0, 280));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(getShareText());
    alert('Texto copiado 📋 Abrí Instagram y pegalo en tu historia o post.');
  };

  const shareNative = () => {
    const text = getShareText();
    if (navigator.share) {
      navigator.share({ title: `Winner — ${routine.name}`, text });
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Resumen copiado al portapapeles!');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!student?.id) return;
      const promises = exState
        .filter(ex => ex.sets.some(s => s.checked))
        .map(ex => {
          const completedSets = ex.sets.filter(s => s.checked);
          return base44.entities.WorkoutLog.create({
            student_id: student.id,
            coach_id: student.coach_id,
            fecha: today,
            exercise_name: ex.name || ex.exercise_name,
            metric_type: ex.metric_type || 'weight_reps',
            sets_data: JSON.stringify(completedSets.map(s => ({ weight: s.weight, reps: s.reps }))),
            notas_alumno: [
              `Rutina: ${routine.name}`,
              rating ? `Valoración: ${rating}/5 estrellas` : '',
              comment ? `Comentario: ${comment}` : '',
            ].filter(Boolean).join(' | '),
          });
        });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
      queryClient.invalidateQueries({ queryKey: ['my-logs'] });
      setSaved(true);
    },
  });

  const toggleSet = (exIdx, setIdx) => {
    setExState(prev => {
      const next = prev.map((ex, ei) =>
        ei !== exIdx ? ex : {
          ...ex,
          sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, checked: !s.checked })
        }
      );
      const ex = next[exIdx];
      const allDone = ex.sets.every(s => s.checked);
      const wasCompleted = completedExRef.current.has(exIdx);
      if (allDone && !wasCompleted) {
        completedExRef.current.add(exIdx);
        const allExDone = next.every(e => e.sets.every(s => s.checked));
        if (allExDone) {
          // Go to winner screen immediately
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setExToast(null);
          setScreen('winner');
        } else {
          const msg = EX_MESSAGES[Math.floor(Math.random() * EX_MESSAGES.length)];
          setExToast({ msg });
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setExToast(null), 2800);
        }
      }
      return next;
    });
  };

  const updateSetField = (exIdx, setIdx, field, val) => {
    setExState(prev => prev.map((ex, ei) =>
      ei !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: val })
      }
    ));
  };

  const totalSets = exState.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exState.reduce((acc, ex) => acc + ex.sets.filter(s => s.checked).length, 0);
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const calcVolumen = (sets) =>
    sets.filter(s => s.checked).reduce((acc, s) => acc + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0);

  const totalVolumen = exState.reduce((acc, ex) => acc + calcVolumen(ex.sets), 0);
  const totalReps = exState.reduce((acc, ex) =>
    acc + ex.sets.filter(s => s.checked).reduce((a, s) => a + (parseFloat(s.reps) || 0), 0), 0);

  if (exercises.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-md">
          <p className="text-muted-foreground text-sm text-center py-8">Esta rutina no tiene ejercicios cargados aún.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-card border-border max-w-lg w-full flex flex-col p-0 overflow-hidden relative"
        style={{ position: 'fixed', top: '5%', left: '50%', transform: 'translateX(-50%)', height: '90vh', maxHeight: '90vh' }}
        onInteractOutside={e => e.preventDefault()}
        onFocusOutside={e => e.preventDefault()}
      >

        <AnimatePresence mode="wait">

          {/* ── TRAINING SCREEN ── */}
          {screen === 'training' && (
            <motion.div key="training" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col flex-1 overflow-hidden min-h-0">

              {/* Exercise completion toast (inside dialog) */}
              <AnimatePresence>
                {exToast && (
                  <motion.div
                    key="ex-toast"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}
                  >
                    <span className="text-xl">{exToast.msg.icon}</span>
                    <div>
                      <p className="font-display font-bold text-white text-sm leading-tight">{exToast.msg.text}</p>
                      <p className="text-white/80 text-xs">¡Eso es ser un WINNER! 🏆</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="p-5 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display font-bold text-lg">{routine?.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{completedSets} / {totalSets} series completadas</span>
                    <span className="font-semibold" style={{ color: progress === 100 ? '#00C896' : '#FF4D00' }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: progress === 100 ? '#00C896' : '#FF4D00' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    />
                  </div>
                </div>
              </div>

              {/* Exercise list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {exState.map((ex, exIdx) => {
                  const exCompleted = ex.sets.filter(s => s.checked).length;
                  const isExpanded = expanded === exIdx;
                  return (
                    <div key={exIdx} className="rounded-xl border border-border overflow-hidden">
                      <button
                        onClick={() => setExpanded(isExpanded ? -1 : exIdx)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${exCompleted === ex.sets.length ? 'bg-success/20' : 'bg-primary/10'}`}>
                            {exCompleted === ex.sets.length
                              ? <CheckCircle2 size={16} className="text-success" />
                              : <Dumbbell size={14} className="text-primary" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{ex.name || ex.exercise_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exCompleted}/{ex.sets.length} series
                              {ex.rest_seconds && ` · descanso ${ex.rest_seconds}s`}
                              {calcVolumen(ex.sets) > 0 && (
                                <span className="ml-2 text-accent font-semibold">
                                  · {calcVolumen(ex.sets).toLocaleString('es-AR')} kg·rep
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="grid grid-cols-[32px_1fr_80px_80px] gap-2 px-4 py-2 text-[10px] text-muted-foreground">
                              <span /><span>Serie</span>
                              <span className="text-center">Peso (kg)</span>
                              <span className="text-center">Reps</span>
                            </div>
                            <div className="px-3 pb-3 space-y-1.5">
                              {ex.sets.map((s, si) => (
                                <motion.div key={si} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: si * 0.04 }}
                                  className={`grid grid-cols-[32px_1fr_80px_80px] gap-2 items-center p-2 rounded-lg transition-colors ${s.checked ? 'bg-success/10 border border-success/20' : 'bg-secondary/40'}`}
                                >
                                  <button onClick={() => toggleSet(exIdx, si)} className="flex items-center justify-center">
                                    {s.checked ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-muted-foreground" />}
                                  </button>
                                  <span className={`text-sm font-bold ${s.checked ? 'text-success' : 'text-foreground'}`}>Serie {si + 1}</span>
                                  <input type="number" value={s.weight} onChange={e => updateSetField(exIdx, si, 'weight', e.target.value)}
                                    placeholder="—" className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                  <input type="number" value={s.reps} onChange={e => updateSetField(exIdx, si, 'reps', e.target.value)}
                                    placeholder="—" className="h-8 w-full rounded-md bg-secondary border border-border text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex-shrink-0 space-y-3">
                {completedSets > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-secondary/60 py-2 px-1">
                      <p className="text-[10px] text-muted-foreground">Series</p>
                      <p className="font-display font-bold text-sm text-primary">{completedSets}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 py-2 px-1">
                      <p className="text-[10px] text-muted-foreground">Reps totales</p>
                      <p className="font-display font-bold text-sm text-accent">{Math.round(totalReps)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 py-2 px-1">
                      <p className="text-[10px] text-muted-foreground">Volumen total</p>
                      <p className="font-display font-bold text-sm text-success">{totalVolumen.toLocaleString('es-AR')} kg</p>
                    </div>
                  </div>
                )}
                {saved ? (
                  <div className="flex items-center justify-center gap-2 text-success py-2">
                    <Trophy size={18} /> <span className="font-semibold">¡Entrenamiento guardado!</span>
                  </div>
                ) : (
                  <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || completedSets === 0}
                    className="w-full bg-primary hover:bg-primary/90 gap-2">
                    {saveMutation.isPending ? 'Guardando...' : `Guardar ${completedSets} series completadas`}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── WINNER SCREEN ── */}
          {screen === 'winner' && (
            <motion.div key="winner" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="flex flex-col items-center text-center px-8 py-10 overflow-y-auto"
              style={{ background: 'linear-gradient(145deg, #0f0f0f, #161616)' }}
            >
              <motion.div animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 0.7 }} className="text-8xl mb-3">🏆</motion.div>

              <p className="font-display font-black text-4xl text-white mb-1" style={{ textShadow: '0 0 30px #FF4D00' }}>WINNER</p>
              <div className="h-1 w-20 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #FF4D00, #FFB800)' }} />
              <p className="text-white/80 font-semibold text-base leading-snug mb-5 max-w-xs">{winnerMsg}</p>

              <div className="flex gap-2 mb-6">
                {['⭐','🔥','💪','⚡','🏆'].map((e, i) => (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07 }} className="text-xl">{e}</motion.span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 w-full mb-6">
                <div className="rounded-xl py-2 px-1" style={{ background: 'rgba(255,77,0,0.12)', border: '1px solid rgba(255,77,0,0.25)' }}>
                  <p className="text-[10px] text-white/50">Series</p>
                  <p className="font-display font-bold text-lg text-primary">{completedSets}</p>
                </div>
                <div className="rounded-xl py-2 px-1" style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)' }}>
                  <p className="text-[10px] text-white/50">Reps</p>
                  <p className="font-display font-bold text-lg text-accent">{Math.round(totalReps)}</p>
                </div>
                <div className="rounded-xl py-2 px-1" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)' }}>
                  <p className="text-[10px] text-white/50">Volumen</p>
                  <p className="font-display font-bold text-sm text-success leading-tight mt-0.5">{Math.round(totalVolumen)} kg</p>
                </div>
              </div>

              <Button onClick={() => setScreen('review')} className="w-full font-display font-bold text-base py-5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)', color: 'white' }}>
                Evaluar rutina →
              </Button>
              <button onClick={() => setShowSharePanel(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm font-semibold">
                <Share2 size={15} /> Compartir resultados
              </button>
              <button onClick={onClose} className="mt-2 text-white/25 text-xs hover:text-white/40 transition-colors w-full text-center">
                Cerrar sin guardar
              </button>
            </motion.div>
          )}

          {/* ── REVIEW SCREEN ── */}
          {screen === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="flex flex-col px-7 py-8 overflow-y-auto"
              style={{ background: 'linear-gradient(145deg, #0f0f0f, #161616)' }}
            >
              <div className="text-center mb-6">
                <span className="text-5xl">🏆</span>
                <p className="font-display font-black text-2xl text-white mt-2">¿Cómo fue el entrenamiento?</p>
                <p className="text-white/50 text-sm mt-1">Tu feedback ayuda a mejorar tu plan</p>
              </div>

              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 text-center">Valoración</p>
              <div className="flex justify-center gap-3 mb-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)} className="transition-transform hover:scale-110 active:scale-95">
                    <Star size={38} className="transition-colors"
                      fill={(hoverRating || rating) >= n ? '#FFB800' : 'transparent'}
                      stroke={(hoverRating || rating) >= n ? '#FFB800' : '#444'} />
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {(hoverRating || rating) > 0 && (
                  <motion.p key={hoverRating || rating} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center text-sm font-semibold mb-4" style={{ color: '#FFB800' }}>
                    {['', '😓 Muy difícil', '😐 Regular', '🙂 Bien', '😄 Muy bien', '🔥 ¡Épico!'][hoverRating || rating]}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 mt-2">Comentario (opcional)</p>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="¿Cómo te sentiste? ¿Algo que destacar o mejorar?" rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm p-3 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none mb-5"
              />

              {saved ? (
                <div className="flex items-center justify-center gap-2 text-success py-3">
                  <Trophy size={20} /> <span className="font-display font-bold text-lg">¡Entrenamiento guardado!</span>
                </div>
              ) : (
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                  className="w-full font-display font-bold text-base py-5 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)', color: 'white' }}>
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar entrenamiento'}
                </Button>
              )}
              <button onClick={() => setShowSharePanel(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm font-semibold">
                <Share2 size={15} /> Compartir resultados
              </button>
              <button onClick={() => setScreen('winner')} className="mt-2 text-white/25 text-xs hover:text-white/40 transition-colors text-center w-full">
                ← Volver
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        <SharePanel
          open={showSharePanel}
          onClose={() => setShowSharePanel(false)}
          feedPosted={feedPosted}
          onFeed={postToFeed}
          onWhatsApp={shareToWhatsApp}
          onFacebook={shareToFacebook}
          onTwitter={shareToTwitter}
          onInstagram={shareToInstagram}
          onNative={shareNative}
        />
      </DialogContent>
    </Dialog>
  );
}