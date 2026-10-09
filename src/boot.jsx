import React, { useEffect, useRef, useState } from 'react';

/* Boot screen: CRT power-on → self-test log → tape loading → CRT collapse.
   Plays once per browser session; any click or key skips it. */
const LINES = [
  ['LC-SYSTEMS TAPE OPERATING SYSTEM', 'v26.10'],
  ['(C) LIZHE CHEN · TSINGHUA SIGS', ''],
  ['', ''],
  ['MEMORY TEST', '640K OK'],
  ['GRAPHICS ADAPTER', 'WEBGL2 OK'],
  ['RENDER PIPELINE', 'VULKAN · WEBGPU'],
  ['MOUNT DECK A:', 'RESEARCH.TAP'],
  ['MOUNT DECK B:', 'GAMES.TAP'],
  ['HOLO-PROJECTOR', 'STANFORD BUNNY'],
  ['', ''],
  ['LOADING CHENLIZHE.CN', '']
];

export function BootScreen({ onDone }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('on');
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setPhase('off');
    try { sessionStorage.setItem('lc-booted', '1'); } catch { /* private mode */ }
    setTimeout(onDone, 620);
  };

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(LINES.length); setProgress(1); const t = setTimeout(finish, 500); return () => clearTimeout(t); }
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(380, () => setPhase('run'));
    LINES.forEach((_, i) => at(460 + i * 120, () => setShown(i + 1)));
    const t0 = 460 + LINES.length * 120;
    let p = 0;
    const tick = () => {
      if (done.current) return;
      p = Math.min(1, p + 0.035 + Math.random() * 0.06);
      setProgress(p);
      if (p < 1) timers.push(setTimeout(tick, 45 + Math.random() * 50));
      else at(380, finish);
    };
    at(t0, tick);
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', skip); };
  }, []);

  const cells = 28, filled = Math.round(progress * cells);
  return (
    <div className={`boot boot--${phase}`} onClick={finish} role="status" aria-label="Loading Lizhe Chen’s website">
      <div className="boot__crt">
        <div className="boot__screen">
          <div className="boot__head">
            <svg className="boot__tape" viewBox="0 0 120 76" aria-hidden="true">
              <rect x="2" y="2" width="116" height="72" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
              <rect x="12" y="10" width="96" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".6"/>
              <rect x="30" y="20" width="60" height="22" rx="11" fill="currentColor" opacity=".18"/>
              <g className="boot__reel"><circle cx="44" cy="31" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M44 23v16M36 31h16" stroke="currentColor" strokeWidth="2"/></g>
              <g className="boot__reel"><circle cx="76" cy="31" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M76 23v16M68 31h16" stroke="currentColor" strokeWidth="2"/></g>
              <path d="M34 74l6-14h40l6 14" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <div>
              <b>LC/OS</b>
              <span>CASSETTE WORKSTATION · 2026</span>
            </div>
          </div>
          <pre className="boot__log">{LINES.slice(0, shown).map(([l, r], i) => (
            <div key={i}>{l}{r && <><span className="boot__dots">{' '.padEnd(Math.max(2, 34 - l.length), '.')}</span><em>{r}</em></>}</div>
          ))}</pre>
          <div className="boot__bar" aria-hidden="true">
            <span>[</span>{Array.from({ length: cells }, (_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}<span>]</span>
            <b>{String(Math.round(progress * 100)).padStart(3, ' ')}%</b>
          </div>
          <div className="boot__hint">{progress >= 1 ? '▶ PLAY' : 'PRESS ANY KEY TO SKIP'}<i /></div>
        </div>
      </div>
    </div>
  );
}
