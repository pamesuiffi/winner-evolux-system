import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Loader2, CheckCircle2, X, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MEAL_TYPES = [
  { value: 'desayuno', label: '🌅 Desayuno' },
  { value: 'almuerzo', label: '☀️ Almuerzo' },
  { value: 'merienda', label: '🍎 Merienda' },
  { value: 'cena', label: '🌙 Cena' },
  { value: 'snack', label: '🍿 Snack' },
];

export default function FoodPhotoAnalyzer({ user }) {
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [mealType, setMealType] = useState('almuerzo');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleFile = (file) => {
    if (!file) return;
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
    setResult(null);
    setSaved(false);
  };

  const analyze = async () => {
    if (!photo) return;
    setAnalyzing(true);
    setResult(null);

    try {
      // Upload photo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photo });

      // Analyze with LLM
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analizá esta foto de comida y estimá los macronutrientes y calorías totales.
Sé preciso y detallado. Identificá cada alimento visible con su porción estimada.
Respondé ÚNICAMENTE con el JSON pedido, sin texto adicional.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            food_description: { type: 'string', description: 'Descripción detallada de los alimentos identificados con porciones estimadas' },
            calories: { type: 'number', description: 'Calorías totales estimadas' },
            protein_g: { type: 'number', description: 'Proteínas en gramos' },
            carbs_g: { type: 'number', description: 'Carbohidratos en gramos' },
            fat_g: { type: 'number', description: 'Grasas en gramos' },
            fiber_g: { type: 'number', description: 'Fibra en gramos' },
          }
        }
      });

      setResult({ ...analysis, photo_url: file_url });
    } catch (err) {
      toast.error('Error al analizar la foto');
    }
    setAnalyzing(false);
  };

  const saveLog = async () => {
    if (!result) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    await base44.entities.FoodLog.create({
      student_id: user?.id,
      coach_id: user?.id,
      fecha: today,
      meal_type: mealType,
      food_description: result.food_description,
      photo_url: result.photo_url,
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      fiber_g: result.fiber_g,
    });
    queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    setSaved(true);
    setSaving(false);
    toast.success('Comida registrada');
  };

  const reset = () => {
    setPhoto(null);
    setPhotoUrl('');
    setResult(null);
    setSaved(false);
  };

  return (
    <div className="space-y-4">
      {/* Meal type selector */}
      <div className="flex gap-2 flex-wrap">
        {MEAL_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMealType(value)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: mealType === value ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${mealType === value ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: mealType === value ? '#FF4D00' : '#888',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {!photoUrl ? (
        <div
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all"
          style={{ borderColor: 'rgba(255,77,0,0.2)', background: 'rgba(255,77,0,0.03)', minHeight: 220 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,77,0,0.12)' }}>
            <Camera size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">Subí una foto de tu comida</p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG o HEIC</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-border gap-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload size={14} /> Galería
            </Button>
            <Button variant="outline" size="sm" className="border-border gap-2" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
              <Camera size={14} /> Cámara
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden relative" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={photoUrl} alt="Comida" className="w-full max-h-64 object-cover" />
          <button
            onClick={reset}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 hover:bg-black/80 transition-all"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      {/* Analyze button */}
      {photoUrl && !result && (
        <Button
          onClick={analyze}
          disabled={analyzing}
          className="w-full bg-primary hover:bg-primary/90 h-11 text-base gap-2"
        >
          {analyzing ? (
            <><Loader2 size={16} className="animate-spin" /> Analizando con IA...</>
          ) : (
            <><Flame size={16} /> Analizar calorías y macros</>
          )}
        </Button>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(0,200,150,0.2)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Alimentos detectados</p>
              <p className="text-sm text-gray-200 leading-relaxed">{result.food_description}</p>
            </div>
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Flame, label: 'Calorías', value: Math.round(result.calories), unit: 'kcal', color: '#FF4D00' },
              { icon: Beef, label: 'Proteína', value: Math.round(result.protein_g), unit: 'g', color: '#FFB800' },
              { icon: Wheat, label: 'Carbos', value: Math.round(result.carbs_g), unit: 'g', color: '#00C896' },
              { icon: Droplets, label: 'Grasas', value: Math.round(result.fat_g), unit: 'g', color: '#888' },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                <div className="font-display font-bold text-2xl" style={{ color }}>{value}</div>
                <div className="text-xs text-gray-300">{unit}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Save button */}
          {!saved ? (
            <Button
              onClick={saveLog}
              disabled={saving}
              className="w-full bg-success hover:bg-success/90 h-10 gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {saving ? 'Guardando...' : 'Guardar en mi registro'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-success text-sm font-medium">
              <CheckCircle2 size={16} /> Guardado correctamente
            </div>
          )}
        </div>
      )}
    </div>
  );
}