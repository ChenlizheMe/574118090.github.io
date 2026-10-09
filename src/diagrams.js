/* Paper diagrams · one small animated voxel diorama per paper.
   Not games: each loops a short illustration of the paper's core idea.
   Static parts are baked once; moving cubes are drawn per frame at 20 fps
   into a ~300 px buffer, followed by the dithered posterize pass. */
import { Voxels, mix, makePost, loop, chip, hex } from './voxel.js';

const C = {
  ground: '#cfe7b4', ground2: '#bcdba0', grass: '#6fbd42', pad: '#2c2b35', pad2: '#3a3946', cream: '#efe6c8',
  lime: '#c6ff4a', green: '#3fcf6e', red: '#ff4a3d', pink: '#ff4fa3', orange: '#f08a24', yellow: '#ffd23f',
  teal: '#2ad1c9', blue: '#3b7bff', grey: '#9a9a8e', ink: '#071211', water: '#28c6c1'
};

function plate(V, w, d, h = 0) {
  for (let x = 0; x < w; x++) for (let y = 0; y < d; y++) {
    const edge = x === 0 || y === 0 || x === w - 1 || y === d - 1;
    V.set(x, y, h, edge ? C.ground2 : ((x + y) % 2 ? C.ground : C.ground2));
  }
}
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const frac = x => x - Math.floor(x);

/* ---------------- SkillForge: skill lifecycle ---------------- */
function skillforge() {
  const V = new Voxels(6);
  plate(V, 20, 16);
  V.box(8, 6, 1, 11, 9, 1, C.pad); V.box(9, 7, 2, 10, 8, 2, C.pad2);            // agent pedestal
  V.box(1, 11, 1, 5, 14, 1, C.pad); V.box(1, 11, 2, 1, 14, 3, C.pad2); V.box(5, 11, 2, 5, 14, 3, C.pad2); // pool crate
  V.box(14, 1, 1, 18, 4, 1, '#5a3a2a'); V.box(14, 1, 2, 14, 4, 3, C.red); V.box(18, 1, 2, 18, 4, 3, C.red); // retire bin
  const skills = Array.from({ length: 7 }, (_, i) => ({ ph: i / 7, good: [1, 1, 0, 1, 0, 1, 1][i] }));
  const POOL = [3, 12.5], AG = [9.5, 7.5], BIN = [16, 2.5];
  return {
    V,
    draw(ctx, t, P) {
      const pulse = .5 + .5 * Math.sin(t * 3);
      P.cube(AG[0], AG[1], 3 + pulse * .4, mix(hex(C.lime), [255, 255, 255], pulse * .3));
      skills.forEach(s => {
        const u = frac(t * .16 + s.ph);
        let x, y, z, c = s.good ? C.green : C.red;
        if (u < .45) {
          const k = ease(u / .45);
          x = POOL[0] + (AG[0] - POOL[0]) * k; y = POOL[1] + (AG[1] - POOL[1]) * k; z = 4 + Math.sin(k * Math.PI) * 4;
        } else if (s.good) {
          const k = Math.min(1, (u - .45) / .2);
          if (k >= 1) return;
          x = AG[0]; y = AG[1]; z = 4 + (1 - k) * .5; c = mix(hex(C.green), hex(C.lime), k);
        } else {
          const k = Math.min(1, (u - .45) / .4);
          x = AG[0] + (BIN[0] - AG[0]) * k; y = AG[1] + (BIN[1] - AG[1]) * k; z = 4 + Math.sin(k * Math.PI) * 5 - k * 2;
          if (k >= 1) { x = BIN[0]; y = BIN[1]; z = 2; }
        }
        P.cube(x, y, z, c);
      });
    },
    labels: [['SKILL POOL', 3, 12.5, 5, '#ffd23f'], ['AGENT', 9.5, 7.5, 7, C.lime], ['RETIRED', 16, 2.5, 5, '#ff8a7a']]
  };
}

/* ---------------- PromptCD: positive − negative contrast ---------------- */
function promptcd() {
  const V = new Voxels(6);
  plate(V, 20, 18);
  const COLS = [[3, 11, C.blue], [9, 6, C.red], [15, 1, C.lime]];   // x, y0, colour: spread left → right on screen
  COLS.forEach(([x, y0]) => V.box(x - 1, y0, 1, x + 1, y0 + 5, 1, C.pad));
  return {
    V,
    draw(ctx, t, P) {
      const cyc = frac(t * .12);
      for (let i = 0; i < 6; i++) {
        const pos = 2 + Math.round(3 + 2.5 * Math.sin(i * 1.7 + 1));
        const neg = 1 + Math.round(1.5 + 1.5 * Math.sin(i * 2.3));
        const grow = Math.min(1, cyc * 2.2 - i * .08);
        const hp = Math.max(0, Math.round(pos * grow)), hn = Math.max(0, Math.round(neg * grow));
        for (let z = 0; z < hp; z++) P.cube(3, 11 + i, 2 + z, C.blue);
        for (let z = 0; z < hn; z++) P.cube(9, 6 + i, 2 + z, C.red);
        const out = Math.max(0, Math.round((pos * 1.6 - neg) * Math.max(0, Math.min(1, cyc * 2.2 - .5 - i * .08))));
        for (let z = 0; z < Math.min(out, 9); z++) P.cube(15, 1 + i, 2 + z, i === 2 ? C.yellow : C.lime);
      }
      for (let k = 0; k < 6; k++) {
        const u = frac(t * .5 + k / 6);
        P.cube(4 + u * 10, 13 - u * 9, 3 + Math.sin(u * Math.PI) * 3, k % 2 ? C.blue : C.red);
      }
    },
    labels: [['+ PROMPT', 3, 11, 9, '#8fb4ff'], ['- PROMPT', 9, 6, 7, '#ff8a7a'], ['CONTRAST', 15, 1, 12, C.lime]]
  };
}

/* ---------------- CorrDetail: spot the forged detail ---------------- */
function corrdetail() {
  const V = new Voxels(6);
  plate(V, 22, 18);
  const faces = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) faces.push([3 + i * 6, 2 + j * 5]);
  faces.forEach(([x, y]) => {
    V.box(x, y, 1, x + 3, y + 3, 4, C.cream);
    V.set(x, y + 3, 4, null); V.set(x + 3, y + 3, 4, null);
  });
  return {
    V, faces,
    draw(ctx, t, P) {
      const fake = Math.floor(t * .25) % 9;
      faces.forEach(([x, y], i) => {
        const odd = i === fake;
        // eyes on the front (+y face, z=3) and mouth
        P.cube(x + .6, y + 3.6, 3.2, C.ink); P.cube(x + 2.4, y + 3.6, odd ? 3.8 : 3.2, odd ? C.blue : C.ink);
        P.cube(x + 1.5, y + 3.6, 1.8, odd ? C.orange : C.red);
      });
      // scanner sweeping across the grid
      const s = frac(t * .25) * 9, cell = Math.floor(s);
      const [fx, fy] = faces[Math.min(8, cell)];
      const z = 7 + Math.sin(t * 6) * .3;
      for (let a = 0; a < 8; a++) { const ang = a / 8 * Math.PI * 2; P.cube(fx + 1.5 + Math.cos(ang) * 2.2, fy + 1.5 + Math.sin(ang) * 2.2, z, C.lime); }
      if (cell === Math.floor(t * .25) % 9 || frac(s) > .6) {
        const [gx, gy] = faces[Math.floor(t * .25) % 9];
        P.cube(gx + 1.5, gy + 1.5, 8.5 + Math.sin(t * 8) * .4, C.red);
      }
    },
    labels: [['SCAN DETAIL', 9, 2, 9, C.lime], ['FORGED?', 15, 12, 8, '#ff8a7a']]
  };
}

/* ---------------- Innate Reasoning: overthinking vs ICL ---------------- */
function innate() {
  const V = new Voxels(6);
  plate(V, 20, 12);
  V.box(3, 4, 1, 6, 7, 1, C.pad); V.box(12, 4, 1, 15, 7, 1, C.pad);
  return {
    V,
    draw(ctx, t, P) {
      const u = frac(t * .09);
      const tall = Math.floor(Math.min(1, u * 1.25) * 14), short = Math.floor(Math.min(1, u * 1.25) * 14);
      const ansA = 5, ansB = 5;
      for (let i = 0; i < tall; i++) {
        const c = i === ansA ? C.lime : i > ansA ? C.grey : (i % 2 ? C.cream : C.teal);
        P.cube(4.5, 5.5, 2 + i * 0.95, c); P.cube(4.5, 4.5, 2 + i * 0.95, c);
      }
      for (let i = 0; i < Math.min(short, ansB + 1); i++) {
        const c = i === ansB ? C.lime : (i % 2 ? C.cream : C.teal);
        P.cube(13.5, 5.5, 2 + i * 0.95, c); P.cube(13.5, 4.5, 2 + i * 0.95, c);
      }
      // ghost example floating next to the ICL tower
      if (u > .05) for (let i = 0; i < 4; i++) P.cube(17, 3, 4 + i, i === 3 ? C.yellow : '#bfe9cf');
      if (tall > ansA + 1) P.cube(4.5 + Math.sin(t * 7) * .3, 6.5, 2 + tall * .95 + 1, C.red);
    },
    labels: [['ZERO-SHOT', 4.5, 7, 3, '#ff8a7a'], ['+ IN-CONTEXT', 13.5, 7, 3, C.lime], ['ANSWER', 13.5, 5, 9, '#ffd23f']]
  };
}

/* ---------------- Graph order: breadth-first wave ---------------- */
function graph() {
  const V = new Voxels(6);
  plate(V, 22, 18);
  const nodes = [[4, 8], [9, 4], [9, 12], [14, 2], [14, 8], [14, 14], [19, 5], [19, 11]];
  const depth = [0, 1, 1, 2, 2, 2, 3, 3];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7]];
  edges.forEach(([a, b]) => {
    const [x0, y0] = nodes[a], [x1, y1] = nodes[b], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let k = 1; k < n; k++) V.set(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), 1, '#8fa58a');
  });
  nodes.forEach(([x, y]) => V.box(x, y, 1, x, y, 1, C.pad));
  return {
    V,
    draw(ctx, t, P) {
      const wave = frac(t * .14) * 5.5;
      nodes.forEach(([x, y], i) => {
        const on = wave > depth[i];
        const h = on ? 1 + Math.min(3, (wave - depth[i]) * 4) : 1;
        const c = i === 0 ? C.red : on ? [C.orange, C.yellow, C.lime, C.teal][depth[i]] : C.cream;
        for (let z = 0; z < Math.round(h); z++) P.cube(x, y, 2 + z, c);
      });
      // wavefront pulse along edges
      edges.forEach(([a, b], k) => {
        const lt = wave - depth[a];
        if (lt > 0 && lt < 1) {
          const [x0, y0] = nodes[a], [x1, y1] = nodes[b];
          P.cube(x0 + (x1 - x0) * lt, y0 + (y1 - y0) * lt, 2, C.lime);
        }
      });
    },
    labels: [['START', 4, 8, 4, '#ff8a7a'], ['LAYER 1', 9, 4, 5, '#ffd23f'], ['LAYER 2', 14, 2, 6, C.lime]]
  };
}

export const DIAGRAMS = { skillforge, promptcd, corrdetail, innate, graph };

export function mountDiagram(canvas, id, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !DIAGRAMS[id]) return null;
  const D = DIAGRAMS[id]();
  const b = D.V.bounds();
  const base = document.createElement('canvas');
  base.width = Math.ceil(b.w) + 2; base.height = Math.ceil(b.h) + 2;
  D.V.bake(base.getContext('2d'), -b.x0, -b.y0, { shadow: true });
  let bw = 0, bh = 0, post = null, ox = 0, oy = 0;
  const P = {
    cube: (x, y, z, c) => D.V.cube(ctx, x, y, z, c, ox - b.x0, oy - b.y0)
  };
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    bw = Math.round(Math.min(300, Math.max(240, r.width / 2.2)));
    bh = Math.round(bw * r.height / r.width);
    canvas.width = bw; canvas.height = bh;
    ctx.imageSmoothingEnabled = false;
    post = makePost(bw, bh, { levels: 8, ab: 1, vignette: .25, grain: 6 });
    frame(lastT);
  };
  let lastT = 4.5;
  const frame = t => {
    lastT = t;
    if (!bw) return;
    ox = Math.round((bw - base.width) / 2); oy = Math.round((bh - base.height) / 2 + 12);
    const g = ctx.createLinearGradient(0, 0, 0, bh);
    g.addColorStop(0, '#9fe0d0'); g.addColorStop(1, '#e8f3c8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh);
    ctx.fillStyle = 'rgba(7,18,17,.18)';
    for (let y = 0; y < bh; y += 6) ctx.fillRect(0, y, bw, 1);
    ctx.drawImage(base, ox, oy);
    D.draw(ctx, t, P);
    D.labels.forEach(([s, x, y, z, col]) => {
      const [px, py] = D.V.proj(x, y, z, ox - b.x0, oy - b.y0);
      chip(ctx, s, px - s.length * 2 + 4, py - 6, col);
    });
    post(ctx, false);
  };
  const L = loop(canvas, 20, frame, reduced);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  resize();
  return {
    bench(n = 60) { const t0 = performance.now(); for (let i = 0; i < n; i++) frame(lastT + 1 / 20); return { w: bw, h: bh, ms: (performance.now() - t0) / n }; },
    dispose() { L.stop(); ro.disconnect(); }
  };
}
