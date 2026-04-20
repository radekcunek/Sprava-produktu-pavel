import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ── Accent colours per category ── */
const ACCENT = {
  Elektronika:   0x6366f1,
  Příslušenství: 0x8b5cf6,
  Komponenty:    0x0ea5e9,
  Audio:         0x10b981,
  Ostatní:       0xf59e0b,
};

/* ═══════════════════════════════════════
   MODEL BUILDERS
═══════════════════════════════════════ */

function mStd(hex, met = 0.8, rou = 0.2, emi = 0, emiInt = 0) {
  return new THREE.MeshStandardMaterial({
    color: hex, metalness: met, roughness: rou,
    emissive: emi ? emi : 0x000000, emissiveIntensity: emiInt,
  });
}

/* Laptop */
function buildLaptop(accent) {
  const g = new THREE.Group();
  const body  = mStd(0x1c1c2e, 0.85, 0.15);
  const dark  = mStd(0x080810, 0.2,  0.9);
  const acc   = mStd(accent,   0.5,  0.3, accent, 0.3);

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.8), body);
  base.position.y = 0;
  g.add(base);

  // Screen housing
  const housing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.65, 0.08), body);
  housing.position.set(0, 0.93, -0.86);
  housing.rotation.x = 0.1;
  g.add(housing);

  // Display panel
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.28, 1.38, 0.02), dark);
  panel.position.set(0, 0.93, -0.82);
  panel.rotation.x = 0.1;
  g.add(panel);

  // Glowing screen content (fake display)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.28, 1.38, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x0a0a1a, emissive: accent, emissiveIntensity: 0.08 }));
  screen.position.set(0, 0.93, -0.815);
  screen.rotation.x = 0.1;
  g.add(screen);

  // Glowing accent stripe (Apple-style back logo)
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.025, 0.025), acc);
  stripe.position.set(0, 0.06, -0.86);
  g.add(stripe);

  // Keyboard rows (5 rows of keys)
  for (let row = 0; row < 4; row++) {
    const keys = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.018, 0.12),
      mStd(0x252535, 0.6, 0.5)
    );
    keys.position.set(0, 0.065, -0.55 + row * 0.28);
    g.add(keys);
    // Key gap lines
    for (let k = 0; k < 10; k++) {
      const gap = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.02, 0.12), mStd(0x050508));
      gap.position.set(-1.05 + k * 0.22, 0.065, -0.55 + row * 0.28);
      g.add(gap);
    }
  }

  // Trackpad
  const tp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.008, 0.52), mStd(0x1e1e30, 0.7, 0.3));
  tp.position.set(0, 0.058, 0.55);
  g.add(tp);

  // Hinge detail
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12), mStd(0x303048, 0.9, 0.1));
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.055, -0.86);
  g.add(hinge);

  // Camera dot
  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mStd(0x101010, 0.1, 0.9));
  cam.position.set(0, 1.71, -0.79);
  cam.rotation.x = 0.1;
  g.add(cam);

  g.position.y = -0.3;
  return g;
}

/* Mouse */
function buildMouse(accent) {
  const g = new THREE.Group();
  const body = mStd(0x111120, 0.85, 0.15);
  const dark = mStd(0x060610, 0.3,  0.8);
  const acc  = mStd(accent,   0.4,  0.4, accent, 0.35);

  // Body – three overlapping ellipsoids
  const mainBody = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 32), body);
  mainBody.scale.set(0.88, 0.52, 1.25);
  g.add(mainBody);

  // Flat bottom
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 48), dark);
  bottom.position.y = -0.27;
  g.add(bottom);

  // Left button
  const lBtn = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 32), mStd(0x151525, 0.8, 0.2));
  lBtn.scale.set(0.43, 0.48, 1.2);
  lBtn.position.x = -0.22;
  g.add(lBtn);

  // Button seam
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 1.2), dark);
  seam.position.set(0, 0.2, -0.1);
  g.add(seam);

  // Scroll wheel
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 20), acc);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0, 0.32, -0.08);
  g.add(wheel);

  // Wheel grooves
  for (let i = 0; i < 8; i++) {
    const groove = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 4, 16), dark);
    groove.rotation.x = Math.PI / 2;
    groove.position.set(0, 0.32, -0.08 + (i - 3.5) * 0.023);
    g.add(groove);
  }

  // Side accent strip
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.18, 0.65), acc);
  side.position.set(-0.6, 0.08, 0.15);
  g.add(side);

  // Logo dot
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), acc);
  logo.rotation.x = -Math.PI / 2;
  logo.position.set(0, 0.38, 0.3);
  g.add(logo);

  g.rotation.x = -0.2;
  g.position.y = -0.1;
  return g;
}

/* CPU Chip */
function buildCPU(accent) {
  const g = new THREE.Group();
  const pcb  = mStd(0x0a2215, 0.3, 0.7);
  const die  = mStd(0x181818, 0.95, 0.05);
  const pin  = mStd(0xc8a020, 1.0,  0.05);
  const acc  = mStd(accent,   0.4,  0.3, accent, 0.5);

  // PCB board
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 2.6), pcb);
  g.add(board);

  // PCB traces (lines)
  for (let i = 0; i < 6; i++) {
    const trace = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.075, 2.6), mStd(0x1a4030, 0.5, 0.5));
    trace.position.set(-0.75 + i * 0.3, 0, 0);
    g.add(trace);
  }
  for (let i = 0; i < 6; i++) {
    const trace = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.075, 0.015), mStd(0x1a4030, 0.5, 0.5));
    trace.position.set(0, 0, -0.75 + i * 0.3);
    g.add(trace);
  }

  // Die (main chip)
  const chip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), die);
  chip.position.y = 0.125;
  g.add(chip);

  // Inner die layers
  const inner = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.185, 1.1), mStd(0x222222, 0.95, 0.05));
  inner.position.y = 0.125;
  g.add(inner);

  // Glowing logo / die mark
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.19, 0.5), acc);
  mark.position.y = 0.125;
  g.add(mark);

  // Four corner caps
  for (let cx of [-0.55, 0.55]) {
    for (let cz of [-0.55, 0.55]) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.19, 0.28), mStd(0x1a1a1a, 0.95, 0.05));
      cap.position.set(cx, 0.125, cz);
      g.add(cap);
    }
  }

  // Pins – 10 per side
  const pinGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.22, 6);
  const PINS = 10, SPAN = 2.0;
  for (let side = 0; side < 4; side++) {
    for (let j = 0; j < PINS; j++) {
      const p2 = new THREE.Mesh(pinGeo, pin);
      const t = (j / (PINS - 1)) * SPAN - SPAN / 2;
      const off = 1.32;
      if (side === 0) p2.position.set(t, -0.09, -off);
      if (side === 1) p2.position.set(t, -0.09,  off);
      if (side === 2) p2.position.set(-off, -0.09, t);
      if (side === 3) p2.position.set( off, -0.09, t);
      g.add(p2);
    }
  }

  g.position.y = -0.05;
  return g;
}

/* Headphones */
function buildHeadphones(accent) {
  const g = new THREE.Group();
  const body    = mStd(0x101010, 0.85, 0.12);
  const cushion = mStd(0x1a0808, 0.1,  0.95);
  const acc     = mStd(accent,   0.5,  0.3, accent, 0.3);

  // Headband arc
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.065, 16, 64, Math.PI), body);
  band.rotation.z = Math.PI / 2;
  band.position.y = 0.6;
  g.add(band);

  // Headband padding
  const pad = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.055, 12, 64, Math.PI * 0.7),
    mStd(0x181818, 0.1, 0.9));
  pad.rotation.z = Math.PI / 2;
  pad.rotation.x = 0.25;
  pad.position.y = 0.55;
  g.add(pad);

  // Slider arms (left & right)
  for (let side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 10), body);
    arm.position.set(side * 1.05, -0.05, 0);
    g.add(arm);

    // Ear cup shell
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), body);
    cup.scale.set(1, 0.82, 0.72);
    cup.position.set(side * 1.05, -0.5, 0);
    g.add(cup);

    // Ear cushion torus
    const cush = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.11, 16, 48), cushion);
    cush.position.set(side * 1.05, -0.5, 0.25);
    cush.rotation.y = Math.PI / 2;
    g.add(cush);

    // Accent ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 10, 40), acc);
    ring.position.set(side * 1.05, -0.5, -0.28);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);

    // Accent dot
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20), acc);
    dot.position.set(side * 1.38, -0.5, 0);
    dot.rotation.y = side * Math.PI / 2;
    g.add(dot);
  }

  g.scale.setScalar(0.82);
  g.position.y = -0.1;
  return g;
}

/* Package / Box */
function buildBox(accent) {
  const g = new THREE.Group();
  const cardboard = mStd(0x1c1510, 0.15, 0.85);
  const tape      = mStd(accent,   0.3,  0.5, accent, 0.25);
  const dark      = mStd(0x0a0905, 0.1,  0.9);

  // Main box
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.9, 1.9), cardboard);
  g.add(box);

  // Box flap lines
  const flapH = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.01, 0.01), dark);
  flapH.position.set(0, 0.95, 0.96);
  g.add(flapH);
  const flapV = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 1.92), dark);
  flapV.position.set(0, 0.95, 0);
  g.add(flapV);

  // Tape strip
  const tapeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.92, 1.92), tape);
  g.add(tapeStrip);
  const tapeTop = new THREE.Mesh(new THREE.BoxGeometry(1.92, 1.92, 0.22), tape);
  g.add(tapeTop);

  // Edge highlights
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 1.9, 1.9));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.4 }));
  g.add(edges);

  // Logo face
  const logo = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.01), tape);
  logo.position.set(0, 0, 0.96);
  g.add(logo);

  // Corner protectors
  const corners = [[-1,-1,-1],[1,-1,-1],[-1,-1,1],[1,-1,1],[-1,1,-1],[1,1,-1],[-1,1,1],[1,1,1]];
  corners.forEach(([cx, cy, cz]) => {
    const corner = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mStd(0x252015, 0.3, 0.7));
    corner.position.set(cx * 0.94, cy * 0.94, cz * 0.94);
    g.add(corner);
  });

  g.rotation.y = Math.PI / 5;
  g.rotation.x = 0.15;
  return g;
}

function buildModel(kategorie, accent) {
  switch (kategorie) {
    case "Elektronika":   return buildLaptop(accent);
    case "Příslušenství": return buildMouse(accent);
    case "Komponenty":    return buildCPU(accent);
    case "Audio":         return buildHeadphones(accent);
    default:              return buildBox(accent);
  }
}

/* ═══════════════════════════════════════
   REACT COMPONENT
═══════════════════════════════════════ */

export default function ThreeCarousel({ produkty, progress, activeIdx }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({});   // { renderer, scene, camera, ringGroup, models, clock }
  const progRef    = useRef(0);
  const activeRef  = useRef(0);
  const mouseRef   = useRef({ x: 0, y: 0 });

  /* ── Init scene once ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth  || canvas.offsetWidth  || 600;
    const H = canvas.clientHeight || canvas.offsetHeight || 500;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace   = THREE.SRGBColorSpace;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 8);
    camera.lookAt(0, 0, 0);

    /* Lighting */
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(5, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(1024);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8899ff, 0.45);
    fill.position.set(-6, 3, -4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xaaccff, 0.3);
    rim.position.set(0, -5, -6);
    scene.add(rim);

    const front = new THREE.PointLight(0xffffff, 1.8, 14);
    front.position.set(0, 2, 6);
    scene.add(front);

    /* Ring group */
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const clock = new THREE.Clock();
    stateRef.current = { renderer, scene, camera, ringGroup, models: [], clock };

    /* Animate loop */
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* Camera soft follow mouse */
      camera.position.x += (mouseRef.current.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (mouseRef.current.y * 0.4 + 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      /* Slow self-rotation of active model */
      const { models } = stateRef.current;
      if (models[activeRef.current]) {
        models[activeRef.current].rotation.y += 0.007;
      }

      /* Gentle breathing of active model */
      if (models[activeRef.current]) {
        const s = 1 + Math.sin(t * 1.8) * 0.015;
        models[activeRef.current].scale.setScalar(s);
      }

      renderer.render(scene, camera);
    };
    animate();

    /* Resize */
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    /* Mouse move */
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      renderer.dispose();
    };
  }, []);

  /* ── Rebuild models when produkty changes ── */
  useEffect(() => {
    const { ringGroup, models } = stateRef.current;
    if (!ringGroup) return;

    /* Remove old */
    models.forEach(m => {
      ringGroup.remove(m);
      m.traverse(c => { if (c.geometry) c.geometry.dispose(); });
    });

    const N = produkty.length;
    if (N === 0) { stateRef.current.models = []; return; }

    const RADIUS = Math.max(3.2, N * 0.7);
    const newModels = produkty.map((p, i) => {
      const angle  = (i / N) * Math.PI * 2;
      const accent = ACCENT[p.kategorie] || 0x6366f1;
      const model  = buildModel(p.kategorie, accent);

      model.position.set(
        Math.sin(angle) * RADIUS,
        0,
        Math.cos(angle) * RADIUS,
      );
      model.rotation.y = angle; // face outward

      ringGroup.add(model);
      return model;
    });

    stateRef.current.models = newModels;
  }, [produkty]);

  /* ── Update ring rotation from scroll progress ── */
  useEffect(() => {
    progRef.current  = progress;
    activeRef.current = activeIdx;
    const { ringGroup } = stateRef.current;
    if (!ringGroup) return;
    const N = produkty.length;
    if (N <= 1) return;
    ringGroup.rotation.y = -progress * (N - 1) * (Math.PI * 2 / N);
  }, [progress, activeIdx, produkty.length]);

  return (
    <canvas
      ref={canvasRef}
      className="three-cr-canvas"
    />
  );
}
