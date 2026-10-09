/* Tiny CPU voxel renderer + pixel post-processing.
   Everything is drawn into a low-resolution 2D canvas and upscaled by CSS
   with nearest-neighbour filtering, so it runs on integrated graphics.

   Projection (2:1 dimetric, z up):  sx = (x − y)·T,  sy = (x + y)·T/2 − z·T
   View direction is (1,1,1), so painter's order is x + y + z ascending. */

export const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const cb = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
export const mul = (c, k) => [cb(c[0] * k), cb(c[1] * k), cb(c[2] * k)];
export const mix = (a, b, t) => [cb(a[0] + (b[0] - a[0]) * t), cb(a[1] + (b[1] - a[1]) * t), cb(a[2] + (b[2] - a[2]) * t)];
export const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const toRGB = c => (typeof c === 'string' ? hex(c) : c);

export const TOP = 1, LEFT = 2, RIGHT = 4, ALL = 7;

export class Voxels {
  constructor(T = 4) { this.T = T; this.m = new Map(); this.sprites = new Map(); }
  key(x, y, z) { return ((x + 128) * 256 + (y + 128)) * 256 + (z + 128); }
  set(x, y, z, c) { if (c == null) this.m.delete(this.key(x, y, z)); else this.m.set(this.key(x, y, z), { x, y, z, c: toRGB(c) }); }
  get(x, y, z) { return this.m.get(this.key(x, y, z)); }
  has(x, y, z) { return this.m.has(this.key(x, y, z)); }
  box(x0, y0, z0, x1, y1, z1, c) {
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      const col = typeof c === 'function' ? c(x, y, z) : c;
      this.set(x, y, z, col);
    }
  }
  proj(x, y, z, ox = 0, oy = 0) { const T = this.T; return [(x - y) * T + ox, (x + y) * T / 2 - z * T + oy]; }

  /* pixel-exact cube sprite with three shaded faces and a lit rim */
  sprite(c, mask = ALL, shadow = false) {
    const k = c[0] + ',' + c[1] + ',' + c[2] + '|' + mask + (shadow ? 's' : '');
    let s = this.sprites.get(k);
    if (s) return s;
    const T = this.T, W = 2 * T;
    s = document.createElement('canvas'); s.width = W; s.height = W;
    const g = s.getContext('2d'), img = g.createImageData(W, W), d = img.data;
    const top = shadow ? mix(mul(c, .66), [40, 70, 110], .12) : c;
    const rim = mix(top, [255, 255, 240], shadow ? .08 : .24);
    const left = mul(c, .8), right = mul(c, .6), lo = mul(c, .48);
    const region = (px, py) => {
      const fx = px + .5, fy = py + .5;
      let t, b, m;
      if (fx < T) { t = T / 2 - fx / 2; b = 3 * T / 2 + fx / 2; m = T / 2 + fx / 2; }
      else { t = (fx - T) / 2; b = 2 * T - (fx - T) / 2; m = T - (fx - T) / 2; }
      if (fy < t || fy > b) return 0;
      return fy <= m ? TOP : (fx < T ? LEFT : RIGHT);
    };
    for (let py = 0; py < W; py++) for (let px = 0; px < W; px++) {
      const f = region(px, py);
      if (!f || !(f & mask)) continue;
      let col;
      if (f === TOP) col = region(px, py - 1) !== TOP ? rim : top;
      else { col = f === LEFT ? left : right; if (region(px, py + 1) === 0) col = lo; }
      const i = (py * W + px) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    this.sprites.set(k, s);
    return s;
  }

  cube(ctx, x, y, z, c, ox, oy, mask = ALL) {
    const [sx, sy] = this.proj(x, y, z, ox, oy);
    ctx.drawImage(this.sprite(toRGB(c), mask), Math.round(sx), Math.round(sy));
  }

  /* bake every voxel with face culling, cast shadows and distance fog */
  bake(ctx, ox, oy, { fog = null, fogAmt = 0, shadow = true } = {}) {
    const list = [...this.m.values()].sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z) || a.z - b.z);
    let dmin = 1e9, dmax = -1e9;
    list.forEach(v => { dmin = Math.min(dmin, v.x + v.y); dmax = Math.max(dmax, v.x + v.y); });
    const fogC = fog && toRGB(fog);
    for (const v of list) {
      const { x, y, z } = v;
      let mask = 0;
      if (!this.has(x, y, z + 1)) mask |= TOP;
      if (!this.has(x, y + 1, z)) mask |= LEFT;
      if (!this.has(x + 1, y, z)) mask |= RIGHT;
      if (!mask) continue;
      let sh = false;
      if (shadow && (mask & TOP)) for (let i = 1; i <= 9; i++) if (this.has(x - i, y, z + i) || this.has(x - i, y - 1, z + i)) { sh = true; break; }
      let c = v.c;
      if (fogC && fogAmt) {
        const t = Math.round((1 - (v.x + v.y - dmin) / Math.max(1, dmax - dmin)) * 3) / 3 * fogAmt;
        if (t) c = mix(c, fogC, t);
      }
      const [sx, sy] = this.proj(x, y, z, ox, oy);
      ctx.drawImage(this.sprite(c, mask, sh), Math.round(sx), Math.round(sy));
    }
  }

  bounds() {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const v of this.m.values()) {
      const [sx, sy] = this.proj(v.x, v.y, v.z);
      x0 = Math.min(x0, sx); y0 = Math.min(y0, sy); x1 = Math.max(x1, sx + 2 * this.T); y1 = Math.max(y1, sy + 2 * this.T);
    }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  }
}

/* ---------- 3×5 pixel font ---------- */
/* each glyph: five rows of three pixels */
const ROWS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'], 4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'], 8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '##.'],
  '-': ['...', '...', '###', '...', '...'], '+': ['...', '.#.', '###', '.#.', '...'], '.': ['...', '...', '...', '...', '.#.'],
  ':': ['...', '.#.', '...', '.#.', '...'], '/': ['..#', '..#', '.#.', '#..', '#..'], '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'], '<': ['..#', '.#.', '#..', '.#.', '..#'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['##.', '..#', '.#.', '...', '.#.'], '=': ['...', '###', '...', '###', '...'], '#': ['#.#', '###', '#.#', '###', '#.#'],
  '*': ['...', '#.#', '.#.', '#.#', '...'], ' ': ['...', '...', '...', '...', '...'], "'": ['.#.', '.#.', '...', '...', '...'],
  '(': ['.#.', '#..', '#..', '#..', '.#.'], ')': ['.#.', '..#', '..#', '..#', '.#.'], '×': ['...', '#.#', '.#.', '#.#', '...']
};
const GLYPH = {};
for (const k in ROWS) GLYPH[k] = ROWS[k].join('');

export function textWidth(s) { return s.length * 4 - 1; }
export function pixelText(ctx, s, x, y, color = '#fff', shadow = '#071211') {
  s = String(s).toUpperCase();
  const draw = (ox, oy, col) => {
    ctx.fillStyle = col;
    for (let n = 0; n < s.length; n++) {
      const g = GLYPH[s[n]] || GLYPH['?'];
      for (let i = 0; i < 15; i++) if (g[i] === '#') ctx.fillRect(x + ox + n * 4 + (i % 3), y + oy + ((i / 3) | 0), 1, 1);
    }
  };
  if (shadow) { draw(1, 0, shadow); draw(0, 1, shadow); draw(1, 1, shadow); draw(-1, 0, shadow); draw(0, -1, shadow); }
  draw(0, 0, color);
}
/* label chip: dark plate + text */
export function chip(ctx, s, x, y, color = '#c6ff4a', plate = 'rgba(7,18,17,.86)') {
  const w = textWidth(String(s)) + 4;
  ctx.fillStyle = plate; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, w, 9);
  ctx.fillStyle = color; ctx.fillRect(Math.round(x) - 2, Math.round(y) + 7, w, 1);
  pixelText(ctx, s, Math.round(x), Math.round(y), color, null);
}

/* ---------- post: ordered-dither posterize, RGB split, vignette, grain ---------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
export function makePost(w, h, { levels = 7, ab = 1, vignette = .38, grain = 9 } = {}) {
  const luts = BAYER.map(b => {
    const l = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) l[v] = Math.min(levels - 1, Math.floor(v / 255 * (levels - 1) + b)) * 255 / (levels - 1);
    return l;
  });
  const vig = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x / w - .5) * 2, dy = (y / h - .5) * 2;
    vig[y * w + x] = 1 - vignette * Math.min(1, Math.pow(dx * dx * .7 + dy * dy, 1.2));
  }
  const off = new Int8Array(w);
  for (let x = 0; x < w; x++) {
    const r = (x / w - .5) * 2, a = Math.abs(r);
    const k = a > .82 ? ab + 1 : a > .38 ? ab : 0;
    off[x] = Math.sign(r) * k;
    if (x - Math.abs(off[x]) < 0 || x + Math.abs(off[x]) >= w) off[x] = 0;
  }
  const noise = new Int8Array(65536);
  for (let i = 0; i < 65536; i++) noise[i] = ((Math.random() - .5) * 2 * grain) | 0;
  let src = new Uint8ClampedArray(w * h * 4), phase = 0;
  return function apply(ctx, glitch = 0) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    src.set(d);
    phase = (phase + 7919) & 65535;
    const gRow = glitch ? (Math.random() * h) | 0 : -1, gH = glitch ? 2 + ((Math.random() * 6) | 0) : 0, gS = glitch ? ((Math.random() - .5) * 10) | 0 : 0;
    for (let y = 0; y < h; y++) {
      const sh = y >= gRow && y < gRow + gH ? gS : 0;
      const row = y * w, lr = (y & 3) << 2;
      for (let x = 0; x < w; x++) {
        let sx = x + sh; if (sx < 0) sx = 0; else if (sx >= w) sx = w - 1;
        const o = off[sx], i = (row + x) * 4, s = (row + sx) * 4;
        const v = vig[row + x], n = noise[(row + x + phase) & 65535];
        const L = luts[lr | (x & 3)];
        d[i] = L[cb(src[s - o * 4] * v + n)];
        d[i + 1] = L[cb(src[s + 1] * v + n)];
        d[i + 2] = L[cb(src[s + 2 + o * 4] * v + n)];
      }
    }
    ctx.putImageData(img, 0, 0);
  };
}

/* loop helper: capped fps, runs only while visible */
export function loop(canvas, fps, frame, reduced, start = 4.5) {
  let raf = 0, last = 0, vis = false, t = start, dead = false;
  const step = now => {
    raf = 0;
    if (dead || !vis || document.hidden) return;
    const dt = now - last;
    if (dt >= 1000 / fps - 2) {
      t += Math.min(dt, 120) / 1000; last = now;
      frame(t);
    }
    raf = requestAnimationFrame(step);
  };
  const kick = () => { if (!raf && vis && !document.hidden && !reduced) { last = performance.now(); raf = requestAnimationFrame(step); } };
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && reduced) frame(t); kick(); }, { threshold: 0 });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);
  return {
    once() { frame(t); },
    stop() { dead = true; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); }
  };
}
