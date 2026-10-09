/* Hero diorama · overgrown ruins with a giant cassette, a CRT terminal,
   water and trees. ZWAARD-style lush pixel palette.
   The static world is baked once into an offscreen canvas. Each frame only
   blits it, draws a few overlays (reels, water glints, fireflies, light
   shafts, terminal cursor) at ~24 fps into a ~384 px wide buffer, then runs
   the dithered posterize + RGB split pass. No WebGL, no GPU required. */
import { Voxels, rng, hex, mix, rgb, makePost, loop, chip, pixelText } from './voxel.js';

const P = {
  grass: ['#5aa83a', '#6fbd42', '#86d14b', '#4c9634'], moss: '#b6e35a', lime: '#c6ff4a',
  dirt: '#6d4b31', stone: '#8d8e80', conc: ['#ddd8bf', '#cfcab0', '#bdb99f'],
  water: '#28c6c1', water2: '#1f9fa8',
  shell: '#2c2b35', shell2: '#3a3946', label: '#efe6c8', orange: '#f08a24', pink: '#ff4fa3', teal: '#2ad1c9', win: '#121218', reel: '#e9dfbf',
  beige: '#d7c9a2', screen: '#0c2c21', trunk: '#7a5232', birch: '#e7e3d3',
  leaf: ['#3f8d3a', '#55a842', '#73c94d', '#9be060'], flower: ['#ff4fa3', '#ffd23f', '#ff8a2a', '#f4f1e6'],
  rust: '#c9622b', rust2: '#9a4421', hair: '#ff8a2a', body: '#efe6c8', legs: '#2c2b35', ink: '#071211', haze: '#bfe9cf'
};

function noise2(seed) {
  const r = rng(seed), g = [];
  for (let i = 0; i < 64 * 64; i++) g.push(r());
  const at = (x, y) => g[((y & 63) * 64 + (x & 63))];
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}

function buildWorld() {
  const V = new Voxels(4), R = rng(7), N = noise2(3), N2 = noise2(11);
  const S = 58;
  const water = (x, y) => Math.abs(x - (y * .55 + 9 + Math.sin(y * .22) * 3.2)) < 2.4 && y > 4;
  const H = [];
  for (let x = 0; x < S; x++) {
    H[x] = [];
    for (let y = 0; y < S; y++) {
      const n = N(x * .09, y * .09) * .7 + N2(x * .22, y * .22) * .3;
      let h = 1 + Math.round(n * 3);
      const wd = Math.abs(x - (y * .55 + 9 + Math.sin(y * .22) * 3.2));
      if (wd < 4.5) h = Math.min(h, 1);
      H[x][y] = water(x, y) ? -1 : h;
    }
  }
  const water_cells = [];
  for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) {
    const h = H[x][y];
    if (h < 0) { V.set(x, y, 0, (x + y) % 3 ? P.water : P.water2); water_cells.push([x, y]); continue; }
    for (let z = 0; z <= h; z++) {
      const top = z === h;
      const g = P.grass[(N2(x * .5, y * .5) * 4) | 0] || P.grass[0];
      V.set(x, y, z, top ? g : (z === h - 1 ? P.dirt : P.stone));
    }
    if (R() < .05) V.set(x, y, h + 1, P.flower[(R() * 4) | 0]);
    else if (R() < .05) V.set(x, y, h + 1, P.moss);
  }
  const top = (x, y) => Math.max(0, H[x]?.[y] ?? 0);

  /* ruined concrete block (back-left) */
  const ruin = (x0, y0, w, d, hgt, seed) => {
    const r = rng(seed), base = top(x0, y0) + 1;
    for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + d; y++) {
      const edge = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + d - 1;
      if (!edge) continue;
      const hh = hgt - Math.floor(Math.max(0, (x - x0) - w * .55) * 1.4) - (r() < .25 ? 1 : 0);
      for (let z = base; z < base + hh; z++) {
        const win = (z - base) % 4 === 2 && (x + y) % 3 === 1 && z < base + hh - 1;
        if (win) continue;
        V.set(x, y, z, P.conc[(z + x + y) % 3]);
      }
      const zt = base + hh;
      if (r() < .8) V.set(x, y, zt, P.grass[(r() * 3) | 0]);
      if (r() < .3) for (let z = zt - 1; z > base + 1 && r() < .8; z--) V.set(x + (y === y0 + d - 1 ? 0 : 0), y, z, P.leaf[2]);
    }
    for (let x = x0 + 1; x < x0 + w - 1; x++) for (let y = y0 + 1; y < y0 + d - 1; y++) if (r() < .7) V.set(x, y, base, P.grass[1]);
  };
  ruin(4, 30, 11, 9, 11, 21);
  ruin(30, 2, 9, 7, 9, 22);

  /* the cassette: 18×11 footprint, lying in the moss */
  const cx0 = 19, cy0 = 13, CW = 23, CD = 14;
  const cz = 3;
  const label = (x, y) => x >= cx0 + 1 && x <= cx0 + CW - 2 && y >= cy0 + 1 && y <= cy0 + CD - 4;
  const stripe = y => y === cy0 + CD - 6 ? P.orange : y === cy0 + CD - 5 ? P.pink : y === cy0 + CD - 4 ? P.teal : null;
  const winR = (x, y) => y >= cy0 + 4 && y <= cy0 + 7 && x >= cx0 + 6 && x <= cx0 + CW - 7;
  const reelA = [cx0 + 8, cy0 + 5.5], reelB = [cx0 + CW - 9, cy0 + 5.5];
  for (let x = cx0; x < cx0 + CW; x++) for (let y = cy0; y < cy0 + CD; y++) {
    const corner = (x === cx0 || x === cx0 + CW - 1) && (y === cy0 || y === cy0 + CD - 1);
    if (corner) continue;
    for (let z = 1; z < cz; z++) V.set(x, y, z, P.shell);
    let c = P.shell2;
    if (label(x, y)) c = stripe(y) || P.label;
    if (winR(x, y)) c = P.win;
    const dA = Math.hypot(x - reelA[0], y - reelA[1]), dB = Math.hypot(x - reelB[0], y - reelB[1]);
    if (dA < 2.1 || dB < 2.1) c = P.reel;
    if (dA < .8 || dB < .8) c = P.win;
    if (y >= cy0 + CD - 2 && x > cx0 + 4 && x < cx0 + CW - 5) c = P.shell;
    V.set(x, y, cz, c);
  }
  // handwritten line on the label
  for (let x = cx0 + 3; x < cx0 + 12; x++) if ((x * 7) % 5 < 3) V.set(x, cy0 + 1, cz, '#4a4a58');
  // moss + flowers creeping over the shell
  const RM = rng(40);
  for (let x = cx0; x < cx0 + CW; x++) for (let y = cy0; y < cy0 + CD; y++) {
    const edge = x < cx0 + 2 || y > cy0 + CD - 3 || x > cx0 + CW - 3;
    if (edge && RM() < .5 && !winR(x, y)) V.set(x, y, cz + 1, RM() < .2 ? P.flower[(RM() * 3) | 0] : P.grass[(RM() * 4) | 0]);
  }
  // sapling growing out of the cassette
  for (let z = cz + 1; z < cz + 5; z++) V.set(cx0 + CW - 3, cy0 + 2, z, P.trunk);
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1]].forEach(([dx, dy]) => V.set(cx0 + CW - 3 + dx, cy0 + 2 + dy, cz + 5, P.leaf[2]));
  V.set(cx0 + CW - 3, cy0 + 2, cz + 6, P.leaf[3]);

  /* CRT terminal */
  const tx = 43, ty = 30, tz = top(tx, ty) + 1;
  for (let x = tx; x < tx + 5; x++) for (let y = ty; y < ty + 4; y++) for (let z = tz; z < tz + 5; z++) {
    const face = y === ty + 3 && x > tx && x < tx + 4 && z > tz && z < tz + 4;
    V.set(x, y, z, face ? P.screen : (z === tz ? '#a99d7d' : P.beige));
  }
  V.set(tx + 4, ty + 3, tz + 1, P.orange); V.set(tx + 4, ty + 3, tz + 2, P.lime);
  // cable to the cassette
  for (let x = cx0 + CW; x < tx; x++) V.set(x, ty + 1, top(x, ty + 1) + 1, '#26252e');
  for (let y = cy0 + 6; y <= ty + 1; y++) V.set(cx0 + CW, y, top(cx0 + CW, y) + 1, '#26252e');

  /* rusty pipe over the water */
  for (let y = 26; y < 40; y++) { const x = Math.round(y * .55 + 9 + Math.sin(y * .22) * 3.2) - 6; }
  for (let x = 8; x < 26; x++) { V.set(x, 44, 2, P.rust); V.set(x, 44, 3, P.rust); V.set(x, 45, 2, P.rust2); if (x % 6 === 0) { V.set(x, 44, 4, P.rust2); V.set(x, 45, 3, P.rust2); } }

  /* trees */
  const tree = (x, y, h, r, seed, birch) => {
    const rr = rng(seed), z0 = top(x, y) + 1;
    for (let z = z0; z < z0 + h; z++) V.set(x, y, z, birch ? ((z % 3) ? P.birch : '#3a3a3a') : P.trunk);
    const cz2 = z0 + h;
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) {
      const d = Math.hypot(dx, dy, dz * 1.2);
      if (d <= r + rr() * .6 - .3) V.set(x + dx, y + dy, cz2 + dz, P.leaf[Math.min(3, Math.max(0, ((dz + r) / (2 * r) * 3 + rr() * 1.2) | 0))]);
    }
  };
  tree(6, 12, 7, 3, 1); tree(15, 6, 9, 3.4, 2); tree(50, 12, 6, 2.6, 3, true); tree(18, 48, 6, 3, 4);
  tree(52, 44, 8, 3.2, 5); tree(34, 42, 5, 2.4, 6, true); tree(46, 20, 5, 2.2, 7); tree(2, 46, 7, 3, 8);

  /* the traveller */
  const hx = tx - 2, hy = ty + 5, hz = top(hx, hy) + 1;
  V.set(hx, hy, hz, P.legs); V.set(hx, hy, hz + 1, P.body); V.set(hx, hy, hz + 2, P.hair);

  return {
    V, S, water_cells,
    reels: [[reelA[0], reelA[1], cz], [reelB[0], reelB[1], cz]],
    screen: [tx + 1, ty + 3, tz + 1],
    cassette: [cx0 + CW / 2, cy0 + CD / 2, cz],
    terminal: [tx + 2, ty + 2, tz + 5]
  };
}

export function mountVoxelHero(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const W = buildWorld();
  const b = W.V.bounds();
  const world = document.createElement('canvas');
  world.width = Math.ceil(b.w) + 2; world.height = Math.ceil(b.h) + 2;
  const wctx = world.getContext('2d');
  W.V.bake(wctx, -b.x0, -b.y0, { fog: P.haze, fogAmt: .38 });
  const wproj = (x, y, z) => W.V.proj(x, y, z, -b.x0, -b.y0);
  const waterPx = W.water_cells.map(([x, y]) => wproj(x, y, 0));

  let bw = 0, bh = 0, post = null, mask = null, mx = 0, my = 0, tmx = 0, tmy = 0;
  const flies = Array.from({ length: 26 }, (_, i) => ({ a: i * 2.4, r: 20 + (i * 37) % 60, s: .2 + (i % 5) * .07, x: (i * 53) % 400, y: (i * 97) % 240 }));

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    bw = Math.round(Math.min(440, Math.max(240, r.width / 3.4)));
    bh = Math.round(bw * r.height / r.width);
    canvas.width = bw; canvas.height = bh;
    ctx.imageSmoothingEnabled = false;
    post = makePost(bw, bh, { levels: 7, ab: 1, vignette: .34, grain: 7 });
    // organic dark border, like a camera iris overgrown with leaves
    mask = document.createElement('canvas'); mask.width = bw; mask.height = bh;
    const m = mask.getContext('2d'), img = m.createImageData(bw, bh), d = img.data, n = noise2(5);
    const ink = hex(P.ink);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const e = Math.min(x, bw - 1 - x, y * 1.6, (bh - 1 - y) * 1.6);
      const th = 9 + n(x * .12, y * .12) * 20;
      if (e < th) { const i = (y * bw + x) * 4; d[i] = ink[0]; d[i + 1] = ink[1]; d[i + 2] = ink[2]; d[i + 3] = e < th - 3 ? 255 : 150; }
    }
    m.putImageData(img, 0, 0);
    frame(lastT);
  };

  let lastT = 4.5, glitchUntil = 0;
  const frame = t => {
    lastT = t;
    if (!bw) return;
    mx += (tmx - mx) * .08; my += (tmy - my) * .08;
    // anchor the cassette at ~62% / 52% of the screen
    const [cxp, cyp] = wproj(...W.cassette);
    const ox = Math.round(bw * .64 - cxp + Math.sin(t * .15) * 5 + mx * 8);
    const oy = Math.round(bh * .55 - cyp + Math.cos(t * .11) * 3 + my * 5);
    ctx.fillStyle = '#0d2a24'; ctx.fillRect(0, 0, bw, bh);
    ctx.drawImage(world, ox, oy);

    // water glints
    ctx.fillStyle = '#c9fff3';
    for (let i = 0; i < waterPx.length; i += 3) {
      const [px, py] = waterPx[i];
      if (((px * 3 + py * 7 + Math.floor(t * 4)) % 23) === 0) ctx.fillRect(ox + px + 3, oy + py + 2, 2, 1);
    }
    // reels: spinning notches
    W.reels.forEach(([x, y, z], k) => {
      const [px, py] = wproj(x, y, z);
      const a = t * (k ? 5 : 3.4);
      const cx = ox + px + 4, cy = oy + py + 2;
      ctx.fillStyle = P.win;
      for (let s = 0; s < 3; s++) { const aa = a + s * 2.094; ctx.fillRect(Math.round(cx + Math.cos(aa) * 3), Math.round(cy + Math.sin(aa) * 1.5), 1, 1); }
      ctx.fillStyle = '#3b2617'; ctx.fillRect(cx, cy, 1, 1);
    });
    // terminal: scrolling text + cursor on the screen face
    {
      const [px, py] = wproj(...W.screen);
      const sx = ox + px + 1, sy = oy + py - 7;
      ctx.fillStyle = P.lime;
      const rows = 3, scroll = Math.floor(t * 3);
      for (let r = 0; r < rows; r++) {
        const len = 2 + ((r + scroll) * 7) % 7;
        for (let c = 0; c < len; c++) ctx.fillRect(sx + c, sy + r * 2 + Math.floor(c / 2) * -1 + 4, 1, 1);
      }
      if (Math.floor(t * 2) % 2) ctx.fillRect(sx + 8, sy + 8, 2, 1);
    }
    // light shafts
    ctx.save(); ctx.globalAlpha = .07 + Math.sin(t * .4) * .02; ctx.fillStyle = '#fff6d0';
    for (let k = 0; k < 3; k++) {
      const x0 = bw * (.3 + k * .24) + Math.sin(t * .2 + k) * 6;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + 22 + k * 6, 0); ctx.lineTo(x0 - 40, bh); ctx.lineTo(x0 - 62 - k * 6, bh); ctx.fill();
    }
    ctx.restore();
    // fireflies / pollen
    flies.forEach((f, i) => {
      const x = ((f.x + t * 6 * f.s + Math.sin(t * f.s * 3 + f.a) * 10) % (bw + 20) + bw + 20) % (bw + 20) - 10;
      const y = ((f.y - t * 4 * f.s + Math.cos(t * f.s * 2 + f.a) * 6) % (bh + 20) + bh + 20) % (bh + 20) - 10;
      const on = (Math.sin(t * 2 + f.a) + 1) / 2;
      ctx.fillStyle = i % 4 ? `rgba(198,255,74,${.35 + on * .65})` : `rgba(255,79,163,${.4 + on * .5})`;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      if (on > .7 && i % 4) { ctx.fillStyle = 'rgba(198,255,74,.25)'; ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); }
    });
    // in-world labels
    {
      const [px, py] = wproj(...W.terminal);
      chip(ctx, 'TERMINAL', ox + px - 10, oy + py - 14, P.lime);
      const [qx, qy] = wproj(W.cassette[0] - 4, W.cassette[1] - 6, 3);
      chip(ctx, 'TAPE-01  SIDE A', ox + qx - 20, oy + qy - 14, '#ffd23f');
    }
    ctx.drawImage(mask, 0, 0);
    const g = !reduced && t > glitchUntil - .12 && t < glitchUntil;
    if (!reduced && t > glitchUntil + 3 + Math.random() * 4) glitchUntil = t + .14;
    post(ctx, g);
  };

  const L = loop(canvas, 24, frame, reduced);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const host = canvas.parentElement;
  const onMove = e => { const r = host.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; tmy = (e.clientY - r.top) / r.height * 2 - 1; };
  host.addEventListener('pointermove', onMove);
  resize();
  return {
    bench(n = 60) { const t0 = performance.now(); for (let i = 0; i < n; i++) frame(lastT + 1 / 24); return { w: bw, h: bh, ms: (performance.now() - t0) / n }; },
    dispose() { L.stop(); ro.disconnect(); host.removeEventListener('pointermove', onMove); }
  };
}
