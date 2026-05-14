import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Dumbbell, BarChart3, Brain, Users, Zap, ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import InstallButton from '@/components/InstallButton';

const features = [
  { icon: Dumbbell, title: 'Entrenamiento Universal', desc: 'CrossFit, Musculación, Calistenia, HIIT y más. Cualquier disciplina, un solo sistema.', color: 'text-primary' },
  { icon: BarChart3, title: 'Evaluaciones ISAK', desc: 'Antropometría completa, somatotipo Heath-Carter, composición corporal profesional.', color: 'text-accent' },
  { icon: Brain, title: 'Coaching & Mindset', desc: 'Hábitos, bienestar, Rueda de la Vida. Entrena el cuerpo y la mente.', color: 'text-success' },
  { icon: Users, title: 'Comunidad', desc: 'Feed social, chat directo, celebra PRs y logros con tu equipo.', color: 'text-primary' },
];

const plans = [
  { name: 'Starter', price: '$19', period: '/mes', features: ['Hasta 10 alumnos', 'Ejercicios ilimitados', 'Evaluaciones ISAK', 'Chat directo', 'Feed comunitario'], popular: false },
  { name: 'Pro', price: '$49', period: '/mes', features: ['Hasta 50 alumnos', 'Todo de Starter', 'Rutinas avanzadas', 'Informes PDF', 'Coaching & Mindset'], popular: true },
  { name: 'Elite', price: '$99', period: '/mes', features: ['Alumnos ilimitados', 'Todo de Pro', 'Marca blanca (tu logo)', 'Soporte prioritario', 'API access'], popular: false },
];

export default function Landing() {
  const handleStart = () => {
    base44.auth.redirectToLogin('/dashboard');
  };

  const handleDemo = () => {
    window.location.href = '/demo';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm">WINNER</span>
              <span className="text-[10px] text-primary font-semibold ml-1 tracking-widest">EVOLUX</span>
            </div>
          </div>
          <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 gap-2">
            Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </Button>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Plataforma integral para coaches de fitness</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-tight">
              WINNER<br />
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                EVOLUX SYSTEM
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              La plataforma todo-en-uno para profesores de fitness. Entrenamiento, nutrición, coaching y comunidad en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Button onClick={handleDemo} size="lg" className="bg-primary hover:bg-primary/90 gap-2 text-base px-8 h-12">
                Comenzar Gratis <ArrowRight className="w-5 h-5" />
              </Button>
              <InstallButton />
              <p className="text-sm text-muted-foreground">14 días de prueba gratuita • Sin tarjeta</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Todo lo que necesitás para<br /><span className="text-primary">evolucionar tu academia</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <IconComp className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Planes simples,<br /><span className="text-accent">resultados extraordinarios</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border p-6 transition-all ${
                  plan.popular 
                    ? 'border-primary bg-card glow-orange scale-105' 
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="flex items-center gap-1 text-primary text-xs font-bold mb-3">
                    <Star className="w-3 h-3 fill-primary" /> MÁS POPULAR
                  </div>
                )}
                <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-display font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleDemo}
                  className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'}`}
                >
                  Empezar ahora
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Coaches */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.12) 0%, rgba(255,184,0,0.08) 100%)', border: '1px solid rgba(255,77,0,0.25)' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(255,77,0,0.15)', border: '1px solid rgba(255,77,0,0.3)' }}>
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wider">PARA COACHES</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
                ¿Sos coach o instructor?<br />
                <span className="text-primary">Sumate a la red Evolux</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                Usá Winner Evolux en tu academia. Registrate y te contactamos directo por WhatsApp para conocer tu proyecto y activar tu cuenta.
              </p>
              <Button
                onClick={() => window.location.href = '/coach-register'}
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2 text-base px-8 h-12"
              >
                Quiero ser Coach Evolux <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">WINNER EVOLUX SYSTEM</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Winner Evolux System. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}