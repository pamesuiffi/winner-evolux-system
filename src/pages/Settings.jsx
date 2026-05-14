import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Save, User, Shield, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const planInfo = {
  trial: { label: 'Prueba Gratuita', color: 'bg-muted text-muted-foreground', limit: '14 días' },
  starter: { label: 'Starter', color: 'bg-primary/15 text-primary', limit: 'Hasta 10 alumnos' },
  pro: { label: 'Pro', color: 'bg-accent/15 text-accent', limit: 'Hasta 50 alumnos' },
  elite: { label: 'Elite', color: 'bg-success/15 text-success', limit: 'Alumnos ilimitados + Marca blanca' },
};

export default function Settings() {
  const { user, setUser } = useOutletContext();
  const [form, setForm] = useState({
    display_name: user?.display_name || user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(user?.logo_url || '');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ ...form, logo_url: logoUrl });
    setUser(prev => ({ ...prev, ...form, logo_url: logoUrl }));
    setSaving(false);
    toast.success('Perfil actualizado');
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    await base44.auth.updateMe({ logo_url: file_url });
    setUser(prev => ({ ...prev, logo_url: file_url }));
    setUploadingLogo(false);
    toast.success('Logo actualizado');
  };

  const plan = planInfo[user?.plan] || planInfo.trial;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold">Configuración</h1>

      {/* Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Tu Plan</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${plan.color} px-3 py-1`}>{plan.label}</Badge>
          <span className="text-sm text-muted-foreground">{plan.limit}</span>
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Personalización de tu Academia</h2>
        </div>
        
        {/* Logo */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-sm font-semibold mb-4">Logo</h3>
          <div className="flex items-center gap-5">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: '#1a1a1a', border: '2px dashed rgba(255,255,255,0.1)' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={28} className="text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">Subí el logo de tu academia o gym. Se mostrará en tu perfil y en los informes.</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="gap-2 border-border"
              >
                {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploadingLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              {logoUrl && (
                <button onClick={() => { setLogoUrl(''); base44.auth.updateMe({ logo_url: '' }); setUser(prev => ({ ...prev, logo_url: '' })); }}
                  className="ml-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
          💡 Consejo: Crea tu biblioteca personal de ejercicios con videos en{' '}
          <a href="/exercise-library" className="text-primary hover:underline font-semibold">
            Mi Biblioteca
          </a>
          {' '}y asígnalos a tus rutinas. Tus estudiantes verán todos los ejercicios con tus videos.
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Nombre para mostrar</Label>
            <Input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} className="bg-secondary border-border" />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-secondary border-border" />
          </div>
          <div>
            <Label>Bio / Descripción</Label>
            <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="bg-secondary border-border" rows={3} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </motion.div>


      </div>
      );
      }