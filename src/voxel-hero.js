/* Hero diorama · a gridded plinth with cassettes, a CRT terminal, a speaker
   and a VU meter, in the Swiss cassette palette (paper, ink, red, orange,
   yellow, brown).
   The static world is baked once into an offscreen canvas. Each frame only
   blits it and draws a few overlays (spinning reels, a hovering cassette,
   VU bars, terminal text) at ~24 fps into a ~140 px tall buffer that CSS
   upscales with nearest-neighbour filtering. Colours are drawn flat: no
   posterize, dither, grain or RGB split. No WebGL, no GPU required. */
import { Voxels, rng, chip, loop } from './voxel.js';

const P = {
  ink: '#1c1a17', ink2: '#2a2723', hub: '#151412', win: '#3a342c',
  cream: '#efe8d8', paper: '#f6f1e6', beige: '#d8cfba', beige2: '#c2b8a1', grey: '#9a9282',
  red: '#e2381b', orange: '#ef7a1c', yellow: '#f5b91d', brown: '#8a3a1d', blue: '#2b62d4',
  amber: '#ffb000', screen: '#1a1611'
};
const FLOOR = {
  light: { a: '#ebe5d6', b: '#e3dccb', line: '#d2c9b3', base: '#151412' },
  dark: { a: '#2b2824', b: '#25221e', line: '#37332d', base: '#0a0908' }
};

/* cassette face pattern: i along the length (0..W-1), j across (0..D-1, j=0 is the top edge) */
function pat(i, j, W, D) {
  if ((i === 0 || i === W - 1) && (j === 0 || j === D - 1)) return null;
  const ry = Math.round(D * .45), rx1 = Math.round(W * .3), rx2 = W - 1 - rx1;
  const r = D >= 10 ? 2.1 : 1.6;
  const d = Math.min(Math.hypot(i - rx1, j - ry), Math.hypot(i - rx2, j - ry));
  if (d < .8) return 'hub';
  if (d < r) return 'reel';
  if (j >= ry - 1 && j <= ry + 1 && i >= rx1 && i <= rx2) return 'win';
  if (j >= D - 2 && i > 2 && i < W - 3) return 'head';
  if (i >= 1 && i <= W - 2 && j >= 1 && j <= D - 4) return j === D - 5 ? 's1' : j === D - 4 ? 's2' : 'label';
  return 'shell';
}
const CASS_SKIN = { shell: P.ink2, head: P.ink, label: P.cream, s1: P.red, s2: P.orange, reel: P.cream, hub: P.hub, win: P.win };

/* flat cassette lying on its back; returns the reel centres of its top face */
function flatCassette(V, x0, y0, z0, W, D, H, skin = {}) {
  const S = { ...CASS_SKIN, ...skin };
  for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) {
    const role = pat(i, j, W, D);
    if (!role) continue;
    for (let z = z0; z < z0 + H - 1; z++) V.set(x0 + i, y0 + j, z, S.shell);
    V.set(x0 + i, y0 + j, z0 + H - 1, S[role]);
  }
  const ry = Math.round(D * .45), rx1 = Math.round(W * .3);
  return [[x0 + rx1, y0 + ry, z0 + H - 1], [x0 + W - 1 - rx1, y0 + ry, z0 + H - 1]];
}
/* cassette standing on its long edge, label facing +x */
function uprightCassette(V, x0, y0, z0, L, Hh, skin = {}) {
  const S = { ...CASS_SKIN, ...skin };
  for (let i = 0; i < L; i++) for (let j = 0; j < Hh; j++) {
    const role = pat(i, j, L, Hh);
    if (!role) continue;
    const z = z0 + Hh - 1 - j;
    V.set(x0, y0 + i, z, S.shell);
    V.set(x0 + 1, y0 + i, z, S[role]);
  }
}

function buildWorld(dark) {
  const V = new Voxels(4), R = rng(9), F = dark ? FLOOR.dark : FLOOR.light;
  const mod = (a, n) => ((a % n) + n) % n;

  /* plinth: a screen-aligned slab, u = x − y across, v = x + y in depth */
  for (let x = -60; x < 80; x++) for (let y = -80; y < 60; y++) {
    const u = x - y, v = x + y;
    if (u < -78 || u > 78 || v < -2 || v > 38) continue;
    V.set(x, y, 0, F.base);
    V.set(x, y, 1, mod(x, 6) === 0 || mod(y, 6) === 0 ? F.line : (mod(x, 2) ^ mod(y, 2)) ? F.a : F.b);
  }

  /* hero cassette, centre stage */
  const reels = flatCassette(V, -2, 2, 2, 22, 14, 3);
  for (let x = 1; x < 10; x++) if ((x * 7) % 5 < 3) V.set(x, 3, 4, '#4a443a');                 // handwriting on the label
  const rec = [17, 3, 4];

  /* CRT terminal, screen on its +x face */
  const T0 = { x0: -12, y0: 22, z0: 2 };
  for (let x = T0.x0; x <= T0.x0 + 8; x++) for (let y = T0.y0; y <= T0.y0 + 7; y++) for (let z = T0.z0; z <= T0.z0 + 8; z++) {
    const face = x === T0.x0 + 8 && y > T0.y0 && y < T0.y0 + 7 && z > T0.z0 + 1 && z < T0.z0 + 8;
    V.set(x, y, z, face ? P.screen : z === T0.z0 ? P.beige2 : P.beige);
  }
  V.set(T0.x0 + 8, T0.y0 + 7, T0.z0 + 1, P.red); V.set(T0.x0 + 8, T0.y0 + 6, T0.z0 + 1, P.amber);
  for (let x = T0.x0 + 2; x <= T0.x0 + 6; x++) for (let y = T0.y0 + 1; y <= T0.y0 + 6; y++) V.set(x, y, T0.z0 + 9, P.beige2); // top vent
  // keyboard
  for (let x = -3; x <= -1; x++) for (let y = 22; y <= 29; y++) V.set(x, y, 2, (x + y) % 2 ? P.beige : P.cream);
  // cable into the hero cassette
  for (let y = 16; y <= 21; y++) V.set(-1, y, 2, P.ink);

  /* stack of cassettes, back-left */
  const stackSkins = [
    { shell: P.cream, head: P.beige, label: P.paper, s1: P.ink, s2: P.ink, reel: P.ink2 },
    { shell: P.red, head: P.brown, label: P.cream, s1: P.ink, s2: P.yellow },
    { shell: P.ink2, head: P.ink, label: P.yellow, s1: P.red, s2: P.ink },
    { shell: P.orange, head: P.brown, label: P.cream, s1: P.red, s2: P.brown }
  ];
  stackSkins.forEach((s, k) => flatCassette(V, -26 + (k % 2), 28 - (k === 2 ? 1 : 0), 2 + k * 2, 12, 8, 2, s));
  const hoverBase = [-26, 28, 2 + 4 * 2 + 3];

  /* loose cassette, front-left */
  flatCassette(V, -1, 19, 2, 12, 8, 2, { shell: P.cream, head: P.beige, label: P.paper, s1: P.red, s2: P.yellow, reel: P.ink2 });

  /* upright cassette, front-right */
  uprightCassette(V, 23, -4, 2, 12, 8, { shell: P.ink2, label: P.cream, s1: P.yellow, s2: P.red });

  /* speaker with two cones on its +y face */
  const S0 = { x0: 21, y0: -12, z0: 2 };
  for (let x = S0.x0; x <= S0.x0 + 6; x++) for (let y = S0.y0; y <= S0.y0 + 5; y++) for (let z = S0.z0; z <= S0.z0 + 11; z++) V.set(x, y, z, P.ink2);
  const cone = (cx, cz, r) => {
    for (let x = S0.x0; x <= S0.x0 + 6; x++) for (let z = S0.z0; z <= S0.z0 + 11; z++) {
      const d = Math.hypot(x - cx, z - cz);
      if (d < r) V.set(x, S0.y0 + 5, z, d < r * .35 ? P.hub : d < r * .75 ? P.grey : P.cream);
    }
  };
  cone(S0.x0 + 3, S0.z0 + 3.5, 2.9); cone(S0.x0 + 3, S0.z0 + 9, 1.7);
  for (let x = S0.x0; x <= S0.x0 + 6; x++) V.set(x, S0.y0 + 5, S0.z0 + 11, P.red);

  /* VU meter base */
  const U0 = { x0: 31, y0: -15 };
  V.box(U0.x0, U0.y0, 2, U0.x0 + 9, U0.y0 + 2, 2, P.ink);
  V.box(U0.x0, U0.y0, 3, U0.x0 + 9, U0.y0, 3, P.ink2);

  /* stack far right */
  [{ shell: P.yellow, head: P.brown, label: P.cream, s1: P.ink, s2: P.red }, { shell: P.cream, head: P.beige, label: P.paper, s1: P.blue, s2: P.ink, reel: P.ink2 }, { shell: P.ink2, head: P.ink, label: P.red, s1: P.cream, s2: P.cream }]
    .forEach((s, k) => flatCassette(V, 30 - (k === 1 ? 1 : 0), -29 + (k % 2), 2 + k * 2, 12, 8, 2, s));

  /* scattered loose voxels on the floor (screws, crumbs of label) */
  for (let k = 0; k < 26; k++) {
    const x = Math.round(-40 + R() * 90), y = Math.round(-40 + R() * 80), u = x - y, v = x + y;
    if (u < -70 || u > 70 || v < 2 || v > 36 || V.has(x, y, 2)) continue;
    V.set(x, y, 2, [P.red, P.ink, P.yellow, P.cream][k % 4]);
  }

  /* hovering cassette, drawn per frame */
  const hover = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) {
    const role = pat(i, j, 12, 8);
    if (!role) continue;
    const S = { ...CASS_SKIN, shell: P.ink2, label: P.cream, s1: P.red, s2: P.orange };
    hover.push([i, j, 0, S.shell], [i, j, 1, S[role]]);
  }
  hover.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[2] - b[2]);

  return {
    V, reels, rec, hover, hoverBase,
    screen: { x: T0.x0 + 9, y0: T0.y0 + 1.3, z1: T0.z0 + 7.6 },
    vu: U0,
    center: [8.5, 8.5, 2],
    labels: [['LC-01  SIDE A', 2, 4, 6], ['CRT-80', -8, 25, 13], ['VU', 35, -14, 12]]
  };
}

export function mountVoxelHero(canvas, { reduced = false, dark = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const W = buildWorld(dark);
  const V = W.V, T = V.T;
  const b = V.bounds();
  const world = document.createElement('canvas');
  world.width = Math.ceil(b.w) + 2; world.height = Math.ceil(b.h) + 2;
  V.bake(world.getContext('2d'), -b.x0, -b.y0, { shadow: true });

  let bw = 0, bh = 0, ox = 0, oy = 0, mx = 0, tmx = 0;
  const pt = (X, Y, Z) => [Math.round((X - Y) * T + T - b.x0 + ox), Math.round((X + Y) * T / 2 - Z * T + T - b.y0 + oy)];
  const cube = (x, y, z, c) => V.cube(ctx, x, y, z, c, ox - b.x0, oy - b.y0);

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    bh = 150;
    bw = Math.round(bh * r.width / r.height);
    canvas.width = bw; canvas.height = bh;
    ctx.imageSmoothingEnabled = false;
    frame(lastT);
  };

  let lastT = 4.5;
  const frame = t => {
    lastT = t;
    if (!bw) return;
    mx += (tmx - mx) * .08;
    const [cx] = V.proj(...W.center);
    ox = Math.round(bw / 2 - (cx - b.x0) + Math.sin(t * .12) * 4 + mx * 8);
    oy = bh - 4 - world.height;
    ctx.clearRect(0, 0, bw, bh);
    ctx.drawImage(world, ox, oy);

    // reels: three notches orbiting each hub
    W.reels.forEach(([x, y, z], k) => {
      const a = t * (k ? 4.2 : 3);
      ctx.fillStyle = P.ink;
      for (let s = 0; s < 3; s++) {
        const aa = a + s * 2.094;
        const [px, py] = pt(x + .5 + Math.cos(aa) * 1.45, y + .5 + Math.sin(aa) * 1.45, z + 1);
        ctx.fillRect(px, py, 1, 1);
      }
    });
    // REC light
    if (Math.floor(t * 1.6) % 2) cube(W.rec[0], W.rec[1], W.rec[2], P.red);

    // terminal: amber lines scrolling on the +x face
    {
      const { x, y0, z1 } = W.screen, scroll = Math.floor(t * 2.5);
      ctx.fillStyle = P.amber;
      for (let r = 0; r < 4; r++) {
        const len = 1.4 + ((r + scroll) * 5 % 7) * .55;
        const Z = z1 - r * 1.3;
        for (let k = 0; k <= len * T; k++) { const [px, py] = pt(x, y0 + k / T, Z); ctx.fillRect(px, py, 1, 1); }
      }
      if (Math.floor(t * 2) % 2) { const [px, py] = pt(x, y0 + .2, z1 - 4 * 1.3); ctx.fillRect(px, py - 1, 2, 2); }
    }

    // VU bars
    {
      const { x0, y0 } = W.vu;
      for (let i = 0; i < 8; i++) {
        const lv = .5 + .5 * Math.sin(t * (3.1 + i * .37) + i * 1.3) * Math.sin(t * 1.7 + i);
        const h = 1 + Math.round(Math.abs(lv) * 8);
        for (let z = 0; z < h; z++) cube(x0 + 1 + i, y0 + 1, 3 + z, z >= 6 ? P.red : z >= 4 ? P.orange : P.yellow);
      }
    }

    // hovering cassette over the left stack, with its shadow
    {
      const [hx, hy, hz0] = W.hoverBase;
      const lift = reduced ? 1.5 : 1.5 + (Math.sin(t * 1.3) + 1) * 1.2;
      const shZ = 10;
      ctx.save(); ctx.globalAlpha = .18 - lift * .02; ctx.fillStyle = P.hub;
      const c = [pt(hx + 1, hy + 1, shZ), pt(hx + 11, hy + 1, shZ), pt(hx + 11, hy + 7, shZ), pt(hx + 1, hy + 7, shZ)];
      ctx.beginPath(); ctx.moveTo(...c[0]); c.slice(1).forEach(p => ctx.lineTo(...p)); ctx.fill(); ctx.restore();
      W.hover.forEach(([i, j, k, col]) => cube(hx + i, hy + j, hz0 + lift + k - 1, col));
    }

    // labels
    W.labels.forEach(([s, x, y, z]) => {
      const [px, py] = V.proj(x, y, z, ox - b.x0, oy - b.y0);
      chip(ctx, s, px, py, s === 'VU' ? P.yellow : P.red);
    });
  };

  const L = loop(canvas, 24, frame, reduced);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const host = canvas.closest('.hero') || canvas.parentElement;
  const onMove = e => { const r = host.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; };
  host.addEventListener('pointermove', onMove);
  resize();
  return {
    bench(n = 60) { const t0 = performance.now(); for (let i = 0; i < n; i++) frame(lastT + 1 / 24); return { w: bw, h: bh, ms: (performance.now() - t0) / n }; },
    dispose() { L.stop(); ro.disconnect(); host.removeEventListener('pointermove', onMove); }
  };
}
