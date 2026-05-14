import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Mail, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoSignup() {
  const [step, setStep] = useState('form'); // form, loading, success, error
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      setError('Por favor completa tu nombre y email');
      return;
    }

    setStep('loading');
    setError('');

    try {
      // Call backend to create demo account
      const response = await base44.functions.invoke('createDemoAccount', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone
      });

      if (response.data?.success) {
        setStep('success');
        setTimeout(() => {
          base44.auth.redirectToLogin('/dashboard');
        }, 2000);
      } else {
        setStep('error');
        setError(response.data?.message || 'Error al crear la cuenta de prueba');
      }
    } catch (err) {
      setStep('error');
      setError(err.message || 'Error al crear la cuenta de prueba');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black mb-2">WINNER EVOLUX</h1>
          <p className="text-muted-foreground">Prueba la plataforma gratis</p>
        </div>

        {/* Form */}
        {step === 'form' && (
          <div className="bg-card rounded-2xl border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Tu nombre"
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Teléfono (opcional)
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="bg-secondary border-border"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 h-11 text-base"
              >
                Crear cuenta de prueba
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                14 días gratis • Sin tarjeta requerida
              </p>
            </form>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <p className="text-foreground font-medium">Creando tu cuenta...</p>
            <p className="text-muted-foreground text-sm mt-2">Esto solo toma un momento</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <p className="text-foreground font-display font-bold text-lg mb-2">¡Cuenta creada!</p>
            <p className="text-muted-foreground text-sm mb-4">
              Te redireccionamos al dashboard en unos segundos...
            </p>
            <p className="text-xs text-muted-foreground">
              Si no se redirige automáticamente, haz clic en Iniciar Sesión
            </p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
            <Button
              onClick={() => setStep('form')}
              variant="outline"
              className="w-full border-border"
            >
              Intentar de nuevo
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            ¿Sos coach? <a href="/coach-register" className="text-primary hover:underline font-medium">Registrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}