/* Hero background · an endless Perlin-noise world rendered as isometric voxels.
   Grassland, forest, taiga, tundra, desert, savanna, beaches, ocean, rock, snow caps
   and a few volcanoes (crater lava, lava streams, smoke). The map scrolls steadily to
   the right; every page load starts from a new random coordinate in the noise field.
   Pure 2D canvas, no WebGL. Meant to sit behind the hero copy. */
import { Voxels, hex, mul, mix, loop, TOP, LEFT, RIGHT, ALL } from './voxel.js';
import { sampleWorld, SEA, BIOME as B, DECO as D } from './terrain.js';

const T = 4;
const FPS = 15;
const SPEED = 6;            // canvas pixels per second (moves right)
const ZMAX = 36;
const N = 512;              // ring-buffer side for the cell cache
const INK = [21, 20, 18];

const PAL = {
  [B.SAND]: ['#e6d08f', '#eedb9f', '#dcc581'],
  [B.GRASS]: ['#79c04a', '#6bb142', '#8ccf56'],
  [B.FOREST]: ['#4c9a3a', '#438f35', '#58a640'],
  [B.PINE]: ['#3d7f50', '#35744a', '#46895a'],
  [B.SNOWFIELD]: ['#e9f1f5', '#dde8ee', '#f5fafc'],
  [B.DESERT]: ['#e7b45a', '#d9a24a', '#f0c46c'],
  [B.SAVANNA]: ['#b8b250', '#a8a548', '#c8c15c'],
  [B.ROCK]: ['#8c8780', '#7d7973', '#9b968d'],
  [B.SNOW]: ['#ffffff', '#eef4f8', '#e3edf3'],
  [B.ASH]: ['#4a4541', '#3f3a37', '#57514b'],
  [B.LAVA]: ['#ff5a1a', '#ffa21f', '#ff3d0a']
};
/* what the cut sides show below the surface */
const SIDE = {
  [B.SAND]: ['#d7bd7a', '#c2a867'], [B.GRASS]: ['#8a6642', '#6f5a45'], [B.FOREST]: ['#8a6642', '#6f5a45'],
  [B.PINE]: ['#7d6444', '#6a5a48'], [B.SAVANNA]: ['#9c7a45', '#7a6244'], [B.DESERT]: ['#c58f48', '#a9793e'],
  [B.SNOWFIELD]: ['#cfdbe3', '#7a766f'], [B.SNOW]: ['#cfdbe3', '#7a766f'], [B.ROCK]: ['#767169', '#625e58'],
  [B.ASH]: ['#3a3532', '#2e2a28'], [B.LAVA]: ['#c9340c', '#3a3532']
};
const WATER = ['#82d8ea', '#55b8e2', '#3b91d2', '#2b69b4'];
const WOOD = '#7a5230';
const LEAF = ['#3f9a35', '#4aa83c', '#2f8a30', '#5bb043'];
const AUTUMN = '#e08a2c', BLOSSOM = '#f2a6c4';
const PINES = ['#2f6f47', '#3a7d52', '#276040'];
const FLOWER = ['#ff6b6b', '#ffd84d', '#ffffff', '#c88cff', '#ff9ad0'];

/* cube templates [dx, dy, dz, colour slot], painter-sorted */
const order = a => a.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]) || (p[0] + p[1]) - (q[0] + q[1]) || p[2] - q[2]);
const cross = z => [[-1, 0, z], [0, -1, z], [0, 0, z], [1, 0, z], [0, 1, z]];
const TPL_TREE = order([[0, 0, 0, 0], ...cross(1).map(c => [...c, 1]), [0, 0, 2, 2]]);
const TPL_TALL = order([[0, 0, 0, 0], [0, 0, 1, 0], ...cross(2).map(c => [...c, 1]), [0, 0, 3, 2]]);
const TPL_PINE = order([[0, 0, 0, 0], ...cross(1).map(c => [...c, 1]), [0, 0, 2, 2], [0, 0, 3, 3]]);
const TPL_CACTUS = order([[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 2, 1], [1, 0, 1, 1]]);

export function mountVoxelHero(canvas, { reduced = false, dark = false } = {}) {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return { bench: () => 0, dispose() {} };
  const V = new Voxels(T);
  const tone = h => { const c = typeof h === 'string' ? hex(h) : h; return dark ? mix(mul(c, .62), [16, 22, 44], .22) : c; };
  const toneAll = a => a.map(tone);

  const top = {}, alt = {}, side = {};
  for (const k in PAL) { top[k] = toneAll(PAL[k]); alt[k] = top[k].map(c => mul(c, .95)); side[k] = toneAll(SIDE[k]); }
  const water = toneAll(WATER);
  const spark = water.map(c => mix(c, [255, 255, 255], .42));
  const sea = water[3];
  const woodC = tone(WOOD);
  const leafSets = [...LEAF, AUTUMN, BLOSSOM].map(c => { const l = tone(c); return [woodC, l, mix(l, [255, 255, 255], .18)]; });
  const pineSets = PINES.map(c => { const l = tone(c); return [woodC, l, mul(l, 1.1), mix(l, [255, 255, 255], .75)]; });
  const snowPine = pineSets.map(s => [s[0], s[1], s[2], tone('#ffffff')]);
  const cactusC = [tone('#4e9a45'), tone('#5cab50')];
  const flowerC = toneAll(FLOWER);
  const smokeC = Array.from({ length: 5 }, (_, i) => tone(mix([70, 66, 64], [214, 210, 206], i / 4)));

  /* random start in the noise field; prefer one whose first screen shows every biome family */
  const pickStart = () => {
    const o = {};
    let best = null, bestScore = -1;
    for (let tries = 0; tries < 40; tries++) {
      const bx = 20000 + Math.floor(Math.random() * 80000), by = 20000 + Math.floor(Math.random() * 80000);
      const seen = new Set();
      for (let s = 16; s <= 150; s += 3) for (let d = -36 + (s & 1); d <= 36; d += 4) {
        sampleWorld(bx + ((s + d) >> 1), by + ((s - d) >> 1), o);
        seen.add(o.b === B.LAVA ? B.ASH : o.b);
      }
      const need = [B.WATER, B.SAND, B.ASH, B.SNOW, B.ROCK].every(k => seen.has(k)) && (seen.has(B.FOREST) || seen.has(B.PINE)) && (seen.has(B.GRASS) || seen.has(B.SAVANNA) || seen.has(B.DESERT));
      const score = seen.size + (need ? 100 : 0);
      if (score > bestScore) { bestScore = score; best = [bx, by]; }
      if (need) break;
    }
    return best;
  };
  const [bx, by] = pickStart();

  /* ring-buffer cache of generated cells, keyed by world coordinate */
  const tx = new Int32Array(N * N).fill(-1), ty = new Int32Array(N * N).fill(-1);
  const hh = new Int8Array(N * N), bb = new Uint8Array(N * N), dd = new Uint8Array(N * N), dc = new Uint8Array(N * N), tn = new Uint8Array(N * N);
  const probe = {};
  let K = 0;
  const at = (x, y) => {
    const wx = x - K + bx, wy = y + K + by, i = ((wx & (N - 1)) << 9) | (wy & (N - 1));
    if (tx[i] !== wx || ty[i] !== wy) {
      sampleWorld(wx, wy, probe);
      tx[i] = wx; ty[i] = wy; hh[i] = probe.h; bb[i] = probe.b; dd[i] = probe.dep; dc[i] = probe.deco; tn[i] = probe.tint;
    }
    return i;
  };

  let bw = 0, bh = 0, ox = 0, lastT = 0;

  const put = (tpl, cols, px, s, h) => {
    for (let n = 0; n < tpl.length; n++) {
      const [dx, dy, dz, ci] = tpl[n];
      ctx.drawImage(V.sprite(cols[ci], ALL), px + (dx - dy) * T, (s + dx + dy) * T / 2 - (h + dz) * T);
    }
  };

  const frame = t => {
    lastT = t;
    if (!bw) return;
    const sh = Math.floor(t * SPEED);
    K = Math.floor(sh / (2 * T));
    const fr = sh - K * 2 * T;
    ctx.fillStyle = `rgb(${sea[0]},${sea[1]},${sea[2]})`;
    ctx.fillRect(0, 0, bw, bh);

    const half = Math.ceil(bw / (2 * T)) + 3;
    const sHi = Math.ceil((bh + ZMAX * T) * 2 / T) + 2;
    const tk = Math.floor(t * 2.2);

    for (let s = -4; s <= sHi; s++) {
      const yBase = s * T / 2;
      for (let d = -half; d <= half; d++) {
        if ((s + d) & 1) continue;
        const px = d * T + ox - T + fr;
        if (px < -2 * T || px > bw) continue;
        const x = (s + d) / 2, y = (s - d) / 2;
        const i = at(x, y), h = hh[i], b = bb[i];
        const hl = hh[at(x, y + 1)], hr = hh[at(x + 1, y)];
        const topZ = h - 1;
        const z0 = Math.min(Math.max(0, Math.min(hl, hr)), topZ);
        if (yBase - z0 * T + 2 * T <= 0) continue;
        const r = tn[i], patch = r % 3, rr = (r / 3) | 0;

        if (b === B.WATER) {
          const sp = (rr + tk) % 17 === 0 && dd[i] < 3;
          ctx.drawImage(V.sprite((sp ? spark : water)[dd[i]], TOP | LEFT | RIGHT), px, yBase - topZ * T);
          continue;
        }

        const tops = top[b], sides = side[b];
        let tc = (((x + y) & 1) && b !== B.SNOW ? alt[b] : tops)[patch];
        if (b === B.LAVA) tc = tops[(rr + tk) % 3];
        const shadow = b !== B.LAVA && (hh[at(x - 1, y)] > h + 1 || hh[at(x - 2, y)] > h + 2);
        for (let z = z0; z <= topZ; z++) {
          const mask = (z === topZ ? TOP : 0) | (z >= hl ? LEFT : 0) | (z >= hr ? RIGHT : 0);
          if (!mask) continue;
          const dz = topZ - z;
          const c = dz === 0 ? tc : (b === B.LAVA && dz === 1 ? tops[(rr + tk + 1) % 3] : sides[dz === 1 ? 0 : 1]);
          ctx.drawImage(V.sprite(c, mask, shadow && z === topZ), px, yBase - z * T);
        }

        const dec = dc[i];
        if (!dec) continue;
        if (dec === D.TREE || dec === D.TREE_TALL) {
          const v = rr < 6 ? 4 : rr < 9 ? 5 : rr % 4;
          put(dec === D.TREE ? TPL_TREE : TPL_TALL, leafSets[b === B.SAVANNA ? 3 : v], px, s, h);
        } else if (dec === D.PINE) {
          put(TPL_PINE, (b === B.SNOWFIELD ? snowPine : pineSets)[rr % 3], px, s, h);
        } else if (dec === D.CACTUS) {
          put(TPL_CACTUS, cactusC, px, s, h);
        } else if (dec === D.FLOWER) {
          ctx.fillStyle = `rgb(${flowerC[rr % 5].join(',')})`;
          ctx.fillRect(px + T - 1, yBase - topZ * T + 1, 2, 2);
        } else if (dec === D.SMOKE) {
          for (let j = 0; j < 5; j++) {
            const ph = (t * .26 + j / 5) % 1;
            const off = Math.round(ph * 3);
            ctx.globalAlpha = Math.max(.15, .92 - ph * .85);
            ctx.drawImage(V.sprite(smokeC[Math.min(4, Math.floor(ph * 5))], ALL), px + off * 2 * T, (s - 0) * T / 2 - (h + 1 + ph * 14) * T);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const S = r.width < 700 ? 3 : 4;
    bw = Math.round(r.width / S); bh = Math.round(r.height / S);
    canvas.width = bw; canvas.height = bh;
    ox = Math.round(bw / 2);
    ctx.imageSmoothingEnabled = false;
    frame(lastT);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const run = loop(canvas, FPS, frame, reduced, 0);
  return {
    bench() { const a = performance.now(); for (let i = 0; i < 20; i++) frame(2 + i * 1.3); return (performance.now() - a) / 20; },
    dispose() { run.stop(); ro.disconnect(); }
  };
}
