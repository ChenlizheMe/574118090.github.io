import React, { useState } from 'react';
import { education, workExperience } from './content.js';
import { Icon } from './icons.jsx';
const details = {
  work: [
    { year:'2026', points:['Neural rendering research and development.','Integrating rendering methods into engine and tooling workflows.'], pointsZh:['围绕神经渲染开展研发工作。','将相关方法接入实际引擎与工具链，关注研究方法在工程中的落地。'] },
    { year:'2025', points:['Built a complete multi-camera OptiX renderer in EmbodiChain.','Integrated a warp-based GPU parallel compute layer.','Contributed to simulation, engine and asset tooling.'], pointsZh:['在 EmbodiChain 内实现完整的多相机 OptiX 渲染器。','集成基于 NVIDIA warp 的 GPU 并行计算层。','参与仿真、引擎与资产侧工具开发。'], link:'https://github.com/DexForce/EmbodiChain', linkLabel:'EmbodiChain' }
  ],
  study: [
    { year:'2025', points:['Master’s study in Interactive Media Technology.','Research interests include real-time rendering, engine systems and vision-language models.','Coursework in computer graphics and interactive media.'], pointsZh:['攻读互动媒体技术方向硕士学位。','研究方向涵盖实时渲染、引擎系统与视觉语言模型。','学习计算机图形学与交互媒体相关课程。'] },
    { year:'2021', points:['B.S. in Digital Media Technology; ranked first by GPA.','Studied graphics programming, real-time engines and machine learning.','Worked on early VLM/LLM collaborations and game projects through competitions.'], pointsZh:['数字媒体技术专业工学学士，绩点排名第一。','学习图形编程、实时引擎与机器学习基础。','参与早期 VLM/LLM 合作研究，并通过竞赛完成游戏项目。'] }
  ]
};
function Chronicle({ kind, items, lang }) {
  const [selected, setSelected] = useState(null); const zh = lang === 'zh';

  return <section className={'flight-chronicle flight-chronicle--'+kind} aria-labelledby={'chronicle-'+kind}>
    <header className="flight-chronicle-heading"><Icon name={kind === 'work' ? 'briefcase' : 'scholar'}/><h3 id={'chronicle-'+kind}>{kind === 'work' ? (zh ? '工作经历' : 'Work experience') : (zh ? '学习经历' : 'Education')}</h3><span aria-hidden="true">{kind==='work'?'01 / WORK':'02 / EDUCATION'}</span></header>
    <div className="flight-chronicle-body">
      <div className="journey-timeline" aria-label={zh?'选择经历':'Select an experience'}>
        {[...items].reverse().map((entry,order)=>{const i=items.length-1-order;const expanded=selected===i;return <button className="journey-event" key={entry.place} aria-label={`${details[kind][i].year} ${zh?entry.placeZh:entry.place}`} aria-expanded={expanded} aria-controls={kind+'-experience-panel'} onClick={()=>setSelected(expanded?null:i)}><strong>{details[kind][i].year}</strong><span className="journey-event__point" aria-hidden="true"/><span className="journey-event__name">{kind==='work'&&i===1?(zh?'跨维智能':'DexForce'):kind==='study'&&i===0?(zh?'清华大学':'Tsinghua University'):kind==='study'&&i===1?(zh?'北方工业大学':'NCUT'):(zh?entry.placeZh:entry.place)}</span><span className="journey-event__action"><span aria-hidden="true">{expanded?'−':'+'}</span>{expanded?(zh?'收起详情':'Close details'):(zh?'展开详情':'View details')}</span></button>;})}
      </div>
      <div className="flight-detail" hidden={selected===null} id={kind+'-experience-panel'}>{items.map((item,i)=> {
        const info=details[kind][i];
        return <div className={'flight-detail-content '+(selected===i?'is-selected':'')} key={item.place} aria-hidden={selected!==i} inert={selected!==i}>
          <span className="flight-date">{zh?item.dateZh:item.date}</span>
          <h4>{zh?item.placeZh:item.place}</h4>
          <p className="flight-role">{zh?item.roleZh:item.role}</p>
          <ul>{(zh?info.pointsZh:info.points).map(point=><li key={point}>{point}</li>)}</ul>
          {info.link && <a className="detail-link" href={info.link} target="_blank" rel="noreferrer"><Icon name="github"/>{info.linkLabel}<Icon name="external"/></a>}
        </div>;
      })}</div>
    </div>
  </section>;
}
export function ExperienceJourney({ lang }) {
  return <div className="flight-chronicles"><Chronicle kind="work" items={workExperience} lang={lang}/><Chronicle kind="study" items={education} lang={lang}/></div>;
}
