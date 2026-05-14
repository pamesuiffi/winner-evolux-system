import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MUSCLE_GROUPS as MUSCLE_GROUPS_FULL, EQUIPMENT_TYPES, INTENSITY_TECHNIQUES, ENVIRONMENTS } from '@/lib/exerciseData';
import { base44 } from '@/api/base44Client';
import { Video, Upload, X, Link } from 'lucide-react';

const disciplines = [
  { value: 'musculacion', label: 'Musculación' }, { value: 'crossfit', label: 'CrossFit' },
  { value: 'calistenia', label: 'Calistenia' }, { value: 'hiit', label: 'HIIT' },
  { value: 'movilidad', label: 'Movilidad' }, { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'kettlebell', label: 'Kettlebell' }, { value: 'yoga', label: 'Yoga' },
  { value: 'hibrido', label: 'Híbrido' }, { value: 'atletismo', label: 'Atletismo' },
];

const metricTypes = [
  { value: 'weight_reps', label: 'Peso × Repeticiones' }, { value: 'time', label: 'Tiempo' },
  { value: 'distance', label: 'Distancia' }, { value: 'rounds_reps', label: 'Rondas × Reps' },
  { value: 'hold_time', label: 'Tiempo sostenido' }, { value: 'custom', label: 'Personalizado' },
];

const movements = [
  'empuje_horizontal', 'empuje_vertical', 'traccion_horizontal', 'traccion_vertical',
  'bisagra', 'sentadilla', 'cargada', 'rotacion', 'core', 'locomocion', 'otro'
];

const defaultForm = {
  name: '', alternate_name: '', disciplines: [], movement_pattern: 'otro',
  primary_muscles: [], secondary_muscles: [], equipment: '',
  video_url: '', coaching_cues: '', common_errors: '',
  easier_variation: '', harder_variation: '', metric_type: 'weight_reps',
  level: 'intermedio', description: '',
  muscle_group: '', equipment_type: '', environment: 'gym',
  intensity_technique: 'normal', tempo: '2-0-2-0',
  sets_range: '3-4', reps_range: '8-12', tips: '',
  calories_per_minute: null, muscle_3d_map: [], secondary_muscles_3d: [],
};

export default function ExerciseFormDialog({ open, onOpenChange, exercise, onSave }) {
  const [form, setForm] = useState(defaultForm);
  const [primaryMuscleInput, setPrimaryMuscleInput] = useState('');
  const [secondaryMuscleInput, setSecondaryMuscleInput] = useState('');
  const [tab, setTab] = useState('basico');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMode, setVideoMode] = useState('url'); // 'url' | 'upload'
  const fileInputRef = useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, video_url: file_url }));
    setUploadingVideo(false);
  };

  useEffect(() => {
    if (exercise) setForm({ ...defaultForm, ...exercise });
    else setForm(defaultForm);
    setTab('basico');
  }, [exercise, open]);

  const handleSave = () => {
    const cleaned = { ...form };
    // equipment debe ser string, no array
    if (Array.isArray(cleaned.equipment)) cleaned.equipment = cleaned.equipment[0] || undefined;
    if (cleaned.equipment === '') cleaned.equipment = undefined;
    // calories_per_minute debe ser número o no enviarse
    if (cleaned.calories_per_minute === '' || cleaned.calories_per_minute === null || isNaN(cleaned.calories_per_minute)) {
      delete cleaned.calories_per_minute;
    }
    onSave(cleaned);
  };

  const toggleDiscipline = (d) => {
    setForm(prev => ({
      ...prev,
      disciplines: prev.disciplines?.includes(d)
        ? prev.disciplines.filter(x => x !== d)
        : [...(prev.disciplines || []), d]
    }));
  };

  const addMuscle = (field) => {
    if (field === 'primary_muscles' && primaryMuscleInput.trim()) {
      setForm(prev => ({ ...prev, primary_muscles: [...(prev.primary_muscles || []), primaryMuscleInput.trim()] }));
      setPrimaryMuscleInput('');
    } else if (field === 'secondary_muscles' && secondaryMuscleInput.trim()) {
      setForm(prev => ({ ...prev, secondary_muscles: [...(prev.secondary_muscles || []), secondaryMuscleInput.trim()] }));
      setSecondaryMuscleInput('');
    }
  };

  const FORM_TABS = [
    { id: 'basico', label: 'Básico' },
    { id: 'musculos', label: 'Músculos' },
    { id: 'tecnica', label: 'Técnica' },
    { id: 'extras', label: 'Extras' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="font-display">{exercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</DialogTitle>
        </DialogHeader>

        {/* Mini tabs */}
        <div className="flex border-b border-border mx-5 mt-3">
          {FORM_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="px-3 py-2 text-xs font-medium transition-all" style={{ color: tab === t.id ? '#FF4D00' : '#888', borderBottom: tab === t.id ? '2px solid #FF4D00' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* BÁSICO */}
          {tab === 'basico' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border mt-1" /></div>
                <div><Label>Nombre alternativo</Label><Input value={form.alternate_name} onChange={e => setForm({ ...form, alternate_name: e.target.value })} className="bg-secondary border-border mt-1" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Grupo muscular</Label>
                  <Select value={form.muscle_group} onValueChange={v => setForm({ ...form, muscle_group: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{Object.entries(MUSCLE_GROUPS_FULL).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nivel</Label>
                  <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Equipamiento</Label>
                  <Select value={form.equipment_type} onValueChange={v => setForm({ ...form, equipment_type: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Tipo..." /></SelectTrigger>
                    <SelectContent>{EQUIPMENT_TYPES.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Entorno</Label>
                  <Select value={form.environment} onValueChange={v => setForm({ ...form, environment: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{ENVIRONMENTS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tipo de métrica</Label>
                  <Select value={form.metric_type} onValueChange={v => setForm({ ...form, metric_type: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{metricTypes.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Patrón de movimiento</Label>
                  <Select value={form.movement_pattern} onValueChange={v => setForm({ ...form, movement_pattern: v })}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{movements.map(m => <SelectItem key={m} value={m}>{m.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* VIDEO */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-primary" />
                  <Label className="text-sm font-semibold">Video demostrativo</Label>
                </div>

                {form.video_url ? (
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video src={form.video_url} className="w-full h-full object-cover" controls muted />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, video_url: '' }))}
                      className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/80 flex items-center justify-center hover:bg-destructive transition-colors border border-white/20"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoMode('url')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${videoMode === 'url' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
                      >
                        <Link size={10} className="inline mr-1" /> URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${videoMode === 'upload' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
                      >
                        <Upload size={10} className="inline mr-1" /> Subir archivo
                      </button>
                    </div>

                    {videoMode === 'url' ? (
                      <Input
                        value={form.video_url}
                        onChange={e => setForm({ ...form, video_url: e.target.value })}
                        className="bg-secondary border-border"
                        placeholder="https://..."
                      />
                    ) : (
                      <div>
                        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingVideo}
                          className="w-full py-6 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50"
                        >
                          <Upload size={20} />
                          <span className="text-xs">{uploadingVideo ? 'Subiendo...' : 'Tocá para seleccionar el video'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border mt-1" rows={2} /></div>

              <div>
                <Label>Disciplinas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {disciplines.map(d => (
                    <button key={d.value} type="button" onClick={() => toggleDiscipline(d.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.disciplines?.includes(d.value) ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MÚSCULOS */}
          {tab === 'musculos' && (
            <>
              <div>
                <Label>Músculos principales</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={primaryMuscleInput} onChange={e => setPrimaryMuscleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMuscle('primary_muscles'))} placeholder="Ej: Pectoral Mayor" className="bg-secondary border-border" />
                  <Button type="button" variant="secondary" onClick={() => addMuscle('primary_muscles')}>+</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.primary_muscles?.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs cursor-pointer" onClick={() => setForm(prev => ({ ...prev, primary_muscles: prev.primary_muscles.filter((_, idx) => idx !== i) }))}>
                      {m} ×
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Músculos secundarios</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={secondaryMuscleInput} onChange={e => setSecondaryMuscleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMuscle('secondary_muscles'))} placeholder="Ej: Deltoides Anterior" className="bg-secondary border-border" />
                  <Button type="button" variant="secondary" onClick={() => addMuscle('secondary_muscles')}>+</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.secondary_muscles?.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs cursor-pointer" onClick={() => setForm(prev => ({ ...prev, secondary_muscles: prev.secondary_muscles.filter((_, idx) => idx !== i) }))}>
                      {m} ×
                    </span>
                  ))}
                </div>
              </div>

              <div><Label>Variante más fácil</Label><Input value={form.easier_variation} onChange={e => setForm({ ...form, easier_variation: e.target.value })} className="bg-secondary border-border mt-1" /></div>
              <div><Label>Variante más difícil</Label><Input value={form.harder_variation} onChange={e => setForm({ ...form, harder_variation: e.target.value })} className="bg-secondary border-border mt-1" /></div>
            </>
          )}

          {/* TÉCNICA */}
          {tab === 'tecnica' && (
            <>
              <div>
                <Label>Tempo (Excéntrica-Pausa-Concéntrica-Pausa)</Label>
                <Input value={form.tempo} onChange={e => setForm({ ...form, tempo: e.target.value })} className="bg-secondary border-border mt-1 font-mono" placeholder="Ej: 3-1-2-0" />
                <p className="text-xs text-muted-foreground mt-1">Formato: segundos por fase. 0 = explosivo</p>
              </div>

              <div>
                <Label>Técnica de intensidad</Label>
                <Select value={form.intensity_technique} onValueChange={v => setForm({ ...form, intensity_technique: v })}>
                  <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTENSITY_TECHNIQUES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Series sugeridas</Label><Input value={form.sets_range} onChange={e => setForm({ ...form, sets_range: e.target.value })} className="bg-secondary border-border mt-1" placeholder="Ej: 3-4" /></div>
                <div><Label>Reps sugeridas</Label><Input value={form.reps_range} onChange={e => setForm({ ...form, reps_range: e.target.value })} className="bg-secondary border-border mt-1" placeholder="Ej: 8-12" /></div>
              </div>

              <div><Label>Cues de coaching</Label><Textarea value={form.coaching_cues} onChange={e => setForm({ ...form, coaching_cues: e.target.value })} className="bg-secondary border-border mt-1" rows={2} /></div>
            </>
          )}

          {/* EXTRAS */}
          {tab === 'extras' && (
            <>
              <div><Label>Tips del coach</Label><Textarea value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} className="bg-secondary border-border mt-1" rows={2} /></div>
              <div><Label>Calorías por minuto</Label><Input type="number" value={form.calories_per_minute ?? ''} onChange={e => setForm({ ...form, calories_per_minute: e.target.value === '' ? null : parseFloat(e.target.value) })} className="bg-secondary border-border mt-1" placeholder="Ej: 8" /></div>
            </>
          )}
        </div>

        <DialogFooter className="px-5 pb-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}