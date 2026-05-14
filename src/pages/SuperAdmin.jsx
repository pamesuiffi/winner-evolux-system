import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Users, MessageCircle, CheckCircle, XCircle, Clock, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  contactado: { label: 'Contactado', color: '#0094FF', bg: 'rgba(0,148,255,0.1)' },
  activo: { label: 'Activo', color: '#00C896', bg: 'rgba(0,200,150,0.1)' },
  rechazado: { label: 'Rechazado', color: '#FF4D00', bg: 'rgba(255,77,0,0.1)' },
};

const PLAN_LABELS = {
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite',
  sin_plan: 'Sin plan',
};

const WHATSAPP_NUMBER_BASE = '549';

export default function SuperAdmin() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editNotes, setEditNotes] = useState({});
  const qc = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['coach_registrations'],
    queryFn: () => base44.entities.CoachRegistration.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CoachRegistration.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach_registrations'] }),
  });

  const filtered = registrations.filter(r => {
    const matchSearch = !search ||
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase()) ||
      r.gym_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: registrations.length,
    pendiente: registrations.filter(r => r.status === 'pendiente').length,
    contactado: registrations.filter(r => r.status === 'contactado').length,
    activo: registrations.filter(r => r.status === 'activo').length,
    rechazado: registrations.filter(r => r.status === 'rechazado').length,
  };

  const openWhatsApp = (phone) => {
    const clean = phone.replace(/\D/g, '');
    const num = clean.startsWith('54') ? clean : `549${clean}`;
    window.open(`https://wa.me/${num}`, '_blank');
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white">SUPER ADMIN</h1>
            <p className="text-gray-500 text-xs">Panel de control — Winner Evolux</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'all', label: 'Total', icon: Users },
            { key: 'pendiente', label: 'Pendientes', icon: Clock },
            { key: 'contactado', label: 'Contactados', icon: MessageCircle },
            { key: 'activo', label: 'Activos', icon: CheckCircle },
            { key: 'rechazado', label: 'Rechazados', icon: XCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: filterStatus === key ? 'rgba(255,77,0,0.12)' : '#111',
                border: filterStatus === key ? '1px solid rgba(255,77,0,0.35)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Icon size={16} className={filterStatus === key ? 'text-primary' : 'text-gray-500'} />
              <p className="text-2xl font-display font-bold text-white mt-1">{counts[key]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, ciudad..."
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay registros aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pendiente;
              return (
                <div
                  key={r.id}
                  className="rounded-xl p-4 md:p-5"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm">{r.full_name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                          {st.label}
                        </span>
                        {r.plan && r.plan !== 'sin_plan' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}>
                            {PLAN_LABELS[r.plan]}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Email:</span> {r.email}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Tel:</span> {r.phone}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Gym:</span> {r.gym_name || '—'}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Ciudad:</span> {r.city || '—'}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Disciplinas:</span> {r.disciplines || '—'}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-600">Alumnos:</span> {r.students_count || '—'}</p>
                        <p className="text-xs text-gray-400 col-span-2">
                          <span className="text-gray-600">Registrado:</span> {new Date(r.created_date).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      {r.message && (
                        <p className="text-xs text-gray-500 mt-2 italic">"{r.message}"</p>
                      )}

                      {/* Notes */}
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Notas internas..."
                          defaultValue={r.notes || ''}
                          onBlur={e => {
                            if (e.target.value !== r.notes) {
                              updateMutation.mutate({ id: r.id, data: { notes: e.target.value } });
                            }
                          }}
                          className="w-full text-xs px-2 py-1.5 rounded-lg bg-background border border-border text-gray-400 placeholder-gray-600 focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => openWhatsApp(r.phone)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </Button>

                      <select
                        value={r.status}
                        onChange={e => {
                          const newStatus = e.target.value;
                          // Si cambias a "activo", invita al usuario automáticamente
                          if (newStatus === 'activo' && !r.user_id) {
                            base44.users.inviteUser(r.email, 'admin').then(() => {
                              updateMutation.mutate({ id: r.id, data: { status: newStatus } });
                            }).catch(() => {
                              alert('Error al invitar. Intenta de nuevo.');
                            });
                          } else {
                            updateMutation.mutate({ id: r.id, data: { status: newStatus } });
                          }
                        }}
                        className="text-xs px-2 py-1.5 rounded-lg bg-background border border-border text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="contactado">Contactado</option>
                        <option value="activo">✓ Activar (invita)</option>
                        <option value="rechazado">Rechazado</option>
                      </select>

                      <select
                        value={r.plan || 'sin_plan'}
                        onChange={e => updateMutation.mutate({ id: r.id, data: { plan: e.target.value } })}
                        className="text-xs px-2 py-1.5 rounded-lg bg-background border border-border text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="sin_plan">Sin plan</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="elite">Elite</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}