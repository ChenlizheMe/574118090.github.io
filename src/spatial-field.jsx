import React, { useEffect, useRef } from 'react';
import { useMotion } from './motion.jsx';

// Project wire geometry in viewport space; scroll changes the camera, never layout.
export function SpatialField() {
  const canvasRef=useRef(null);
  const {paused}=useMotion();
  useEffect(()=>{
    const canvas=canvasRef.current, ctx=canvas.getContext('2d');
    if(!ctx) return;
    let w=0,h=0,frame=0,last=0,angle=0,scroll=window.scrollY,mouse=[0,0];
    const vertices=Array.from({length:8},(_,i)=>[i&1?1:-1,i&2?1:-1,i&4?1:-1]);
    const edges=vertices.flatMap((v,i)=>[1,2,4].filter(bit=>(i^bit)>i).map(bit=>[v,vertices[i^bit]]));
    const draw=(time=0)=>{
      cancelAnimationFrame(frame);frame=0;
      if(!time || time-last>=32 || paused){
        angle+=!paused&&time?Math.max(0,Math.min((time-last)/1000,.05))*.24:0;last=time||performance.now();
        ctx.clearRect(0,0,w,h);
        const dark=document.documentElement.dataset.theme==='dark';
        const colors=dark?['#79b7d4','#f19664','#e3c575']:['#3a718a','#c96642','#af8a39'];
        const geometry=(cx,cy,size,phase,kind)=>{
          const rotation=angle+phase+scroll*.00035;
          const project=([x,y,z])=>{
            const a=x*Math.cos(rotation)-z*Math.sin(rotation), b=x*Math.sin(rotation)+z*Math.cos(rotation);
            const tilt=.5+mouse[1]*.16, yy=y*Math.cos(tilt)-b*Math.sin(tilt),zz=y*Math.sin(tilt)+b*Math.cos(tilt);
            const scale=4/(4+zz);return[cx+a*size*scale+mouse[0]*12,cy+yy*size*scale];
          };
          ctx.strokeStyle=colors[kind];ctx.lineWidth=1;ctx.globalAlpha=dark?.32:.24;
          const path=points=>{ctx.beginPath();points.forEach((v,i)=>{const p=project(v);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();};
          if(kind===1){
            for(let j=0;j<8;j++)path(Array.from({length:65},(_,i)=>{const t=i*Math.PI/32,r=.85+.23*Math.cos(j*Math.PI/4);return[r*Math.cos(t),.23*Math.sin(j*Math.PI/4),r*Math.sin(t)];}));
            for(let j=0;j<24;j++)path(Array.from({length:25},(_,i)=>{const t=i*Math.PI/12,a=j*Math.PI/12,r=.85+.23*Math.cos(t);return[r*Math.cos(a),.23*Math.sin(t),r*Math.sin(a)];}));
          }else {
            edges.forEach(path);edges.forEach(pair=>path(pair.map(v=>v.map(n=>n*.63))));
            vertices.forEach(v=>path([v,v.map(n=>n*.63)]));
          }
          ctx.globalAlpha=1;
        };
        geometry(w*.97,h*.25,Math.min(w*.12,145),0,0);
        geometry(w*.025,h*.7,Math.min(w*.13,160),2,1);
        geometry(w*.94,h*.96,Math.min(w*.08,90),4,2);
        ctx.strokeStyle=colors[0];ctx.globalAlpha=.16;ctx.setLineDash([2,9]);
        ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(20,h);ctx.moveTo(w-20,0);ctx.lineTo(w-20,h);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      }
      if(!paused&&!document.hidden)frame=requestAnimationFrame(draw);
    };
    const resize=()=>{w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();};
    const onScroll=()=>{scroll=window.scrollY;if(paused)draw();};
    const onPointer=e=>{mouse=[e.clientX/w-.5,e.clientY/h-.5];};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;last=performance.now();if(!document.hidden)draw();};
    const theme=new MutationObserver(()=>{if(paused)draw();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    addEventListener('resize',resize);addEventListener('scroll',onScroll,{passive:true});addEventListener('pointermove',onPointer,{passive:true});document.addEventListener('visibilitychange',visibility);resize();
    return()=>{cancelAnimationFrame(frame);theme.disconnect();removeEventListener('resize',resize);removeEventListener('scroll',onScroll);removeEventListener('pointermove',onPointer);document.removeEventListener('visibilitychange',visibility);};
  },[paused]);
  return <div className="site-background" aria-hidden="true"><div className="site-background__atmosphere"/><svg className="site-background__orbits" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" fill="none"><g className="background-orbit-lines"><ellipse cx="1290" cy="110" rx="620" ry="375" transform="rotate(-32 1290 110)"/><ellipse cx="1290" cy="110" rx="670" ry="405" transform="rotate(-32 1290 110)"/><ellipse cx="1290" cy="110" rx="720" ry="435" transform="rotate(-32 1290 110)"/><path d="M-280 780C200 490 650 1190 1450 670M-280 810C200 520 650 1220 1450 700"/><path d="M56 0v1000M1384 0v1000M0 940h1440" strokeDasharray="2 9"/></g><g className="background-reference-marks"><path d="M100 174h18m-9-9v18m1110 325h18m-9-9v18M174 847h18m-9-9v18"/><circle cx="1152" cy="451" r="6"/><circle cx="257" cy="660" r="4"/></g></svg><canvas className="spatial-field" ref={canvasRef}/><div className="site-background__grain"/></div>;
}

export function SpatialGlyph({ variant='cube' }) {
  return <div className={`spatial-glyph spatial-glyph--${variant}`} aria-hidden="true"><div className="glyph-gimbal"><div className="glyph-cube">{['front','back','left','right','top','bottom'].map(face=><i key={face} className={`glyph-face glyph-face--${face}`}/>)}</div><i className="glyph-ring glyph-ring--one"/><i className="glyph-ring glyph-ring--two"/><i className="glyph-ring glyph-ring--three"/></div></div>;
}
