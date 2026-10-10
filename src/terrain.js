/* Procedural world for the hero: Perlin / fBm noise → elevation, temperature, moisture →
   biomes (ocean, beach, grassland, forest, taiga, tundra, desert, savanna, rock, snow caps)
   plus sparse volcanoes with crater lava and lava streams.
   Pure functions of the world coordinate, so the world is endless and the same
   cell always generates the same result. */
import { rng } from './voxel.js';

export const SEA = 6;
export const BIOME = { WATER: 0, SAND: 1, GRASS: 2, FOREST: 3, PINE: 4, SNOWFIELD: 5, DESERT: 6, SAVANNA: 7, ROCK: 8, SNOW: 9, ASH: 10, LAVA: 11 };
export const DECO = { NONE: 0, TREE: 1, TREE_TALL: 2, PINE: 3, CACTUS: 4, FLOWER: 5, RUIN: 6, CONTAINER: 7, LILY: 8, SMOKE: 9 };

/* ---------- Perlin noise ---------- */
const P = new Uint8Array(512);
{
  const r = rng(20240607), a = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  for (let i = 0; i < 512; i++) P[i] = a[i & 255];
}
const GX = [1, -1, 1, -1, 1, -1, 0, 0], GY = [1, 1, -1, -1, 0, 0, 1, -1];
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
export function perlin(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
  const aa = P[P[X] + Y] & 7, ab = P[P[X] + Y + 1] & 7, ba = P[P[X + 1] + Y] & 7, bb = P[P[X + 1] + Y + 1] & 7;
  const u = fade(xf), v = fade(yf);
  const d00 = GX[aa] * xf + GY[aa] * yf, d10 = GX[ba] * (xf - 1) + GY[ba] * yf;
  const d01 = GX[ab] * xf + GY[ab] * (yf - 1), d11 = GX[bb] * (xf - 1) + GY[bb] * (yf - 1);
  const x1 = d00 + u * (d10 - d00), x2 = d01 + u * (d11 - d01);
  return x1 + v * (x2 - x1);
}
export function fbm(x, y, oct) {
  let a = .5, f = 1, s = 0, n = 0;
  for (let i = 0; i < oct; i++) { s += a * perlin(x * f, y * f); n += a; a *= .5; f *= 2.03; }
  return s / n;
}
const hs = (x, y, s = 0) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* thresholds calibrated against the fBm distribution (see scripts in the repo history) */
const SEA_E = -.09;       // elevation below this is ocean
const HI_E = .38;         // elevation that counts as "highest"
const DEEP = .2;          // depth span used for water shading
const M = 48;             // volcano macro cell

export function sampleWorld(wx, wy, o) {
  const e = fbm(wx * .024 + 17.3, wy * .024 + 91.7, 5);
  let h, b, dep = 0, deco = 0, tint = 0;

  /* temperature / moisture (slow, large biomes) */
  const t0 = clamp(fbm(wx * .017 + 301.1, wy * .017 + 57.7, 3) * 3.4, -1, 1);
  const m0 = clamp(fbm(wx * .021 + 733.9, wy * .021 + 412.3, 3) * 3.4, -1, 1);

  if (e < SEA_E) {
    h = SEA; b = BIOME.WATER;
    dep = clamp(Math.floor((SEA_E - e) / DEEP * 4), 0, 3);
  } else {
    const n = clamp((e - SEA_E) / (HI_E - SEA_E), 0, 1);
    let rel = 1 + Math.round(Math.pow(n, 1.4) * 10);
    const ridge = 1 - Math.abs(perlin(wx * .06 + 5.5, wy * .06 + 71.2)) * 1.6;
    if (ridge > 0) rel += Math.round(ridge * ridge * 7 * smooth(.3, .7, n));
    h = SEA + rel;
    const teff = t0 - rel * .015;
    const sl = 14 + Math.round(t0 * 4);
    if (rel <= 1) b = BIOME.SAND;
    else if (rel >= sl) b = BIOME.SNOW;
    else if (rel >= sl - 3 && rel >= 9) b = BIOME.ROCK;
    else if (teff > .38 && m0 < .0) b = BIOME.DESERT;
    else if (teff > .25 && m0 < .3) b = BIOME.SAVANNA;
    else if (teff < -.38) b = m0 > -.15 ? BIOME.PINE : BIOME.SNOWFIELD;
    else if (m0 > .12) b = BIOME.FOREST;
    else b = BIOME.GRASS;
  }

  /* volcanoes */
  const mx = Math.floor(wx / M), my = Math.floor(wy / M);
  if (hs(mx, my, 11) < .6) {
    const cx = mx * M + 16 + hs(mx, my, 12) * (M - 32), cy = my * M + 16 + hs(mx, my, 13) * (M - 32);
    const R = 10 + hs(mx, my, 14) * 5, Hv = 15 + hs(mx, my, 15) * 6;
    const dx = wx - cx, dy = wy - cy, r = Math.hypot(dx, dy) / R;
    if (r < 1) {
      const rimH = Hv * Math.pow(.8, 1.35);
      let ch, lava = false;
      if (r < .2) { ch = rimH - (r < .15 ? 3 : 2); lava = r < .15; }
      else ch = Hv * Math.pow(1 - r, 1.35);
      const vh = SEA + 1 + Math.round(ch);
      if (ch >= .5 && vh > h) {
        h = vh; b = BIOME.ASH; deco = 0;
        if (lava) b = BIOME.LAVA;
        else if (r > .2 && r < .62 + .2 * perlin(wx * .2 + 3.3, wy * .2 + 8.8)) {
          const ang = Math.atan2(dy, dx), a0 = hs(mx, my, 16) * 6.2832, a1 = a0 + 2 + hs(mx, my, 17) * 2.4;
          const wrap = a => { a = Math.abs(a) % 6.2832; return a > 3.1416 ? 6.2832 - a : a; };
          const da = Math.min(wrap(ang - a0), wrap(ang - a1));
          if (da < 1.2 && r * R * Math.sin(da) < 1.1 + .7 * perlin(wx * .3 + 1.1, wy * .3 + 6.6)) b = BIOME.LAVA;
        }
        if (Math.round(cx) === wx && Math.round(cy) === wy) deco = DECO.SMOKE;
      }
    }
  }

  /* decoration & tint */
  const hh = hs(wx, wy, 3);
  if (b !== BIOME.LAVA && b !== BIOME.ASH && b !== BIOME.WATER) {
    if (b === BIOME.FOREST) { if (hh < .2 + .06 * m0) deco = hh < .06 ? DECO.TREE_TALL : DECO.TREE; }
    else if (b === BIOME.PINE) { if (hh < .22) deco = DECO.PINE; }
    else if (b === BIOME.GRASS) { if (hh < .025) deco = DECO.TREE; else if (hh < .09) deco = DECO.FLOWER; }
    else if (b === BIOME.SAVANNA) { if (hh < .018) deco = DECO.TREE_TALL; }
    else if (b === BIOME.DESERT) { if (hh < .022) deco = DECO.CACTUS; }
    else if (b === BIOME.SNOWFIELD) { if (hh < .04) deco = DECO.PINE; }
    /* overgrown ruins: scattered singles, plus drifting "districts" where they cluster */
    if (b === BIOME.GRASS || b === BIOME.FOREST || b === BIOME.SAVANNA || b === BIOME.SAND) {
      const town = perlin(wx * .045 + 44.4, wy * .045 + 12.1) > .22;
      const rh = hs(wx, wy, 7);
      if (rh < (town ? .07 : .004)) deco = rh < (town ? .018 : .001) ? DECO.CONTAINER : DECO.RUIN;
    }
  } else if (b === BIOME.WATER && dep === 0 && hh < .05) deco = DECO.LILY;
  const pn = perlin(wx * .11 + 9.1, wy * .11 + 2.7);
  tint = (pn < -.12 ? 0 : pn > .14 ? 2 : 1) + 3 * Math.floor(hs(wx, wy, 5) * 80);

  o.h = h; o.b = b; o.dep = dep; o.deco = deco; o.tint = tint; o.t = t0; o.m = m0; o.e = e;
  return o;
}
