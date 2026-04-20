import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = `
uniform float uTime;
attribute float aSize;
attribute float aSpeed;
attribute float aOffset;
varying float vAlpha;

void main() {
  vec3 pos = position;

  float t = uTime * aSpeed + aOffset;
  pos.y += sin(pos.x * 0.7 + t) * 0.35;
  pos.y += cos(pos.z * 0.5 + t * 0.6) * 0.2;
  pos.x += sin(pos.y * 0.4 + t * 0.8) * 0.15;
  pos.z += cos(pos.x * 0.3 + t * 0.4) * 0.1;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (350.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;

  float depth = clamp(1.0 - (-mvPos.z - 0.5) / 18.0, 0.0, 1.0);
  vAlpha = depth * smoothstep(0.0, 1.5, pos.y + 7.0) * 0.55;
}
`;

const FRAG = `
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d) * vAlpha;
  gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}
`;

const VERT_LINES = `
uniform float uTime;
varying float vAlpha;
void main() {
  vec3 pos = position;
  pos.y += sin(pos.x * 0.3 + uTime * 0.08) * 0.6;
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  vAlpha = 0.06 + 0.03 * sin(pos.x * 0.5 + uTime * 0.15);
}
`;

const FRAG_LINES = `
varying float vAlpha;
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha);
}
`;

export default function WebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080808, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.055);

    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100);
    camera.position.set(0, 0, 8);

    // === PARTICLES ===
    const COUNT = 2800;
    const pos = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      sizes[i]   = Math.random() * 2.8 + 0.4;
      speeds[i]  = Math.random() * 0.35 + 0.12;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
    pGeo.setAttribute("aSpeed",   new THREE.BufferAttribute(speeds, 1));
    pGeo.setAttribute("aOffset",  new THREE.BufferAttribute(offsets, 1));

    const pMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // === GRID LINES ===
    const linesGeo = new THREE.BufferGeometry();
    const lVerts = [];
    const GRID = 18;
    const STEP = 2.2;
    for (let x = -GRID; x <= GRID; x++) {
      lVerts.push(x * STEP, -GRID * STEP, -6,  x * STEP, GRID * STEP, -6);
    }
    for (let y = -GRID; y <= GRID; y++) {
      lVerts.push(-GRID * STEP, y * STEP, -6,  GRID * STEP, y * STEP, -6);
    }
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(lVerts, 3));
    const lMat = new THREE.ShaderMaterial({
      vertexShader: VERT_LINES,
      fragmentShader: FRAG_LINES,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
    });
    scene.add(new THREE.LineSegments(linesGeo, lMat));

    // === MOUSE PARALLAX ===
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const onMouse = (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 1.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 1.0;
    };
    window.addEventListener("mousemove", onMouse);

    // === RESIZE ===
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // === ANIMATE ===
    const clock = new THREE.Clock();
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      curX += (targetX - curX) * 0.035;
      curY += (targetY - curY) * 0.035;
      camera.position.x = curX * 0.8;
      camera.position.y = -curY * 0.5;
      camera.lookAt(0, 0, 0);

      pMat.uniforms.uTime.value = t;
      lMat.uniforms.uTime.value = t;

      particles.rotation.y = t * 0.012;
      particles.rotation.x = t * 0.005;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pGeo.dispose(); pMat.dispose();
      linesGeo.dispose(); lMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: -1,
        width: "100%", height: "100%", display: "block",
      }}
    />
  );
}
