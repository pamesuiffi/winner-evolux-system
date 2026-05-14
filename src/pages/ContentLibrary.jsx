import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Download, Play, Music, Zap, BookOpen, X, Save, Loader2, Upload, Cloud } from 'lucide-react';

export default function ContentLibrary() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('libro');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: content = [] } = useQuery({
    queryKey: ['content-library', user?.id],
    queryFn: () => base44.entities.ContentLibrary.filter({ coach_id: user?.id }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentLibrary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-library', user?.id] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingItem) {
        return base44.entities.ContentLibrary.update(editingItem.id, data);
      } else {
        return base44.entities.ContentLibrary.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library', user?.id] });
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
    },
    onError: (error) => {
      console.error('Error al guardar contenido:', error);
    },
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resp = await base44.integrations.Core.UploadFile({ file });
      setFormData(f => ({ ...f, [type === 'file' ? 'file_url' : 'video_url']: resp.file_url }));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  };

  const openCreate = (category) => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      author: '',
      duration: '',
      file_url: '',
      video_url: '',
      thumbnail_url: '',
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setSelectedTab(item.category);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.title || !user?.id) return;
    saveMutation.mutate({
      ...formData,
      category: editingItem ? editingItem.category : selectedTab,
      coach_id: user?.id,
    });
  };

  const categoryConfig = {
    libro: {
      icon: BookOpen,
      label: 'Libros',
      color: '#FF4D00',
      bgColor: 'rgba(255,77,0,0.1)',
      description: 'Libros descargables sobre mindset y desarrollo personal',
    },
    podcast: {
      icon: Music,
      label: 'Podcasts',
      color: '#9B6DFF',
      bgColor: 'rgba(155,109,255,0.1)',
      description: 'Episodios de audio para escuchar en cualquier momento',
    },
    video: {
      icon: Play,
      label: 'Videos',
      color: '#00C896',
      bgColor: 'rgba(0,200,150,0.1)',
      description: 'Videos educativos sobre mindset y entrenamiento mental',
    },
    mindfulness: {
      icon: Zap,
      label: 'Mindfulness',
      color: '#FFB800',
      bgColor: 'rgba(255,184,0,0.1)',
      description: 'Meditaciones y ejercicios de atención plena',
    },
  };

  const currentConfig = categoryConfig[selectedTab];
  const CurrentIcon = currentConfig.icon;
  const filteredContent = content.filter(c => c.category === selectedTab).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display font-black text-4xl text-white tracking-wider">BIBLIOTECA</h1>
        <p className="text-muted-foreground text-sm">Contenido educativo y de mindfulness</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button key={key} onClick={() => setSelectedTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedTab === key
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={{
                background: selectedTab === key ? config.bgColor : 'transparent',
                border: selectedTab === key ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.1)',
                color: selectedTab === key ? config.color : undefined,
              }}>
              <Icon size={16} /> {config.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="font-display font-bold text-2xl text-white">{currentConfig.label}</h2>
            <p className="text-sm text-gray-500 mt-1">{currentConfig.description}</p>
          </div>
          <button onClick={() => openCreate(selectedTab)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: currentConfig.color }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <CurrentIcon size={48} className="mx-auto mb-3" style={{ color: currentConfig.color, opacity: 0.3 }} />
            <p className="text-gray-500 text-sm">No hay contenido en esta sección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map(item => (
              <div key={item.id} className="rounded-xl p-4 group" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Thumbnail */}
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}

                <div className="mb-3">
                  <h3 className="font-semibold text-white text-sm line-clamp-2">{item.title}</h3>
                  {item.author && <p className="text-xs text-gray-500 mt-1">{item.author}</p>}
                  {item.duration && <p className="text-xs" style={{ color: currentConfig.color }}>{item.duration}</p>}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {item.file_url && (
                    <a href={item.file_url} download
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                      style={{ background: currentConfig.color }}>
                      <Download size={12} /> Descargar
                    </a>
                  )}
                  {item.video_url && (
                    <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                      style={{ background: currentConfig.color }}>
                      <Play size={12} /> Ver
                    </a>
                  )}
                  <button onClick={() => openEdit(item)}
                    className="p-2 rounded-lg text-gray-500 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(item.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.3)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-2xl text-white">
                {editingItem ? 'Editar contenido' : 'Nuevo contenido'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-semibold">Título *</label>
                <input type="text" value={formData.title || ''}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Título del contenido" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold">Autor</label>
                  <input type="text" value={formData.author || ''}
                    onChange={e => setFormData(f => ({ ...f, author: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Nombre del autor" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold">Duración</label>
                  <input type="text" value={formData.duration || ''}
                    onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Ej: 45 min, 8 capítulos" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block font-semibold">Descripción</label>
                <textarea value={formData.description || ''}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Descripción del contenido" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold">URL Portada/Miniatura</label>
                  <input type="url" value={formData.thumbnail_url || ''}
                    onChange={e => setFormData(f => ({ ...f, thumbnail_url: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="https://..." />
                </div>
                {selectedTab === 'libro' && (
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block font-semibold">Archivo PDF</label>
                      <button onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                        style={{ background: '#FF4D00' }}>
                        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {uploading ? 'Subiendo...' : 'Seleccionar PDF'}
                      </button>
                      {formData.file_url && <p className="text-xs text-green-500 mt-2">✓ PDF cargado</p>}
                      <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'file')} className="hidden" />
                    </div>
                  )}
              </div>

              {(selectedTab === 'podcast' || selectedTab === 'video' || selectedTab === 'mindfulness') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block font-semibold">
                      {selectedTab === 'video' ? 'Video' : selectedTab === 'podcast' ? 'Podcast' : 'Meditación'}
                    </label>
                    {(selectedTab === 'video' || selectedTab === 'podcast') ? (
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={formData.video_url || ''}
                          onChange={e => setFormData(f => ({ ...f, video_url: e.target.value }))}
                          className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                          style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                          placeholder={selectedTab === 'video' ? 'URL del video o déjalo vacío' : 'URL del podcast o déjalo vacío'}
                        />
                        <button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = selectedTab === 'video' ? 'video/mp4,video/mpeg,video/webm,.mp4,.webm' : 'audio/mpeg,audio/wav,audio/mp3,.mp3,.wav,.m4a';
                            input.onchange = (e) => handleFileUpload(e, 'video');
                            input.click();
                          }}
                          disabled={uploading}
                          className="px-4 py-2.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                          style={{ background: '#FF4D00' }}>
                          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        </button>
                      </div>
                    ) : (
                      <input 
                        type="url" 
                        value={formData.video_url || ''}
                        onChange={e => setFormData(f => ({ ...f, video_url: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                        style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}
                        placeholder="YouTube, Vimeo, link directo"
                      />
                    )}
                    {formData.video_url && <p className="text-xs text-green-500 mt-2">✓ {selectedTab === 'video' ? 'Video' : selectedTab === 'podcast' ? 'Podcast' : 'Link'} cargado</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!formData.title || saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: currentConfig.color }}>
                {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}