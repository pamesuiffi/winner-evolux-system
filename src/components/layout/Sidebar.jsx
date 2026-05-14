import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Users, MessageCircle,
  BookOpen, Settings, ChevronLeft, ChevronRight,
  Zap, Trophy, Heart, Calendar, ClipboardList, UserCheck, CreditCard, Apple, TrendingUp
} from 'lucide-react';

const coachNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Alumnos', path: '/students' },
  { icon: Dumbbell, label: 'Ejercicios', path: '/exercises' },
  { icon: BookOpen, label: 'Mi Biblioteca', path: '/exercise-library' },
  { icon: ClipboardList, label: 'Rutinas', path: '/routines' },
  { icon: UserCheck, label: 'Asistencia', path: '/attendance' },
  { icon: Heart, label: 'Evaluaciones', path: '/evaluations' },
  { icon: Zap, label: 'Feed', path: '/feed' },
  { icon: MessageCircle, label: 'Mensajes', path: '/messages' },
  { icon: Apple, label: 'Nutrición', path: '/nutrition' },
  { icon: TrendingUp, label: 'Progresión', path: '/progression' },
  { icon: BookOpen, label: 'Coaching', path: '/coaching' },
  { icon: CreditCard, label: 'Membresías', path: '/payments' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
];

const studentNav = [
  { icon: LayoutDashboard, label: 'Mi Dashboard', path: '/my-dashboard' },
  { icon: Trophy, label: 'Mis PRs', path: '/my-dashboard' },
  { icon: Zap, label: 'Feed', path: '/feed' },
  { icon: MessageCircle, label: 'Mensajes', path: '/messages' },
  { icon: BookOpen, label: 'Coaching', path: '/coaching' },
  { icon: CreditCard, label: 'Membresías', path: '/payments' },
];


export default function Sidebar({ collapsed, setCollapsed, user }) {
  const location = useLocation();
  const navItems = (user?.role === 'student' || user?.role === 'user') ? studentNav : coachNav;

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ background: '#0D0D0D', borderRight: '1px solid rgba(255,77,0,0.15)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-white/5">
        {user?.logo_url ? (
          <>
            <img src={user.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-contain flex-shrink-0" />
            {!collapsed && (
              <div>
                <p className="font-display text-white text-sm font-bold leading-tight truncate">{user?.display_name || user?.full_name}</p>
                <p className="text-[10px] font-semibold text-primary">Tu Academia</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
              <Trophy size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="font-display text-white text-sm font-bold leading-tight tracking-widest">WINNER</p>
                <p className="text-[10px] font-semibold" style={{ color: '#FF4D00' }}>EVOLUX SYSTEM</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${active ? 'text-white bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={18} style={{ color: active ? '#FF4D00' : undefined }} className={active ? '' : 'group-hover:text-orange-500 transition-colors'} />
              {!collapsed && (
                <span className="font-medium text-sm">{label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Collapse */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{user.full_name?.[0] || '?'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}