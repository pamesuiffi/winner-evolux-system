import { X, QrCode, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function QRModal({ onClose }) {
  const appUrl = window.location.origin;
  const demoUrl = `${appUrl}/demo`;
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(demoUrl)}`;
    setQrUrl(url);
  }, [demoUrl]);

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="relative rounded-2xl p-6 max-w-sm w-full" style={{ background: '#111', border: '1px solid rgba(255,184,0,0.3)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,184,0,0.15)' }}>
            <QrCode size={24} style={{ color: '#FFB800' }} />
          </div>
          <h3 className="font-bebas text-2xl text-white mb-1">ESCANEA Y PRUEBA</h3>
          <p className="text-gray-400 text-sm mb-5">Escanea con tu cámara para crear una cuenta de prueba gratis</p>

          {/* QR Code - Generated dynamically */}
          <div className="mx-auto rounded-xl flex items-center justify-center mb-4" style={{ background: 'white', padding: '12px' }}>
            <img 
              src={qrUrl}
              alt="QR Code"
              className="w-48 h-48 rounded-lg"
              loading="eager"
            />
          </div>

          <p className="text-xs text-gray-500 mb-4">{demoUrl}</p>

          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)' }}>
            <Smartphone size={16} style={{ color: '#FF4D00' }} />
            <p className="text-xs text-gray-300">También puedes instalar la app desde tu navegador móvil usando "Añadir a pantalla de inicio"</p>
          </div>
        </div>
      </div>
    </div>
  );
}