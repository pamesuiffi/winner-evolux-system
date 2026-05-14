import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, BookOpen, Target, Heart, Zap, Trash2, Edit2, X, Play, Music, Download, Loader2, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import WheelEvaluator from '@/components/coaching/WheelEvaluator';

const wheelDimensions = [
  'Salud', 'Familia', 'Trabajo', 'Finanzas', 'Diversión', 'Relaciones', 'Desarrollo', 'Espiritualidad'
];

const defaultWheelData = wheelDimensions.map(d => ({ subject: d, value: 5, fullMark: 10 }));

const HABIT_EMOJIS = ['💧', '😴', '🧘', '🏋️', '📖', '🎯', '💪', '🚀', '⏰', '🎨', '📝', '🍎'];

function ContentLibrarySection({ user }) {
  const queryClient = useQueryClient();
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [sectionForm, setSectionForm] = useState({});
  const [contentForm, setContentForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  const DEFAULT_SECTIONS = [
    { title: 'Mentalidad Ganadora', icon: '🧠', description: 'Cómo construir una mentalidad de campeón' },
    { title: 'Gestión del Estrés', icon: '❤️', description: 'Técnicas para manejar el estrés diario' },
    { title: 'Hábitos de Éxito', icon: '⚡', description: 'Rutinas matutinas de alto rendimiento' },
    { title: 'Disciplina > Motivación', icon: '🎯', description: 'Por qué la disciplina supera siempre a la motivación' },
  ];

  const { data: sections = [] } = useQuery({
    queryKey: ['content-sections', user?.id],
    queryFn: async () => {
      const existing = await base44.entities.ContentSection.filter({ coach_id: user?.id });
      if (existing.length === 0 && user?.id) {
        for (const section of DEFAULT_SECTIONS) {
          await base44.entities.ContentSection.create({ ...section, coach_id: user.id });
        }
        return base44.entities.ContentSection.filter({ coach_id: user?.id });
      }
      return existing;
    },
    enabled: !!user,
  });

  const { data: allContent = [] } = useQuery({
    queryKey: ['section-content', user?.id],
    queryFn: () => base44.entities.ContentLibrary.filter({ coach_id: user?.id }),
    enabled: !!user,
  });

  const saveSectionMutation = useMutation({
    mutationFn: async (data) => {
      if (editingSection) {
        return base44.entities.ContentSection.update(editingSection.id, data);
      } else {
        return base44.entities.ContentSection.create(data);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-sections', user?.id] });
      const sections = await base44.entities.ContentSection.filter({ coach_id: user?.id });
      const saved = editingSection 
        ? sections.find(s => s.id === editingSection.id)
        : sections[sections.length - 1];
      setSelectedSection(saved);
      setShowSectionForm(false);
      setEditingSection(null);
      setSectionForm({});
      if (!editingSection) {
        setTimeout(() => {
          setContentForm({ title: '', description: '', author: '', type: 'articulo', file_url: '', video_url: '' });
          setShowContentForm(true);
        }, 300);
      }
    },
  });

  const saveContentMutation = useMutation({
    mutationFn: async (data) => {
      if (editingContent) {
        return base44.entities.ContentLibrary.update(editingContent.id, data);
      } else {
        return base44.entities.ContentLibrary.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-content', user?.id] });
      setShowContentForm(false);
      setEditingContent(null);
      setContentForm({});
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentLibrary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['section-content', user?.id] }),
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await base44.integrations.Core.UploadFile({ file });
      setContentForm(f => ({ ...f, [type === 'file' ? 'file_url' : 'video_url']: resp.file_url }));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  };

  const openSectionEdit = (section) => {
    setEditingSection(section);
    setSectionForm(section);
    setShowSectionForm(true);
  };

  const openContentCreate = (section) => {
    setSelectedSection(section);
    setEditingContent(null);
    setContentForm({ title: '', description: '', author: '', type: 'articulo', file_url: '', video_url: '' });
    setShowContentForm(true);
  };

  const openContentEdit = (content) => {
    setEditingContent(content);
    setContentForm(content);
    setShowContentForm(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.title || !user?.id) return;
    saveSectionMutation.mutate({ ...sectionForm, coach_id: user.id });
  };

  const handleSaveContent = () => {
    if (!contentForm.title || !selectedSection || !user?.id) return;
    saveContentMutation.mutate({
      ...contentForm,
      section_id: editingContent?.section_id || selectedSection.id,
      coach_id: user.id,
    });
  };

  const sectionContent = selectedSection
    ? allContent.filter(c => c.section_id === selectedSection.id).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* Sections Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Secciones</h3>
          <Button onClick={() => { setEditingSection(null); setSectionForm({}); setShowSectionForm(true); }} className="bg-primary hover:bg-primary/90 gap-2 text-xs">
            <Plus className="w-3 h-3" /> Nueva Sección
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {sections.map(section => (
            <motion.div key={section.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              onClick={() => setSelectedSection(section)}
              className={`rounded-lg p-4 cursor-pointer transition-all border ${selectedSection?.id === section.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{section.icon || '📚'}</span>
                    <h4 className="font-display font-semibold text-sm">{section.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{sectionContent.length} items</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openSectionEdit(section); }} className="text-muted-foreground hover:text-primary">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content in selected section */}
      {selectedSection && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Contenido - {selectedSection.title}</h3>
            <Button onClick={() => openContentCreate(selectedSection)} className="bg-primary hover:bg-primary/90 gap-2 text-xs">
              <Plus className="w-3 h-3" /> Agregar Contenido
            </Button>
          </div>

          {sectionContent.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin contenido en esta sección</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sectionContent.map(content => (
                <div key={content.id} className="rounded-lg border border-border p-3 flex items-start justify-between hover:border-primary/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{content.title}</h4>
                    <p className="text-xs text-muted-foreground">{content.type} {content.author && `• ${content.author}`}</p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {content.file_url && <a href={content.file_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Download className="w-3 h-3" /></a>}
                    {content.video_url && <button onClick={() => setVideoPreview(content.video_url)} className="text-muted-foreground hover:text-primary"><Play className="w-3 h-3" /></button>}
                    <button onClick={() => openContentEdit(content)} className="text-muted-foreground hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteContentMutation.mutate(content.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="rounded-xl p-6 w-full max-w-sm bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{editingSection ? 'Editar sección' : 'Nueva sección'}</h2>
              <button onClick={() => setShowSectionForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={sectionForm.title || ''} onChange={e => setSectionForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Título" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
              <input type="text" value={sectionForm.icon || ''} onChange={e => setSectionForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="Emoji (🧠, ❤️, ⚡, etc)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
              <textarea value={sectionForm.description || ''} onChange={e => setSectionForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowSectionForm(false)} variant="outline" className="flex-1 text-xs">Cancelar</Button>
              <Button onClick={handleSaveSection} disabled={!sectionForm.title || saveSectionMutation.isPending} className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Form Modal */}
      {showContentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="rounded-xl p-6 w-full max-w-md bg-card border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{editingContent ? 'Editar contenido' : 'Nuevo contenido'}</h2>
              <button onClick={() => setShowContentForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={contentForm.title || ''} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Título" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
              <select value={contentForm.type || 'articulo'} onChange={e => setContentForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm">
                <option value="articulo">Artículo</option>
                <option value="libro">Libro PDF</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
              </select>
              <input type="text" value={contentForm.author || ''} onChange={e => setContentForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Autor" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
              <textarea value={contentForm.description || ''} onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm resize-none" />

              {contentForm.type === 'libro' && (
                <button onClick={() => document.getElementById('pdf-input')?.click()} disabled={uploading}
                  className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium">
                  {uploading ? 'Subiendo...' : 'Subir PDF'}
                </button>
              )}
              {contentForm.type === 'video' && (
               <div className="space-y-2">
                 <input type="url" value={contentForm.video_url || ''} onChange={e => setContentForm(f => ({ ...f, video_url: e.target.value }))}
                   placeholder="O pega una URL de YouTube/Vimeo" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
                 <button onClick={() => document.getElementById('video-input')?.click()} disabled={uploading}
                   className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium flex items-center justify-center gap-2">
                   {uploading ? 'Subiendo...' : <><Upload className="w-3 h-3" /> Subir video desde galería</>}
                 </button>
                 <input id="video-input" type="file" accept="video/mp4,video/webm,video/mpeg,.mp4,.webm" onChange={e => handleFileUpload(e, 'video')} className="hidden" />
               </div>
              )}
              {contentForm.type === 'podcast' && (
               <div className="space-y-2">
                 <input type="url" value={contentForm.video_url || ''} onChange={e => setContentForm(f => ({ ...f, video_url: e.target.value }))}
                   placeholder="O pega una URL del podcast" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none text-sm" />
                 <button onClick={() => document.getElementById('audio-input')?.click()} disabled={uploading}
                   className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium flex items-center justify-center gap-2">
                   {uploading ? 'Subiendo...' : <><Upload className="w-3 h-3" /> Subir audio desde galería</>}
                 </button>
                 <input id="audio-input" type="file" accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav,.m4a" onChange={e => handleFileUpload(e, 'video')} className="hidden" />
               </div>
              )}

              {contentForm.file_url && <p className="text-xs text-green-500">✓ PDF cargado</p>}
              {contentForm.video_url && <p className="text-xs text-green-500">✓ URL cargada</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowContentForm(false)} variant="outline" className="flex-1 text-xs">Cancelar</Button>
              <Button onClick={handleSaveContent} disabled={!contentForm.title || saveContentMutation.isPending} className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                Guardar
              </Button>
            </div>

            <input id="pdf-input" type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'file')} className="hidden" />
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="rounded-xl w-full max-w-4xl bg-black overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Reproductor</h2>
              <button onClick={() => setVideoPreview(null)} className="text-white hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {videoPreview.includes('youtube.com') || videoPreview.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={videoPreview.includes('watch?v=') ? videoPreview.replace('watch?v=', 'embed/') : videoPreview.replace('youtu.be/', 'youtube.com/embed/')}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoPreview.includes('vimeo.com') ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://player.vimeo.com/video/${videoPreview.split('/').pop()}`}
                  title="Video"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video width="100%" height="100%" controls className="w-full h-full">
                  <source src={videoPreview} type="video/mp4" />
                  Tu navegador no soporta videos HTML5
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function HabitsSection({ user }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🎯', frequency: 'diario' });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => base44.entities.HabitTracker.filter({ coach_id: user?.id }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HabitTracker.create({
      ...data,
      coach_id: user?.id,
      is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setFormData({ name: '', icon: '🎯', frequency: 'diario' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.HabitTracker.update(editingHabit.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setEditingHabit(null);
      setFormData({ name: '', icon: '🎯', frequency: 'diario' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HabitTracker.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const handleOpen = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        icon: habit.icon || '🎯',
        frequency: habit.frequency || 'diario',
      });
    } else {
      setEditingHabit(null);
      setFormData({ name: '', icon: '🎯', frequency: 'diario' });
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    
    if (editingHabit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Tracker de Hábitos</h3>
        <Button onClick={() => handleOpen()} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nuevo Hábito
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm mb-4">Aún no tienes hábitos creados</p>
          <Button onClick={() => handleOpen()} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Crear tu primer hábito
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {habits.filter(h => h.is_active).map((habit, i) => (
              <motion.div 
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-all group"
              >
                <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
                <span className="text-2xl">{habit.icon}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{habit.name}</span>
                  <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                </div>
                <button
                  onClick={() => handleOpen(habit)}
                  className="p-1.5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(habit.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal para crear/editar */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-card border border-border p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-display font-semibold text-lg">
                  {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Beber agua, Meditación..."
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Icono</label>
                  <div className="grid grid-cols-6 gap-2">
                    {HABIT_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`p-2 rounded-lg text-xl transition-all ${
                          formData.icon === emoji
                            ? 'bg-primary/20 border border-primary'
                            : 'bg-secondary border border-transparent hover:border-border'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frecuencia */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Frecuencia</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    <option value="diario">Diario</option>
                    <option value="lunes_viernes">Lunes a Viernes</option>
                    <option value="fin_semana">Fin de Semana</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name.trim() || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {editingHabit ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Coaching() {
  const { user } = useOutletContext();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Coaching & Mindset</h1>
        <p className="text-muted-foreground text-sm">Herramientas de desarrollo personal</p>
      </div>

      <Tabs defaultValue="wheel" className="w-full">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="wheel" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="w-4 h-4" /> Rueda de la Vida
          </TabsTrigger>
          <TabsTrigger value="habits" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="w-4 h-4" /> Hábitos
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-4 h-4" /> Contenido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wheel">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <WheelEvaluator user={user} />
          </motion.div>
        </TabsContent>

        <TabsContent value="habits">
          <HabitsSection user={user} />
        </TabsContent>

        <TabsContent value="articles">
          <ContentLibrarySection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}