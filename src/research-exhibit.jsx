import React, { useState } from 'react';
import { publications } from './content.js';
import { FigureViewer } from './content-experiences.jsx';
import { Icon } from './icons.jsx';
import { DepthSurface } from './motion.jsx';
const selection = [
  { id:'fi-gs', shortTitle:'FI-GS', subject:'实时渲染', field:'GRAPHICS' },
  { id:'corrdetail', shortTitle:'CorrDetail', subject:'视觉语言模型', field:'VLM' },
  { id:'words-to-worlds', shortTitle:'Words to Worlds', subject:'三维地形生成', field:'GENERATIVE 3D' },
  { id:'3d-pose', shortTitle:'3D Human Pose', subject:'三维人体姿态', field:'3D VISION' }
];
export function ResearchExhibit({lang}) {
 const [selected,setSelected]=useState(0),zh=lang==='zh';
 const papers=selection.map(meta=>({...publications.find(p=>p.image===`/img/papers/${meta.id}.png`),...meta}));
 return <div className="research-atlas"><div className="atlas-nav">{papers.map((p,i)=><button key={p.id} aria-pressed={selected===i} aria-controls={`atlas-${p.id}`} onClick={()=>setSelected(i)}><span>0{i+1}</span><strong>{p.shortTitle}</strong><small>{zh?p.subject:p.field}</small></button>)}</div><div className="atlas-stage">{papers.map((p,i)=><article className={`atlas-panel ${selected===i?'is-selected':''}`} key={p.id} id={`atlas-${p.id}`} aria-hidden={selected!==i} inert={selected!==i}><div className="atlas-image"><DepthSurface className="atlas-sheet"><div className="atlas-sheet__assembly"><i className="atlas-sheet__back" aria-hidden="true"/><i className="atlas-sheet__edge" aria-hidden="true"/><FigureViewer src={p.image} title={p.shortTitle} lang={lang}/></div></DepthSurface><span className="atlas-field">{p.field}</span></div><div className="atlas-copy"><p className="publication-venue">{zh?(p.venueZh||p.venue):p.venue}</p><h3>{p.title}</h3><p className="publication-summary">{zh?p.introZh:p.intro}</p><p className="publication-authors" dangerouslySetInnerHTML={{__html:p.authors}}/><a className="detail-link" href={p.link} target="_blank" rel="noreferrer"><Icon name="book"/>{zh?'阅读论文':'Read paper'}<Icon name="external"/></a></div></article>)}</div></div>;
}
