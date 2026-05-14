import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, CheckCircle, MessageCircle, Dumbbell, BarChart3, Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const WHATSAPP_NUMBER = '543878215867';

const benefits = [
  { icon: Dumbbell, text: 'Gestión completa de alumnos y rutinas' },
  { icon: BarChart3, text: 'Evaluaciones ISAK y composición corporal' },
  { icon: Brain, text: 'Coaching de hábitos y mindset' },
  { icon: Users, text: 'Feed comunitario y chat directo' },
];

export default function CoachRegister() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gym_name: '',
    city: '',
    disciplines: '',
    students_count: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('registerCoach', form);

      // Abrir WhatsApp con mensaje automático
      const msg = encodeURIComponent(
        `🏆 *Nuevo Coach Interesado - Winner Evolux*\n\n` +
        `👤 *Nombre:* ${form.full_name}\n` +
        `📧 *Email:* ${form.email}\n` +
        `📱 *Teléfono:* ${form.phone}\n` +
        `🏟️ *Gym/Academia:* ${form.gym_name || 'No especificó'}\n` +
        `📍 *Ciudad:* ${form.city || 'No especificó'}\n` +
        `💪 *Disciplinas:* ${form.disciplines || 'No especificó'}\n` +
        `👥 *Alumnos aprox:* ${form.students_count || 'No especificó'}\n` +
        `💬 *Mensaje:* ${form.message || 'Sin mensaje adicional'}`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
      setDone(true);
    } catch (err) {
      setError('Hubo un error. Intentá de nuevo.');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="font-display text-3xl font-black text-white mb-3">¡Registro enviado!</h2>
          <p className="text-gray-400 mb-6">
            Tu solicitud fue guardada y se abrió WhatsApp para que nos contactemos directo. 
            Te respondemos en menos de 24hs. 🚀
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">
            Volver al inicio
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-3">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white">WINNER</span>
            <span className="text-[10px] text-primary font-semibold ml-1 tracking-widest">EVOLUX</span>
          </div>
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-start">
        {/* Left - Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(255,77,0,0.12)', border: '1px solid rgba(255,77,0,0.25)' }}>
            <MessageCircle size={12} className="text-primary" />
            <span className="text-xs font-bold text-primary tracking-wider">SER COACH EVOLUX</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Llevá tu academia<br />
            <span className="text-primary">al siguiente nivel</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            Únete a la red de coaches que ya están usando Winner Evolux para transformar la experiencia de sus alumnos. 
            Registrate y te contactamos directamente.
          </p>

          <div className="space-y-3">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,77,0,0.12)' }}>
                  <Icon size={15} className="text-primary" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right - Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl p-6 md:p-8" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-display text-xl font-bold text-white mb-6">Quiero ser Coach Evolux</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Nombre completo *</label>
                  <Input
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">WhatsApp *</label>
                  <Input
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="11 1234 5678"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Gym / Academia</label>
                  <Input
                    value={form.gym_name}
                    onChange={e => update('gym_name', e.target.value)}
                    placeholder="Nombre del gym"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <Input
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                    placeholder="Tu ciudad"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Disciplinas</label>
                  <Input
                    value={form.disciplines}
                    onChange={e => update('disciplines', e.target.value)}
                    placeholder="CrossFit, Musculación..."
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">¿Cuántos alumnos tenés?</label>
                  <Input
                    value={form.students_count}
                    onChange={e => update('students_count', e.target.value)}
                    placeholder="Aprox. 20"
                    className="bg-background border-border"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">¿Algo que quieras contarnos?</label>
                  <textarea
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Contanos sobre tu academia, tus objetivos..."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-semibold gap-2"
              >
                {loading ? 'Enviando...' : (
                  <>Quiero unirme <ArrowRight size={16} /></>
                )}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                Al enviar, se abrirá WhatsApp para contacto directo. Sin compromiso.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}