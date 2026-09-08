import React, { useRef, useState } from 'react';
import { infernux } from './content.js';
import { useMetrics, VideoStats } from './live-data.jsx';
import { VideoPlayer } from './motion.jsx';
import { Icon } from './icons.jsx';

export function VideoDeck({ lang }) {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const start = useRef(null);
  const metrics = useMetrics();
  const videos = infernux.videos;
  const choose = index => {
    const next = (index + videos.length) % videos.length;
    if (next === selected) return;
    setPlaying(false); setSelected(next);
  };
  const active = videos[selected];
  const zh = lang === 'zh';
  return <div className={`video-deck ${playing ? 'is-playing' : ''}`} role="region" aria-roledescription="carousel" aria-label={zh ? 'Infernux 视频展示' : 'Infernux films'} onKeyDown={e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); choose(selected + (e.key === 'ArrowRight' ? 1 : -1)); }
  }}>
    <div className="deck-stage" onPointerDown={e => { if (e.pointerType === 'touch' && !playing) start.current = e.clientX; }} onPointerUp={e => {
      if (start.current === null) return;
      const delta = e.clientX - start.current; start.current = null;
      if (Math.abs(delta) > 50) choose(selected + (delta < 0 ? 1 : -1));
    }} onPointerCancel={() => { start.current = null; }}>
      {videos.map((video, i) => {
        const offset = (i - selected + videos.length) % videos.length;
        const slot = offset === 0 ? 'active' : offset === 1 ? 'next' : 'previous';
        const title = zh ? video.titleZh : video.title;
        const poster = metrics.videos?.[video.bvid]?.poster || infernux.image;
        return <div key={video.bvid} className={`deck-card deck-card--${slot}`} aria-label={`${i+1} / ${videos.length}: ${title}`}>
          <div className="deck-card__bar"><span>{zh ? video.shortZh : video.short}</span><span>{String(i+1).padStart(2,'0')} / 03</span></div>
          {slot === 'active' ? <VideoPlayer key={video.bvid} url={video.url} title={title} poster={poster} lang={lang} onPlaybackChange={setPlaying} /> : <button className="deck-select" onClick={() => choose(i)} aria-label={`${zh ? '切换到' : 'Select'} ${title}`}><img src={poster} alt="" referrerPolicy="no-referrer" /><span>{title}</span></button>}
        </div>;
      })}
    </div>
    <div className="deck-caption"><div aria-live="polite"><h3>{zh ? active.titleZh : active.title}</h3><VideoStats url={active.url} lang={lang} /></div><div className="deck-controls"><button onClick={() => choose(selected-1)} aria-label={zh ? '上一个视频' : 'Previous video'}><Icon name="arrow" className="icon--back"/></button><button onClick={() => choose(selected+1)} aria-label={zh ? '下一个视频' : 'Next video'}><Icon name="arrow"/></button></div></div>
    <div className="deck-tabs" aria-label={zh ? '选择视频' : 'Select a video'}>{videos.map((video,i) => <button key={video.bvid} aria-pressed={selected===i} onClick={() => choose(i)}><span>{String(i+1).padStart(2,'0')}</span>{zh ? video.shortZh : video.short}</button>)}</div>
  </div>;
}
