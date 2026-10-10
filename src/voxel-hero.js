/* Hero background · an endless Perlin-noise world of overgrown ruins, drawn as isometric voxels
   and finished with a ZWAARD-style post pass: a mint / lime / teal tone-map, soft bloom,
   RGB fringing and the odd tape-glitch band.
   Biomes: grassland, forest, taiga, tundra, desert, savanna, beaches, turquoise sea with lily pads,
   mossy rock, snow caps, volcanoes (neon lava, smoke) and moss-eaten concrete ruins and containers.
   The map scrolls steadily to the right; every page load starts from a new random coordinate.
   Pure 2D canvas, no WebGL. Meant to sit behind the hero copy. */
import { Voxels, hex, mul, mix, loop, TOP, LEFT, RIGHT, ALL } from './voxel.js';
import { sampleWorld, SEA, BIOME as B, DECO as D } from './terrain.js';

const T = 4;
const FPS = 15;
const SPEED = 6;            // canvas pixels per second (moves right)
const ZMAX = 36;
const N = 512;              // ring-buffer side for the cell cache

const PAL = {
  [B.SAND]: ['#f1e6a6', '#f7eebb', '#e6d894'],
  [B.GRASS]: ['#92e24e', '#82d646', '#a6ee62'],
  [B.FOREST]: ['#55bb4c', '#49ae47', '#66c956'],
  [B.PINE]: ['#33a58a', '#2a987f', '#40b598'],
  [B.SNOWFIELD]: ['#e6fbf4', '#d4f3ea', '#f2fffb'],
  [B.DESERT]: ['#f0a05e', '#e5904e', '#f7b26f'],
  [B.SAVANNA]: ['#cdd95e', '#bccb52', '#dce772'],
  [B.ROCK]: ['#97b8ad', '#86a89c', '#93d27c'],
  [B.SNOW]: ['#f4fffb', '#e2f7f1', '#d3f0ea'],
  [B.ASH]: ['#5f4f78', '#52446b', '#8a5c98'],
  [B.LAVA]: ['#ff4fa0', '#ff8f3a', '#ff2f7c']
};
/* what the cut sides show below the surface */
const SIDE = {
  [B.SAND]: ['#dcbf7c', '#c4a468'], [B.GRASS]: ['#a8704c', '#82605a'], [B.FOREST]: ['#a8704c', '#82605a'],
  [B.PINE]: ['#8f6d58', '#76616a'], [B.SAVANNA]: ['#b5864f', '#8c6a52'], [B.DESERT]: ['#cf8b50', '#b0743f'],
  [B.SNOWFIELD]: ['#b9dad8', '#7d8a98'], [B.SNOW]: ['#b9dad8', '#7d8a98'], [B.ROCK]: ['#6f968b', '#5c7d82'],
  [B.ASH]: ['#42345a', '#32284a'], [B.LAVA]: ['#d02a78', '#42345a']
};
const WATER = ['#86f6ea', '#45dede', '#25bcd2', '#1b93c4'];
const WOOD = '#8a5a3a';
const LEAF = ['#52c04c', '#66d054', '#3cab4c', '#80da5e'];
const AUTUMN = '#ff9a3c', BLOSSOM = '#ff7ac8';
const PINES = ['#2b9c7a', '#37b08a', '#248c6e'];
const FLOWER = ['#ff5fb0', '#ffe14d', '#ffffff', '#b98cff', '#ff9a4a'];
const CONCRETE = ['#bccfc6', '#a9bfb5', '#cbdbd3'];
const MOSS = '#7ad84c', RUST = '#e0703c';
const CONTAINER = ['#5483b5', '#436fa0', '#6c9ac6'];
const LILY = '#4fc46a', LILY_BLOOM = '#ff9ad0';

/* cube templates [dx, dy, dz, colour slot], painter-sorted */
const order = a => a.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]) || (p[0] + p[1]) - (q[0] + q[1]) || p[2] - q[2]);
const cross = z => [[-1, 0, z], [0, -1, z], [0, 0, z], [1, 0, z], [0, 1, z]];
const TPL_TREE = order([[0, 0, 0, 0], ...cross(1).map(c => [...c, 1]), [0, 0, 2, 2]]);
const TPL_TALL = order([[0, 0, 0, 0], [0, 0, 1, 0], ...cross(2).map(c => [...c, 1]), [0, 0, 3, 2]]);
const TPL_PINE = order([[0, 0, 0, 0], ...cross(1).map(c => [...c, 1]), [0, 0, 2, 2], [0, 0, 3, 3]]);
const TPL_CACTUS = order([[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 2, 1], [1, 0, 1, 1]]);
/* ruins: slot 0 concrete, 1 moss, 2 rust */
const TPL_PILLAR = order([[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 2, 0], [0, 0, 3, 1]]);
const TPL_STUMP = order([[0, 0, 0, 0], [0, 0, 1, 1]]);
const TPL_WALL = order([[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [1, 0, 1, 2], [0, 0, 2, 1], [1, 0, 2, 1]]);
const TPL_BOX = order([[0, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0], [0, 0, 1, 0], [1, 0, 1, 1], [2, 0, 1, 0], [1, 0, 2, 1]]);

/* tone-map ramp: shadows indigo, mids teal, highlights lime, then cream */
const RAMP = [[0, [30, 40, 92]], [.3, [38, 108, 132]], [.58, [134, 210, 144]], [.82, [228, 240, 152]], [1, [255, 247, 218]]];
const LUT = new Float32Array(256 * 3);
for (let i = 0; i < 256; i++) {
  const l = i / 255;
  let k = 1;
  while (k < RAMP.length - 1 && RAMP[k][0] < l) k++;
  const [a0, c0] = RAMP[k - 1], [a1, c1] = RAMP[k], f = Math.min(1, Math.max(0, (l - a0) / (a1 - a0)));
  for (let c = 0; c < 3; c++) LUT[i * 3 + c] = c0[c] + (c1[c] - c0[c]) * f;
}
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export function mountVoxelHero(canvas, { reduced = false, dark = false } = {}) {
  const out = canvas?.getContext('2d');
  if (!out) return { bench: () => 0, dispose() {} };
  /* the scene is composed on an offscreen buffer, graded, then copied to the visible canvas */
  const buf = document.createElement('canvas');
  const ctx = buf.getContext('2d', { willReadFrequently: true });
  const glow = document.createElement('canvas');
  const gctx = glow.getContext('2d');
  const V = new Voxels(T);
  /* soft, washed-out palette: colours are pulled toward paper (light) or dusk (dark) */
  const tone = (h, k = .14) => { const c = typeof h === 'string' ? hex(h) : h; return dark ? mix(mul(mix(c, [150, 150, 150], k * .6), .62), [16, 22, 44], .24) : mix(c, [246, 241, 230], k); };
  const toneAll = (a, k) => a.map(c => tone(c, k));
  const GRADE = dark ? .3 : .36;

  const top = {}, alt = {}, side = {};
  for (const k in PAL) {
    const kk = +k === B.LAVA ? .04 : undefined;
    top[k] = toneAll(PAL[k], kk); alt[k] = top[k].map(c => mul(c, .97)); side[k] = toneAll(SIDE[k], kk);
  }
  const water = toneAll(WATER);
  const spark = water.map(c => mix(c, [255, 255, 255], .5));
  const sea = water[3];
  const woodC = tone(WOOD);
  const leafSets = [...LEAF, AUTUMN, BLOSSOM].map(c => { const l = tone(c); return [woodC, l, mix(l, [255, 255, 255], .2)]; });
  const pineSets = PINES.map(c => { const l = tone(c); return [woodC, l, mul(l, 1.1), mix(l, [255, 255, 255], .75)]; });
  const snowPine = pineSets.map(s => [s[0], s[1], s[2], tone('#ffffff')]);
  const cactusC = [tone('#4fb06a'), tone('#62c27a')];
  const flowerC = toneAll(FLOWER);
  const ruinSets = CONCRETE.map(c => [tone(c), tone(MOSS), tone(RUST)]);
  const boxSets = CONTAINER.map(c => [tone(c), tone(MOSS), tone(RUST)]);
  const lilyC = tone(LILY), bloomC = tone(LILY_BLOOM);
  const smokeC = Array.from({ length: 5 }, (_, i) => tone(mix([100, 80, 128], [252, 232, 246], i / 4)));
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

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

  let bw = 0, bh = 0, ox = 0, lastT = 0, outImg = null;

  const put = (tpl, cols, px, s, h) => {
    for (let n = 0; n < tpl.length; n++) {
      const [dx, dy, dz, ci] = tpl[n];
      ctx.drawImage(V.sprite(cols[ci], ALL), px + (dx - dy) * T, (s + dx + dy) * T / 2 - (h + dz) * T);
    }
  };

  const scene = t => {
    const sh = Math.floor(t * SPEED);
    K = Math.floor(sh / (2 * T));
    const fr = sh - K * 2 * T;
    ctx.fillStyle = rgb(sea);
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
          const wy = yBase - topZ * T;
          ctx.drawImage(V.sprite((sp ? spark : water)[dd[i]], TOP | LEFT | RIGHT), px, wy);
          if (dc[i] === D.LILY) {
            ctx.fillStyle = rgb(lilyC);
            ctx.fillRect(px + 2, wy + 1, 4, 2);
            if (rr % 3 === 0) { ctx.fillStyle = rgb(bloomC); ctx.fillRect(px + 3, wy, 1, 1); }
          }
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
        } else if (dec === D.RUIN) {
          const v = rr % 4;
          put(v === 0 ? TPL_WALL : v === 1 ? TPL_STUMP : TPL_PILLAR, ruinSets[rr % 3], px, s, h);
        } else if (dec === D.CONTAINER) {
          put(TPL_BOX, boxSets[rr % 3], px, s, h);
        } else if (dec === D.FLOWER) {
          ctx.fillStyle = rgb(flowerC[rr % 5]);
          ctx.fillRect(px + T - 1, yBase - topZ * T + 1, 2, 2);
        } else if (dec === D.SMOKE) {
          for (let j = 0; j < 5; j++) {
            const ph = (t * .26 + j / 5) % 1;
            const off = Math.round(ph * 3);
            ctx.globalAlpha = Math.max(.15, .92 - ph * .85);
            ctx.drawImage(V.sprite(smokeC[Math.min(4, Math.floor(ph * 5))], ALL), px + off * 2 * T, s * T / 2 - (h + 1 + ph * 14) * T);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
  };

  /* post pass: bloom, tone-map, RGB fringe, tape-glitch band */
  const post = t => {
    const gw = bw >> 2, gh = bh >> 2;
    if (gw > 2 && gh > 2) {
      gctx.imageSmoothingEnabled = true;
      gctx.drawImage(buf, 0, 0, gw, gh);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = dark ? .2 : .3;
      ctx.drawImage(glow, 0, 0, bw, bh);
      ctx.restore();
    }
    const src = ctx.getImageData(0, 0, bw, bh).data;
    if (!outImg || outImg.width !== bw || outImg.height !== bh) outImg = out.createImageData(bw, bh);
    const dst = outImg.data;

    const cyc = 6, slot = Math.floor(t / cyc), ph = t - slot * cyc;
    const gOn = ph < .28;
    const gy = Math.floor(hash(slot) * (bh - 14)), gh2 = 3 + Math.floor(hash(slot + .5) * 8);
    const gs = (hash(slot + .9) < .5 ? -1 : 1) * (2 + Math.floor(hash(slot + .3) * 3));

    for (let y = 0; y < bh; y++) {
      const rs = gOn && y >= gy && y < gy + gh2 ? gs : 0;
      const row = y * bw;
      for (let x = 0; x < bw; x++) {
        const xr = Math.min(bw - 1, Math.max(0, x - 1 + rs)), xg = Math.min(bw - 1, Math.max(0, x + rs)), xb = Math.min(bw - 1, Math.max(0, x + 1 + rs));
        const r = src[(row + xr) * 4], g = src[(row + xg) * 4 + 1], b = src[(row + xb) * 4 + 2];
        const l = (r * 77 + g * 150 + b * 29) >> 8, li = l * 3, o = (row + x) * 4;
        dst[o] = r + (LUT[li] - r) * GRADE;
        dst[o + 1] = g + (LUT[li + 1] - g) * GRADE;
        dst[o + 2] = b + (LUT[li + 2] - b) * GRADE;
        dst[o + 3] = 255;
      }
    }
    out.putImageData(outImg, 0, 0);
  };

  const frame = t => {
    lastT = t;
    if (!bw) return;
    scene(t);
    post(t);
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const S = r.width < 700 ? 3 : 4;
    bw = Math.round(r.width / S); bh = Math.round(r.height / S);
    canvas.width = buf.width = bw; canvas.height = buf.height = bh;
    glow.width = Math.max(1, bw >> 2); glow.height = Math.max(1, bh >> 2);
    ox = Math.round(bw / 2);
    ctx.imageSmoothingEnabled = false;
    outImg = null;
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
