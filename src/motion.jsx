import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const MotionContext = createContext({ paused: false });
export const useMotion = () => useContext(MotionContext);
export function MotionProvider({ children }) {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return <MotionContext.Provider value={{ paused: reduced }}><div data-motion={reduced ? 'paused' : 'on'}>{children}</div></MotionContext.Provider>;
}

export function ScrollEffects({ page }) {
  const { paused } = useContext(MotionContext);
  const progress = useRef(null);
  useEffect(() => {
    let frame = 0;
    const kinetic = [...document.querySelectorAll('.flight-chronicle, .research-exhibit, .feature, .spatial-glyph, .archive-hero')];
    const update = () => {
      const length = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${length > 0 ? scrollY / length : 0})`;
      kinetic.forEach(node => {
        const rect=node.getBoundingClientRect();
        const visible=rect.bottom>0 && rect.top<innerHeight;
        node.classList.toggle('is-in-view',visible);
        if (visible) node.style.setProperty('--travel',paused ? '0' : Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight)).toFixed(3));
      });
    };
    const schedule = () => { if (!frame) frame=requestAnimationFrame(()=>{frame=0;update();}); };
    addEventListener('scroll', schedule, { passive: true }); update();
    const resize = new ResizeObserver(update); resize.observe(document.body);
    const nodes = [...document.querySelectorAll('.section__head, .card, .paper-card, .publication-tile, .project-card, .game-card, .flight-chronicle, .research-exhibit, .award-list article')];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    if (!paused) nodes.forEach((node, i) => { node.classList.add('reveal'); node.style.setProperty('--reveal-delay', `${(i % 3) * 65}ms`); observer.observe(node); });
    return () => { removeEventListener('scroll', schedule); cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); nodes.forEach(n => n.classList.remove('reveal', 'revealed')); };
  }, [page, paused]);
  return <div className="reading-progress" ref={progress} aria-hidden="true" />;
}

export function VideoPlayer({ url, title, poster, lang, onPlaybackChange }) {
  const [playing, setPlaying] = useState(false);
  const src = new URL(url); src.searchParams.set('autoplay', '1');
  return <div className={`video-player ${playing ? 'is-playing' : ''}`}>
    {playing ? <><iframe src={src.toString()} title={title} allow="autoplay; fullscreen" allowFullScreen /><button className="video-close" onClick={() => { setPlaying(false); onPlaybackChange?.(false); }} aria-label={lang === 'zh' ? '关闭视频' : 'Close video'}>×</button></> : <button className="video-cover" onClick={() => { setPlaying(true); onPlaybackChange?.(true); }} aria-label={`${lang === 'zh' ? '播放' : 'Play'} ${title}`}>
      {poster && <img src={poster} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />}<span className="video-cover__grid" /><span className="play-circle">▷</span><span className="video-cover__label">{lang === 'zh' ? '播放作品演示' : 'WATCH THE FILM'} <span>↗</span></span>
    </button>}
  </div>;
}

export function DepthSurface({ children, className = '' }) {
  const { paused } = useMotion();
  const ref = useRef(null);
  const reset = () => { ref.current?.style.setProperty('--rx','0deg'); ref.current?.style.setProperty('--ry','0deg'); };
  useEffect(reset, [paused]);
  return <div ref={ref} className={`depth-surface ${className}`} onPointerLeave={reset} onPointerMove={e => {
    if (paused || e.pointerType === 'touch') return;
    const bounds = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--rx', `${-(e.clientY-bounds.top-bounds.height/2)/bounds.height*5}deg`);
    e.currentTarget.style.setProperty('--ry', `${(e.clientX-bounds.left-bounds.width/2)/bounds.width*7}deg`);
  }}>{children}</div>;
}
