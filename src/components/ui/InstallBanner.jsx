import { useState, useEffect } from 'react';
import { X, Download, Chrome, Apple, Smartphone } from 'lucide-react';

export default function InstallBanner({ onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') onClose();
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="relative rounded-2xl p-6 max-w-md w-full" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.3)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
            <Download size={28} className="text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white">INSTALAR LA APP</h3>
          <p className="text-gray-400 text-sm mt-1">Accedé más rápido desde tu dispositivo</p>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full py-3 rounded-xl font-bold text-white mb-4 flex items-center justify-center gap-2"
            style={{ background: '#FF4D00' }}
          >
            <Download size={18} />
            Instalar ahora
          </button>
        )}

        <div className="space-y-3">
          {isIOS ? (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Apple size={20} style={{ color: '#FFB800' }} />
                <span className="font-semibold text-white text-sm">iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-gray-400 text-xs space-y-1 ml-8">
                <li>1. Abrí la app en Safari</li>
                <li>2. Tocá el ícono de compartir □↑</li>
                <li>3. Seleccioná "Añadir a pantalla de inicio"</li>
              </ol>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Chrome size={20} style={{ color: '#FFB800' }} />
                  <span className="font-semibold text-white text-sm">Android / Chrome</span>
                </div>
                <ol className="text-gray-400 text-xs space-y-1 ml-8">
                  <li>1. Abrí en Chrome</li>
                  <li>2. Tocá el menú ⋮ (tres puntos)</li>
                  <li>3. Seleccioná "Instalar app" o "Añadir a pantalla de inicio"</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone size={20} style={{ color: '#FFB800' }} />
                  <span className="font-semibold text-white text-sm">PC / Escritorio</span>
                </div>
                <ol className="text-gray-400 text-xs space-y-1 ml-8">
                  <li>1. Buscá el ícono de instalación en la barra de dirección</li>
                  <li>2. Hacé clic en "Instalar Winner Evolux System"</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          La aplicación funciona sin conexión una vez instalada
        </p>
      </div>
    </div>
  );
}