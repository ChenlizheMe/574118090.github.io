import React, { useEffect, useId, useRef, useState } from 'react';
import { education, workExperience, publications, infernux } from './content.js';
import { Icon } from './icons.jsx';
import { VideoPlayer, biliThumb, useMotion } from './motion.jsx';
import { useMetrics, AnimatedNumber, RepositoryStars } from './live-data.jsx';

const bvidOf = url => { try { return new URL(url).searchParams.get('bvid'); } catch { return null; } };
/* inline figures use the ~960px variant written by scripts/optimize-images.mjs */
export const smallOf = src => (typeof src === 'string' && /^\/img\/.+\.webp$/.test(src) && !src.endsWith('-sm.webp') ? src.replace(/\.webp$/, '-sm.webp') : src);

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
    {roles.map(role => <span key={role} className="authors__co">Lizhe Chen · {role}</span>)}</p>;
}

/* ------------------------------------------------------------------
   01 · Journey — flight-log cassette J-cards
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

function JCard({ kind, items, lang }) {
  const zh = lang === 'zh';
  const work = kind === 'work';
  const details = DETAILS[kind];
  return <article className={`jcard jcard--${kind} rv`}>
    <div className="jcard__spine" aria-hidden="true">
      <span>{work ? 'SIDE A' : 'SIDE B'}</span>
      <b>{work ? 'WORK' : 'STUDY'}</b>
      <i />
    </div>
    <div className="jcard__body">
      <header className="jcard__head">
        <div><small>{work ? 'FLIGHT LOG · C-60' : 'FLIGHT LOG · C-90'}</small>
          <h3><Icon name={work ? 'briefcase' : 'scholar'} />{work ? (zh ? '工作经历' : 'Work experience') : (zh ? '学习经历' : 'Education')}</h3></div>
      </header>
      <ol className="tracks">
        {items.map((item, i) => {
          const d = details[i];
          return <li className="track" key={item.place}>
            <div className="track__no"><span>{String(i + 1).padStart(2, '0')}</span><b>{d.year}</b></div>
            <div className="track__copy">
              <p className="track__date">{zh ? item.dateZh : item.date}</p>
              <h4>{zh ? item.placeZh : item.place}</h4>
              <p className="track__role">{zh ? item.roleZh : item.role}</p>
              <ul>{(zh ? d.pointsZh : d.points).map(p => <li key={p}>{p}</li>)}</ul>
              {d.link && <a className="link" href={d.link} target="_blank" rel="noreferrer"><Icon name="github" />{d.linkLabel}<Icon name="external" /></a>}
            </div>
          </li>;
        })}
      </ol>
      <footer className="jcard__foot" aria-hidden="true"><span>NR ON</span><span>{work ? 'TENCENT · DEXFORCE' : 'TSINGHUA · NCUT'}</span><span>{work ? '◀◀ ▶ ▶▶' : 'DOLBY B'}</span></footer>
    </div>
  </article>;
}

export function Journey({ lang }) {
  return <div className="journey">
    <JCard kind="study" items={education} lang={lang} />
    <JCard kind="work" items={workExperience} lang={lang} />
  </div>;
}

/* ------------------------------------------------------------------
   02 · Publications — tape index with an animated voxel diagram per paper
   ------------------------------------------------------------------ */
const FEATURED = [
  { id: 'compact-bench', dia: 'compact', short: 'CompAct-Bench', field: 'AGENT MEMORY', color: 'var(--orange)',
    cap: ['Ten history cubes are pressed into one memory block; the agent resumes from it and either passes or fails.', '十个历史方块被压成一块记忆；智能体从这块记忆继续执行，结果或通过、或失败。'] },
  { id: 'skillforge', dia: 'skillforge', short: 'SkillForge', field: 'AI AGENTS', color: 'var(--green)',
    cap: ['Skills leave the pool; fit ones are absorbed by the agent, low-fitness ones are retired.', '技能从技能池出发：高适应度的被智能体吸收，低适应度的被淘汰。'] },
  { id: 'promptcd', dia: 'promptcd', short: 'PromptCD', field: 'MULTIMODAL AI', color: 'var(--blue)',
    cap: ['Decode under a positive and a negative prompt, then keep the contrast between them.', '分别在正向与负向提示下解码，再取两者的对比作为输出。'] },
  { id: 'corrdetail', dia: 'corrdetail', short: 'CorrDetail', field: 'FORGERY DETECTION', color: 'var(--red)',
    cap: ['A scanner sweeps the faces; fine visual detail exposes the forged one.', '扫描器逐个检查人脸，细粒度的视觉细节暴露出伪造的那一张。'] },
  { id: 'innate-reasoning', dia: 'innate', short: 'Innate Reasoning', field: 'LLM REASONING', color: 'var(--yellow)',
    cap: ['Zero-shot keeps stacking thoughts after the answer; an in-context example stops it in time.', '零样本推理在得出答案后仍不断堆叠思考；加入上下文示例后及时停下。'] }
];

function Diagram({ id, label }) {
  const ref = useRef(null);
  const { paused } = useMotion();
  useEffect(() => {
    let api = null, dead = false;
    import('./diagrams.js').then(({ mountDiagram }) => { if (!dead) api = mountDiagram(ref.current, id, { reduced: paused }); });
    return () => { dead = true; api?.dispose(); };
  }, [id, paused]);
  return <canvas className="dia" ref={ref} aria-label={label} />;
}

export function PaperArcade({ lang }) {
  const zh = lang === 'zh';
  const [sel, setSel] = useState(0);
  const papers = FEATURED.map(m => ({ ...publications.find(p => p.image?.startsWith(`/img/papers/${m.id}.`)), ...m }));
  const p = papers[sel];
  const venue = zh ? (p.venueZh || p.venue) : p.venue;
  return <div className="papers rv" style={{ '--pc': p.color }}>
    <div className="papers__tabs" role="tablist" aria-label={zh ? '代表论文' : 'Selected papers'}>
      {papers.map((x, i) => <button key={x.id} type="button" role="tab" aria-selected={sel === i} className={sel === i ? 'is-on' : ''} style={{ '--tc': x.color }} onClick={() => setSel(i)}>
        <span className="papers__no">{String(i + 1).padStart(2, '0')}</span>
        <b>{x.short}</b>
        <small>{(zh ? (x.venueZh || x.venue) : x.venue).split(/ · | Main| Long/)[0]}</small>
      </button>)}
    </div>
    <div className="papers__stage">
      <figure className="papers__dia pane">
        <figcaption className="pane__bar"><span className="pane__id">SIM {String(sel + 1).padStart(2, '0')}</span><b>{p.field}</b></figcaption>
        <Diagram key={p.dia} id={p.dia} label={zh ? p.cap[1] : p.cap[0]} />
        <p className="papers__cap"><span>▶</span>{zh ? p.cap[1] : p.cap[0]}</p>
      </figure>
      <figure className="papers__fig pane pane--light">
        <figcaption className="pane__bar"><span className="pane__id">FIG. {String(sel + 1).padStart(2, '0')}</span><b>{zh ? '论文原图' : 'From the paper'}</b><span className="pane__right">{zh ? '点击放大' : 'CLICK TO ENLARGE'}</span></figcaption>
        <FigureViewer key={p.id} src={p.image} title={p.short} lang={lang} className="papers__figure" />
      </figure>
    </div>
    <div className="papers__dossier" key={p.id}>
      <div>
        <p className="papers__venue">{venue}</p>
        <h3>{p.title}</h3>
      </div>
      <div>
        <p className="papers__intro">{zh ? p.introZh : p.intro}</p>
        <Authors paper={p} lang={lang} />
        <div className="btn-row btn-row--tight">
          {p.link && <a className="btn btn--sm btn--hot" href={p.link} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '阅读论文' : 'Read paper'}<Icon name="external" /></a>}
          {p.pdf && <a className="btn btn--sm btn--cyan" href={p.pdf} target="_blank" rel="noreferrer"><Icon name="download" />PDF</a>}
        </div>
      </div>
    </div>
  </div>;
}

export function PaperCard({ paper, lang, index }) {
  const zh = lang === 'zh';
  const title = zh ? (paper.titleZh || paper.title) : paper.title;
  const venue = zh ? (paper.venueZh || paper.venue) : paper.venue;
  return <article className="icard rv">
    <div className="icard__tab"><span>{String(index + 1).padStart(3, '0')}</span><b>{paper.levelLabel}</b></div>
    <FigureViewer src={paper.image} title={title} lang={lang} className="icard__fig" />
    <div className="icard__copy">
      {venue && <p className="icard__venue">{venue}</p>}
      <h3>{paper.link ? <a href={paper.link} target="_blank" rel="noreferrer">{title}</a> : title}</h3>
      <p className="icard__intro">{zh ? (paper.introZh || paper.intro) : paper.intro}</p>
      {paper.authors && <Authors paper={paper} lang={lang} />}
      <div className="icard__links">
        {paper.link && <a className="link" href={paper.link} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '阅读论文' : 'Read paper'}<Icon name="external" /></a>}
        {paper.pdf && <a className="link" href={paper.pdf} target="_blank" rel="noreferrer"><Icon name="download" />PDF<Icon name="external" /></a>}
      </div>
    </div>
  </article>;
}

/* ------------------------------------------------------------------
   03 · Infernux — full-width mission monitor
   ------------------------------------------------------------------ */
export function MissionMonitor({ lang }) {
  const zh = lang === 'zh';
  const metrics = useMetrics();
  const [ch, setCh] = useState(0);
  const [noise, setNoise] = useState(false);
  const videos = infernux.videos;
  const v = videos[ch];
  const stat = metrics.videos?.[v.bvid];
  const tune = i => { if (i === ch) return; setNoise(true); setCh(i); setTimeout(() => setNoise(false), 380); };
  return <div className="monitor rv">
    <div className="monitor__bar">
      <span className="monitor__rec"><i className="led led--rec" />{zh ? '播放中' : 'ON AIR'}</span>
      <span>CH {String(ch + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}</span>
      <b>{v.chapter}</b>
      <span className="monitor__stats">▷ <AnimatedNumber value={stat?.views} lang={lang} /> · ♡ <AnimatedNumber value={stat?.likes} lang={lang} /></span>
    </div>
    <div className={`monitor__screen ${noise ? 'is-noise' : ''}`}>
      <VideoPlayer key={v.bvid} url={v.url} title={zh ? v.titleZh : v.title} poster={stat?.poster || smallOf(infernux.image)} lang={lang} />
      <span className="monitor__corners" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="monitor__title" aria-hidden="true">{zh ? v.titleZh : v.title}</span>
    </div>
    <div className="monitor__channels" role="tablist" aria-label={zh ? '选择视频' : 'Select a film'}>
      {videos.map((x, i) => {
        const s = metrics.videos?.[x.bvid];
        return <button key={x.bvid} type="button" role="tab" aria-selected={ch === i} className={ch === i ? 'is-on' : ''} onClick={() => tune(i)}>
          <span className="monitor__thumb">{s?.poster ? <img src={biliThumb(s.poster, 320)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <Icon name="play" />}<em>{String(i + 1).padStart(2, '0')}</em></span>
          <span className="monitor__meta"><small>{x.chapter}</small><b>{zh ? x.titleZh : x.title}</b><span>▷ <AnimatedNumber value={s?.views} lang={lang} /></span></span>
        </button>;
      })}
    </div>
  </div>;
}

export function InfernuxLinks({ lang }) {
  const zh = lang === 'zh';
  const m = useMetrics();
  return <div className="btn-row">
    <a className="btn btn--hot" href={infernux.website} target="_blank" rel="noreferrer"><Icon name="globe" />{zh ? '进入引擎官网' : 'Visit Infernux'}<Icon name="external" /></a>
    <a className="btn" href={infernux.url} target="_blank" rel="noreferrer"><Icon name="github" />GitHub</a>
    <a className="btn" href={infernux.report} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '技术报告' : 'Tech report'}</a>
    <RepositoryStars lang={lang} />
    {m.release?.tag && <a className="chip-led" href={m.release.url} target="_blank" rel="noreferrer"><i className="led led--on" />{m.release.tag}</a>}
  </div>;
}

/* ------------------------------------------------------------------
   04 · Projects — rack-mount units
   ------------------------------------------------------------------ */
export function RackUnit({ project, lang, index }) {
  const zh = lang === 'zh';
  const screen = useRef(null);
  const look = e => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    screen.current?.style.setProperty('--lx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
    screen.current?.style.setProperty('--ly', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
  };
  return <article className="rack rv">
    <div className="rack__ear" aria-hidden="true"><i /><i /></div>
    <div className="rack__face">
      <div className="rack__top"><span className="rack__id">UNIT {String(index + 1).padStart(2, '0')}</span><span className="rack__name">{project.name}</span><span className="rack__status"><i className="led led--on" />{zh ? project.statusZh : project.status}</span></div>
      <div className="rack__grid">
        <div className="rack__screen" ref={screen} onPointerMove={look} onPointerLeave={() => { screen.current?.style.setProperty('--lx', '50%'); screen.current?.style.setProperty('--ly', '50%'); }}>
          <img src={smallOf(project.image)} alt={project.name} loading="lazy" decoding="async" />
          <span className="rack__cross" aria-hidden="true" />
          <FigureViewer src={project.image} title={project.name} lang={lang} className="rack__expand" />
        </div>
        <div className="rack__copy">
          <h3><a href={project.url} target="_blank" rel="noreferrer">{project.name}</a></h3>
          <p className="rack__desc">{zh ? project.descZh : project.desc}</p>
          {project.detail && <p className="rack__detail" dangerouslySetInnerHTML={{ __html: zh ? (project.detailZh || project.detail) : project.detail }} />}
          <p className="rack__role">{zh ? project.roleZh : project.role}</p>
          <div className="keycaps">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
          <a className="link" href={project.url} target="_blank" rel="noreferrer"><Icon name="github" />{zh ? '查看项目' : 'Explore project'}<Icon name="external" /></a>
        </div>
      </div>
    </div>
    <div className="rack__ear" aria-hidden="true"><i /><i /></div>
  </article>;
}

/* ------------------------------------------------------------------
   05 · Games — VHS shelf feeding a monitor
   ------------------------------------------------------------------ */
const SPINE = ['#e2381b', '#f5b91d', '#efe8d8', '#8a3a1d', '#ef7a1c', '#d8cfba', '#2b62d4', '#3a342c'];

export function TapeShelf({ games, lang }) {
  const zh = lang === 'zh';
  const uid = useId();
  const metrics = useMetrics().videos;
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const g = games[sel];
  const id = bvidOf(g.video);
  const stat = id ? metrics?.[id] : null;
  const choose = i => { if (i === sel) return; setLoading(true); setSel(i); setTimeout(() => setLoading(false), 480); };
  return <div className="shelf rv">
    <div className="shelf__deck">
      <div className={`shelf__monitor ${loading ? 'is-loading' : ''}`}>
        {g.video ? <VideoPlayer key={g.name} url={g.video} title={zh ? g.nameZh : g.name} poster={stat?.poster} lang={lang} /> : <div className="shelf__empty"><Icon name="play" /></div>}
        <span className="shelf__osd" aria-hidden="true">▶ PLAY · {String(sel + 1).padStart(2, '0')}</span>
      </div>
      <div className="shelf__info" id={`${uid}-g`} aria-live="polite">
        <p className="shelf__role">{zh ? g.roleZh : g.role}</p>
        <h3>{zh ? g.nameZh : g.name}</h3>
        {g.awards && <p className="shelf__award"><Icon name="star" />{zh ? g.awardsZh : g.awards}</p>}
        {stat && <p className="shelf__stats">▷ <AnimatedNumber value={stat.views} lang={lang} /> {zh ? '播放' : 'views'} · ♡ <AnimatedNumber value={stat.likes} lang={lang} /></p>}
        <p>{zh ? g.descZh : g.desc}</p>
        {g.detail && <p className="shelf__detail">{zh ? (g.detailZh || g.detail) : g.detail}</p>}
        <div className="shelf__links">
          {g.extraVideos?.map(x => <a key={x.url} className="link" href={x.url} target="_blank" rel="noreferrer"><Icon name="play" />{zh ? x.labelZh : x.label}<Icon name="external" /></a>)}
          {(g.bilibili || id) && <a className="link" href={g.bilibili || `https://www.bilibili.com/video/${id}`} target="_blank" rel="noreferrer"><Icon name="play" />Bilibili<Icon name="external" /></a>}
        </div>
      </div>
    </div>
    <div className="shelf__rack" role="tablist" aria-label={zh ? '选择游戏' : 'Select a game'}>
      {games.map((x, i) => <button key={x.name} type="button" role="tab" aria-selected={sel === i} aria-controls={`${uid}-g`}
        className={`vhs ${sel === i ? 'is-out' : ''}`} style={{ '--sc': SPINE[i % SPINE.length], '--h': `${88 + (i * 13) % 14}%` }} onClick={() => choose(i)}>
        <span className="vhs__no">{String(i + 1).padStart(2, '0')}</span>
        <span className="vhs__title">{zh ? x.nameZh : x.name}</span>
        <span className="vhs__mark">VHS</span>
      </button>)}
      <div className="shelf__plank" aria-hidden="true" />
    </div>
  </div>;
}

/* ------------------------------------------------------------------
   06 · Honors — mission-patch wall
   ------------------------------------------------------------------ */
const PATCH = ['#e2381b', '#ef7a1c', '#f5b91d', '#8a3a1d', '#2b62d4', '#e2381b', '#ef7a1c', '#f5b91d', '#8a3a1d'];
export function DymoWall({ awards, lang }) {
  const zh = lang === 'zh';
  return <div className="dymo-wall">
    {awards.map((a, i) => <article key={a.title} className="dymo-card rv" style={{ '--dc': PATCH[i % PATCH.length] }}>
      <span className="dymo-card__no">{String(i + 1).padStart(2, '0')}</span>
      <p className="dymo"><span>{(zh ? a.resultZh : a.result)}</span></p>
      <h3>{zh ? a.titleZh : a.title}</h3>
      <p className="dymo-card__blurb">{zh ? a.blurbZh : a.blurb}</p>
    </article>)}
  </div>;
}
