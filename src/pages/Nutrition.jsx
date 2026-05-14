import { useState } from 'react';
import { Calculator, TrendingDown, Scale, Minus, Plus, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import FoodPhotoAnalyzer from '@/components/nutrition/FoodPhotoAnalyzer';
import FoodLogHistory from '@/components/nutrition/FoodLogHistory';

const tooltipStyle = { background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' };

const weightHistory = [
  { fecha: 'Feb 1', peso: 87, grasa: 22 },
  { fecha: 'Feb 15', peso: 86, grasa: 21 },
  { fecha: 'Mar 1', peso: 85, grasa: 20 },
  { fecha: 'Mar 15', peso: 84, grasa: 19.2 },
  { fecha: 'Abr 1', peso: 83, grasa: 18.5 },
  { fecha: 'Abr 15', peso: 82, grasa: 18 },
  { fecha: 'May 1', peso: 81, grasa: 17 },
];

function calcISAK({ peso, talla, edad, sexo, triceps, subescapular, supraespinal, pantorrilla, biceps, cresta_iliaca, abdominal, muslo, brazo_flex, diametro_humero, diametro_femur }) {
  const sum6 = (triceps || 0) + (subescapular || 0) + (supraespinal || 0) + (abdominal || 0) + (muslo || 0) + (pantorrilla || 0);
  const sum8 = sum6 + (biceps || 0) + (cresta_iliaca || 0);

  // Durnin-Womersley % grasa
  let pctGrasa = 0;
  const logSum4 = Math.log10((triceps || 0) + (subescapular || 0) + (supraespinal || 0) + (biceps || 0));
  if (sexo === 'male') {
    const D = edad < 30 ? 1.1631 - 0.0632 * logSum4 : edad < 40 ? 1.1422 - 0.0544 * logSum4 : 1.162 - 0.07 * logSum4;
    pctGrasa = ((4.95 / D) - 4.5) * 100;
  } else {
    const D = edad < 30 ? 1.1549 - 0.0678 * logSum4 : edad < 40 ? 1.1599 - 0.0717 * logSum4 : 1.1813 - 0.0813 * logSum4;
    pctGrasa = ((4.95 / D) - 4.5) * 100;
  }

  const masaGrasa = (peso * pctGrasa) / 100;
  const masaLibre = peso - masaGrasa;
  const imc = peso / Math.pow(talla / 100, 2);

  // Somatotipo Heath-Carter
  const SPL = (triceps || 0) + (subescapular || 0) + (supraespinal || 0) + (pantorrilla || 0);
  const endo = -0.7182 + 0.1451 * SPL - 0.00068 * SPL * SPL + 0.0000014 * Math.pow(SPL, 3);

  const meso = 0.858 * (diametro_humero || 0) + 0.601 * (diametro_femur || 0)
    + 0.188 * ((brazo_flex || 0) - (triceps || 0) / 10)
    + 0.161 * ((pantorrilla || 0) - (pantorrilla || 0) / 10)
    - 0.131 * (talla || 0) + 4.5;

  const IPP = peso / Math.pow(talla, 0.333);
  let ecto = 0.1;
  if (IPP >= 40.75) ecto = 0.732 * IPP - 28.58;
  else if (IPP >= 38.25) ecto = 0.463 * IPP - 17.63;

  // TMB Mifflin-St Jeor
  const tmb = sexo === 'male'
    ? 10 * peso + 6.25 * talla - 5 * edad + 5
    : 10 * peso + 6.25 * talla - 5 * edad - 161;

  return { sum6, sum8, pctGrasa, masaGrasa, masaLibre, imc, endo, meso, ecto, tmb };
}

const ACTIVITY_FACTORS = { sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725, very_intense: 1.9 };
const ACTIVITY_LABELS = { sedentary: 'Sedentario', light: 'Ligero (1-3d)', moderate: 'Moderado (3-5d)', intense: 'Intenso (6-7d)', very_intense: 'Muy intenso' };

export default function Nutrition() {
  const [tab, setTab] = useState('dashboard');
  const { user } = useOutletContext() || {};
  const [form, setForm] = useState({
    peso: 82, talla: 178, edad: 28, sexo: 'male',
    triceps: 12, subescapular: 14, biceps: 8, cresta_iliaca: 18,
    supraespinal: 10, abdominal: 16, muslo: 20, pantorrilla: 12,
    brazo_flex: 36, diametro_humero: 7.2, diametro_femur: 9.5, pantorrilla_cm: 38,
    activity_level: 'moderate', objetivo: 'deficit'
  });

  const results = calcISAK(form);
  const tdee = results.tmb * (ACTIVITY_FACTORS[form.activity_level] || 1.55);
  const calObjetivo = form.objetivo === 'deficit' ? tdee - 500 : form.objetivo === 'surplus' ? tdee + 300 : tdee;
  const macro_dist = { deficit: [0.4, 0.35, 0.25], maintenance: [0.45, 0.3, 0.25], surplus: [0.5, 0.3, 0.2] }[form.objetivo] || [0.45, 0.3, 0.25];
  const carbs_g = (calObjetivo * macro_dist[0]) / 4;
  const prot_g = (calObjetivo * macro_dist[1]) / 4;
  const fat_g = (calObjetivo * macro_dist[2]) / 9;

  const updateForm = (field, val) => setForm(f => ({ ...f, [field]: parseFloat(val) || val }));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">NUTRICIÓN</h1>
          <p className="text-gray-400 text-sm">Protocolo ISAK Nivel 1 + Somatotipo Heath-Carter</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
          <FileText size={16} /> Exportar PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[['dashboard', '📊 Dashboard'], ['foto', '📸 Foto IA'], ['historial', '📋 Historial'], ['eval', '📏 ISAK'], ['macros', '🥗 Macros']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === id ? '#FF4D00' : 'transparent', color: tab === id ? 'white' : '#888' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Macros del día */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Calorías objetivo', value: Math.round(calObjetivo), unit: 'kcal', color: '#FF4D00' },
              { label: 'Proteína', value: Math.round(prot_g), unit: 'g', color: '#FFB800' },
              { label: 'Carbohidratos', value: Math.round(carbs_g), unit: 'g', color: '#00C896' },
              { label: 'Grasas', value: Math.round(fat_g), unit: 'g', color: '#888' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-bebas text-3xl" style={{ color }}>{value}</div>
                <div className="text-xs font-medium text-gray-300">{unit}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Macro bar */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">DISTRIBUCIÓN DE MACROS</h3>
            <div className="h-6 rounded-full overflow-hidden flex">
              <div style={{ width: `${macro_dist[0]*100}%`, background: '#00C896' }}></div>
              <div style={{ width: `${macro_dist[1]*100}%`, background: '#FFB800' }}></div>
              <div style={{ width: `${macro_dist[2]*100}%`, background: '#888' }}></div>
            </div>
            <div className="flex gap-4 mt-3">
              {[['#00C896', `Carbs ${Math.round(macro_dist[0]*100)}%`], ['#FFB800', `Proteína ${Math.round(macro_dist[1]*100)}%`], ['#888', `Grasas ${Math.round(macro_dist[2]*100)}%`]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ background: c }}></div><span className="text-xs text-gray-400">{l}</span></div>
              ))}
            </div>
          </div>

          {/* Weight/Fat history */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">EVOLUCIÓN CORPORAL</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightHistory}>
                <XAxis dataKey="fecha" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="peso" stroke="#FF4D00" strokeWidth={2} dot={false} name="Peso (kg)" />
                <Line type="monotone" dataKey="grasa" stroke="#00C896" strokeWidth={2} dot={false} name="% Grasa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'foto' && (
        <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-display font-bold text-lg text-white mb-1">Análisis de comida con IA</h3>
          <p className="text-sm text-gray-500 mb-5">Sacá o subí una foto y la IA detecta automáticamente las calorías y macronutrientes</p>
          <FoodPhotoAnalyzer user={user} />
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Historial de comidas</h3>
          <FoodLogHistory user={user} />
        </div>
      )}

      {tab === 'eval' && (
        <div className="space-y-4">
          {/* Datos básicos */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">DATOS BÁSICOS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { f: 'peso', l: 'Peso (kg)' },
                { f: 'talla', l: 'Talla (cm)' },
                { f: 'edad', l: 'Edad' },
              ].map(({ f, l }) => (
                <div key={f}>
                  <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                  <input type="number" value={form[f]} onChange={e => updateForm(f, e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Sexo</label>
                <select value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pliegues */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">PLIEGUES CUTÁNEOS (mm)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['triceps', 'subescapular', 'biceps', 'cresta_iliaca', 'supraespinal', 'abdominal', 'muslo', 'pantorrilla'].map(f => (
                <div key={f}>
                  <label className="text-xs text-gray-400 mb-1 block capitalize">{f.replace('_', ' ')}</label>
                  <input type="number" value={form[f] || ''} onChange={e => updateForm(f, e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(0,200,150,0.15)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">RESULTADOS AUTOMÁTICOS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: '% Grasa corporal', value: `${results.pctGrasa.toFixed(1)}%`, color: '#FF4D00' },
                { label: 'Masa grasa (kg)', value: `${results.masaGrasa.toFixed(1)} kg`, color: '#FF3B3B' },
                { label: 'Masa libre grasa (kg)', value: `${results.masaLibre.toFixed(1)} kg`, color: '#00C896' },
                { label: 'IMC', value: results.imc.toFixed(1), color: '#FFB800' },
                { label: 'Sumatoria 6 pliegues', value: `${results.sum6.toFixed(1)} mm`, color: '#888' },
                { label: 'TMB (Mifflin)', value: `${Math.round(results.tmb)} kcal`, color: '#FF4D00' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="font-bebas text-2xl" style={{ color }}>{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }}>
              <p className="font-bebas text-base text-white tracking-wider mb-2">SOMATOTIPO HEATH-CARTER</p>
              <div className="flex gap-6">
                {[
                  { label: 'Endomorfia', value: results.endo.toFixed(1), color: '#FF4D00' },
                  { label: 'Mesomorfia', value: results.meso.toFixed(1), color: '#FFB800' },
                  { label: 'Ectomorfia', value: results.ecto.toFixed(1), color: '#00C896' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div className="font-bebas text-3xl" style={{ color }}>{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'macros' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bebas text-lg text-white tracking-wider mb-4">NIVEL DE ACTIVIDAD</h3>
              <div className="space-y-2">
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, activity_level: key }))}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background: form.activity_level === key ? 'rgba(255,77,0,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.activity_level === key ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: form.activity_level === key ? '#FF4D00' : '#888',
                    }}>
                    {label} <span className="float-right text-gray-500">×{ACTIVITY_FACTORS[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bebas text-lg text-white tracking-wider mb-4">OBJETIVO</h3>
              <div className="space-y-2">
                {[['deficit', '🔻 Déficit — Perder grasa', '-500 kcal'], ['maintenance', '⚖️ Mantenimiento', 'TDEE'], ['surplus', '🔺 Superávit — Ganar músculo', '+300 kcal']].map(([key, label, mod]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, objetivo: key }))}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background: form.objetivo === key ? 'rgba(255,77,0,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.objetivo === key ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: form.objetivo === key ? '#FF4D00' : '#888',
                    }}>
                    {label} <span className="float-right text-gray-500">{mod}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)' }}>
                <div className="font-bebas text-4xl" style={{ color: '#FF4D00' }}>{Math.round(calObjetivo)}</div>
                <div className="text-xs text-gray-400">kcal / día objetivo</div>
                <div className="text-xs text-gray-500 mt-1">TDEE: {Math.round(tdee)} kcal</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bebas text-lg text-white tracking-wider mb-4">PLAN DE MACROS DIARIO</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Proteína', g: prot_g, pct: macro_dist[1]*100, cal: prot_g*4, color: '#FFB800', emoji: '🥩' },
                { label: 'Carbohidratos', g: carbs_g, pct: macro_dist[0]*100, cal: carbs_g*4, color: '#00C896', emoji: '🍚' },
                { label: 'Grasas', g: fat_g, pct: macro_dist[2]*100, cal: fat_g*9, color: '#888', emoji: '🥑' },
              ].map(({ label, g, pct, cal, color, emoji }) => (
                <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className="font-bebas text-3xl" style={{ color }}>{Math.round(g)}g</div>
                  <div className="text-xs text-gray-300">{label}</div>
                  <div className="text-xs text-gray-500">{pct}% · {Math.round(cal)} kcal</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}