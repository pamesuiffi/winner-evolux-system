import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXERCISES_DB } from '@/data/exerciseDatabase';

const MUSCLE_MAP = [
  { id: 'pectoral', label: 'Pectoral Mayor', function: 'Aducción y rotación interna del brazo. Empuje horizontal.', position: [0, 0.5, 0.35], scale: [0.5, 0.22, 0.15], muscles: ['pecho'] },
  { id: 'deltoides_ant', label: 'Deltoides Anterior', function: 'Flexión y rotación interna del hombro.', position: [0.58, 0.72, 0.18], scale: [0.18, 0.18, 0.14], muscles: ['hombros'] },
  { id: 'deltoides_lat', label: 'Deltoides Lateral', function: 'Abducción del brazo.', position: [0.68, 0.68, 0], scale: [0.14, 0.18, 0.14], muscles: ['hombros'] },
  { id: 'deltoides_post', label: 'Deltoides Posterior', function: 'Extensión y rotación externa del hombro.', position: [0.58, 0.68, -0.2], scale: [0.18, 0.18, 0.14], muscles: ['espalda', 'hombros'] },
  { id: 'biceps', label: 'Bíceps Braquial', function: 'Flexión del codo y supinación del antebrazo.', position: [0.65, 0.35, 0.12], scale: [0.13, 0.28, 0.13], muscles: ['biceps'] },
  { id: 'triceps', label: 'Tríceps Braquial', function: 'Extensión del codo.', position: [0.65, 0.35, -0.12], scale: [0.13, 0.28, 0.13], muscles: ['triceps'] },
  { id: 'dorsal', label: 'Dorsal Ancho', function: 'Aducción, extensión y rotación interna del brazo.', position: [0.3, 0.2, -0.28], scale: [0.38, 0.38, 0.12], muscles: ['espalda'] },
  { id: 'trapecio', label: 'Trapecio', function: 'Elevación, retracción y rotación de escápulas.', position: [0.15, 0.82, -0.08], scale: [0.32, 0.22, 0.1], muscles: ['espalda', 'hombros'] },
  { id: 'cuadriceps', label: 'Cuádriceps', function: 'Extensión de rodilla y flexión de cadera.', position: [0.2, -0.48, 0.2], scale: [0.22, 0.44, 0.18], muscles: ['cuadriceps'] },
  { id: 'gluteo', label: 'Glúteo Mayor', function: 'Extensión y rotación externa de cadera.', position: [0.2, -0.22, -0.2], scale: [0.28, 0.28, 0.18], muscles: ['gluteos'] },
  { id: 'isquio', label: 'Isquiotibiales', function: 'Flexión de rodilla y extensión de cadera.', position: [0.2, -0.52, -0.15], scale: [0.22, 0.38, 0.14], muscles: ['gluteos'] },
  { id: 'pantorrilla', label: 'Gastrocnemio / Sóleo', function: 'Flexión plantar y estabilización del tobillo.', position: [0.15, -1.0, -0.08], scale: [0.15, 0.32, 0.14], muscles: ['pantorrillas'] },
  { id: 'core', label: 'Core (Recto Abdominal)', function: 'Flexión del tronco, estabilización lumbo-pélvica.', position: [0, 0.08, 0.3], scale: [0.35, 0.35, 0.12], muscles: ['core'] },
  { id: 'erector', label: 'Erector Espinal', function: 'Extensión y estabilización de columna vertebral.', position: [0.1, 0.1, -0.28], scale: [0.15, 0.5, 0.1], muscles: ['espalda'] },
  { id: 'antebrazos', label: 'Antebrazos', function: 'Flexión/extensión de muñeca, prensión.', position: [0.65, 0.0, 0], scale: [0.12, 0.28, 0.12], muscles: ['antebrazos'] },
];

export default function AnatomyMode() {
  const mountRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('anterior');
  const [sex, setSex] = useState('masculino');
  const animFrameRef = useRef(null);
  const meshMapRef = useRef({});
  const hoveredRef = useRef(null);

  const selectedExercises = selected
    ? EXERCISES_DB.filter(e =>
        selected.muscles.includes(e.muscle_group) ||
        (e.primary_muscles || []).some(m => m.toLowerCase().includes(selected.label.split(' ')[0].toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth || 320;
    const H = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080808');

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d = new THREE.DirectionalLight(0xffffff, 1);
    d.position.set(2, 3, 4);
    scene.add(d);

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true, opacity: 0.45, roughness: 0.8 });

    const addPart = (geo, pos, rot = [0,0,0]) => {
      const m = new THREE.Mesh(geo, bodyMat);
      m.position.set(...pos);
      m.rotation.set(...rot);
      scene.add(m);
    };

    addPart(new THREE.CapsuleGeometry(0.38, 1.2, 8, 8), [0, 0.3, 0]);
    addPart(new THREE.SphereGeometry(0.3, 16, 16), [0, 1.35, 0]);
    addPart(new THREE.CapsuleGeometry(0.12, 0.7, 8, 8), [-0.6, 0.3, 0], [0, 0, 0.2]);
    addPart(new THREE.CapsuleGeometry(0.12, 0.7, 8, 8), [0.6, 0.3, 0], [0, 0, -0.2]);
    addPart(new THREE.CapsuleGeometry(0.11, 0.5, 8, 8), [-0.6, -0.35, 0]);
    addPart(new THREE.CapsuleGeometry(0.11, 0.5, 8, 8), [0.6, -0.35, 0]);
    addPart(new THREE.CapsuleGeometry(0.14, 0.85, 8, 8), [-0.22, -0.9, 0]);
    addPart(new THREE.CapsuleGeometry(0.14, 0.85, 8, 8), [0.22, -0.9, 0]);
    addPart(new THREE.CapsuleGeometry(0.1, 0.55, 8, 8), [-0.22, -1.75, 0]);
    addPart(new THREE.CapsuleGeometry(0.1, 0.55, 8, 8), [0.22, -1.75, 0]);

    // Muscle overlays
    meshMapRef.current = {};
    MUSCLE_MAP.forEach(muscle => {
      const geo = new THREE.SphereGeometry(0.32, 10, 10);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xFF4D00,
        transparent: true,
        opacity: 0,
        emissive: new THREE.Color('#FF4D00'),
        emissiveIntensity: 0,
        roughness: 0.5,
      });

      [-1, 1].forEach(side => {
        const mesh = new THREE.Mesh(geo.clone(), mat.clone());
        mesh.position.set(muscle.position[0] * side, muscle.position[1], muscle.position[2]);
        mesh.scale.set(...muscle.scale);
        mesh.userData = { muscleId: muscle.id };
        scene.add(mesh);
        if (!meshMapRef.current[muscle.id]) meshMapRef.current[muscle.id] = [];
        meshMapRef.current[muscle.id].push(mesh);
      });
    });

    // Raycaster for click/hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getMouseIntersect = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = Object.values(meshMapRef.current).flat();
      return raycaster.intersectObjects(meshes);
    };

    const handleClick = (e) => {
      const hits = getMouseIntersect(e);
      if (hits.length > 0) {
        const muscleId = hits[0].object.userData.muscleId;
        const muscleData = MUSCLE_MAP.find(m => m.id === muscleId);
        setSelected(muscleData || null);
      } else {
        setSelected(null);
      }
    };

    const handleMove = (e) => {
      const hits = getMouseIntersect(e);
      hoveredRef.current = hits.length > 0 ? hits[0].object.userData.muscleId : null;
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMove);

    // Update visibility based on view
    const updateView = () => {
      if (view === 'anterior') camera.position.set(0, 0, 5);
      else if (view === 'posterior') camera.position.set(0, 0, -5);
      else if (view === 'lateral') camera.position.set(5, 0, 0);
      camera.lookAt(0, 0, 0);
    };
    updateView();

    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.03;

      MUSCLE_MAP.forEach(muscle => {
        const meshes = meshMapRef.current[muscle.id] || [];
        const isSelected = selected?.id === muscle.id;
        const isHovered = hoveredRef.current === muscle.id;

        meshes.forEach(mesh => {
          const targetOpacity = isSelected ? 0.9 : isHovered ? 0.6 : 0.08;
          const targetEmissive = isSelected ? (0.4 + Math.sin(t) * 0.2) : isHovered ? 0.2 : 0;

          mesh.material.opacity += (targetOpacity - mesh.material.opacity) * 0.1;
          mesh.material.emissiveIntensity += (targetEmissive - mesh.material.emissiveIntensity) * 0.1;
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [view, selected]);

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* 3D Panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">Tocá cualquier músculo para explorar</p>
          <div className="flex gap-2">
            {['anterior', 'posterior', 'lateral'].map(v => (
              <button key={v} onClick={() => setView(v)} className="px-3 py-1 rounded-lg text-xs capitalize transition-all"
                style={{
                  background: view === v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${view === v ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: view === v ? '#FF4D00' : '#888',
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div ref={mountRef} className="rounded-2xl overflow-hidden cursor-crosshair" style={{ width: '100%', height: 420, background: '#080808', border: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      {/* Info Panel */}
      <div className="lg:w-72 space-y-4">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key="selected" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="rounded-2xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(255,77,0,0.2)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">{selected.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selected.function}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  <X size={12} />
                </button>
              </div>

              {selectedExercises.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                    <Dumbbell size={11} /> Ejercicios disponibles
                  </p>
                  <div className="space-y-2">
                    {selectedExercises.map(ex => (
                      <div key={ex.id} className="p-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="font-medium text-foreground">{ex.name}</p>
                        <p className="text-muted-foreground">{ex.equipment} · {ex.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-5 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Dumbbell size={20} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Seleccioná un músculo en el modelo 3D para ver su función y ejercicios disponibles</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Grupos musculares</p>
          {MUSCLE_MAP.slice(0, 8).map(m => (
            <button key={m.id} onClick={() => setSelected(m)}
              className="w-full flex items-center gap-2 text-left py-1 hover:text-primary transition-colors">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" style={{ opacity: selected?.id === m.id ? 1 : 0.3 }} />
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}