import React, { useEffect, useRef } from 'react';
import { useMotion } from './motion.jsx';

// A projected spherical lattice. No image filters are applied to the portrait.
export function OrbitalField({ contrast = 'auto' }) {
  const ref = useRef(null);
  const { paused } = useMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0, visible = false, last = 0, phase = 0;
    let width = 0, height = 0, pointer = [0, 0], camera = [0, 0];
    const draw = (time = 0) => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (time - last >= 32 || !time || paused) {
        const delta = time ? Math.max(0, Math.min((time - last) / 1000, .05)) : 0;
        last = time || performance.now();
        if (!paused) phase += delta * .14;
        camera = camera.map((v, i) => v + (pointer[i] - v) * .045);
        ctx.clearRect(0, 0, width, height);
        const dark = contrast === 'light' || document.documentElement.dataset.theme === 'dark';
        const rgb = dark ? '159,188,200' : '47,76,93';
        const radius = Math.min(width, height) * .31;
        const project = ([x, y, z]) => {
          const angle = phase + camera[0] * .24;
          const a = x * Math.cos(angle) - z * Math.sin(angle);
          const b = x * Math.sin(angle) + z * Math.cos(angle);
          const tilt = -.38 + camera[1] * .15;
          const c = y * Math.cos(tilt) - b * Math.sin(tilt);
          const depth = y * Math.sin(tilt) + b * Math.cos(tilt);
          const scale = 3.8 / (3.8 + depth);
          return [width / 2 + a * radius * scale, height / 2 + c * radius * scale, depth];
        };
        const line = (points, color, lineWidth = .8) => {
          ctx.beginPath(); points.forEach((p, i) => { const q = project(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
          ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
        };
        for (let lat = 1; lat < 12; lat++) {
          const phi = lat * Math.PI / 12;
          line(Array.from({length:73}, (_, i) => { const a=i*Math.PI/36; return [Math.sin(phi)*Math.cos(a),Math.cos(phi),Math.sin(phi)*Math.sin(a)]; }), `rgba(${rgb},.27)`);
        }
        for (let lon = 0; lon < 20; lon++) {
          const theta = lon * Math.PI / 10;
          line(Array.from({length:49}, (_, i) => { const a=i*Math.PI/48; return [Math.sin(a)*Math.cos(theta),Math.cos(a),Math.sin(a)*Math.sin(theta)]; }), `rgba(${rgb},.23)`);
        }
        for (let ring = 0; ring < 3; ring++) {
          const points = Array.from({length:129}, (_, i) => {
            const a=i*Math.PI/64, r=1.22+ring*.11;
            return ring === 0 ? [Math.cos(a)*r,Math.sin(a)*r*.22,Math.sin(a)*r*.95] : ring === 1 ? [Math.cos(a)*r,Math.sin(a)*r*.92,Math.sin(a)*r*.38] : [Math.cos(a)*r*.4,Math.sin(a)*r,Math.cos(a)*r*.92];
          });
          line(points, ring === 0 ? '#bd6241' : `rgba(${rgb},.4)`, ring === 0 ? 1.5 : .8);
          const p=project(points[Math.floor((phase * (17 + ring * 5)) % 128)]);
          ctx.beginPath(); ctx.arc(p[0],p[1],ring===0?4:2.5,0,Math.PI*2); ctx.fillStyle=ring===0?'#bd6241':`rgb(${rgb})`;ctx.fill();
        }
      }
      if (visible && !document.hidden && !paused) frame = requestAnimationFrame(draw);
    };
    const start = () => { if (!frame && visible && !document.hidden) { last = performance.now(); frame=requestAnimationFrame(draw); } };
    const resize = new ResizeObserver(() => {
      const rect=canvas.getBoundingClientRect(); width=rect.width; height=rect.height;
      const dpr=Math.min(devicePixelRatio || 1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();
    });
    resize.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else {cancelAnimationFrame(frame);frame=0;} });observer.observe(canvas);
    const move=e=>{const b=canvas.getBoundingClientRect();pointer=[(e.clientX-b.left)/b.width-.5,(e.clientY-b.top)/b.height-.5];};
    const leave=()=>{pointer=[0,0];};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;start();};
    const theme=new MutationObserver(()=>{if(paused || !visible)draw();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
    return ()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();theme.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);};
  }, [paused, contrast]);
  return <div className="orbital-field" aria-hidden="true"><div className="orbital-reticle"/><canvas ref={ref}/><span className="orbital-axis orbital-axis--x">X</span><span className="orbital-axis orbital-axis--y">Y</span><div className="orbital-signature"><i/><i/><i/><i/></div></div>;
}
