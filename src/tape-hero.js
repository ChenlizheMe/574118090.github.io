/* Hero · a pile of compact cassettes; the one on top is a projector that
   casts a holographic Stanford Bunny (Stanford 3D Scanning Repository,
   bun_zipper_res2 / res4). Three projection modes cycle: HOLO, WIRE, POINTS.
   Hover lifts a tape, click ejects it, click the projector or the bunny to
   switch modes. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const BG = 0x070b18;
const AMBER = new THREE.Color('#ffb000');
const MODES = ['HOLO', 'WIRE', 'POINTS'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- geometry helpers ---------- */
function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function stadium(cx, cy, w, h) {
  const p = new THREE.Path(), r = h / 2;
  p.moveTo(cx - w / 2 + r, cy - r); p.lineTo(cx + w / 2 - r, cy - r);
  p.absarc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2, false);
  p.lineTo(cx - w / 2 + r, cy + r);
  p.absarc(cx - w / 2 + r, cy, r, Math.PI / 2, Math.PI * 1.5, false);
  return p;
}

/* ---------- cassette dimensions (1 unit ≈ 1 cm) ---------- */
const CW = 10, CH = 6.3, CD = 1.0, BEV = 0.1;
const HALF = CD / 2 + BEV;
const WIN = { x: 0, y: 0.35, w: 6.2, h: 2.0 };
const HUB_X = 2.1;
const LABEL = { w: 9.0, h: 4.6, y: 0.55 };

const LABELS = [
  { base: '#efe7d6', ink: '#191714', title: 'Lizhe Chen · Vol. 1', sub: 'GRAPHICS / VLM / GAMES', stripes: ['#f5b91d', '#ef7a1c', '#e2381b', '#8a3a1d'], side: 'A', tag: 'C-90' },
  { base: '#d9c08a', ink: '#2a2112', title: 'Infernux — engine log', sub: 'VULKAN · WEBGPU · JOLT', stripes: ['#191714', '#e2381b'], side: 'A', tag: 'C-60' },
  { base: '#f4f1ea', ink: '#1a1a1a', title: 'GS-NTC sessions', sub: '4× SPEED · +5 dB', stripes: ['#2b62d4', '#86b4ff'], side: 'B', tag: 'TYPE II' },
  { base: '#ef7a1c', ink: '#1a1208', title: 'Game Jam B-sides', sub: 'GGJ · CIGA · miHoYo', stripes: ['#191714', '#f5b91d'], side: 'B', tag: 'C-46' },
  { base: '#0e1730', ink: '#efe7d6', title: 'Shader demos', sub: 'NPR · PBR · SPLATS', stripes: ['#ffb000', '#ef7a1c', '#e2381b'], side: 'A', tag: 'METAL' },
  { base: '#efe7d6', ink: '#191714', title: 'SkillForge', sub: 'NEURIPS 2026', stripes: ['#0f8d67', '#52e6aa'], side: 'A', tag: 'C-60' },
  { base: '#e2381b', ink: '#fff4e6', title: 'Dong! Da-Dong!', sub: 'RHYTHM · ACTION', stripes: ['#191714', '#f5b91d'], side: 'A', tag: 'C-90' },
  { base: '#f4f1ea', ink: '#191714', title: 'Mixtape ’26', sub: 'TSINGHUA · SIGS', stripes: ['#e2381b', '#191714'], side: 'B', tag: 'TYPE I' },
  { base: '#d9c08a', ink: '#2a2112', title: 'Vulkan nights', sub: 'RENDER GRAPH', stripes: ['#8a3a1d', '#ef7a1c'], side: 'A', tag: 'C-120' },
  { base: '#efe7d6', ink: '#191714', title: 'Tree · 樹', sub: 'CIGA JAM 2025', stripes: ['#0f8d67', '#f5b91d'], side: 'A', tag: 'C-60' }
];
const SHELLS = [0x1c1a17, 0xe9e2d3, 0x2a2724, 0xe2381b, 0x3a2f27, 0xc9c1b2, 0x1c1a17, 0xef7a1c, 0x24324f, 0x1c1a17];

export function mountTapeHero({ canvas, host, tagEl, reduced = false, onMode, onCount }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(BG, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 42, 92);
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 260);
  const disposables = [];
  const keep = x => { disposables.push(x); return x; };

  /* ---------- canvas textures ---------- */
  const redraws = [];
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const tex = keep(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const run = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
    run(); redraws.push(run);
    return tex;
  };
  if (document.fonts?.load) {
    Promise.all(['400 40px "Special Elite"', '800 40px "Archivo Variable"', '500 20px "JetBrains Mono"'].map(f => document.fonts.load(f).catch(() => null)))
      .then(() => redraws.forEach(f => f()));
  }

  const drawLabel = spec => (g, w, h) => {
    const S = w / LABEL.w;
    g.fillStyle = spec.base;
    g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, h, 26) : g.rect(0, 0, w, h); g.fill();
    // stripes along the bottom band
    const sh = 22, sy = h - 30 - spec.stripes.length * sh;
    spec.stripes.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, sy + i * sh, w, sh); });
    g.fillStyle = spec.ink;
    g.font = '400 66px "Special Elite", "Courier New", monospace';
    g.fillText(spec.title, 44, 92);
    g.globalAlpha = .75;
    g.font = '500 26px "JetBrains Mono", monospace';
    g.fillText(spec.sub, 46, 138);
    g.textAlign = 'right'; g.fillText(spec.tag, w - 46, 138);
    g.globalAlpha = 1;
    g.font = '800 104px "Archivo Variable", Arial, sans-serif';
    g.fillText(spec.side, w - 42, 104);
    g.globalAlpha = .25; g.fillRect(44, 150, w - 88, 3); g.globalAlpha = 1;
    // punch the window
    const wcx = w / 2 + (WIN.x) * S, wcy = h / 2 - (WIN.y - LABEL.y) * S;
    const ww = (WIN.w + 0.32) * S, wh = (WIN.h + 0.32) * S, r = wh / 2;
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.beginPath();
    g.moveTo(wcx - ww / 2 + r, wcy - r);
    g.arc(wcx + ww / 2 - r, wcy, r, -Math.PI / 2, Math.PI / 2);
    g.arc(wcx - ww / 2 + r, wcy, r, Math.PI / 2, Math.PI * 1.5);
    g.fill(); g.restore();
    // window frame ticks (tape counter marks)
    g.strokeStyle = spec.ink; g.globalAlpha = .4; g.lineWidth = 3;
    for (let i = 0; i <= 10; i++) { const x = wcx - ww / 2 + 30 + i * (ww - 60) / 10; g.beginPath(); g.moveTo(x, wcy + r + 8); g.lineTo(x, wcy + r + (i % 5 ? 18 : 28)); g.stroke(); }
    g.globalAlpha = 1;
  };
  const labelTex = LABELS.map(spec => canvasTex(1024, Math.round(1024 * LABEL.h / LABEL.w), drawLabel(spec)));
  const hubTex = canvasTex(128, 128, (g) => {
    g.fillStyle = '#efe7d6'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#121110'; g.beginPath(); g.arc(64, 64, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#efe7d6';
    for (let i = 0; i < 6; i++) { g.save(); g.translate(64, 64); g.rotate(i * Math.PI / 3); g.fillRect(-5, -31, 10, 13); g.restore(); }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 46, 0, Math.PI * 2); g.stroke();
  });
  const dotTex = canvasTex(64, 64, g => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  });

  /* ---------- shared cassette geometry ---------- */
  const shellShape = roundedRect(CW, CH, 0.42);
  shellShape.holes.push(stadium(WIN.x, WIN.y, WIN.w, WIN.h));
  const shellGeo = keep(new THREE.ExtrudeGeometry(shellShape, { depth: CD, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 2, curveSegments: 18 }));
  shellGeo.translate(0, 0, -CD / 2);
  const trap = new THREE.Shape();
  trap.moveTo(-3.7, -CH / 2 + .06); trap.lineTo(-3.0, -2.05); trap.lineTo(3.0, -2.05); trap.lineTo(3.7, -CH / 2 + .06); trap.closePath();
  const trapGeo = keep(new THREE.ExtrudeGeometry(trap, { depth: 0.14, bevelEnabled: false }));
  const labelGeo = keep(new THREE.PlaneGeometry(LABEL.w, LABEL.h));
  const packGeo = keep(new THREE.CylinderGeometry(1, 1, 0.72, 48)); packGeo.rotateX(Math.PI / 2);
  const hubGeo = keep(new THREE.CylinderGeometry(0.62, 0.62, 0.86, 28)); hubGeo.rotateX(Math.PI / 2);
  const backGeo = keep(new THREE.PlaneGeometry(WIN.w + .4, WIN.h + .4));
  const screwGeo = keep(mergeGeometries([[-4.55, 2.75], [4.55, 2.75], [-4.55, -2.75], [4.55, -2.75], [0, -1.6]].map(([x, y]) => {
    const g = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14); g.rotateX(Math.PI / 2); g.translate(x, y, HALF + .02); return g;
  })));

  const M = {
    pack: keep(new THREE.MeshStandardMaterial({ color: 0x3b2516, roughness: .32, metalness: .45 })),
    hub: keep(new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: .6 })),
    hubCap: keep(new THREE.MeshStandardMaterial({ map: hubTex, roughness: .6 })),
    back: keep(new THREE.MeshStandardMaterial({ color: 0x0e0c0a, roughness: .9, side: THREE.DoubleSide })),
    screw: keep(new THREE.MeshStandardMaterial({ color: 0xb9b2a6, metalness: .9, roughness: .3 })),
    trap: keep(new THREE.MeshStandardMaterial({ color: 0x2c2925, roughness: .5, metalness: .2 }))
  };
  const shellMats = SHELLS.map(c => keep(new THREE.MeshStandardMaterial({ color: c, roughness: .42, metalness: .08 })));
  const labelMats = labelTex.map(t => keep(new THREE.MeshStandardMaterial({ map: t, roughness: .78, alphaTest: .5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })));

  const makeCassette = (i, fill) => {
    const g = new THREE.Group();
    const add = (geo, mat, shadow = true) => { const m = new THREE.Mesh(geo, mat); if (shadow) { m.castShadow = true; m.receiveShadow = true; } g.add(m); return m; };
    add(shellGeo, shellMats[i % shellMats.length]);
    const lf = add(labelGeo, labelMats[i % labelMats.length], false); lf.position.set(0, LABEL.y, HALF + .012); lf.receiveShadow = true;
    const lb = add(labelGeo, labelMats[(i + 3) % labelMats.length], false); lb.position.set(0, LABEL.y, -HALF - .012); lb.rotation.y = Math.PI; lb.receiveShadow = true;
    const t = add(trapGeo, M.trap); t.position.z = HALF - .02;
    add(screwGeo, M.screw, false);
    const back = add(backGeo, M.back, false); back.position.set(WIN.x, WIN.y, 0);
    const reels = [-HUB_X, HUB_X].map((x, k) => {
      const r = new THREE.Group(); r.position.set(x, WIN.y, 0);
      const pack = new THREE.Mesh(packGeo, M.pack);
      const radius = k === 0 ? lerp(.75, 1.95, fill) : lerp(1.95, .75, fill);
      pack.scale.set(radius, radius, 1);
      const hub = new THREE.Mesh(hubGeo, [M.hub, M.hubCap, M.hubCap]);
      r.add(pack, hub); g.add(r);
      return r;
    });
    g.userData.reels = reels;
    return g;
  };

  /* ---------- the pile ---------- */
  const T = 2 * HALF;
  // [x, y, z, yaw, tiltX, tiltZ, label, fill]
  const PILE = [
    [0.0, HALF, 0.0, 0.08, 0, 0, 1, .3],
    [0.5, HALF + T, -0.3, -0.16, 0, 0, 2, .6],
    [-0.2, HALF + 2 * T, 0.15, 0.22, 0, 0, 0, .45], // projector
    [-11.0, HALF, -3.6, 0.55, 0, 0, 3, .2],
    [-10.6, HALF + T, -3.9, 0.32, 0, 0, 4, .8],
    [-11.3, HALF + 2 * T, -3.3, 0.74, 0, 0, 5, .5],
    [-10.8, HALF + 3 * T + .45, -3.7, 0.4, 0.06, -0.12, 6, .1],
    [10.2, HALF, 3.0, -0.62, 0, 0, 7, .7],
    [6.2, HALF, 8.8, 1.08, 0, 0, 8, .35],
    [-5.2, HALF, 8.4, -0.32, 0, 0, 9, .9],
    [8.9, 2.55, -2.1, -0.38, 0, 0.29, 5, .55],
    [-4.2, CH / 2 + .02, -7.4, 0.18, Math.PI / 2, 0, 6, .4],
    [4.6, CH / 2 + .1, -7.9, -0.3, Math.PI / 2, 0.11, 8, .6],
    [-15.6, HALF, 4.4, 1.4, 0, 0, 2, .25]
  ];
  const PROJ = 2;
  const tapes = PILE.map(([x, y, z, yaw, tx, tz, label, fill], i) => {
    const wrap = new THREE.Group();
    const c = makeCassette(label, fill);
    c.rotation.x = -Math.PI / 2;
    const tilt = new THREE.Group(); tilt.rotation.set(tx, 0, tz); tilt.add(c);
    wrap.add(tilt);
    wrap.position.set(x, y, z); wrap.rotation.y = yaw;
    scene.add(wrap);
    c.traverse(o => { o.userData.tape = i; });
    return { wrap, cass: c, base: wrap.position.clone(), yaw, lift: 0, liftT: 0, eject: -1, spin: 0, reels: c.userData.reels };
  });
  onCount?.(tapes.length);

  /* ---------- unspooled tape ribbon ---------- */
  {
    const pts = [[6.2, .05, 8.8], [3.4, .05, 10.6], [0.4, .05, 9.4], [-1.6, .05, 11.8], [-4.8, .05, 12.6], [-8.4, .05, 11.2], [-10.6, .05, 13.4]]
      .map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const N = 220, wdt = .34, pos = [], idx = [];
    const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(), tan = new THREE.Vector3();
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = curve.getPointAt(u); curve.getTangentAt(u, tan);
      const tw = Math.sin(u * 9.0) * 0.9;
      const n = up.clone().applyAxisAngle(tan, tw);
      side.crossVectors(tan, n).normalize().multiplyScalar(wdt / 2);
      p.y += Math.abs(Math.sin(u * 9.0)) * 0.09;
      pos.push(p.x + side.x, p.y + side.y, p.z + side.z, p.x - side.x, p.y - side.y, p.z - side.z);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = keep(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const rib = new THREE.Mesh(geo, keep(new THREE.MeshStandardMaterial({ color: 0x4a2d18, roughness: .25, metalness: .6, side: THREE.DoubleSide })));
    rib.receiveShadow = true; rib.castShadow = true; scene.add(rib);
  }

  /* ---------- floor ---------- */
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(400, 400)), keep(new THREE.MeshStandardMaterial({ color: 0x0b142c, roughness: .92 })));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(160, 80, 0x2c4380, 0x172752);
  grid.material.transparent = true; grid.material.opacity = .32; grid.position.y = .004; scene.add(grid);
  keep(grid.geometry); keep(grid.material);

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xc9d6ff, 0x120d08, 1.1));
  const key = new THREE.DirectionalLight(0xffe9cf, 2.6);
  key.position.set(-16, 30, 20); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 1, far: 90 });
  key.shadow.bias = -.0004; key.shadow.normalBias = .04;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a2a, 1.4); rim.position.set(18, 9, -20); scene.add(rim);

  /* ---------- projector + hologram ---------- */
  const proj = tapes[PROJ];
  scene.updateMatrixWorld(true);
  const lens = new THREE.Vector3(WIN.x, WIN.y, HALF);
  proj.cass.localToWorld(lens);
  const holo = new THREE.Group(); scene.add(holo);
  holo.position.copy(lens);
  const BH = 8.6, BUN_Y = 1.7;           // bunny height and float above the lens
  const beamH = BUN_Y + BH + 0.6;

  const projLight = new THREE.PointLight(0xffb000, 70, 30, 1.6); projLight.position.set(0, 2.5, 0); holo.add(projLight);
  const lensGlow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: dotTex, color: 0xffc04a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  lensGlow.scale.set(3.4, 3.4, 1); lensGlow.position.y = .15; holo.add(lensGlow);

  const beamMat = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uColor: { value: AMBER.clone() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float uTime, uOn; uniform vec3 uColor; varying vec2 vUv;
      void main(){
        float fall = pow(1.0 - vUv.y, 1.6);
        float streak = 0.55 + 0.45 * sin(vUv.x * 62.83 * 3.0 + uTime * 1.7) * sin(vUv.x * 62.83 * 1.3 - uTime * 0.9);
        float pulse = 0.85 + 0.15 * sin(uTime * 9.0);
        gl_FragColor = vec4(uColor, fall * streak * 0.32 * pulse * uOn);
      }`
  }));
  const beamGeo = keep(new THREE.CylinderGeometry(5.2, 0.75, beamH, 64, 1, true));
  beamGeo.translate(0, beamH / 2 + .1, 0);
  holo.add(new THREE.Mesh(beamGeo, beamMat));

  // hologram materials (shared shader, three flavours)
  const holoUniforms = { uTime: { value: 0 }, uBuild: { value: -0.05 }, uGlitch: { value: 0 }, uColor: { value: AMBER.clone() } };
  const VS_COMMON = `uniform float uTime, uGlitch; varying float vY;
    vec3 glitch(vec3 p){
      float slice = floor(p.y * 18.0) + floor(uTime * 14.0);
      float r = fract(sin(slice * 91.7) * 43758.5453);
      p.x += uGlitch * (r - 0.5) * 0.35 * step(0.62, r);
      return p;
    }`;
  const surfMat = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { ...holoUniforms, uAlpha: { value: 1 } },
    vertexShader: `${VS_COMMON} varying vec3 vN; varying vec3 vV;
      void main(){ vec3 p = glitch(position); vY = position.y;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = -mv.xyz; vN = normalMatrix * normal;
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime, uBuild, uAlpha; uniform vec3 uColor; varying float vY; varying vec3 vN; varying vec3 vV;
      void main(){
        if (vY > uBuild) discard;
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float scan = 0.6 + 0.4 * sin(vY * 240.0 - uTime * 8.0);
        float sweep = smoothstep(0.06, 0.0, abs(vY - fract(uTime * 0.22) * 1.3 + 0.15));
        float front = smoothstep(0.035, 0.0, uBuild - vY);
        float a = (0.018 + fres * 0.55) * scan + sweep * 0.22 + front * 1.2;
        vec3 col = uColor * (0.5 + fres * 0.7) + vec3(1.0, 0.92, 0.75) * (sweep * 0.4 + front);
        gl_FragColor = vec4(col, a * uAlpha);
      }`
  }));
  const lineMat = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...holoUniforms, uAlpha: { value: 0.3 } },
    vertexShader: `${VS_COMMON} void main(){ vec3 p = glitch(position); vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform float uTime, uBuild, uAlpha; uniform vec3 uColor; varying float vY;
      void main(){ if (vY > uBuild) discard; float f = 0.75 + 0.25 * sin(vY * 90.0 - uTime * 5.0);
        gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.95, 0.8), 0.25), f * uAlpha); }`
  }));
  const pointMat = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...holoUniforms, uAlpha: { value: 0.25 }, uSize: { value: 2.0 }, uMap: { value: dotTex } },
    vertexShader: `${VS_COMMON} uniform float uSize; attribute float aSeed; varying float vTw;
      void main(){ vec3 p = glitch(position); vY = position.y;
        vTw = 0.55 + 0.45 * sin(uTime * 3.0 + aSeed * 40.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (220.0 / -mv.z);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uBuild, uAlpha; uniform vec3 uColor; uniform sampler2D uMap; varying float vY; varying float vTw;
      void main(){ if (vY > uBuild) discard; float d = texture2D(uMap, gl_PointCoord).a;
        gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.9, 0.6), 0.2 * vTw), d * vTw * uAlpha); }`
  }));

  const bunny = new THREE.Group();
  bunny.position.y = BUN_Y; bunny.scale.setScalar(BH);
  holo.add(bunny);
  let bunnySurf = null;
  // base rings that the hologram stands on
  const ringTex = canvasTex(512, 512, (g) => {
    g.translate(256, 256); g.strokeStyle = '#ffffff';
    g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 236, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.setLineDash([10, 14]); g.beginPath(); g.arc(0, 0, 200, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
    for (let i = 0; i < 72; i++) { g.save(); g.rotate(i * Math.PI / 36); g.fillStyle = '#fff'; g.fillRect(-1.5, -250, 3, i % 6 ? 10 : 24); g.restore(); }
    g.font = '600 22px "JetBrains Mono", monospace'; g.fillStyle = '#fff'; g.textAlign = 'center';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + .3); g.fillText('STANFORD BUNNY · 1994', 0, -168); g.restore(); }
  });
  const ringMat = keep(new THREE.MeshBasicMaterial({ map: ringTex, color: 0xffb000, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  const ring = new THREE.Mesh(keep(new THREE.PlaneGeometry(7.6, 7.6)), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = BUN_Y - .05; holo.add(ring);

  fetch('/img/models/stanford-bunny.bin').then(r => { if (!r.ok) throw new Error('bunny'); return r.arrayBuffer(); }).then(buf => {
    if (disposed) return;
    const head = new Uint32Array(buf, 4, 4);
    const [nv, nf, lv, le] = head;
    let o = 20;
    const sv = new Float32Array(buf.slice(o, o + nv * 12)); o += nv * 12;
    const sf = new Uint16Array(buf.slice(o, o + nf * 6)); o += nf * 6;
    const wv = new Float32Array(buf.slice(o, o + lv * 12)); o += lv * 12;
    const we = new Uint16Array(buf.slice(o, o + le * 4));
    const sg = keep(new THREE.BufferGeometry());
    sg.setAttribute('position', new THREE.BufferAttribute(sv, 3)); sg.setIndex(new THREE.BufferAttribute(sf, 1)); sg.computeVertexNormals();
    bunnySurf = new THREE.Mesh(sg, surfMat); bunnySurf.userData.bunny = true;
    const wg = keep(new THREE.BufferGeometry());
    wg.setAttribute('position', new THREE.BufferAttribute(wv, 3)); wg.setIndex(new THREE.BufferAttribute(we, 1));
    const wire = new THREE.LineSegments(wg, lineMat);
    const pg = keep(new THREE.BufferGeometry());
    pg.setAttribute('position', new THREE.BufferAttribute(sv, 3));
    const seeds = new Float32Array(nv); for (let i = 0; i < nv; i++) seeds[i] = Math.random();
    pg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const pts = new THREE.Points(pg, pointMat);
    bunny.add(bunnySurf, wire, pts);
    bunny.rotation.y = -0.6;
    renderOnce?.();
  }).catch(() => { /* the projector still glows without the model */ });

  // dust motes rising through the beam
  const ND = 180;
  const dPos = new Float32Array(ND * 3), dSpd = new Float32Array(ND);
  const resetMote = (i, y) => {
    const a = Math.random() * Math.PI * 2, h = y ?? Math.random() * beamH;
    const r = Math.sqrt(Math.random()) * lerp(.7, 4.0, h / beamH);
    dPos[i * 3] = Math.cos(a) * r; dPos[i * 3 + 1] = h; dPos[i * 3 + 2] = Math.sin(a) * r; dSpd[i] = rand(.3, 1.1);
  };
  for (let i = 0; i < ND; i++) resetMote(i);
  const dGeo = keep(new THREE.BufferGeometry()); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dMat = keep(new THREE.PointsMaterial({ size: .16, map: dotTex, color: 0xffc860, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  holo.add(new THREE.Points(dGeo, dMat));

  /* ---------- modes ---------- */
  let modeI = 0, modeT = 0, glitchT = 0, lastUser = -99;
  const     MODE_ALPHA = {
    HOLO: { surf: 1, line: .18, point: .08, size: 1.4 },
    WIRE: { surf: .14, line: 1, point: .25, size: 1.6 },
    POINTS: { surf: .03, line: .05, point: .42, size: 1.25 }
  };
  const target = { ...MODE_ALPHA.HOLO };
  const setMode = (i, user) => {
    modeI = (i + MODES.length) % MODES.length; modeT = 0; glitchT = .55;
    Object.assign(target, MODE_ALPHA[MODES[modeI]]);
    if (user) lastUser = clock;
    onMode?.(MODES[modeI]);
    if (reduced) {
      surfMat.uniforms.uAlpha.value = target.surf; lineMat.uniforms.uAlpha.value = target.line;
      pointMat.uniforms.uAlpha.value = target.point; pointMat.uniforms.uSize.value = target.size;
      glitchT = 0; renderOnce?.();
    }
  };
  let renderOnce = null;
  onMode?.(MODES[0]);

  /* ---------- camera rig ---------- */
  const look = new THREE.Vector3();
  let W = 1, H = 1, mobile = false;
  const layout = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    mobile = host.getBoundingClientRect().width < 960;
    camera.fov = mobile ? 30 : 30;
    if (mobile) camera.setViewOffset(W, H, 0, -H * 0.04, W, H);
    else camera.setViewOffset(W, H, -W * 0.19, -H * 0.02, W, H);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(layout); ro.observe(host); layout();

  /* ---------- interaction ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(-9, -9);
  let mx = 0, my = 0, tx = 0, ty = 0, hover = -1, pointerIn = false;
  const toNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const pick = () => {
    ray.setFromCamera(ndc, camera);
    const objs = [...tapes.map(t => t.wrap)]; if (bunnySurf) objs.push(bunnySurf);
    const hit = ray.intersectObjects(objs, true)[0];
    if (!hit) return null;
    if (hit.object.userData.bunny) return 'bunny';
    return hit.object.userData.tape ?? null;
  };
  const onMove = e => {
    const r = host.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
    toNdc(e); pointerIn = true;
  };
  const onLeave = () => { tx = 0; ty = 0; pointerIn = false; hover = -1; canvas.style.cursor = ''; };
  const onClick = e => {
    toNdc(e);
    const p = pick();
    if (p === null) return;
    if (p === 'bunny' || p === PROJ) { setMode(modeI + 1, true); return; }
    const t = tapes[p]; if (t.eject < 0) t.eject = 0;
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);

  let visible = true;
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(host);

  /* ---------- loop ---------- */
  let clock = 0, last = performance.now(), raf = 0, disposed = false, started = false, buildT = 0, frameN = 0;
  const tagV = new THREE.Vector3();

  const step = dt => {
    clock += dt;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    const sp = clamp(window.scrollY / H, 0, 1.2);

    // camera orbit around the pile
    const az = 0.5 + mx * 0.16 + sp * 0.25, el = 0.43 - my * 0.06 + sp * 0.08;
    const dist = mobile ? 60 / Math.min(1, camera.aspect * 1.25) : 62;
    look.set(-1.0, 6.2 + sp * 2, 0.4);
    camera.position.set(look.x + Math.sin(az) * Math.cos(el) * dist, look.y + Math.sin(el) * dist, look.z + Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(look);

    // build-in after boot
    if (started) buildT += dt;
    const build = reduced ? 1.1 : clamp(buildT / 2.4, 0, 1) * 1.12 - .04;
    holoUniforms.uBuild.value = build;
    const on = reduced ? 1 : clamp(buildT / .6, 0, 1);
    beamMat.uniforms.uOn.value = on * (0.9 + 0.1 * Math.sin(clock * 23) * (Math.random() < .03 ? 1 : 0));
    projLight.intensity = 70 * on * (0.92 + Math.sin(clock * 7) * .08);
    lensGlow.material.opacity = on;
    ringMat.opacity = on * .75;
    ring.rotation.z += dt * .25;
    dMat.opacity = on * .85;

    // modes
    modeT += dt;
    if (!reduced && modeT > 8 && clock - lastUser > 14) setMode(modeI + 1);
    if (!reduced && Math.random() < dt * .25) glitchT = Math.max(glitchT, .18);
    glitchT = Math.max(0, glitchT - dt);
    holoUniforms.uGlitch.value = glitchT > 0 ? clamp(glitchT * 3, 0, 1) : 0;
    const k = 1 - Math.pow(.02, dt);
    surfMat.uniforms.uAlpha.value = lerp(surfMat.uniforms.uAlpha.value, target.surf, k);
    lineMat.uniforms.uAlpha.value = lerp(lineMat.uniforms.uAlpha.value, target.line, k);
    pointMat.uniforms.uAlpha.value = lerp(pointMat.uniforms.uAlpha.value, target.point, k);
    pointMat.uniforms.uSize.value = lerp(pointMat.uniforms.uSize.value, target.size, k);
    holoUniforms.uTime.value = clock; beamMat.uniforms.uTime.value = clock;
    if (!reduced) bunny.rotation.y += dt * .38;
    bunny.position.y = BUN_Y + (reduced ? 0 : Math.sin(clock * 1.2) * .12);

    // dust
    for (let i = 0; i < ND; i++) {
      dPos[i * 3 + 1] += dSpd[i] * dt;
      if (dPos[i * 3 + 1] > beamH) resetMote(i, 0);
    }
    dGeo.attributes.position.needsUpdate = true;

    // hover pick (throttled)
    if (pointerIn && (frameN++ % 3 === 0)) {
      const p = pick();
      hover = typeof p === 'number' ? p : -1;
      canvas.style.cursor = p !== null ? 'pointer' : '';
    }

    // tapes: hover lift, ejects, spinning reels
    tapes.forEach((t, i) => {
      t.liftT = hover === i && i !== PROJ ? 0.45 : 0;
      t.lift = lerp(t.lift, t.liftT, 1 - Math.pow(.001, dt));
      let jump = 0, spin = 0;
      if (t.eject >= 0) {
        t.eject += dt;
        const u = clamp(t.eject / 1.1, 0, 1);
        jump = Math.sin(u * Math.PI) * 4.2; spin = easeOut(u) * Math.PI * 2;
        if (u >= 1) t.eject = -1;
      }
      t.wrap.position.y = t.base.y + t.lift + jump;
      t.wrap.rotation.y = t.yaw + spin;
      const speed = i === PROJ ? 3.2 : (hover === i ? 1.6 : 0) + (t.eject >= 0 ? 8 : 0);
      if (speed && !reduced) t.reels.forEach((r, j) => { r.rotation.z += dt * speed * (j ? 1.25 : 1); });
    });

    // HUD tag above the bunny
    if (tagEl) {
      tagV.set(0, BUN_Y + BH + .6, 0); holo.localToWorld(tagV); tagV.project(camera);
      const x = (tagV.x * .5 + .5) * W, y = (-tagV.y * .5 + .5) * H;
      tagEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      tagEl.classList.toggle('is-on', on > .9 && x > 40 && x < W - 40 && y > 70);
    }
  };

  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    step(dt);
    if (!mobile) canvas.style.opacity = String(clamp(1.35 - window.scrollY / H, 0, 1));
    renderer.render(scene, camera);
  };
  if (reduced) {
    const once = () => { step(0); renderer.render(scene, camera); };
    renderOnce = once;
    const ro2 = new ResizeObserver(() => { layout(); once(); });
    ro.disconnect(); ro2.observe(host);
    const t1 = setTimeout(once, 600), t2 = setTimeout(once, 1800);
    disposables.push({ dispose() { ro2.disconnect(); clearTimeout(t1); clearTimeout(t2); } });
    canvas.addEventListener('click', () => requestAnimationFrame(once));
  } else raf = requestAnimationFrame(frame);

  return {
    start() { started = true; },
    next() { setMode(modeI + 1, true); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      disposables.forEach(d => d.dispose?.());
      renderer.dispose();
    }
  };
}
