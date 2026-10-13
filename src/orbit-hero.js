/* Hero backdrop · a quiet survey plate: a dot-matrix planet slowly turning,
   two tilted orbits with a small craft, a degree scale and a few registration
   marks. Line art only, drawn in the page's own ink so it reads as print. */

const TAU = Math.PI * 2;

/* tiny 3D value noise for the continents (no seam on a sphere) */
function hash(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const s = t => t * t * (3 - 2 * t);
  const u = s(xf), v = s(yf), w = s(zf);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y, z) => vnoise(x, y, z) * .55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * .3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * .15;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function mountOrbitHero(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(canvas);
  const ink = css.getPropertyValue('--ink').trim() || '#141413';
  const accent = css.getPropertyValue('--red').trim() || '#b8452c';
  const muted = css.getPropertyValue('--muted').trim() || '#73726c';
  const card = css.getPropertyValue('--card').trim() || '#ffffff';
  const mono = '500 10px "JetBrains Mono", ui-monospace, monospace';
  const pad2 = n => String(n).padStart(2, '0');
  const host = canvas.parentElement;
  /* visitor interaction: hover scans lat/lon, click drops a waypoint */
  let mouse = null, geo = null, marks = [], pings = [], wpCount = 0;

  /* fibonacci sphere, land decided once in body space */
  const N = 7000, pts = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + .5) / N * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996323;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const n = fbm(x * 1.6 + 7, y * 1.6 + 3, z * 1.6 + 11);
    if (n > .5) pts.push([x, y, z, n]);
  }
  const R = rng(26);
  const stars = Array.from({ length: 140 }, () => [R(), R(), R()]);

  let w = 0, h = 0, dpr = 1, raf = 0, last = 0, visible = true, t0 = performance.now();
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    draw(reduced ? 18 : (performance.now() - t0) / 1000);
  };

  const tilt = .38, ct = Math.cos(tilt), st = Math.sin(tilt);
  /* screen-space unit disc point -> body-space point on the sphere */
  const unproj = (X, Y, rot) => {
    const D = Math.sqrt(Math.max(0, 1 - X * X - Y * Y));
    const y = Y * ct + D * st, Z = -Y * st + D * ct;
    return [X * Math.cos(rot) - Z * Math.sin(rot), y, X * Math.sin(rot) + Z * Math.cos(rot)];
  };
  function draw(t) {
    if (!w || !h) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 760;
    const cx = narrow ? w * .8 : w * .83, cy = narrow ? h * .3 : h * .5;
    const rad = narrow ? Math.min(w * .48, 220) : Math.min(h * .42, w * .27);
    const rot = t * TAU / 220;
    geo = { cx, cy, rad, rot };

    /* stars */
    ctx.fillStyle = ink;
    stars.forEach(([x, y, s]) => {
      const px = x * w, py = y * h;
      if (Math.hypot(px - cx, py - cy) < rad + 6) return;
      ctx.globalAlpha = .1 + s * .22;
      ctx.fillRect(px, py, s > .85 ? 1.6 : 1, s > .85 ? 1.6 : 1);
    });

    /* faint survey grid */
    ctx.globalAlpha = .05; ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = cx % 64; x < w; x += 64) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); }
    for (let y = cy % 64; y < h; y += 64) { ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); }
    ctx.stroke();

    /* orbit helpers: ellipse in the planet's frame, z decides front/back */
    const orbit = (k, inc, phase) => a => {
      const x = Math.cos(a) * k, z = Math.sin(a) * k;
      const y = Math.sin(a + phase) * k * inc;
      return [cx + x * rad, cy + (y * ct - z * st * .32) * rad, z * ct + y * st];
    };
    const orbits = [orbit(1.42, .2, .3), orbit(1.78, -.12, 2.1)];
    const strokeOrbit = (f, front, dash) => {
      ctx.setLineDash(dash); ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= 160; i++) {
        const [x, y, z] = f(i / 160 * TAU);
        const behind = z < 0 && Math.hypot(x - cx, y - cy) < rad;
        if (behind === front) { pen = false; continue; }
        pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.globalAlpha = .1; orbits.forEach(f => strokeOrbit(f, false, [2, 5]));

    /* planet disc + terminator */
    ctx.globalAlpha = 1;
    const g = ctx.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.05)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill();
    ctx.globalAlpha = .38; ctx.strokeStyle = ink; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.stroke();

    /* graticule */
    const proj = (x, y, z) => {
      const X = x * Math.cos(rot) + z * Math.sin(rot), Z = -x * Math.sin(rot) + z * Math.cos(rot);
      const Y = y * ct - Z * st, D = y * st + Z * ct;
      return [cx + X * rad, cy - Y * rad, D];
    };
    ctx.globalAlpha = .12; ctx.lineWidth = 1;
    const curve = f => {
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= 72; i++) {
        const [x, y, d] = f(i / 72);
        if (d < 0) { pen = false; continue; }
        pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
      }
      ctx.stroke();
    };
    for (let k = 0; k < 12; k++) {
      const lon = k / 12 * TAU;
      curve(u => { const lat = (u - .5) * Math.PI; return proj(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)); });
    }
    for (let k = 1; k < 6; k++) {
      const lat = (k / 6 - .5) * Math.PI;
      curve(u => { const lon = u * TAU; return proj(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)); });
    }

    /* land, dot matrix; limb darkening by depth */
    ctx.fillStyle = ink;
    for (const [x, y, z, n] of pts) {
      const [px, py, d] = proj(x, y, z);
      if (d <= 0) continue;
      ctx.globalAlpha = (.2 + d * .6) * (n > .58 ? 1 : .6);
      const s = n > .6 ? 1.8 : 1.3;
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }

    /* waypoints + click pings, both fixed to the turning surface */
    ctx.font = mono; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.strokeStyle = accent; ctx.fillStyle = accent; ctx.lineWidth = 1.2;
    marks.forEach(([x, y, z, n]) => {
      const [px, py, d] = proj(x, y, z);
      if (d <= 0) return;
      ctx.globalAlpha = .35 + d * .65;
      ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px + 6, py); ctx.lineTo(px, py + 6); ctx.lineTo(px - 6, py); ctx.closePath(); ctx.stroke();
      ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      ctx.beginPath(); ctx.moveTo(px + 7, py - 7); ctx.lineTo(px + 16, py - 16); ctx.stroke();
      ctx.fillText(`WP-${pad2(n)}`, px + 19, py - 18);
    });
    const now = performance.now();
    pings = pings.filter(p => now - p[3] < 900);
    pings.forEach(([x, y, z, born]) => {
      const [px, py, d] = proj(x, y, z);
      if (d <= 0) return;
      const k = (now - born) / 900;
      ctx.globalAlpha = (1 - k) * .9;
      ctx.beginPath(); ctx.arc(px, py, 6 + k * 46, 0, TAU); ctx.stroke();
    });
    ctx.lineWidth = 1;

    /* hover scan: crosshair chords, ring and a lat/lon readout */
    if (mouse) {
      const dx = mouse.x - cx, dy = mouse.y - cy;
      if (dx * dx + dy * dy < rad * rad) {
        const v = unproj(dx / rad, -dy / rad, rot);
        const lat = Math.asin(v[1]) * 180 / Math.PI, lon = Math.atan2(v[0], v[2]) * 180 / Math.PI;
        const hx = Math.sqrt(rad * rad - dy * dy), vy = Math.sqrt(rad * rad - dx * dx);
        ctx.strokeStyle = accent; ctx.globalAlpha = .5; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(cx - hx, mouse.y); ctx.lineTo(cx + hx, mouse.y); ctx.moveTo(mouse.x, cy - vy); ctx.lineTo(mouse.x, cy + vy); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 11, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2, 0, TAU); ctx.fillStyle = accent; ctx.fill();
        const l1 = `LAT ${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}  LON ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
        const l2 = `CLICK · MARK WP-${pad2(wpCount + 1)}`;
        const bw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 16;
        let bx = mouse.x + 18, by = mouse.y + 16;
        if (bx + bw > w - 8) bx = mouse.x - 18 - bw;
        ctx.fillStyle = card; ctx.globalAlpha = .94; ctx.fillRect(bx, by, bw, 36);
        ctx.strokeStyle = ink; ctx.globalAlpha = .35; ctx.strokeRect(bx + .5, by + .5, bw - 1, 35);
        ctx.fillStyle = accent; ctx.globalAlpha = 1; ctx.fillRect(bx, by, 3, 36);
        ctx.fillStyle = ink; ctx.fillText(l1, bx + 9, by + 11);
        ctx.fillStyle = muted; ctx.fillText(l2, bx + 9, by + 25);
      }
    }

    /* plate caption, top right */
    if (!narrow) {
      const c1 = 'SURVEY PLATE 01 · HOVER TO SCAN · CLICK TO MARK';
      const c2 = `WAYPOINTS ${pad2(marks.length)} / 06 · ROT ${String(Math.floor((rot * 180 / Math.PI) % 360)).padStart(3, '0')}°`;
      ctx.font = mono; ctx.textAlign = 'right';
      const cw = ctx.measureText(c1).width + 20;
      ctx.fillStyle = card; ctx.globalAlpha = .9; ctx.fillRect(w - 40 - cw + 10, 76, cw, 40);
      ctx.fillStyle = accent; ctx.globalAlpha = 1; ctx.fillRect(w - 33, 76, 3, 40);
      ctx.fillStyle = muted;
      ctx.fillText(c1, w - 42, 88);
      ctx.fillText(c2, w - 42, 104);
    }

    /* degree scale around the limb */
    ctx.globalAlpha = .3; ctx.beginPath();
    for (let i = 0; i < 72; i++) {
      const a = i / 72 * TAU, l = i % 6 === 0 ? 9 : 4;
      ctx.moveTo(cx + Math.cos(a) * (rad + 6), cy + Math.sin(a) * (rad + 6));
      ctx.lineTo(cx + Math.cos(a) * (rad + 6 + l), cy + Math.sin(a) * (rad + 6 + l));
    }
    ctx.stroke();
    ctx.font = mono; ctx.fillStyle = muted; ctx.globalAlpha = .9;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [0, 90, 180, 270].forEach(deg => {
      const a = deg / 360 * TAU - Math.PI / 2;
      ctx.fillText(String(deg).padStart(3, '0'), cx + Math.cos(a) * (rad + 28), cy + Math.sin(a) * (rad + 28));
    });

    /* orbits in front + the craft */
    ctx.strokeStyle = ink; ctx.globalAlpha = .26;
    orbits.forEach((f, i) => strokeOrbit(f, true, i ? [2, 5] : []));
    const crafts = [[orbits[0], t * TAU / 46, 'LC-01'], [orbits[1], t * TAU / 90 + 2, 'LC-02']];
    crafts.forEach(([f, a, label], i) => {
      const [x, y, z] = f(a);
      const hidden = z < 0 && Math.hypot(x - cx, y - cy) < rad;
      if (hidden || x < -20 || x > w + 20) return;
      ctx.globalAlpha = 1;
      ctx.fillStyle = i ? ink : accent;
      ctx.beginPath(); ctx.arc(x, y, i ? 2.5 : 3.5, 0, TAU); ctx.fill();
      if (!i) {
        ctx.globalAlpha = .35; ctx.strokeStyle = accent;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = .75; ctx.strokeStyle = ink; ctx.fillStyle = muted; ctx.textAlign = 'left';
      ctx.beginPath(); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x + 20, y - 20); ctx.lineTo(x + 64, y - 20); ctx.stroke();
      ctx.fillText(label, x + 24, y - 28);
    });

    /* registration marks */
    ctx.globalAlpha = .35; ctx.strokeStyle = ink;
    const reg = (x, y) => { ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.stroke(); };
    reg(cx - rad - 44, cy - rad - 10); reg(cx + rad + 30, cy + rad + 24);
    ctx.globalAlpha = 1;
  }

  const tick = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (dirty || now - last > 1000 / 24) { last = now; dirty = false; draw((now - t0) / 1000); }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!reduced && !raf) raf = requestAnimationFrame(tick); };
  let dirty = false;
  const redraw = () => { if (reduced) draw(18); else dirty = true; };
  const local = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const blocked = e => e.target.closest?.('a, button, .crew, .hero__copy, .telemetry');
  const inDisc = p => geo && Math.hypot(p.x - geo.cx, p.y - geo.cy) < geo.rad;
  const onMove = e => {
    if (e.pointerType !== 'mouse') return;
    const p = local(e);
    mouse = blocked(e) ? null : p;
    host.style.cursor = mouse && inDisc(p) ? 'crosshair' : '';
    redraw();
  };
  const onLeave = () => { mouse = null; host.style.cursor = ''; redraw(); };
  const onClick = e => {
    if (blocked(e)) return;
    const p = local(e);
    if (!inDisc(p)) return;
    const v = unproj((p.x - geo.cx) / geo.rad, -(p.y - geo.cy) / geo.rad, geo.rot);
    marks.push([...v, ++wpCount]);
    if (marks.length > 6) marks.shift();
    if (!reduced) pings.push([...v, performance.now()]);
    redraw();
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('click', onClick);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
  io.observe(canvas);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  resize(); start();

  return {
    dispose() {
      cancelAnimationFrame(raf); raf = 0; io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); host.removeEventListener('click', onClick); host.style.cursor = '';
    }
  };
}
