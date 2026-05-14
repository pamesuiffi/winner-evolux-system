import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Activity, Clock, AlertTriangle, ChevronRight, X, Save, Pencil } from 'lucide-react';

function getStatusColor(lastActivity) {
  if (!lastActivity) return { color: '#FF3B3B', label: 'Sin actividad', dot: 'bg-red-500' };
  const diff = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
  if (diff <= 7) return { color: '#00C896', label: 'Activo', dot: 'bg-emerald-400' };
  if (diff <= 14) return { color: '#FFB800', label: 'Inactivo', dot: 'bg-yellow-400' };
  return { color: '#FF3B3B', label: 'Inactivo +14d', dot: 'bg-red-500' };
}

const INITIAL_FORM = {
  full_name: '', email: '', phone: '', gender: 'male',
  discipline: 'Crossfit', goal: 'maintenance', activity_level: 'moderate', plan: 'starter'
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.Student.list().then(data => {
      setStudents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      gender: student.gender || 'male',
      discipline: student.discipline || '',
      goal: student.goal || 'maintenance',
      activity_level: student.activity_level || 'moderate',
      plan: student.plan || 'starter',
      notes: student.notes || '',
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingStudent(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingStudent) {
      await base44.entities.Student.update(editingStudent.id, form);
    } else {
      await base44.entities.Student.create({ ...form, coach_id: currentUser?.id, last_activity: new Date().toISOString().split('T')[0], winner_score: 50 });
    }
    setSaving(false);
    setShowForm(false);
    setForm(INITIAL_FORM);
    setEditingStudent(null);
    load();
  };

  const statusCounts = {
    active: students.filter(s => {
      const diff = s.last_activity ? (new Date() - new Date(s.last_activity)) / 86400000 : 999;
      return diff <= 7;
    }).length,
    warning: students.filter(s => {
      const diff = s.last_activity ? (new Date() - new Date(s.last_activity)) / 86400000 : 999;
      return diff > 7 && diff <= 14;
    }).length,
    inactive: students.filter(s => {
      const diff = s.last_activity ? (new Date() - new Date(s.last_activity)) / 86400000 : 999;
      return diff > 14;
    }).length,
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">ALUMNOS</h1>
          <p className="text-gray-400 text-sm">{students.length} alumnos registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}
        >
          <Plus size={16} /> Nuevo Alumno
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Activity, label: 'Activos', count: statusCounts.active, color: '#00C896' },
          { icon: Clock, label: '7-14 días', count: statusCounts.warning, color: '#FFB800' },
          { icon: AlertTriangle, label: 'Inactivos', count: statusCounts.inactive, color: '#FF3B3B' },
        ].map(({ icon: Icon, label, count, color }) => (
          <div key={label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="font-bebas text-2xl text-white">{count}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Search size={16} className="text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar alumno..."
          className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-gray-600"
        />
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: '#111' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => {
            const status = getStatusColor(student.last_activity);
            return (
              <div key={student.id} className="card-hover rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
                      {student.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.discipline || 'Sin disciplina'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: status.color }}></div>
                      <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
                    </div>
                    <button onClick={() => openEdit(student)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="font-bebas text-xl" style={{ color: '#FF4D00' }}>{student.winner_score || 50}</div>
                    <div className="text-xs text-gray-500">W. Score</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="font-bebas text-xl text-white capitalize">{student.plan || 'starter'}</div>
                    <div className="text-xs text-gray-500">Plan</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{student.email}</span>
                  {student.notes && <span className="text-xs text-gray-600 italic truncate max-w-[120px]">{student.notes}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Student Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.3)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bebas text-2xl text-white tracking-wider">{editingStudent ? 'EDITAR ALUMNO' : 'NUEVO ALUMNO'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {[
                { field: 'full_name', label: 'Nombre completo', type: 'text' },
                { field: 'email', label: 'Email', type: 'email' },
                { field: 'phone', label: 'Teléfono', type: 'tel' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', focusBorderColor: '#FF4D00' }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Género</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Plan</label>
                  <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Disciplina principal</label>
                <input
                  value={form.discipline}
                  onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Ej: CrossFit, Musculación..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notas internas</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Observaciones, lesiones, objetivos..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditingStudent(null); }} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.full_name}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}