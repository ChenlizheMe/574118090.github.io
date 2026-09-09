import React, { useState } from 'react';
import { publications } from './content.js';
import { FigureViewer, PublicationAuthors } from './content-experiences.jsx';
import { Icon } from './icons.jsx';
import { DepthSurface } from './motion.jsx';
const selection = [
  { id:'promptcd', shortTitle:'PromptCD', subject:'IEEE TPAMI 2026', field:'MULTIMODAL AI' },
  { id:'corrdetail', shortTitle:'CorrDetail', subject:'IJCAI 2025 Main Track', field:'VLM' },
  { id:'innate-reasoning', shortTitle:'Innate Reasoning', subject:'ACL 2026 Long Papers', field:'LLM REASONING' },
  { id:'graph-descriptive', shortTitle:'Graph Descriptive Order', subject:'ACL 2025 Long Papers', field:'GRAPH REASONING' }
];
export function ResearchExhibit({lang}) {
 const [selected,setSelected]=useState(0),zh=lang==='zh';
 const papers=selection.map(meta=>({...publications.find(p=>p.image===`/img/papers/${meta.id}.webp`),...meta}));
 return <div className="research-atlas"><div className="atlas-nav">{papers.map((p,i)=><button key={p.id} aria-pressed={selected===i} aria-controls={`atlas-${p.id}`} onClick={()=>setSelected(i)}><span>0{i+1}</span><strong>{p.shortTitle}</strong><small>{zh?p.subject:p.field}</small></button>)}</div><div className="atlas-stage">{papers.map((p,i)=><article className={`atlas-panel ${selected===i?'is-selected':''}`} key={p.id} id={`atlas-${p.id}`} aria-hidden={selected!==i} inert={selected!==i}><div className="atlas-image"><DepthSurface className="atlas-sheet"><div className="atlas-sheet__assembly"><i className="atlas-sheet__back" aria-hidden="true"/><i className="atlas-sheet__edge" aria-hidden="true"/><FigureViewer src={p.image} title={p.shortTitle} lang={lang}/></div></DepthSurface><span className="atlas-field">{p.field}</span></div><div className="atlas-copy"><p className="publication-venue">{zh?(p.venueZh||p.venue):p.venue}</p><h3>{p.title}</h3><p className="publication-summary">{zh?p.introZh:p.intro}</p><PublicationAuthors paper={p} lang={lang}/><a className="detail-link" href={p.link} target="_blank" rel="noreferrer"><Icon name="book"/>{zh?'阅读论文':'Read paper'}<Icon name="external"/></a></div></article>)}</div></div>;
}
