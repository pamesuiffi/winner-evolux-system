import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Simplified 3D muscle viewer using Three.js
// Maps muscle groups to visual body regions

const MUSCLE_REGIONS = {
  pectoral: { position: [0, 0.5, 0.35], scale: [0.5, 0.25, 0.15] },
  deltoides_anterior: { position: [0.55, 0.7, 0.2], scale: [0.18, 0.2, 0.15] },
  deltoides_lateral: { position: [0.65, 0.65, 0], scale: [0.15, 0.2, 0.15] },
  deltoides_posterior: { position: [0.55, 0.7, -0.2], scale: [0.18, 0.2, 0.15] },
  biceps: { position: [0.65, 0.35, 0.1], scale: [0.13, 0.25, 0.13] },
  triceps: { position: [0.65, 0.35, -0.1], scale: [0.13, 0.25, 0.13] },
  dorsal: { position: [0.3, 0.3, -0.3], scale: [0.4, 0.4, 0.12] },
  trapecio: { position: [0.15, 0.85, -0.1], scale: [0.3, 0.2, 0.1] },
  romboides: { position: [0.2, 0.5, -0.3], scale: [0.3, 0.2, 0.1] },
  cuadriceps: { position: [0.2, -0.5, 0.2], scale: [0.22, 0.45, 0.18] },
  gluteo: { position: [0.2, -0.2, -0.2], scale: [0.28, 0.3, 0.18] },
  isquio: { position: [0.2, -0.5, -0.15], scale: [0.22, 0.4, 0.15] },
  pantorrilla: { position: [0.15, -1.0, -0.1], scale: [0.15, 0.35, 0.15] },
  core: { position: [0, 0.1, 0.3], scale: [0.35, 0.35, 0.12] },
  erector: { position: [0.1, 0.1, -0.3], scale: [0.15, 0.5, 0.1] },
};

function getMuscleKey(muscleName) {
  const name = muscleName.toLowerCase();
  if (name.includes('pectoral') || name.includes('pecho')) return 'pectoral';
  if (name.includes('deltoides anterior') || name.includes('anterior')) return 'deltoides_anterior';
  if (name.includes('deltoides lateral') || name.includes('lateral')) return 'deltoides_lateral';
  if (name.includes('deltoides posterior') || name.includes('posterior')) return 'deltoides_posterior';
  if (name.includes('bíceps') || name.includes('biceps')) return 'biceps';
  if (name.includes('tríceps') || name.includes('triceps')) return 'triceps';
  if (name.includes('dorsal') || name.includes('latísimo')) return 'dorsal';
  if (name.includes('trapecio')) return 'trapecio';
  if (name.includes('romboides')) return 'romboides';
  if (name.includes('cuádr') || name.includes('cuadr')) return 'cuadriceps';
  if (name.includes('glúteo') || name.includes('gluteo')) return 'gluteo';
  if (name.includes('isquio') || name.includes('femoral')) return 'isquio';
  if (name.includes('pantorrilla') || name.includes('gastrocnemio') || name.includes('sóleo')) return 'pantorrilla';
  if (name.includes('core') || name.includes('abdom') || name.includes('recto')) return 'core';
  if (name.includes('erector') || name.includes('lumbar')) return 'erector';
  return null;
}

export default function MuscleViewer3D({ primaryMuscles = [], secondaryMuscles = [], muscleGroup }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [highlightColor, setHighlightColor] = useState('#FF0000');
  const [view, setView] = useState('anterior');
  const animFrameRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth || 300;
    const H = 260;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0a');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);

    // Body base (torso + head + limbs simplified)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), bodyMaterial);
    torso.position.set(0, 0.3, 0);
    scene.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), bodyMaterial);
    head.position.set(0, 1.3, 0);
    scene.add(head);

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.12, 0.7, 8, 8);
    const leftArm = new THREE.Mesh(armGeo, bodyMaterial);
    leftArm.position.set(-0.65, 0.3, 0); leftArm.rotation.z = 0.2;
    scene.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, bodyMaterial.clone());
    rightArm.position.set(0.65, 0.3, 0); rightArm.rotation.z = -0.2;
    scene.add(rightArm);

    // Legs
    const legGeo = new THREE.CapsuleGeometry(0.15, 0.9, 8, 8);
    const leftLeg = new THREE.Mesh(legGeo, bodyMaterial);
    leftLeg.position.set(-0.22, -0.9, 0);
    scene.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, bodyMaterial.clone());
    rightLeg.position.set(0.22, -0.9, 0);
    scene.add(rightLeg);

    // Muscle highlights
    const primaryKeys = primaryMuscles.map(getMuscleKey).filter(Boolean);
    const secondaryKeys = secondaryMuscles.map(getMuscleKey).filter(Boolean);

    const primaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(highlightColor),
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color(highlightColor),
      emissiveIntensity: 0.3,
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF6B00'),
      transparent: true,
      opacity: 0.6,
      emissive: new THREE.Color('#FF6B00'),
      emissiveIntensity: 0.15,
    });

    const muscleMeshes = [];

    [...new Set([...primaryKeys, ...secondaryKeys])].forEach(key => {
      const region = MUSCLE_REGIONS[key];
      if (!region) return;
      const isPrimary = primaryKeys.includes(key);
      const mat = isPrimary ? primaryMat.clone() : secondaryMat.clone();

      // Mirror for left side
      [-1, 1].forEach(side => {
        const geo = new THREE.SphereGeometry(0.3, 12, 12);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(region.position[0] * side, region.position[1], region.position[2]);
        mesh.scale.set(...region.scale.map((s, i) => i === 0 ? s : s));
        scene.add(mesh);
        muscleMeshes.push({ mesh, mat, isPrimary });
      });
    });

    // Camera positioning by view
    const setCameraView = (v) => {
      if (v === 'anterior') camera.position.set(0, 0, 4);
      else if (v === 'posterior') camera.position.set(0, 0, -4);
      else if (v === 'lateral') camera.position.set(4, 0, 0);
      camera.lookAt(0, 0, 0);
    };
    setCameraView(view);

    // Pulsing animation
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.04;
      const pulse = 0.85 + Math.sin(t) * 0.12;
      muscleMeshes.forEach(({ mat, isPrimary }) => {
        if (isPrimary) mat.emissiveIntensity = pulse * 0.4;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [primaryMuscles, secondaryMuscles, highlightColor, view]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {['anterior', 'posterior', 'lateral'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: view === v ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${view === v ? 'rgba(255,77,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: view === v ? '#FF4D00' : '#888',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setHighlightColor('#FF0000')}
            className="w-7 h-7 rounded-full border-2 transition-all"
            style={{ background: '#FF0000', borderColor: highlightColor === '#FF0000' ? '#fff' : 'transparent' }}
          />
          <button
            onClick={() => setHighlightColor('#FFD700')}
            className="w-7 h-7 rounded-full border-2 transition-all"
            style={{ background: '#FFD700', borderColor: highlightColor === '#FFD700' ? '#fff' : 'transparent' }}
          />
        </div>
      </div>

      {/* Canvas */}
      <div ref={mountRef} className="rounded-xl overflow-hidden w-full" style={{ height: 260 }} />
    </div>
  );
}