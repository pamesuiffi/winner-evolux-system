import { useState } from 'react';
import { CreditCard, Zap, Trophy, Star, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 8000,
    color: '#888',
    icon: Zap,
    checkoutUrl: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=69baef616e26474f95e1ec2a86f69a34',
    features: ['Acceso al Feed', 'Chat con coach', 'Rutinas básicas', '1 evaluación/mes'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    color: '#FF4D00',
    popular: true,
    icon: Trophy,
    checkoutUrl: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=d65aa349bad0466fad989f2fbca9cc96',
    features: ['Todo lo de Starter', 'Evaluaciones ISAK ilimitadas', 'Nutrición personalizada', 'Asistente IA Evolux', 'Seguimiento de hábitos'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 25000,
    color: '#FFB800',
    icon: Star,
    checkoutUrl: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=e3665aa80373432a98946f67fd9b5781',
    features: ['Todo lo de Pro', 'Sesiones 1:1 con coach', 'Plan nutricional avanzado', 'Acceso prioritario', 'Análisis de competencia'],
  },
];

export default function Payments() {
  const { user } = useOutletContext() || {};
  const [error, setError] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');

  const handlePay = (plan) => {
    if (plan.checkoutUrl) {
      window.open(plan.checkoutUrl, '_blank');
    } else {
      setError('Este plan aún no está disponible. Contactá a tu coach.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="font-display text-4xl text-white tracking-wider">MEMBRESÍAS</h1>
        <p className="text-gray-400 text-sm mt-1">Elegí tu plan y pagá con Mercado Pago 💳</p>
      </div>

      {/* Status banners */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)' }}>
          <CheckCircle size={20} style={{ color: '#00C896' }} />
          <div>
            <p className="text-white font-semibold">¡Pago exitoso! 🏆</p>
            <p className="text-sm text-gray-400">Tu membresía fue activada. ¡A entrenar, campeón!</p>
          </div>
        </div>
      )}
      {status === 'failure' && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.3)' }}>
          <AlertCircle size={20} style={{ color: '#FF4D00' }} />
          <div>
            <p className="text-white font-semibold">Pago rechazado</p>
            <p className="text-sm text-gray-400">Hubo un problema. Intentá de nuevo o elegí otro método.</p>
          </div>
        </div>
      )}
      {status === 'pending' && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)' }}>
          <Loader2 size={20} style={{ color: '#FFB800' }} className="animate-spin" />
          <div>
            <p className="text-white font-semibold">Pago pendiente</p>
            <p className="text-sm text-gray-400">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm text-red-400" style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)' }}>
          {error}
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon;

          return (
            <div key={plan.id} className="rounded-2xl p-6 flex flex-col gap-5 relative"
              style={{
                background: plan.popular ? 'rgba(255,77,0,0.07)' : '#111',
                border: `1px solid ${plan.popular ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: '#FF4D00' }}>
                  MÁS POPULAR
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.color}20` }}>
                  <Icon size={20} style={{ color: plan.color }} />
                </div>
                <div>
                  <p className="font-display text-lg text-white font-bold">{plan.name}</p>
                  <p className="text-xs text-gray-500">por mes</p>
                </div>
              </div>

              <div>
                <span className="text-3xl font-display font-bold text-white">
                  ${plan.price.toLocaleString('es-AR')}
                </span>
                <span className="text-gray-500 text-sm ml-1">ARS</span>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePay(plan)}
                disabled={!plan.checkoutUrl}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{
                  background: plan.popular ? '#FF4D00' : 'transparent',
                  border: plan.popular ? 'none' : `1px solid ${plan.color}`,
                  color: plan.popular ? 'white' : plan.color,
                }}>
                <CreditCard size={16} />
                {plan.checkoutUrl ? 'Suscribirse con Mercado Pago' : 'Próximamente'}
                {plan.checkoutUrl && <ExternalLink size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* MP info */}
      <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,148,255,0.15)' }}>
          <CreditCard size={20} style={{ color: '#0094FF' }} />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Pagos seguros con Mercado Pago</p>
          <p className="text-gray-400 text-xs mt-0.5">Aceptamos crédito, débito, transferencia bancaria y cuotas sin interés. Nunca compartimos tu información de pago.</p>
        </div>
      </div>
    </div>
  );
}