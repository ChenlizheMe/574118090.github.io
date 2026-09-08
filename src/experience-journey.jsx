import React from 'react';
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
  const zh = lang === 'zh';
  return <section className={'flight-chronicle flight-chronicle--'+kind} aria-labelledby={'chronicle-'+kind}>
    <header className="flight-chronicle-heading"><Icon name={kind === 'work' ? 'briefcase' : 'scholar'}/><h3 id={'chronicle-'+kind}>{kind === 'work' ? (zh ? '工作经历' : 'Work experience') : (zh ? '学习经历' : 'Education')}</h3><span aria-hidden="true">{kind==='work'?'01 / WORK':'02 / EDUCATION'}</span></header>
    <div className="journey-timeline">
      {[...items].reverse().map((item,order)=> {
        const info=details[kind][items.length-1-order];
        return <article className="journey-record" key={item.place}>
          <strong className="journey-record__year">{info.year}</strong>
          <span className="journey-record__point" aria-hidden="true"/>
          <div className="journey-record__copy">
            <span className="flight-date">{zh?item.dateZh:item.date}</span>
            <h4>{zh?item.placeZh:item.place}</h4>
            <p className="flight-role">{zh?item.roleZh:item.role}</p>
            <ul>{(zh?info.pointsZh:info.points).map(point=><li key={point}>{point}</li>)}</ul>
            {info.link && <a className="detail-link" href={info.link} target="_blank" rel="noreferrer"><Icon name="github"/>{info.linkLabel}<Icon name="external"/></a>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
export function ExperienceJourney({ lang }) {
  return <div className="flight-chronicles"><Chronicle kind="work" items={workExperience} lang={lang}/><Chronicle kind="study" items={education} lang={lang}/></div>;
}
