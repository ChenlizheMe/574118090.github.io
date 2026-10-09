import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/vt323/400.css';
import '@fontsource/special-elite/400.css';
import './cassette.css';
import { MetricsProvider, useMetrics, AnimatedNumber } from './live-data.jsx';
import { MotionProvider, useMotion } from './motion.jsx';
import { Icon, linkIcon } from './icons.jsx';
import { BootScreen } from './boot.jsx';
import { Journey, PaperTerminal, PaperCard, TVDeck, InfernuxLinks, RackUnit, TapeShelf, DymoWall } from './sections.jsx';
import { awards, games, infernux, profile, projects, publications } from './content.js';

const NavigationContext = createContext(null);
const SPA_HREFS = new Set(['/', '/index.html', '/papers.html', '/projects.html', '/games.html', '/awards.html']);

function pageFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path.endsWith('/papers.html') || path === '/papers') return 'papers';
  if (path.endsWith('/projects.html') || path === '/projects') return 'projects';
  if (path.endsWith('/games.html') || path === '/games') return 'games';
  if (path.endsWith('/awards.html') || path === '/awards') return 'awards';
  return 'home';
}
function isClientNavigable(href) {
  if (!href || /^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) return false;
  const pathPart = href.split('#')[0];
  if (!pathPart || !pathPart.startsWith('/')) return false;
  let path = pathPart.replace(/\/+$/, '') || '/';
  if (path === '/index.html') path = '/';
  return SPA_HREFS.has(path);
}
function InternalLink({ href, children, ...rest }) {
  const navigate = useContext(NavigationContext);
  if (!isClientNavigable(href)) return <a href={href} {...rest}>{children}</a>;
  return <a href={href} {...rest} onClick={e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); navigate?.(href);
  }}>{children}</a>;
}

const DOC_TITLES = {
  home: 'Lizhe Chen | Research & Creative Work',
  papers: 'Publications | Lizhe Chen',
  projects: 'Projects | Lizhe Chen',
  games: 'Games | Lizhe Chen',
  awards: 'Awards | Lizhe Chen'
};

function usePreference(key, fallback) {
  const [value, setValue] = useState(() => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } });
  useEffect(() => {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
    document.documentElement.dataset[key] = value;
    if (key === 'lang') document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en';
  }, [key, value]);
  return [value, setValue];
}
const T = ({ en, zh, lang }) => (lang === 'zh' ? zh || en : en);

/* reveal-on-scroll for every .rv element on the current page */
function useReveal(dep) {
  const { paused } = useMotion();
  useEffect(() => {
    const nodes = [...document.querySelectorAll('.rv:not(.in)')];
    if (paused || !('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach((n, i) => { n.style.setProperty('--rd', `${(i % 3) * 70}ms`); io.observe(n); });
    return () => io.disconnect();
  }, [dep, paused]);
}

function Shell() {
  const [lang, setLang] = usePreference('lang', 'en');
  const [theme, setTheme] = usePreference('theme', 'light');
  const [page, setPage] = useState(pageFromPath);
  const [booted, setBooted] = useState(() => { try { return sessionStorage.getItem('lc-booted') === '1'; } catch { return true; } });

  const navigate = useCallback(href => {
    window.history.pushState(null, '', href);
    setPage(pageFromPath());
    const hash = href.split('#')[1];
    requestAnimationFrame(() => { if (hash) document.getElementById(hash)?.scrollIntoView(); else window.scrollTo(0, 0); });
  }, []);
  useEffect(() => {
    const onPop = () => setPage(pageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => { document.title = DOC_TITLES[page] || DOC_TITLES.home; }, [page]);

  return <NavigationContext.Provider value={navigate}>
    <MotionProvider><MetricsProvider>
      {!booted && <BootScreen onDone={() => setBooted(true)} />}
      <div className={`app app--${page}`}>
        <div className="grain" aria-hidden="true" />
        <Masthead lang={lang} page={page} theme={theme}
          toggleLang={() => setLang(lang === 'en' ? 'zh' : 'en')}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="main">
          <div key={page} className="page">
            {page === 'home' ? <Home lang={lang} booted={booted} /> : <ArchivePage lang={lang} page={page} />}
          </div>
        </main>
      </div>
    </MetricsProvider></MotionProvider>
  </NavigationContext.Provider>;
}

/* ------------------------------------------------------------------
   masthead
   ------------------------------------------------------------------ */
function TapeMark() {
  return <svg className="tapemark" viewBox="0 0 34 24" aria-hidden="true">
    <rect x="1" y="1" width="32" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="4" y="16" width="26" height="1.8" fill="var(--yellow)" /><rect x="4" y="17.8" width="26" height="1.8" fill="var(--red)" />
    <rect x="9" y="6" width="16" height="7" rx="3.5" fill="currentColor" />
    <g className="spin"><circle cx="12.5" cy="9.5" r="2.2" fill="var(--amber)" /></g>
    <g className="spin"><circle cx="21.5" cy="9.5" r="1.5" fill="var(--amber)" /></g>
  </svg>;
}

function Masthead({ lang, page, toggleLang, toggleTheme, theme }) {
  const nav = [['home', '/', 'Home', '主页'], ['papers', '/papers.html', 'Papers', '论文'], ['projects', '/projects.html', 'Projects', '项目'], ['games', '/games.html', 'Games', '游戏'], ['awards', '/awards.html', 'Awards', '荣誉']];
  const [onHero, setOnHero] = useState(page === 'home');
  const counter = useRef(null), bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, scrollY / max);
      if (counter.current) counter.current.textContent = String(Math.round(p * 999)).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setOnHero(page === 'home' && scrollY < innerHeight - 80);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); update();
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [page]);
  return <header className={`mast ${onHero ? 'mast--hero' : ''}`}>
    <InternalLink className="mast__brand" href="/">
      <TapeMark />
      <span><strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
        <small><T en="A graphics & large vision-model engineer" zh="一个图形学与视觉大模型工程师" lang={lang} /></small></span>
    </InternalLink>
    <nav className="mast__nav" aria-label="Main navigation">
      {nav.map(([id, href, en, zh]) => <InternalLink key={id} className={page === id ? 'is-active' : ''} href={href} aria-current={page === id ? 'page' : undefined}>
        <T en={en} zh={zh} lang={lang} /></InternalLink>)}
    </nav>
    <div className="mast__tools">
      <div className="counter" title={lang === 'zh' ? '磁带计数器 · 阅读进度' : 'Tape counter · reading progress'}><span>TAPE</span><b ref={counter}>000</b></div>
      <button type="button" className="toggle" onClick={toggleLang} aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
        <span className={lang === 'en' ? 'is-on' : ''}>EN</span><span className={lang === 'zh' ? 'is-on' : ''}>中</span></button>
      <button type="button" className="toggle toggle--icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
    </div>
    <div className="mast__progress" aria-hidden="true"><i ref={bar} /></div>
  </header>;
}

/* ------------------------------------------------------------------
   home
   ------------------------------------------------------------------ */
function Home({ lang, booted }) {
  useReveal(lang);
  return <>
    <Hero lang={lang} booted={booted} />
    <Section id="experience" index="01" eyebrow={['Side A / Side B', 'A 面 / B 面']} title={['Personal journey', '个人经历']} lede={['Learning, research, and the things I build along the way.', '学习、研究，以及将想法做出来的过程。']} lang={lang}>
      <Journey lang={lang} />
    </Section>
    <Section id="papers" index="02" eyebrow={['Papers', '论文']} title={['Selected publications', '代表论文']} lede={['AI agents, vision-language models, language-model reasoning, and real-time rendering.', 'AI 智能体、视觉语言模型、大语言模型推理与实时渲染。']} lang={lang} alt>
      <PaperTerminal lang={lang} />
      <InternalLink className="more" href="/papers.html"><T en="All publications" zh="全部论文" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="infernux" index="03" eyebrow={['Featured engine', '主打项目']} title={['Infernux', 'Infernux']} lede={[infernux.headline, infernux.headlineZh]} lang={lang}>
      <p className="intro rv"><T en={infernux.introduction} zh={infernux.introductionZh} lang={lang} /></p>
      <TVDeck lang={lang} />
      <InfernuxLinks lang={lang} />
    </Section>
    <Section id="projects" index="04" eyebrow={['Projects', '项目']} title={['Software', '软件项目']} lede={['Open-source projects I build and contribute to.', '我开发和参与的开源项目。']} lang={lang} alt>
      <div className="racks">{projects.filter(p => p.featured).map((p, i) => <RackUnit key={p.name} project={p} index={i} lang={lang} />)}</div>
      <InternalLink className="more" href="/projects.html"><T en="All projects" zh="全部项目" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="games" index="05" eyebrow={['Games', '游戏']} title={['Game work', '游戏作品']} lede={['Making games is my purest hobby.', '做游戏是我最纯粹的爱好。']} lang={lang}>
      <TapeShelf games={orderedGames()} lang={lang} />
      <InternalLink className="more" href="/games.html"><T en="All games" zh="全部游戏" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="honors" index="06" eyebrow={['Awards', '荣誉']} title={['Honors', '奖项']} lede={['Some milestones from building, competing and working with wonderful teammates.', '和伙伴们一起做作品、参加比赛，留下的一些纪念。']} lang={lang} alt>
      <DymoWall awards={awards} lang={lang} />
    </Section>
    <Footer lang={lang} />
  </>;
}
const orderedGames = () => [games.find(g => g.name === 'Dong! Da-Dong!'), ...games.filter(g => g.name !== 'Dong! Da-Dong!')];

function Section({ id, index, eyebrow, title, lede, lang, alt, children }) {
  const zh = lang === 'zh';
  return <section className={`sec ${alt ? 'sec--alt' : ''}`} id={id}>
    <aside className="sec__side" aria-hidden="true">
      <b className="sec__idx">{index}</b>
      <span className="sec__eyebrow">{zh ? eyebrow[1] : eyebrow[0]}</span>
      <span className="sec__reel"><i /><i /></span>
    </aside>
    <div className="sec__main">
      <header className="sec__head rv">
        <p className="eyebrow"><span>§{index}</span>{zh ? eyebrow[1] : eyebrow[0]}</p>
        <h2>{zh ? title[1] : title[0]}<i className="dot" /></h2>
        <p className="lede">{zh ? lede[1] : lede[0]}</p>
      </header>
      {children}
    </div>
  </section>;
}

function CopyableContact({ label, value, lang }) {
  const [state, setState] = useState('idle');
  useEffect(() => { if (state === 'idle') return; const t = setTimeout(() => setState('idle'), 2200); return () => clearTimeout(t); }, [state]);
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement('textarea'); input.value = value; input.style.position = 'fixed'; input.style.opacity = '0';
        document.body.appendChild(input); input.select(); const ok = document.execCommand('copy'); input.remove(); if (!ok) throw new Error('copy');
      }
      setState('copied');
    } catch { setState('failed'); }
  };
  const status = state === 'copied' ? (lang === 'zh' ? '已复制' : 'Copied') : state === 'failed' ? (lang === 'zh' ? '复制失败' : 'Copy failed') : '';
  return <div className="contact">
    <span className="contact__label">{label}</span>
    <button type="button" className="contact__value" onClick={copy} aria-label={`${lang === 'zh' ? '复制' : 'Copy'} ${label}: ${value}`} title={lang === 'zh' ? '点击复制' : 'Click to copy'}>
      <span>{value}</span><Icon name={state === 'copied' ? 'check' : 'copy'} /></button>
    <span className="contact__status" role="status">{status}</span>
  </div>;
}

function Hero({ lang, booted }) {
  const zh = lang === 'zh';
  const { paused } = useMotion();
  const metrics = useMetrics();
  const host = useRef(null), canvas = useRef(null), tag = useRef(null), api = useRef(null);
  const [mode, setMode] = useState('HOLO');
  const [tapes, setTapes] = useState(14);
  const [gl, setGl] = useState(true);
  const bootedRef = useRef(booted);
  bootedRef.current = booted;

  useEffect(() => {
    let dead = false;
    import('./tape-hero.js').then(({ mountTapeHero }) => {
      if (dead) return;
      const a = mountTapeHero({ canvas: canvas.current, host: host.current, tagEl: tag.current, reduced: paused, onMode: setMode, onCount: setTapes });
      if (!a) { setGl(false); return; }
      api.current = a;
      if (bootedRef.current) a.start();
    }).catch(() => setGl(false));
    return () => { dead = true; api.current?.dispose(); api.current = null; };
  }, [paused]);
  useEffect(() => { if (booted) api.current?.start(); }, [booted]);

  return <section className={`hero ${gl ? '' : 'hero--nogl'} ${booted ? 'is-booted' : ''}`} ref={host}>
    <canvas className="hero__gl" ref={canvas} aria-label={zh ? '一堆磁带，其中一盘投影出 Stanford Bunny 全息影像' : 'A pile of cassettes; one projects a holographic Stanford Bunny'} />
    <div className="hero__fallback" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div>
    <div className="hero__vign" aria-hidden="true" />
    <div className="holo-tag" ref={tag} aria-hidden="true"><b>HOLO-PROJ</b> STANFORD BUNNY · {mode}</div>

    <div className="hero__wrap">
      <div className="hero__copy">
        <p className="hero__rec"><i className="led led--rec" />REC · SIDE A · 2026<span className="hero__polaroid"><img src="/img/profile.webp" alt={zh ? '陈立哲' : 'Lizhe Chen'} /></span></p>
        <h1 className="hero__title">
          <span className="hero__hello"><T en="Hello, I’m" zh="你好，我是" lang={lang} /></span>
          <span className="hero__name" data-text={zh ? '陈立哲。' : 'Lizhe Chen.'}>{zh ? '陈立哲。' : 'Lizhe Chen.'}</span>
        </h1>
        <p className="hero__text"><T en="I love making things that people can play with. Lately, I’ve been spending my time on Agentic Runtime and imagining what the next generation of AI-native games and engines could be." zh="我喜欢把脑海里的想法，做成可以亲手玩到的东西。最近在折腾 Agentic Runtime，也想看看下一代 AI-native 游戏和游戏引擎会是什么样。" lang={lang} /></p>
        <p className="hero__text hero__text--dim"><T en="I’m a master’s student at Tsinghua University. Along the way, I do graphics and visual intelligence research, contribute to open source, and make indie games. Welcome to have a look around." zh="现在在清华读研，做一些图形学与视觉智能研究，也写开源项目、做独立游戏。欢迎来逛逛。" lang={lang} /></p>
        <div className="hero__contacts">
          <CopyableContact label={zh ? '邮箱' : 'Email'} value={profile.emails[0]} lang={lang} />
          <CopyableContact label={zh ? '微信' : 'WeChat'} value={profile.wechat} lang={lang} />
        </div>
        <div className="btn-row">
          <a className="btn btn--hot" href="#experience"><Icon name="down" /><T en="More about me" zh="了解更多" lang={lang} /></a>
          <a className="btn" href="/attaches/CV.pdf" target="_blank" rel="noreferrer"><Icon name="download" /><T en="Résumé" zh="个人简历" lang={lang} /></a>
          {profile.links.filter(l => ['GitHub', 'Google Scholar'].includes(l.label)).map(l => <a key={l.label} className="btn btn--ghost" href={l.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(l.label)} />{l.label}</a>)}
        </div>
      </div>
    </div>

    <div className="hero__deck">
      <div className="tm"><span>TAPES</span><b>{String(tapes).padStart(2, '0')}</b></div>
      <div className="tm"><span>{zh ? '论文' : 'PAPERS'}</span><b>{String(publications.length).padStart(2, '0')}</b></div>
      <div className="tm"><span>INFERNUX ★</span><b><AnimatedNumber value={metrics.github?.stars} lang={lang} /></b></div>
      <div className="tm"><span>{zh ? '投影' : 'PROJECTION'}</span><b className="tm__txt">STANFORD BUNNY · 16,301 △</b></div>
      <button type="button" className="tm tm--btn" onClick={() => api.current?.next()} disabled={!gl}>
        <span>{zh ? '模式 · 点击切换' : 'MODE · CLICK TO SWITCH'}</span>
        <b>{['HOLO', 'WIRE', 'POINTS'].map(m => <em key={m} className={m === mode ? 'is-on' : ''}>{m}</em>)}</b>
      </button>
    </div>
    <div className="hero__hint" aria-hidden="true">{zh ? '悬停磁带 · 点击弹出 · 点击投影切换模式' : 'HOVER A TAPE · CLICK TO EJECT · CLICK THE PROJECTION TO SWITCH'}</div>
  </section>;
}

/* ------------------------------------------------------------------
   archive pages
   ------------------------------------------------------------------ */
function ArchivePage({ page, lang }) {
  const zh = lang === 'zh';
  const [filter, setFilter] = useState('all');
  useReveal(`${page}-${filter}-${lang}`);
  const config = {
    papers: { eyebrow: ['Publication archive', '论文档案'], title: ['Publications', '论文'], intro: ['Research in AI agents, computer graphics, visual understanding and language-model reasoning.', 'AI 智能体、计算机图形学、视觉理解与语言模型推理相关研究。'], count: publications.length, code: 'PAPERS.TAP' },
    projects: { eyebrow: ['Project archive', '项目档案'], title: ['Systems & tools', '系统与工具'], intro: ['Open-source projects I build and contribute to.', '我开发和参与的开源项目。'], count: projects.length, code: 'SYSTEMS.TAP' },
    games: { eyebrow: ['Games', '游戏'], title: ['Portfolio', '作品集'], intro: ['Game projects and demos.', '游戏项目与演示。'], count: games.length, code: 'GAMES.VHS' },
    awards: { eyebrow: ['Awards', '荣誉'], title: ['Honors', '奖项'], intro: ['Selected competition results.', '部分竞赛与评选结果。'], count: awards.length, code: 'HONORS.TAP' }
  }[page];
  const group = p => /skillforge/.test(p.image) ? 'agents' : /infernux|spatial-learning|3d-pose|fi-gs|words-to-worlds|npr-manga|lightweight-3d/.test(p.image) ? 'graphics' : /promptcd|corrdetail|innate-reasoning|graph-descriptive|pis|fema|vit-tcm/.test(p.image) ? 'vision' : 'other';
  const cats = [['all', '全部', 'All'], ['agents', '智能体与强化学习', 'Agents & RL'], ['graphics', '图形与三维', 'Graphics & 3D'], ['vision', '视觉与语言', 'Vision & language'], ['other', '其他研究', 'Other research']];
  const papers = filter === 'all' ? publications : publications.filter(p => group(p) === filter);
  return <>
    <header className="arch">
      <div className="arch__label">
        <p className="eyebrow"><span>{config.code}</span>{zh ? config.eyebrow[1] : config.eyebrow[0]}</p>
        <h1>{zh ? config.title[1] : config.title[0]}<i className="dot" /></h1>
        <p className="lede">{zh ? config.intro[1] : config.intro[0]}</p>
      </div>
      <div className="arch__count"><span>{zh ? '条目' : 'ENTRIES'}</span><b>{String(config.count).padStart(3, '0')}</b><i className="arch__stripes" /></div>
    </header>
    <div className="arch__body">
      {page === 'papers' && <>
        <div className="keys" role="group" aria-label={zh ? '研究方向' : 'Research areas'}>
          {cats.map(([id, z, e]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            <i className="led" />{zh ? z : e}<small>{id === 'all' ? publications.length : publications.filter(p => group(p) === id).length}</small></button>)}
        </div>
        <div className="icards">{papers.map((p, i) => <PaperCard key={p.title} paper={p} index={i} lang={lang} />)}</div>
      </>}
      {page === 'projects' && <div className="racks">{projects.map((p, i) => <RackUnit key={p.name} project={p} index={i} lang={lang} />)}</div>}
      {page === 'games' && <TapeShelf games={orderedGames()} lang={lang} />}
      {page === 'awards' && <DymoWall awards={awards} lang={lang} />}
    </div>
    <Footer lang={lang} />
  </>;
}

function Footer({ lang }) {
  return <footer className="foot">
    <div className="foot__stripes" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="foot__in">
      <div>
        <strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
        <p>Bridging virtual worlds and physical reality.</p>
        <small>© {new Date().getFullYear()} · END OF SIDE B · <span className="blink">▮</span></small>
      </div>
      <div className="foot__links">{profile.links.map(l => <a key={l.label} href={l.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(l.label)} />{l.label}</a>)}</div>
    </div>
  </footer>;
}

const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Shell />);
