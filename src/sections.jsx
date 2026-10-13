import React, { useEffect, useId, useRef, useState } from 'react';
import { education, workExperience, publications, infernux } from './content.js';
import { Icon } from './icons.jsx';
import { VideoPlayer, biliThumb } from './motion.jsx';
import { useMetrics, AnimatedNumber, RepositoryStars } from './live-data.jsx';

const bvidOf = url => { try { return new URL(url).searchParams.get('bvid'); } catch { return null; } };
/* inline figures use the ~960px variant written by scripts/optimize-images.mjs */
export const smallOf = src => (typeof src === 'string' && /^\/img\/.+\.webp$/.test(src) && !src.endsWith('-sm.webp') ? src.replace(/\.webp$/, '-sm.webp') : src);
const pad = n => String(n).padStart(2, '0');

/* ------------------------------------------------------------------
   Figure lightbox
   ------------------------------------------------------------------ */
export function FigureViewer({ src, title, lang, className = '' }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef(null);
  const zh = lang === 'zh';
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  return <>
    <button type="button" className={`figure ${className}`} onClick={() => { setZoom(false); setOpen(true); }} aria-label={`${zh ? '放大查看' : 'Enlarge'} ${title}`}>
      <img src={smallOf(src)} alt={title} loading="lazy" decoding="async" />
      <span className="figure__zoom"><Icon name="expand" /></span>
    </button>
    {open && <dialog className="lightbox" aria-label={title} ref={dialog} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) dialog.current.close(); }}>
      <div className="lightbox__bar"><span>{title}</span>
        <button type="button" onClick={() => setZoom(!zoom)}><Icon name={zoom ? 'minus' : 'plus'} />{zoom ? (zh ? '适应窗口' : 'Fit') : '200%'}</button>
        <button type="button" onClick={() => dialog.current.close()} aria-label={zh ? '关闭图片' : 'Close image'}><Icon name="close" /></button>
      </div>
      <div className={`lightbox__view ${zoom ? 'is-zoomed' : ''}`}><img src={src} alt={title} /></div>
    </dialog>}
  </>;
}

export function Authors({ paper, lang }) {
  const roles = [
    paper.coFirstAuthor && (lang === 'zh' ? '共同第一作者' : 'Co-first author'),
    paper.firstAuthor && (lang === 'zh' ? '第一作者' : 'First author'),
    paper.correspondingAuthor && (lang === 'zh' ? '通讯作者' : 'Corresponding author')
  ].filter(Boolean);
  return <p className="authors"><span dangerouslySetInnerHTML={{ __html: paper.authors }} />
    {roles.map(role => <span key={role} className="authors__co">{role}</span>)}</p>;
}

/* shared panel header: pill id, title, status on the right */
function PanelHead({ id, title, status, children }) {
  return <header className="panel__hd">
    {id && <span className="pill">{id}</span>}
    {title && <b className="panel__t">{title}</b>}
    {status && <span className="panel__st">{status}</span>}
    {children}
  </header>;
}

/* ------------------------------------------------------------------
   01 · Journey — two mission logs
   ------------------------------------------------------------------ */
const DETAILS = {
  work: [
    {
      year: '2026',
      points: [
        'Reworked Unity’s NTC compression path around ISPC and GPU-native BC formats.',
        'Proposed GSNTC, replacing MLP reconstruction with GS propagation; 4× faster and 5–10 dB higher quality than NTC, for Lightmap and Radiance Cache compression at roughly 99.1% compression.'
      ],
      pointsZh: [
        '重构 Unity 的 NTC 压缩链路，打通 ISPC 与 GPU 原生 BC 格式。',
        '提出 GSNTC 方案，使用 GS 传播替代 MLP 重建；相比 NTC 速度提升 4 倍、质量提升 5–10 dB，用于 Lightmap 与 Radiance Cache 的压缩，压缩率约 99.1%。'
      ]
    },
    { year: '2025', points: ['Built a multi-camera OptiX ray-tracing renderer in EmbodiChain for high-fidelity sensor simulation.', 'Integrated an NVIDIA warp GPU compute layer for batched rendering and sensor pipelines.', 'Contributed to the simulation, engine and asset systems.'], pointsZh: ['在 EmbodiChain 落地多相机 OptiX 光线追踪渲染器，支撑高保真传感器仿真。', '以 NVIDIA warp 构建 GPU 并行计算层，打通批量渲染与传感器数据管线。', '参与仿真、引擎与资产系统的工程化整合。'], link: 'https://github.com/DexForce/EmbodiChain', linkLabel: 'EmbodiChain' }
  ],
  study: [
    { year: '2025', points: ['M.S. in Interactive Media Technology, focusing on real-time rendering and intelligent interactive systems.', 'Research spans rendering, engine systems and vision-language models at the graphics–AI boundary.', 'Systematic training in computer graphics, GPU programming and interactive media.'], pointsZh: ['攻读互动媒体技术硕士，聚焦实时渲染与智能交互系统。', '研究实时渲染、引擎系统与视觉语言模型，探索图形计算与多模态智能的交叉。', '系统学习计算机图形学、GPU 编程与交互媒体方法。'] },
    { year: '2021', points: ['B.S. in Digital Media Technology; ranked first by major GPA.', 'Built a foundation across graphics programming, real-time engines and machine learning.', 'Joined early VLM/LLM collaborations and completed game projects through competitions.'], pointsZh: ['数字媒体技术工学学士，专业绩点排名第一。', '系统训练图形编程、实时引擎与机器学习基础，建立图形与智能交叉能力。', '参与早期 VLM/LLM 合作研究，并通过竞赛完成游戏项目。'] }
  ]
};

function MissionLog({ kind, items, lang }) {
  const zh = lang === 'zh';
  const work = kind === 'work';
  const details = DETAILS[kind];
  return <article className="panel log rv">
    <PanelHead id={work ? 'LOG B' : 'LOG A'}
      title={<><Icon name={work ? 'briefcase' : 'scholar'} />{work ? (zh ? '工作经历' : 'Work experience') : (zh ? '学习经历' : 'Education')}</>}
      status={work ? 'TENCENT · DEXFORCE' : 'TSINGHUA · NCUT'} />
    <ol className="log__list">
      {items.map((item, i) => {
        const d = details[i];
        return <li className="log__item" key={item.place}>
          <div className="log__yr"><b>{d.year}</b><span>{pad(i + 1)}</span></div>
          <div className="log__body">
            <p className="log__date">{zh ? item.dateZh : item.date}</p>
            <h3>{zh ? item.placeZh : item.place}</h3>
            <p className="log__role">{zh ? item.roleZh : item.role}</p>
            <ul>{(zh ? d.pointsZh : d.points).map(p => <li key={p}>{p}</li>)}</ul>
            {d.link && <a className="link" href={d.link} target="_blank" rel="noreferrer"><Icon name="github" />{d.linkLabel}<Icon name="external" /></a>}
          </div>
        </li>;
      })}
    </ol>
  </article>;
}

export function Journey({ lang }) {
  return <div className="journey">
    <MissionLog kind="study" items={education} lang={lang} />
    <MissionLog kind="work" items={workExperience} lang={lang} />
  </div>;
}

/* ------------------------------------------------------------------
   02 · Publications — index + dossier + the paper's own figure
   ------------------------------------------------------------------ */
const FEATURED = [
  { id: 'compact-bench', short: 'CompAct-Bench', field: 'Agent memory', fieldZh: '智能体记忆', color: 'var(--orange)' },
  { id: 'skillforge', short: 'SkillForge', field: 'AI agents', fieldZh: 'AI 智能体', color: 'var(--green)' },
  { id: 'promptcd', short: 'PromptCD', field: 'Multimodal AI', fieldZh: '多模态', color: 'var(--blue)' },
  { id: 'corrdetail', short: 'CorrDetail', field: 'Forgery detection', fieldZh: '伪造检测', color: 'var(--red)' },
  { id: 'innate-reasoning', short: 'Innate Reasoning', field: 'LLM reasoning', fieldZh: '大模型推理', color: 'var(--yellow)' }
];

export function PaperArcade({ lang }) {
  const zh = lang === 'zh';
  const [sel, setSel] = useState(0);
  const papers = FEATURED.map(m => ({ ...publications.find(p => p.image?.startsWith(`/img/papers/${m.id}.`)), ...m }));
  const p = papers[sel];
  const no = pad(sel + 1);
  const venue = zh ? (p.venueZh || p.venue) : p.venue;
  return <div className="papers rv" style={{ '--pc': p.color }}>
    <div className="papers__tabs" role="tablist" aria-label={zh ? '代表论文' : 'Selected papers'}>
      {papers.map((x, i) => <button key={x.id} type="button" role="tab" aria-selected={sel === i} className={sel === i ? 'is-on' : ''} style={{ '--tc': x.color }} onClick={() => setSel(i)}>
        <span className="papers__no">{pad(i + 1)} · {zh ? x.fieldZh : x.field}</span>
        <b>{x.short}</b>
        <small>{(zh ? (x.venueZh || x.venue) : x.venue).split(/ · | Main| Long/)[0]}</small>
      </button>)}
    </div>
    <div className="papers__grid">
      <div className="papers__dossier" key={p.id}>
        <p className="papers__meta"><span className="pill">{zh ? '论文' : 'Paper'} {no} / {pad(papers.length)}</span><span>{venue}</span></p>
        <h3>{p.title}</h3>
        <p className="papers__intro">{zh ? p.introZh : p.intro}</p>
        <Authors paper={p} lang={lang} />
        <div className="btns">
          {p.link && <a className="btn btn--sm btn--solid" href={p.link} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '阅读论文' : 'Read paper'}<Icon name="external" /></a>}
          {p.pdf && <a className="btn btn--sm" href={p.pdf} target="_blank" rel="noreferrer"><Icon name="download" />PDF</a>}
        </div>
      </div>
      <figure className="panel papers__stage" key={`${p.id}-stage`}>
        <PanelHead id={`Fig. ${no}`} title={p.short} status={<><Icon name="expand" />{zh ? '点击放大' : 'Click to enlarge'}</>} />
        <div className="papers__shot">
          <FigureViewer src={p.image} title={p.short} lang={lang} className="papers__figure" />
          <span className="ticks" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="scan" aria-hidden="true" />
        </div>
        <figcaption className="panel__cap"><span className="code">{zh ? p.fieldZh : p.field}</span>{zh ? '论文原图' : 'Figure from the paper'}</figcaption>
      </figure>
    </div>
  </div>;
}

export function PaperCard({ paper, lang, index }) {
  const zh = lang === 'zh';
  const title = zh ? (paper.titleZh || paper.title) : paper.title;
  const venue = zh ? (paper.venueZh || paper.venue) : paper.venue;
  return <article className="pcard rv">
    <FigureViewer src={paper.image} title={title} lang={lang} className="pcard__fig" />
    <div className="pcard__body">
      <p className="pcard__k"><span>{String(index + 1).padStart(3, '0')}</span><span>{paper.levelLabel}</span></p>
      {venue && <p className="pcard__venue">{venue}</p>}
      <h3>{paper.link ? <a href={paper.link} target="_blank" rel="noreferrer">{title}</a> : title}</h3>
      <p className="pcard__intro">{zh ? (paper.introZh || paper.intro) : paper.intro}</p>
      {paper.authors && <Authors paper={paper} lang={lang} />}
      <div className="pcard__links">
        {paper.link && <a className="link" href={paper.link} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '阅读论文' : 'Read paper'}<Icon name="external" /></a>}
        {paper.pdf && <a className="link" href={paper.pdf} target="_blank" rel="noreferrer"><Icon name="download" />PDF<Icon name="external" /></a>}
      </div>
    </div>
  </article>;
}

/* ------------------------------------------------------------------
   03 · Infernux — one screen, a list of transmissions
   ------------------------------------------------------------------ */
export function MissionMonitor({ lang }) {
  const zh = lang === 'zh';
  const metrics = useMetrics();
  const [ch, setCh] = useState(0);
  const videos = infernux.videos;
  const v = videos[ch];
  const stat = metrics.videos?.[v.bvid];
  return <div className="feed rv">
    <div className="panel feed__main">
      <PanelHead id={`CH ${pad(ch + 1)} / ${pad(videos.length)}`} title={v.chapter}
        status={<><i className="led on" />{zh ? '信号正常' : 'Signal nominal'}</>} />
      <div className="frame" key={v.bvid}>
        <VideoPlayer url={v.url} title={zh ? v.titleZh : v.title} poster={stat?.poster || smallOf(infernux.image)} lang={lang} />
        <span className="ticks" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="frame__hud" aria-hidden="true">CH {pad(ch + 1)} · {v.chapter} · REC</span>
      </div>
      <div className="strip" key={`${v.bvid}-s`}>
        <div className="strip__id"><span className="code">{pad(ch + 1)} · {v.chapter}</span><b>{zh ? v.titleZh : v.title}</b></div>
        <dl className="strip__stats">
          <div><dt>{zh ? '播放' : 'Views'}</dt><dd><AnimatedNumber value={stat?.views} lang={lang} /></dd></div>
          <div><dt>{zh ? '点赞' : 'Likes'}</dt><dd><AnimatedNumber value={stat?.likes} lang={lang} /></dd></div>
        </dl>
        <a className="link" href={`https://www.bilibili.com/video/${v.bvid}`} target="_blank" rel="noreferrer"><Icon name="play" />Bilibili<Icon name="external" /></a>
      </div>
    </div>
    <div className="feed__list" role="tablist" aria-label={zh ? '选择视频' : 'Select a film'}>
      {videos.map((x, i) => {
        const s = metrics.videos?.[x.bvid];
        return <button key={x.bvid} type="button" role="tab" aria-selected={ch === i} className={`chan ${ch === i ? 'is-on' : ''}`} onClick={() => setCh(i)}>
          <span className="chan__thumb">{s?.poster ? <img src={biliThumb(s.poster, 240)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <Icon name="play" />}</span>
          <span className="chan__meta"><small>{pad(i + 1)} · {x.chapter}</small><b>{zh ? x.titleZh : x.title}</b><span>▷ <AnimatedNumber value={s?.views} lang={lang} /></span></span>
        </button>;
      })}
    </div>
  </div>;
}

export function InfernuxLinks({ lang }) {
  const zh = lang === 'zh';
  const m = useMetrics();
  return <div className="btns">
    <a className="btn btn--solid" href={infernux.website} target="_blank" rel="noreferrer"><Icon name="globe" />{zh ? '进入引擎官网' : 'Visit Infernux'}<Icon name="external" /></a>
    <a className="btn" href={infernux.url} target="_blank" rel="noreferrer"><Icon name="github" />GitHub</a>
    <a className="btn" href={infernux.report} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '技术报告' : 'Tech report'}</a>
    <RepositoryStars lang={lang} />
    {m.release?.tag && <a className="chip-led" href={m.release.url} target="_blank" rel="noreferrer"><i className="led on" />{m.release.tag}</a>}
  </div>;
}

/* ------------------------------------------------------------------
   04 · Projects — module cards
   ------------------------------------------------------------------ */
export function RackUnit({ project, lang, index }) {
  const zh = lang === 'zh';
  return <article className="panel proj rv">
    <PanelHead id={`Module ${pad(index + 1)}`} title={project.name} status={<><i className="led on" />{zh ? project.statusZh : project.status}</>} />
    <div className="proj__grid">
      <div className="proj__media">
        <FigureViewer src={project.image} title={project.name} lang={lang} className="proj__fig" />
        <span className="ticks" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="scan" aria-hidden="true" />
      </div>
      <div className="proj__copy">
        <h3><a href={project.url} target="_blank" rel="noreferrer">{project.name}</a></h3>
        <p className="proj__desc">{zh ? project.descZh : project.desc}</p>
        {project.detail && <p className="proj__detail" dangerouslySetInnerHTML={{ __html: zh ? (project.detailZh || project.detail) : project.detail }} />}
        <p className="proj__role">{zh ? project.roleZh : project.role}</p>
        <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
        <a className="link" href={project.url} target="_blank" rel="noreferrer"><Icon name="github" />{zh ? '查看项目' : 'Explore project'}<Icon name="external" /></a>
      </div>
    </div>
  </article>;
}

/* ------------------------------------------------------------------
   05 · Games — a wide screen, a dossier strip under it, mission list below
   ------------------------------------------------------------------ */
export function GameDeck({ games, lang }) {
  const zh = lang === 'zh';
  const uid = useId();
  const metrics = useMetrics().videos;
  const [sel, setSel] = useState(0);
  const g = games[sel];
  const id = bvidOf(g.video);
  const stat = id ? metrics?.[id] : null;
  return <div className="games rv">
    <div className="panel games__screen">
      <PanelHead id={`${zh ? '作品' : 'Title'} ${pad(sel + 1)} / ${pad(games.length)}`} title={zh ? g.nameZh : g.name}
        status={<><i className={`led ${g.video ? 'on' : ''}`} />{g.video ? (zh ? '可播放' : 'Footage') : (zh ? '无影像' : 'No footage')}</>} />
      <div className="frame" key={g.name}>
        {g.video ? <VideoPlayer url={g.video} title={zh ? g.nameZh : g.name} poster={stat?.poster} lang={lang} /> : <div className="frame__empty"><Icon name="play" /></div>}
        <span className="ticks" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="frame__hud" aria-hidden="true">GM-{pad(sel + 1)} · {zh ? g.roleZh : g.role}</span>
      </div>
      <div className="strip strip--game" id={`${uid}-g`} aria-live="polite" key={`${g.name}-s`}>
        <div className="strip__id">
          <span className="code">{zh ? g.roleZh : g.role}</span>
          <b>{zh ? g.nameZh : g.name}</b>
          {g.awards && <p className="games__award"><Icon name="star" /><span>{zh ? g.awardsZh : g.awards}</span></p>}
          {stat && <p className="games__stats">▷ <AnimatedNumber value={stat.views} lang={lang} /> {zh ? '播放' : 'views'} · ♡ <AnimatedNumber value={stat.likes} lang={lang} /></p>}
        </div>
        <div className="strip__body">
          <p className="games__desc">{zh ? g.descZh : g.desc}</p>
          {g.detail && <p className="games__detail">{zh ? (g.detailZh || g.detail) : g.detail}</p>}
        </div>
        <div className="strip__links">
          {g.extraVideos?.map(x => <a key={x.url} className="link" href={x.url} target="_blank" rel="noreferrer"><Icon name="play" />{zh ? x.labelZh : x.label}<Icon name="external" /></a>)}
          {(g.bilibili || id) && <a className="link" href={g.bilibili || `https://www.bilibili.com/video/${id}`} target="_blank" rel="noreferrer"><Icon name="play" />Bilibili<Icon name="external" /></a>}
        </div>
      </div>
    </div>
    <div className="games__list" role="tablist" aria-label={zh ? '选择游戏' : 'Select a game'}>
      {games.map((x, i) => <button key={x.name} type="button" role="tab" aria-selected={sel === i} aria-controls={`${uid}-g`}
        className={`gtab ${sel === i ? 'is-on' : ''}`} onClick={() => setSel(i)}>
        <span className="gtab__no">{pad(i + 1)}</span>
        <b className="gtab__t">{zh ? x.nameZh : x.name}</b>
        <small className="gtab__r">{zh ? x.roleZh : x.role}</small>
        {x.awards && <i className="gtab__star" title={zh ? x.awardsZh : x.awards}><Icon name="star" /></i>}
      </button>)}
    </div>
  </div>;
}

/* ------------------------------------------------------------------
   06 · Honors — three mission cards a row; click flips to the brief
   ------------------------------------------------------------------ */
function Medal({ award: a, index, lang }) {
  const zh = lang === 'zh';
  const [flip, setFlip] = useState(false);
  const toggle = () => setFlip(f => !f);
  return <article className="medal rv" role="listitem" data-tier={a.tier} data-flip={flip ? '' : undefined}>
    <button type="button" className="medal__in" onClick={toggle} aria-pressed={flip}><span className="medal__card">
      <span className="medal__face" aria-hidden={flip}>
        <span className="medal__hd"><span className="pill">No. {pad(index + 1)}</span><i className="led on" /></span>
        <b className="medal__badge">{zh ? a.badgeZh : a.badge}</b>
        <span className="medal__t">{zh ? a.titleZh : a.title}</span>
        <span className="medal__res">{zh ? a.resultZh : a.result}</span>
        <span className="medal__ft"><i className="stripe" /><span>{zh ? '点击翻面 ↻' : 'Flip for brief ↻'}</span></span>
      </span>
      <span className="medal__face medal__face--back" aria-hidden={!flip}>
        <span className="medal__hd"><span className="pill">{zh ? '简报' : 'Brief'} · {pad(index + 1)}</span><span className="medal__mini">{zh ? a.badgeZh : a.badge}</span></span>
        <span className="medal__blurb">{zh ? a.blurbZh : a.blurb}</span>
        <span className="medal__ft"><i className="stripe" /><span>{zh ? '返回 ↺' : 'Back ↺'}</span></span>
      </span>
    </span></button>
    <span className="medal__stamp" aria-hidden="true">{zh ? '已核验' : 'Verified'}</span>
  </article>;
}

export function AwardWall({ awards, lang }) {
  return <div className="medals" role="list">
    {awards.map((a, i) => <Medal key={a.title} award={a} index={i} lang={lang} />)}
  </div>;
}
