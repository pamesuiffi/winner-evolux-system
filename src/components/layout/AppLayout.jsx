import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { base44 } from '@/api/base44Client';
import EvoluxAIChat from '@/components/ai/EvoluxAIChat';
import WelcomeScreen from '@/components/ui/WelcomeScreen';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Solo mostrar bienvenida a alumnos nuevos
      if (u?.role === 'student') {
        const key = `welcome_seen_${u.id}`;
        const seen = localStorage.getItem(key);
        if (!seen) setShowWelcome(true);
      }
    }).catch(() => {});
  }, []);

  const handleCloseWelcome = () => {
    if (user?.id) localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      <TopBar collapsed={collapsed} user={user} />
      <main
        className="transition-all duration-300 pt-14 min-h-screen"
        style={{ marginLeft: collapsed ? '64px' : '240px' }}
      >
        <div className="p-4 md:p-6">
          <Outlet context={{ user }} />
        </div>
      </main>
      <EvoluxAIChat user={user} />
      {showWelcome && <WelcomeScreen onClose={handleCloseWelcome} />}
    </div>
  );
}