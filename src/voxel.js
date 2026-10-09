/* Tiny CPU voxel renderer.
   Everything is drawn into a low-resolution 2D canvas and upscaled by CSS
   with nearest-neighbour filtering, so it runs on integrated graphics.
   Colours are drawn as-is: no posterize / dither pass.

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
    const top = shadow ? mix(mul(c, .72), [21, 20, 18], .1) : c;
    const rim = mix(top, [255, 252, 244], shadow ? .06 : .2);
    const left = mul(c, .84), right = mul(c, .66), lo = mul(c, .5);
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
export function pixelText(ctx, s, x, y, color = '#fff', shadow = '#151412') {
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
/* label chip: ink plate, light text, coloured underline */
export function chip(ctx, s, x, y, color = '#e2381b', plate = '#151412', text = '#f3eee2') {
  const w = textWidth(String(s)) + 4;
  ctx.fillStyle = plate; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, w, 9);
  ctx.fillStyle = color; ctx.fillRect(Math.round(x) - 2, Math.round(y) + 7, w, 2);
  pixelText(ctx, s, Math.round(x), Math.round(y), text, null);
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
