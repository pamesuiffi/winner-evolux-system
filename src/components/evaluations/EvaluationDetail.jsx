import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcMacros } from '@/lib/isak-calculations';
import SomatoChart from './SomatoChart';

export default function EvaluationDetail({ evaluation, studentName, onBack }) {
  const ev = evaluation;
  const macrosDeficit = calcMacros(ev.tdee || 2000, 'deficit');
  const macrosMaint = calcMacros(ev.tdee || 2000, 'mantenimiento');
  const macrosSuperavit = calcMacros(ev.tdee || 2000, 'superavit');

  const Section = ({ title, children }) => (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-semibold text-sm text-primary mb-4">{title}</h3>
      {children}
    </div>
  );

  const Metric = ({ label, value, unit }) => (
    <div className="bg-secondary/50 rounded-lg p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-display font-bold mt-1">{value || '—'}</p>
      {unit && <p className="text-[10px] text-muted-foreground">{unit}</p>}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-display font-bold">{studentName}</h1>
            <p className="text-sm text-muted-foreground">
              Evaluación del {ev.fecha ? format(new Date(ev.fecha), "d 'de' MMMM yyyy", { locale: es }) : '—'}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Imprimir
        </Button>
      </div>

      {/* Composición corporal */}
      <Section title="Composición Corporal">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Peso" value={ev.peso} unit="kg" />
          <Metric label="Talla" value={ev.talla} unit="cm" />
          <Metric label="IMC" value={ev.imc} />
          <Metric label="% Grasa" value={ev.grasa_pct} unit="%" />
          <Metric label="Masa Grasa" value={ev.masa_grasa} unit="kg" />
          <Metric label="Masa Libre Grasa" value={ev.masa_libre_grasa} unit="kg" />
          <Metric label="Σ 6 Pliegues" value={ev.sum_6_pliegues} unit="mm" />
          <Metric label="Σ 8 Pliegues" value={ev.sum_8_pliegues} unit="mm" />
        </div>
      </Section>

      {/* Somatotipo */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Somatotipo Heath-Carter">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Metric label="Endomorfia" value={ev.endomorfia} />
            <Metric label="Mesomorfia" value={ev.mesomorfia} />
            <Metric label="Ectomorfia" value={ev.ectomorfia} />
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-display font-bold text-accent">{ev.somatotipo_text || 'Sin datos suficientes'}</p>
          </div>
        </Section>
        <Section title="Somatocarta">
          <SomatoChart endo={ev.endomorfia} meso={ev.mesomorfia} ecto={ev.ectomorfia} />
        </Section>
      </div>

      {/* Pliegues */}
      <Section title="Pliegues Cutáneos (mm)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Tríceps" value={ev.pliegue_triceps} />
          <Metric label="Subescapular" value={ev.pliegue_subescapular} />
          <Metric label="Bíceps" value={ev.pliegue_biceps} />
          <Metric label="Cresta ilíaca" value={ev.pliegue_cresta_iliaca} />
          <Metric label="Supraespinal" value={ev.pliegue_supraespinal} />
          <Metric label="Abdominal" value={ev.pliegue_abdominal} />
          <Metric label="Muslo" value={ev.pliegue_muslo} />
          <Metric label="Pantorrilla" value={ev.pliegue_pantorrilla} />
        </div>
      </Section>

      {/* Gasto calórico */}
      <Section title="Gasto Calórico y Macronutrientes">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Metric label="TMB" value={ev.tmb} unit="kcal" />
          <Metric label="TDEE" value={ev.tdee} unit="kcal" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {[
            { title: '🔻 Déficit', macros: macrosDeficit, color: 'border-primary/30' },
            { title: '⚖️ Mantenimiento', macros: macrosMaint, color: 'border-success/30' },
            { title: '🔺 Superávit', macros: macrosSuperavit, color: 'border-accent/30' },
          ].map(({ title, macros, color }) => (
            <div key={title} className={`rounded-lg border ${color} bg-secondary/30 p-4`}>
              <p className="font-display font-semibold text-sm mb-3">{title}</p>
              <p className="text-2xl font-bold text-foreground">{macros.kcal} <span className="text-sm text-muted-foreground">kcal</span></p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Carbohidratos ({macros.carbs_pct}%)</span><span className="font-medium">{macros.carbs_g}g</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Proteína ({macros.protein_pct}%)</span><span className="font-medium">{macros.protein_g}g</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Grasa ({macros.fat_pct}%)</span><span className="font-medium">{macros.fat_g}g</span></div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {ev.observaciones && (
        <Section title="Observaciones">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ev.observaciones}</p>
        </Section>
      )}
    </motion.div>
  );
}