import { Search, QrCode, Download } from 'lucide-react';
import { useState } from 'react';
import QRModal from '../ui/QRModal';
import InstallBanner from '../ui/InstallBanner';
import NotificationBell from './NotificationBell';

export default function TopBar({ collapsed, user }) {
  const [showQR, setShowQR] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-40 h-14 flex items-center justify-between px-4 transition-all duration-300`}
        style={{
          left: collapsed ? '64px' : '240px',
          background: `${user?.logo_url ? 'rgba(10,10,10,0.98)' : 'rgba(10,10,10,0.95)'}`,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Logo si está personalizado */}
        {user?.logo_url && (
          <img src={user.logo_url} alt="Logo" className="h-8 w-auto mr-4 object-contain" />
        )}
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 w-64">
          <Search size={14} className="text-gray-500" />
          <input
            placeholder="Buscar alumnos, ejercicios..."
            className="bg-transparent text-sm text-gray-300 outline-none w-full placeholder:text-gray-600"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10"
            style={{ color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">QR App</span>
          </button>
          <button
            onClick={() => setShowInstall(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#FF4D00', color: 'white' }}
          >
            <Download size={14} />
            <span className="hidden sm:inline">Instalar</span>
          </button>
          <NotificationBell user={user} />
        </div>
      </header>

      {showQR && <QRModal onClose={() => setShowQR(false)} />}
      {showInstall && <InstallBanner onClose={() => setShowInstall(false)} />}
    </>
  );
}