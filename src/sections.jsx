import React, { useEffect, useId, useRef, useState } from 'react';
import { education, workExperience, publications, infernux } from './content.js';
import { Icon } from './icons.jsx';
import { VideoPlayer, useMotion } from './motion.jsx';
import { useMetrics, AnimatedNumber, RepositoryStars } from './live-data.jsx';

const pick = (zh, a, b) => (zh ? (b || a) : a);
const bvidOf = url => { try { return new URL(url).searchParams.get('bvid'); } catch { return null; } };

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
      <img src={src} alt={title} loading="lazy" />
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
  return <p className="authors"><span dangerouslySetInnerHTML={{ __html: paper.authors }} />
    {paper.coFirstAuthor && <span className="authors__co">Lizhe Chen · {lang === 'zh' ? '共同第一作者' : 'Co-first author'}</span>}</p>;
}

/* ------------------------------------------------------------------
   01 · Journey — two cassette J-cards (Side A work, Side B study)
   ------------------------------------------------------------------ */
const DETAILS = {
  work: [
    {
      year: '2026',
      points: [
        'Adapted Neural Texture Compression (NTC) to Unity’s ISPC-based texture compression pipeline, enabling compatibility with GPU-native BC (Block Compression) formats.',
        'Proposed GSNTC, replacing NTC’s MLP-based reconstruction with Gaussian Splatting and optimizing it for lightmap fitting; achieved 4× the speed and a 5 dB gain in reconstruction quality over the original NTC at the same compressed size.',
        'Further developed GSNTC for Lumen Radiance Cache compression and reconstruction, reducing data size by 99% and improving reconstruction quality by 10 dB over the original NTC.'
      ],
      pointsZh: [
        '改造神经纹理压缩（Neural Texture Compression，NTC），适配 Unity 基于 ISPC 的纹理压缩流程，实现与 GPU 原生 BC（Block Compression）格式的兼容。',
        '提出 GSNTC，以 Gaussian Splatting 替代 NTC 的 MLP 重建过程，并针对光照贴图拟合进行优化；在压缩后体积相同的条件下，速度达到原始 NTC 的 4 倍，重建质量提升 5 dB。',
        '进一步改进 GSNTC，用于 Lumen Radiance Cache 的压缩与重建，实现数据体积减少 99%，重建质量较原始 NTC 提升 10 dB。'
      ]
    },
    { year: '2025', points: ['Built a complete multi-camera OptiX renderer in EmbodiChain.', 'Integrated a warp-based GPU parallel compute layer.', 'Contributed to simulation, engine and asset tooling.'], pointsZh: ['在 EmbodiChain 内实现完整的多相机 OptiX 渲染器。', '集成基于 NVIDIA warp 的 GPU 并行计算层。', '参与仿真、引擎与资产侧工具开发。'], link: 'https://github.com/DexForce/EmbodiChain', linkLabel: 'EmbodiChain' }
  ],
  study: [
    { year: '2025', points: ['Master’s study in Interactive Media Technology.', 'Research interests include real-time rendering, engine systems and vision-language models.', 'Coursework in computer graphics and interactive media.'], pointsZh: ['攻读互动媒体技术方向硕士学位。', '研究方向涵盖实时渲染、引擎系统与视觉语言模型。', '学习计算机图形学与交互媒体相关课程。'] },
    { year: '2021', points: ['B.S. in Digital Media Technology; ranked first by GPA.', 'Studied graphics programming, real-time engines and machine learning.', 'Worked on early VLM/LLM collaborations and game projects through competitions.'], pointsZh: ['数字媒体技术专业工学学士，绩点排名第一。', '学习图形编程、实时引擎与机器学习基础。', '参与早期 VLM/LLM 合作研究，并通过竞赛完成游戏项目。'] }
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
        <div><small>{work ? 'C-60 · CHROME' : 'C-90 · NORMAL'}</small>
          <h3><Icon name={work ? 'briefcase' : 'scholar'} />{work ? (zh ? '工作经历' : 'Work experience') : (zh ? '学习经历' : 'Education')}</h3></div>
        <div className="jcard__reels" aria-hidden="true"><i /><i /></div>
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
    <JCard kind="work" items={workExperience} lang={lang} />
    <JCard kind="study" items={education} lang={lang} />
  </div>;
}

/* ------------------------------------------------------------------
   02 · Publications — CRT catalog terminal
   ------------------------------------------------------------------ */
const FEATURED = [
  { id: 'skillforge', short: 'SKILLFORGE', field: 'AI AGENTS', ext: 'RL' },
  { id: 'promptcd', short: 'PROMPTCD', field: 'MULTIMODAL AI', ext: 'TPAMI' },
  { id: 'corrdetail', short: 'CORRDETAIL', field: 'VLM', ext: 'IJCAI' },
  { id: 'innate-reasoning', short: 'INNATE_REASON', field: 'LLM REASONING', ext: 'ACL' },
  { id: 'graph-descriptive', short: 'GRAPH_ORDER', field: 'GRAPH REASONING', ext: 'ACL' }
];

function useTyped(text, key) {
  const { paused } = useMotion();
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (paused) { setN(text.length); return; }
    setN(0);
    let i = 0, t;
    const tick = () => { i = Math.min(text.length, i + 2); setN(i); if (i < text.length) t = setTimeout(tick, 14); };
    t = setTimeout(tick, 120);
    return () => clearTimeout(t);
  }, [key, text, paused]);
  return text.slice(0, n);
}

export function PaperTerminal({ lang }) {
  const zh = lang === 'zh';
  const [sel, setSel] = useState(0);
  const papers = FEATURED.map(m => ({ ...publications.find(p => p.image?.startsWith(`/img/papers/${m.id}.`)), ...m }));
  const p = papers[sel];
  const typed = useTyped(p.title, sel);
  const venue = zh ? (p.venueZh || p.venue) : p.venue;
  const onKey = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setSel((sel + 1) % papers.length); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setSel((sel - 1 + papers.length) % papers.length); }
  };
  return <div className="term rv" onKeyDown={onKey}>
    <div className="term__bezel">
      <div className="term__brand"><b>LC-2026</b><span>CATALOG TERMINAL</span><i className="led led--on" /></div>
      <div className="term__screen crt">
        <div className="term__dir" role="tablist" aria-label={zh ? '代表论文' : 'Selected papers'}>
          <p className="term__path">C:\PAPERS\SELECTED&gt; DIR</p>
          {papers.map((x, i) => <button type="button" role="tab" key={x.id} aria-selected={sel === i} className={sel === i ? 'is-on' : ''} onClick={() => setSel(i)}>
            <span>{sel === i ? '▶' : ' '}</span><b>{x.short}</b><em>.{x.ext}</em><small>{x.field}</small>
          </button>)}
          <p className="term__free">{papers.length} FILE(S) · {publications.length} TOTAL ON DISK</p>
        </div>
        <div className="term__view" key={sel}>
          <div className="term__fig"><FigureViewer src={p.image} title={p.short} lang={lang} /><span className="term__figtag">FIG · {p.field}</span></div>
          <div className="term__copy">
            <p className="term__venue">{venue}</p>
            <h3>{typed}<i className="caret" /></h3>
            <p className="term__intro">{zh ? p.introZh : p.intro}</p>
            <Authors paper={p} lang={lang} />
            {p.link && <a className="term__open" href={p.link} target="_blank" rel="noreferrer">&gt; {zh ? '打开论文' : 'OPEN PAPER'}<Icon name="external" /></a>}
          </div>
        </div>
      </div>
      <div className="term__keys" aria-hidden="true">
        <span>↑↓ SELECT</span><span>⏎ OPEN</span><span>F1 HELP</span>
        <i /><i /><i />
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
    <i className="icard__punch" aria-hidden="true" />
  </article>;
}

/* ------------------------------------------------------------------
   03 · Infernux — a CRT television with channel buttons
   ------------------------------------------------------------------ */
function Segments({ value, digits = 6 }) {
  const s = Number.isFinite(value) ? String(value).padStart(digits, ' ') : '------'.slice(0, digits);
  return <span className="seg" aria-label={Number.isFinite(value) ? String(value) : 'unavailable'}>{s.split('').map((c, i) => <i key={i} data-c={c}>{c === ' ' ? '8' : c}</i>)}</span>;
}

export function TVDeck({ lang }) {
  const zh = lang === 'zh';
  const metrics = useMetrics();
  const [ch, setCh] = useState(0);
  const [noise, setNoise] = useState(false);
  const videos = infernux.videos;
  const v = videos[ch];
  const stat = metrics.videos?.[v.bvid];
  const tune = i => { if (i === ch) return; setNoise(true); setCh(i); setTimeout(() => setNoise(false), 420); };
  return <div className="tv rv">
    <div className="tv__body">
      <div className="tv__screen-wrap">
        <div className={`tv__screen crt ${noise ? 'is-noise' : ''}`}>
          <VideoPlayer key={v.bvid} url={v.url} title={zh ? v.titleZh : v.title} poster={stat?.poster || infernux.image} lang={lang} />
          <span className="tv__osd" aria-hidden="true">CH {String(ch + 1).padStart(2, '0')} · {v.chapter}</span>
          <span className="tv__static" aria-hidden="true" />
        </div>
      </div>
      <div className="tv__panel">
        <div className="tv__brand"><b>INFERNUX</b><span>COLOR TV · MODEL 0.4</span></div>
        <div className="tv__channels" role="tablist" aria-label={zh ? '选择视频' : 'Select a film'}>
          {videos.map((x, i) => <button key={x.bvid} type="button" role="tab" aria-selected={ch === i} className={ch === i ? 'is-on' : ''} onClick={() => tune(i)}>
            <b>{i + 1}</b><span>{zh ? x.shortZh : x.short}</span>
          </button>)}
        </div>
        <div className="tv__meters">
          <div><small>{zh ? '播放' : 'VIEWS'}</small><Segments value={stat?.views} digits={6} /></div>
          <div><small>{zh ? '点赞' : 'LIKES'}</small><Segments value={stat?.likes} digits={6} /></div>
        </div>
        <div className="tv__knobs" aria-hidden="true"><i /><i /><span className="tv__grille" /></div>
      </div>
      <div className="tv__feet" aria-hidden="true"><i /><i /></div>
    </div>
    <p className="tv__caption"><b>{zh ? v.titleZh : v.title}</b>
      <a href={`https://www.bilibili.com/video/${v.bvid}`} target="_blank" rel="noreferrer">Bilibili ▷ <AnimatedNumber value={stat?.views} lang={lang} /></a></p>
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
        <div className="rack__screen crt" ref={screen} onPointerMove={look} onPointerLeave={() => { screen.current?.style.setProperty('--lx', '50%'); screen.current?.style.setProperty('--ly', '50%'); }}>
          <img src={project.image} alt={project.name} loading="lazy" />
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
        <div className="rack__vu" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--d': `${(i * 37) % 11 / 10}s` }} />)}</div>
      </div>
    </div>
    <div className="rack__ear" aria-hidden="true"><i /><i /></div>
  </article>;
}

/* ------------------------------------------------------------------
   05 · Games — VHS shelf feeding a monitor
   ------------------------------------------------------------------ */
const SPINE = ['#e2381b', '#f5b91d', '#efe7d6', '#0e1730', '#ef7a1c', '#0f8d67', '#2b62d4', '#8a3a1d'];

export function TapeShelf({ games, lang }) {
  const zh = lang === 'zh';
  const uid = useId();
  const metrics = useMetrics().videos;
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const g = games[sel];
  const id = bvidOf(g.video);
  const stat = id ? metrics?.[id] : null;
  const choose = i => { if (i === sel) return; setLoading(true); setSel(i); setTimeout(() => setLoading(false), 520); };
  return <div className="shelf rv">
    <div className="shelf__deck">
      <div className={`shelf__monitor crt ${loading ? 'is-loading' : ''}`}>
        {g.video ? <VideoPlayer key={g.name} url={g.video} title={zh ? g.nameZh : g.name} poster={stat?.poster} lang={lang} /> : <div className="shelf__empty"><Icon name="play" /></div>}
        <span className="shelf__osd" aria-hidden="true">▶ PLAY · TAPE {String(sel + 1).padStart(2, '0')}</span>
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
   06 · Honors — Dymo-embossed label wall
   ------------------------------------------------------------------ */
const DYMO = ['#e2381b', '#0e1730', '#191714', '#0f8d67', '#2b62d4', '#ef7a1c', '#8a3a1d', '#191714', '#e2381b'];
export function DymoWall({ awards, lang }) {
  const zh = lang === 'zh';
  return <div className="dymo-wall">
    {awards.map((a, i) => <article key={a.title} className="dymo-card rv" style={{ '--tilt': `${((i * 53) % 7 - 3) * .45}deg`, '--dc': DYMO[i % DYMO.length] }}>
      <span className="dymo-card__no">{String(i + 1).padStart(2, '0')}</span>
      <p className="dymo"><span>{(zh ? a.resultZh : a.result)}</span></p>
      <h3>{zh ? a.titleZh : a.title}</h3>
      <p className="dymo-card__blurb">{zh ? a.blurbZh : a.blurb}</p>
    </article>)}
  </div>;
}
