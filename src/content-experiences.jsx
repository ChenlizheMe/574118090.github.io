import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { VideoPlayer } from './motion.jsx';
import { useMetrics, VideoStats } from './live-data.jsx';

export function FigureViewer({ src, title, lang, className='' }) {
  const [open,setOpen]=useState(false);
  const [zoom,setZoom]=useState(false);
  const dialog=useRef(null);
  const zh=lang==='zh';
  useEffect(()=>{if(open)dialog.current?.showModal();},[open]);
  return <><button className={`figure-viewer ${className}`} onClick={()=>{setZoom(false);setOpen(true);}} aria-label={`${zh?'放大查看':'Enlarge'} ${title}`}><img src={src} alt={title} loading="lazy"/><span className="figure-zoom"><Icon name="expand"/></span></button>
    {open && <dialog className="image-lightbox" aria-label={title} ref={dialog} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)dialog.current.close();}}><div className="image-lightbox__bar"><span>{title}</span><button onClick={()=>setZoom(!zoom)}><Icon name={zoom?'minus':'plus'}/>{zoom?(zh?'适应窗口':'Fit'):'200%'}</button><button onClick={()=>dialog.current.close()} aria-label={zh?'关闭图片':'Close image'}><Icon name="close"/></button></div><div className={`image-lightbox__viewport ${zoom?'is-zoomed':''}`}><img src={src} alt={title}/></div></dialog>}
  </>;
}

export function PublicationAuthors({ paper, lang }) {
  return <p className="publication-authors"><span dangerouslySetInnerHTML={{__html:paper.authors}}/>{paper.coFirstAuthor && <span className="publication-contribution">Lizhe Chen · {lang==='zh'?'共同第一作者':'Co-first author'}</span>}</p>;
}

export function PublicationCard({ paper,lang }) {
  const zh=lang==='zh';
  return <article className="publication-tile"><FigureViewer src={paper.image} title={paper.title} lang={lang}/><div className="publication-tile__copy"><p className="publication-venue">{zh?(paper.venueZh||paper.venue):paper.venue}</p><h3><a href={paper.link} target="_blank" rel="noreferrer">{paper.title}</a></h3><p className="publication-summary">{zh?(paper.introZh||paper.intro):paper.intro}</p><PublicationAuthors paper={paper} lang={lang}/><a className="detail-link" href={paper.link} target="_blank" rel="noreferrer"><Icon name="book"/>{zh?'阅读论文':'Read paper'}<Icon name="external"/></a></div></article>;
}

export function ProjectViewport({project,lang}) {
  const [detail,setDetail]=useState(false);
  const ref=useRef(null);
  const zh=lang==='zh';
  const reset=()=>{ref.current?.style.setProperty('--look-x','50%');ref.current?.style.setProperty('--look-y','50%');};
  return <div className={`project-viewport ${detail?'is-inspecting':''}`}>
    <div className="project-viewport__screen" ref={ref} onPointerMove={e=>{
      if(!detail||e.pointerType==='touch')return;
      const r=e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--look-x',`${(e.clientX-r.left)/r.width*100}%`);
      e.currentTarget.style.setProperty('--look-y',`${(e.clientY-r.top)/r.height*100}%`);
    }} onPointerLeave={reset}><img src={project.image} alt={project.name} loading="lazy"/><div className="viewport-crosshair" aria-hidden="true"/></div>
    <div className="project-viewport__toolbar"><span>{project.name}</span><button aria-pressed={detail} onClick={()=>{reset();setDetail(!detail);}}><Icon name={detail?'minus':'plus'}/>{detail?(zh?'返回全景':'Overview'):(zh?'查看细节':'Inspect')}</button><FigureViewer src={project.image} title={project.name} lang={lang} className="viewport-expand"/></div>
  </div>;
}

export function GameTheater({games,lang}) {
  const [selected,setSelected]=useState(0);
  const [playing,setPlaying]=useState(false);
  const uid=useId();
  const zh=lang==='zh';
  const metrics=useMetrics().videos;
  const game=games[selected];
  const poster=g=>g.video?metrics?.[new URL(g.video).searchParams.get('bvid')]?.poster:null;
  return <div className={`game-theater ${playing?'is-playing':''}`}>
    <div className="theater-stage"><div className="theater-screen"><div className="theater-screen__edge" aria-hidden="true"/>{game.video?<VideoPlayer key={game.name} url={game.video} title={zh?game.nameZh:game.name} poster={poster(game)} lang={lang} onPlaybackChange={setPlaying}/>:<div className="theater-no-video"><Icon name="play"/><span>{zh?game.nameZh:game.name}</span></div>}</div><div className="theater-floor" aria-hidden="true"/></div>
    <div className="theater-selector" aria-label={zh?'选择游戏':'Select game'}>{games.map((g,i)=><button key={g.name} aria-pressed={selected===i} aria-controls={`${uid}-game-${i}`} onClick={()=>{setSelected(i);setPlaying(false);}}><span className="theater-thumb">{poster(g)?<img src={poster(g)} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<Icon name="play"/>}<b>{String(i+1).padStart(2,'0')}</b></span><span>{zh?g.nameZh:g.name}</span></button>)}</div>
    <div className="theater-info-stack">{games.map((g,i)=><div key={g.name} className={`theater-info ${selected===i?'is-selected':''}`} id={`${uid}-game-${i}`} aria-hidden={selected!==i} inert={selected!==i}><div><p className="theater-role">{zh?g.roleZh:g.role}</p><h3>{zh?g.nameZh:g.name}</h3>{g.awards&&<p className="theater-award"><Icon name="star"/>{zh?g.awardsZh:g.awards}</p>}{g.video&&<VideoStats url={g.video} lang={lang}/>}</div><div><p>{zh?g.descZh:g.desc}</p>{g.detail&&<p className="theater-detail" dangerouslySetInnerHTML={{__html:zh?(g.detailZh||g.detail):g.detail}}/>}{g.extraVideos?.map(v=><a key={v.url} className="detail-link game-extra-video" href={v.url} target="_blank" rel="noreferrer"><Icon name="play"/>{zh?v.labelZh:v.label}<Icon name="external"/></a>)}{(g.bilibili||g.video)&&<a className="detail-link" href={g.bilibili||`https://www.bilibili.com/video/${new URL(g.video).searchParams.get('bvid')}`} target="_blank" rel="noreferrer"><Icon name="play"/>Bilibili<Icon name="external"/></a>}</div></div>)}</div>
  </div>;
}

function AwardMark({item}) {
  const title=item.title;
  const code=/HoYo|miHoYo/.test(title)?'2025':/ICRA/.test(title)?'WBCD':/TapTap/.test(title)?'TapTap':/CCVR/.test(title)?'CCVR':/ICPC/.test(title)?'ICPC':/G-Bit/.test(title)?'G-Bit':/CUSGA/.test(title)?'CUSGA':/Dolphin/.test(title)?'GD':'SIGS';
  return <div className="honor-mark" data-metal={/Bronze/.test(item.result)?'bronze':/Silver/.test(item.result)?'silver':'gold'} aria-hidden="true"><div className="honor-mark__rim"/><div className="honor-mark__face"><svg viewBox="0 0 160 160" fill="none"><circle cx="80" cy="80" r="69" strokeDasharray="1 5"/><path d="M26 92c-10-26 4-52 21-60M134 92c10-26-4-52-21-60M26 71l-9-9m12-7-5-12m109 28 10-9m-12-7 5-12M42 126h76"/><path d="m80 18 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z"/></svg><strong>{code}</strong><span>{/first|1st/i.test(item.result)?'01':/Bronze/.test(item.result)?'III':/Silver/.test(item.result)?'II':'✦'}</span></div></div>;
}

export function HonorsGallery({awards,lang}) {
  const [selected,setSelected]=useState(0);
  const zh=lang==='zh';
  const uid=useId();
  return <div className="honors-gallery"><div className="honors-plinth"><div className="honors-spotlight" aria-hidden="true"/><div className="honors-medals">{awards.map((item,i)=><div key={item.title} className={`honors-medal ${selected===i?'is-selected':''}`} aria-hidden={selected!==i}><AwardMark item={item}/></div>)}</div><div className="honors-inscription">{awards.map((item,i)=><article key={item.title} className={selected===i?'is-selected':''} aria-hidden={selected!==i} inert={selected!==i} id={`${uid}-award-${i}`}><p>{zh?item.resultZh:item.result}</p><h3>{zh?item.titleZh:item.title}</h3><span>{zh?item.blurbZh:item.blurb}</span></article>)}</div></div><div className="honors-index" aria-label={zh?'选择荣誉':'Select honor'}>{awards.map((item,i)=><button key={item.title} aria-pressed={selected===i} aria-controls={`${uid}-award-${i}`} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span><span><strong>{zh?item.titleZh:item.title}</strong><small>{zh?item.resultZh:item.result}</small></span><Icon name="arrow"/></button>)}</div></div>;
}
