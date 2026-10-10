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
   Sticky notes — shared by the honors wall and the papers archive.
   Each note hangs from a strip of tape and sways on its own; moving the
   pointer across the wall blows a gust through the nearby notes.
   ------------------------------------------------------------------ */
const NOTE = ['#f6d453', '#f4a259', '#ee8173', '#f3ead0', '#9cc3ea', '#a9d8a0'];
const TILT = [-2.4, 1.8, -1.2, 2.6, -1.8, 1.2, -2.9, 2.2, -1.5];

function useWind(ref) {
  const { paused } = useMotion();
  useEffect(() => {
    const wall = ref.current;
    if (!wall || paused) return undefined;
    const state = new Map();
    const get = el => { let s = state.get(el); if (!s) { s = { a: 0, v: 0 }; state.set(el, s); } return s; };
    let raf = 0, last = 0;
    const tick = now => {
      raf = 0;
      const dt = Math.min(.033, (now - last) / 1000 || .016); last = now;
      let live = false;
      wall.querySelectorAll('.sticky').forEach(el => {
        const s = get(el);
        s.v += (-90 * s.a - 3.4 * s.v) * dt;           /* pendulum spring with light damping */
        s.a = Math.max(-20, Math.min(20, s.a + s.v * dt));
        if (Math.abs(s.a) < .04 && Math.abs(s.v) < .08) {
          if (s.a || s.v) { s.a = s.v = 0; el.style.setProperty('--wind', '0deg'); el.style.setProperty('--wskew', '0deg'); }
          return;
        }
        live = true;
        el.style.setProperty('--wind', `${s.a.toFixed(2)}deg`);
        el.style.setProperty('--wskew', `${(s.a * .3).toFixed(2)}deg`);
      });
      if (live) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const push = (el, dv) => { const s = get(el); s.v = Math.max(-240, Math.min(240, s.v + dv)); };
    const move = e => {
      if (e.pointerType === 'touch' || (!e.movementX && !e.movementY)) return;
      wall.querySelectorAll('.sticky').forEach(el => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const reach = 260 + r.width / 3, d = Math.hypot(dx, dy);
        if (d > reach) return;
        const f = 1 - d / reach;
        push(el, -e.movementX * f * f * 6);            /* gust follows the pointer's direction */
      });
      kick();
    };
    const poke = e => {
      const el = e.target.closest?.('.sticky');
      if (!el || e.target.closest('a, button')) return;
      push(el, (Math.random() < .5 ? -1 : 1) * (90 + Math.random() * 60));
      kick();
    };
    wall.addEventListener('pointermove', move);
    wall.addEventListener('pointerdown', poke);
    return () => { wall.removeEventListener('pointermove', move); wall.removeEventListener('pointerdown', poke); cancelAnimationFrame(raf); };
  }, [ref, paused]);
}

export function StickyWall({ className = '', children }) {
  const ref = useRef(null);
  useWind(ref);
  return <div ref={ref} className={`sticky-wall ${className}`}>{children}</div>;
}

/* every fourth note is held by a single corner and dangles a little more */
function StickyNote({ index, className = '', children }) {
  const loose = index % 4 === 2;
  const style = {
    '--nc': NOTE[index % NOTE.length],
    '--r': `${TILT[index % TILT.length]}deg`,
    '--a': loose ? '3.4deg' : '1.3deg',
    '--sd': `${(3.8 + (index * 0.7) % 2.2).toFixed(1)}s`,
    '--sl': `-${((index * 1.3) % 4).toFixed(1)}s`,
    '--ox': loose ? '16%' : '50%'
  };
  return <div className="sticky-cell rv" style={style}>
    <div className={`sticky ${loose ? 'sticky--loose' : ''}`}>
      <div className={`sticky__paper ${className}`}>{children}</div>
    </div>
  </div>;
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
  return <canvas className="dia" ref={ref} role="img" aria-label={label} />;
}

/* the big voxel stage: the diagram is the hero, the paper's own figure floats in the corner */
function VoxelStage({ p, no, zh, lang }) {
  const cap = zh ? p.cap[1] : p.cap[0];
  return <div className="papers__stage pane">
    <div className="pane__bar">
      <span className="pane__id">SIM {no}</span><b>{p.field}</b>
      <span className="pane__right"><i className="led led--on" />LIVE</span>
    </div>
    <div className="papers__view">
      <Diagram id={p.dia} label={cap} />
      <figure className="papers__fig">
        <FigureViewer src={p.image} title={p.short} lang={lang} className="papers__figure" />
        <figcaption>FIG. {no} · {zh ? '论文原图' : 'FROM THE PAPER'}</figcaption>
      </figure>
    </div>
    <p className="papers__cap"><span>▶</span>{zh ? '模拟' : 'Simulation'}</p>
  </div>;
}

export function PaperArcade({ lang }) {
  const zh = lang === 'zh';
  const [sel, setSel] = useState(0);
  const papers = FEATURED.map(m => ({ ...publications.find(p => p.image?.startsWith(`/img/papers/${m.id}.`)), ...m }));
  const p = papers[sel];
  const no = String(sel + 1).padStart(2, '0');
  const venue = zh ? (p.venueZh || p.venue) : p.venue;
  return <div className="papers rv" style={{ '--pc': p.color }}>
    <div className="papers__tabs" role="tablist" aria-label={zh ? '代表论文' : 'Selected papers'}>
      {papers.map((x, i) => <button key={x.id} type="button" role="tab" aria-selected={sel === i} className={sel === i ? 'is-on' : ''} style={{ '--tc': x.color }} onClick={() => setSel(i)}>
        <span className="papers__no">{String(i + 1).padStart(2, '0')}</span>
        <b>{x.short}</b>
        <small>{(zh ? (x.venueZh || x.venue) : x.venue).split(/ · | Main| Long/)[0]}</small>
      </button>)}
    </div>
    <div className="papers__dossier" key={p.id}>
      <div className="papers__head">
        <p className="papers__meta"><span className="papers__idx">{zh ? '论文' : 'PAPER'} {no} / {String(papers.length).padStart(2, '0')}</span><span className="papers__venue">{venue}</span></p>
        <h3>{p.title}</h3>
      </div>
      <div className="papers__body">
        <p className="papers__intro">{zh ? p.introZh : p.intro}</p>
        <Authors paper={p} lang={lang} />
        <div className="btn-row btn-row--tight">
          {p.link && <a className="btn btn--sm btn--hot" href={p.link} target="_blank" rel="noreferrer"><Icon name="book" />{zh ? '阅读论文' : 'Read paper'}<Icon name="external" /></a>}
          {p.pdf && <a className="btn btn--sm btn--cyan" href={p.pdf} target="_blank" rel="noreferrer"><Icon name="download" />PDF</a>}
        </div>
      </div>
    </div>
    <VoxelStage key={`${p.id}-stage`} p={p} no={no} zh={zh} lang={lang} />
  </div>;
}

export function PaperCard({ paper, lang, index }) {
  const zh = lang === 'zh';
  const title = zh ? (paper.titleZh || paper.title) : paper.title;
  const venue = zh ? (paper.venueZh || paper.venue) : paper.venue;
  return <StickyNote index={index} className="icard">
    <p className="dymo"><span>{String(index + 1).padStart(3, '0')} · {paper.levelLabel}</span></p>
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
  </StickyNote>;
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
  return <div className="deck rv">
    <div className="deck__tv">
      <div className="deck__bar">
        <span className="deck__rec"><i className="led led--rec" />{zh ? '播放中' : 'ON AIR'}</span>
        <span>CH {String(ch + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}</span>
        <b>{v.chapter}</b>
        <span className="deck__stats">▷ <AnimatedNumber value={stat?.views} lang={lang} /> · ♡ <AnimatedNumber value={stat?.likes} lang={lang} /></span>
      </div>
      <div className="deck__bezel">
        <div className={`monitor__screen ${noise ? 'is-noise' : ''}`}>
          <VideoPlayer key={v.bvid} url={v.url} title={zh ? v.titleZh : v.title} poster={stat?.poster || smallOf(infernux.image)} lang={lang} />
          <span className="monitor__corners" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="monitor__title" aria-hidden="true">{zh ? v.titleZh : v.title}</span>
        </div>
      </div>
      <div className="deck__ctrl" aria-hidden="true">
        <span className="deck__grille" />
        <span className="deck__brand">INFERNUX · 3N</span>
        <span className="deck__knob" /><span className="deck__knob deck__knob--b" />
      </div>
    </div>
    <div className="deck__tapes" role="tablist" aria-label={zh ? '选择视频' : 'Select a film'}>
      <p className="deck__slot" aria-hidden="true"><span>{zh ? '磁带仓' : 'TAPE DECK'}</span><i /></p>
      {videos.map((x, i) => {
        const s = metrics.videos?.[x.bvid];
        return <button key={x.bvid} type="button" role="tab" aria-selected={ch === i} className={`tape ${ch === i ? 'is-on' : ''}`} onClick={() => tune(i)}>
          <span className="tape__label">
            <span className="tape__thumb">{s?.poster ? <img src={biliThumb(s.poster, 240)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <Icon name="play" />}<em>{String(i + 1).padStart(2, '0')}</em></span>
            <span className="tape__meta"><small>{x.chapter}</small><b>{zh ? x.titleZh : x.title}</b><span>▷ <AnimatedNumber value={s?.views} lang={lang} /></span></span>
          </span>
          <span className="tape__window" aria-hidden="true"><i className="tape__reel" /><i className="tape__strip" /><i className="tape__reel" /></span>
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
   05 · Games — a disc player: pick a disc from the rack and it drops into the drive
   ------------------------------------------------------------------ */
const DISC = ['#e2381b', '#f5b91d', '#efe8d8', '#8a3a1d', '#ef7a1c', '#d8cfba', '#2b62d4', '#3a342c'];

export function DiscShelf({ games, lang }) {
  const zh = lang === 'zh';
  const uid = useId();
  const metrics = useMetrics().videos;
  const { paused } = useMotion();
  const root = useRef(null);
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fly, setFly] = useState(null);
  const g = games[sel];
  const id = bvidOf(g.video);
  const stat = id ? metrics?.[id] : null;
  const no = String(sel + 1).padStart(2, '0');

  // the disc lands in the drive: swap the game and let the TV "read" it
  const land = i => { setSel(i); setFly(null); setLoading(true); };
  useEffect(() => { if (!loading) return; const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, [loading]);

  const choose = i => {
    if (fly || i === sel) return;
    const r = root.current;
    const bay = r?.querySelector('.player__disc');
    const inDisc = r?.querySelector(`[data-slot="${i}"] .disc`);
    const outDisc = r?.querySelector(`[data-slot="${sel}"] .disc`);
    if (paused || !bay || !inDisc || !outDisc || !r.animate) { land(i); return; }
    const rr = r.getBoundingClientRect();
    const spot = el => { const b = el.getBoundingClientRect(); return { x: b.left - rr.left + b.width / 2, y: b.top - rr.top + b.height / 2, w: b.width }; };
    setFly({ i, prev: sel, a: spot(inDisc), b: spot(bay), c: spot(outDisc) });
  };

  // two discs float: the new one into the bay, the old one back to its slot
  useEffect(() => {
    if (!fly) return;
    const [flyIn, flyOut] = root.current.querySelectorAll('.fly');
    const hop = (el, from, to, spin) => {
      const k = p => `translate(${(from.x - to.x) * (1 - p)}px, ${(from.y - to.y) * (1 - p) - Math.sin(p * Math.PI) * 78}px)`;
      const sc = p => from.w / to.w + (1 - from.w / to.w) * p + Math.sin(p * Math.PI) * .35;
      return el.animate([0, .25, .5, .75, 1].map(p => ({ transform: `${k(p)} scale(${sc(p)}) rotate(${spin * p}deg)`, offset: p })), { duration: 820, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'both' });
    };
    if (flyIn) hop(flyIn, fly.a, fly.b, 300);
    if (flyOut) hop(flyOut, fly.b, fly.c, -300);
    const t = setTimeout(() => land(fly.i), 820);
    return () => clearTimeout(t);
  }, [fly]);

  const away = fly ? fly.i : sel;
  const flyStyle = (s, k) => ({ left: s.x - s.w / 2, top: s.y - s.w / 2, width: s.w, '--sc': DISC[k % DISC.length] });
  return <div className="shelf rv" ref={root}>
    <div className="shelf__deck">
      <div className={`shelf__monitor ${loading ? 'is-loading' : ''}`}>
        {g.video ? <VideoPlayer key={g.name} url={g.video} title={zh ? g.nameZh : g.name} poster={stat?.poster} lang={lang} /> : <div className="shelf__empty"><Icon name="play" /></div>}
        <span className="shelf__osd" aria-hidden="true">{loading || fly ? 'READING DISC…' : `▶ PLAY · ${no}`}</span>
      </div>
      <div className="shelf__info" id={`${uid}-g`} tabIndex={0} aria-live="polite" aria-label={zh ? `${g.nameZh}，悬停或聚焦查看详情` : `${g.name}, hover or focus for details`}>
        <div className="shelf__scroll">
          <p className="shelf__role">{zh ? g.roleZh : g.role}</p>
          <h3>{zh ? g.nameZh : g.name}</h3>
          {g.awards && <p className="shelf__award"><Icon name="star" /><span>{zh ? g.awardsZh : g.awards}</span></p>}
          {stat && <p className="shelf__stats">▷ <AnimatedNumber value={stat.views} lang={lang} /> {zh ? '播放' : 'views'} · ♡ <AnimatedNumber value={stat.likes} lang={lang} /></p>}
          <p className="shelf__desc">{zh ? g.descZh : g.desc}</p>
          {g.detail && <p className="shelf__detail">{zh ? (g.detailZh || g.detail) : g.detail}</p>}
          <div className="shelf__links">
            {g.extraVideos?.map(x => <a key={x.url} className="link" href={x.url} target="_blank" rel="noreferrer"><Icon name="play" />{zh ? x.labelZh : x.label}<Icon name="external" /></a>)}
            {(g.bilibili || id) && <a className="link" href={g.bilibili || `https://www.bilibili.com/video/${id}`} target="_blank" rel="noreferrer"><Icon name="play" />Bilibili<Icon name="external" /></a>}
          </div>
        </div>
        <span className="shelf__hint" aria-hidden="true">{zh ? '悬停查看详情' : 'HOVER FOR DETAILS'}</span>
      </div>
    </div>
    <div className={`player ${loading ? 'is-reading' : ''} ${fly ? 'is-fly' : ''}`} style={{ '--sc': DISC[sel % DISC.length] }} aria-hidden="true">
      <div className="player__bay">
        <span className="player__disc" key={sel}><span className="disc" /></span>
      </div>
      <div className="player__lcd">
        <small>{loading || fly ? 'READING…' : 'PLAYING'} · DISC {no} / {String(games.length).padStart(2, '0')}</small>
        <b>{zh ? g.nameZh : g.name}</b>
        <span className="player__prog"><i /></span>
      </div>
      <div className="player__keys"><i>▶</i><i>■</i><i>⏏</i></div>
    </div>
    <div className="shelf__discs" role="tablist" aria-label={zh ? '选择游戏' : 'Select a game'}>
      {games.map((x, i) => <button key={x.name} type="button" role="tab" aria-selected={sel === i} aria-controls={`${uid}-g`} data-slot={i}
        className={`dbtn ${away === i ? 'is-out' : ''} ${fly && sel === i ? 'is-gap' : ''}`} style={{ '--sc': DISC[i % DISC.length] }} onClick={() => choose(i)}>
        <span className="disc" />
        <span className="dbtn__no">{String(i + 1).padStart(2, '0')}</span>
        <span className="dbtn__title">{zh ? x.nameZh : x.name}</span>
      </button>)}
    </div>
    {fly && <>
      <span className="fly" aria-hidden="true" style={flyStyle(fly.b, fly.i)}><span className="disc" /></span>
      <span className="fly" aria-hidden="true" style={flyStyle(fly.c, fly.prev)}><span className="disc" /></span>
    </>}
  </div>;
}

/* ------------------------------------------------------------------
   06 · Honors — a Swiss ledger: index, event, result badge
   ------------------------------------------------------------------ */
export function AwardWall({ awards, lang }) {
  const zh = lang === 'zh';
  return <div className="ledger" role="list">
    <div className="ledger__head" aria-hidden="true"><span>NO.</span><span>{zh ? '赛事 / 荣誉' : 'EVENT'}</span><span>{zh ? '成绩' : 'RESULT'}</span></div>
    {awards.map((a, i) => <article key={a.title} className="ledger__row rv" role="listitem" data-tier={a.tier}>
      <span className="ledger__no">{String(i + 1).padStart(2, '0')}</span>
      <div className="ledger__main">
        <h3>{zh ? a.titleZh : a.title}</h3>
        <p className="ledger__blurb">{zh ? a.blurbZh : a.blurb}</p>
      </div>
      <div className="ledger__res">
        <b className="ledger__badge">{zh ? a.badgeZh : a.badge}</b>
        <span>{zh ? a.resultZh : a.result}</span>
      </div>
    </article>)}
  </div>;
}
