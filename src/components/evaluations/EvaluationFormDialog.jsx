import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processEvaluation } from '@/lib/isak-calculations';

export default function EvaluationFormDialog({ open, onOpenChange, students, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    student_id: '', fecha: new Date().toISOString().split('T')[0],
    peso: '', talla: '', talla_sentado: '', envergadura: '', edad: '', sexo: 'masculino',
    pliegue_triceps: '', pliegue_subescapular: '', pliegue_biceps: '',
    pliegue_cresta_iliaca: '', pliegue_supraespinal: '', pliegue_abdominal: '',
    pliegue_muslo: '', pliegue_pantorrilla: '',
    perimetro_cuello: '', perimetro_brazo_relajado: '', perimetro_brazo_flexionado: '',
    perimetro_antebrazo: '', perimetro_muneca: '', perimetro_torax: '',
    perimetro_cintura: '', perimetro_cadera: '', perimetro_muslo_medio: '', perimetro_pantorrilla: '',
    diametro_humero: '', diametro_muneca: '', diametro_femur: '', observaciones: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const numField = (field, label) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" step="0.1" value={form[field]} onChange={e => updateField(field, e.target.value ? parseFloat(e.target.value) : '')} className="bg-secondary border-border h-9 text-sm" />
    </div>
  );

  const handleSave = () => {
    const student = students.find(s => s.id === form.student_id);
    const processed = processEvaluation(form, student);
    onSave(processed);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setStep(1); }}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle className="font-display">
            Nueva Evaluación ISAK — Paso {step} de 4
          </DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary">Datos Básicos</h3>
            <div>
              <Label>Alumno</Label>
              <Select value={form.student_id} onValueChange={v => updateField('student_id', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar alumno" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fecha</Label><Input type="text" value={form.fecha} onChange={e => updateField('fecha', e.target.value)} placeholder="AAAA-MM-DD" className="bg-secondary border-border" /></div>
              <div><Label>Sexo</Label>
                <Select value={form.sexo} onValueChange={v => updateField('sexo', v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {numField('peso', 'Peso corporal (kg)')}
              {numField('talla', 'Talla (cm)')}
              {numField('talla_sentado', 'Talla sentado (cm)')}
              {numField('envergadura', 'Envergadura (cm)')}
              {numField('edad', 'Edad')}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary">Pliegues Cutáneos (mm)</h3>
            <div className="grid grid-cols-2 gap-3">
              {numField('pliegue_triceps', 'Tríceps')}
              {numField('pliegue_subescapular', 'Subescapular')}
              {numField('pliegue_biceps', 'Bíceps')}
              {numField('pliegue_cresta_iliaca', 'Cresta ilíaca')}
              {numField('pliegue_supraespinal', 'Supraespinal')}
              {numField('pliegue_abdominal', 'Abdominal')}
              {numField('pliegue_muslo', 'Muslo anterior')}
              {numField('pliegue_pantorrilla', 'Pantorrilla medial')}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary">Perímetros (cm)</h3>
            <div className="grid grid-cols-2 gap-3">
              {numField('perimetro_cuello', 'Cuello')}
              {numField('perimetro_brazo_relajado', 'Brazo relajado')}
              {numField('perimetro_brazo_flexionado', 'Brazo flexionado')}
              {numField('perimetro_antebrazo', 'Antebrazo')}
              {numField('perimetro_muneca', 'Muñeca')}
              {numField('perimetro_torax', 'Tórax')}
              {numField('perimetro_cintura', 'Cintura')}
              {numField('perimetro_cadera', 'Cadera')}
              {numField('perimetro_muslo_medio', 'Muslo medio')}
              {numField('perimetro_pantorrilla', 'Pantorrilla')}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary">Diámetros Óseos (cm)</h3>
            <div className="grid grid-cols-2 gap-3">
              {numField('diametro_humero', 'Húmero biestiloideo')}
              {numField('diametro_muneca', 'Muñeca biestiloideo')}
              {numField('diametro_femur', 'Fémur bicondíleo')}
            </div>
            <div>
              <Label>Observaciones</Label>
              <textarea 
                value={form.observaciones} 
                onChange={e => updateField('observaciones', e.target.value)}
                rows={3}
                className="w-full bg-secondary border border-border rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        </div>

        <DialogFooter className="flex justify-between px-6 pb-6 pt-4 border-t border-border flex-shrink-0">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Anterior</Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-primary hover:bg-primary/90">Siguiente</Button>
          ) : (
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Guardar Evaluación</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}