import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Dumbbell, BarChart3, Brain, Heart, Users, Flame, ArrowRight, Star } from 'lucide-react';

const steps = [
  {
    icon: Trophy,
    color: '#FF4D00',
    gradient: 'from-orange-500/20 to-transparent',
    label: 'BIENVENIDO',
    title: 'Hoy comienza\ntu mejor versión',
    desc: 'Winner Evolux no es solo una app de entrenamiento. Es tu sistema completo de evolución: cuerpo, mente y hábitos.',
    highlight: null,
  },
  {
    icon: Dumbbell,
    color: '#FF4D00',
    gradient: 'from-orange-500/20 to-transparent',
    label: 'CUERPO',
    title: 'Entrená con\npropósito real',
    desc: 'Rutinas diseñadas por tu coach, registrá cada serie, cada rep, cada PR. Cada sesión cuenta. Cada esfuerzo queda guardado.',
    highlight: '💪 Tu progreso nunca desaparece',
  },
  {
    icon: BarChart3,
    color: '#FFB800',
    gradient: 'from-yellow-500/20 to-transparent',
    label: 'EVOLUCIÓN',
    title: 'Medí quién eras\ny quién sos',
    desc: 'Evaluaciones físicas, composición corporal, tu Winner Score. Los números no mienten — y van a sorprenderte.',
    highlight: '📊 Lo que se mide, se mejora',
  },
  {
    icon: Brain,
    color: '#A855F7',
    gradient: 'from-purple-500/20 to-transparent',
    label: 'MENTE',
    title: 'El juego mental\nes el más importante',
    desc: 'Coaching de hábitos, mindset, bienestar. Tu coach te acompaña más allá del gym. La disciplina se entrena, no se nace con ella.',
    highlight: '🧠 Mente fuerte = cuerpo fuerte',
  },
  {
    icon: Heart,
    color: '#EC4899',
    gradient: 'from-pink-500/20 to-transparent',
    label: 'HÁBITOS',
    title: 'Los pequeños\nactos construyen\ngrandeza',
    desc: 'Hidratación, sueño, nutrición, energía. Registrá tus hábitos diarios y construí la persona que querés ser.',
    highlight: '🔥 La constancia gana siempre',
  },
  {
    icon: Users,
    color: '#00C896',
    gradient: 'from-emerald-500/20 to-transparent',
    label: 'COMUNIDAD',
    title: 'No entrenás\nsolo/a',
    desc: 'El feed, el chat con tu coach, los logros compartidos. Tu entorno define tu nivel. Acá el entorno es de campeones.',
    highlight: '🏆 La tribu te impulsa',
  },
  {
    icon: Flame,
    color: '#FF4D00',
    gradient: 'from-orange-500/20 to-transparent',
    label: '¡ARRANCÁ!',
    title: 'Todo está listo.\nSolo faltabas vos.',
    desc: 'Tu coach ya tiene tu plan preparado. Un año desde hoy, vas a agradecer haber empezado hoy.',
    highlight: null,
    isLast: true,
  },
];

export default function WelcomeScreen({ onClose }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const progress = ((step + 1) / steps.length) * 100;

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: current.color }}
              initial={{ width: `${((step) / steps.length) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Background glow */}
          <div
            className="absolute top-0 left-0 right-0 h-64 opacity-30"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${current.color}30 0%, transparent 70%)` }}
          />

          <div className="relative p-8 pt-10">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-6"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}
            >
              <Star size={10} style={{ color: current.color }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: current.color }}>{current.label}</span>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: `${current.color}15`, border: `2px solid ${current.color}30` }}
            >
              <Icon size={36} style={{ color: current.color }} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl font-black text-white leading-tight mb-4 whitespace-pre-line"
            >
              {current.title}
            </motion.h2>

            {/* Desc */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-gray-400 text-sm leading-relaxed mb-5"
            >
              {current.desc}
            </motion.p>

            {/* Highlight */}
            {current.highlight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 py-3 rounded-xl text-sm font-semibold mb-6"
                style={{ background: `${current.color}12`, border: `1px solid ${current.color}25`, color: current.color }}
              >
                {current.highlight}
              </motion.div>
            )}

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mb-6">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300 cursor-pointer"
                  onClick={() => i < step && setStep(i)}
                  style={{
                    width: i === step ? 24 : 6,
                    height: 6,
                    background: i === step ? current.color : i < step ? `${current.color}50` : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-base transition-all hover:opacity-90"
              style={{ background: current.color }}
            >
              {current.isLast ? (
                <>¡Vamos a evolucionar! 🔥</>
              ) : (
                <>Siguiente <ArrowRight size={18} /></>
              )}
            </motion.button>

            {!current.isLast && (
              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Saltar introducción
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}