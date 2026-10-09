import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/noto-sans-sc/wght.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/vt323/400.css';
import './cassette.css';
import { MetricsProvider } from './live-data.jsx';
import { MotionProvider, useMotion } from './motion.jsx';
import { Icon, linkIcon } from './icons.jsx';
import { BootScreen } from './boot.jsx';
import { MissionHero } from './hero.jsx';
import { Journey, PaperArcade, PaperCard, MissionMonitor, InfernuxLinks, RackUnit, TapeShelf, DymoWall } from './sections.jsx';
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
        <Masthead lang={lang} page={page} theme={theme}
          toggleLang={() => setLang(lang === 'en' ? 'zh' : 'en')}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="main">
          <div key={page} className="page">
            {page === 'home' ? <Home lang={lang} booted={booted} theme={theme} /> : <ArchivePage lang={lang} page={page} />}
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
      <div className="counter" title={lang === 'zh' ? '计数器 · 阅读进度' : 'Counter · reading progress'}><span>CNT</span><b ref={counter}>000</b></div>
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
function Home({ lang, booted, theme }) {
  useReveal(lang);
  return <>
    <MissionHero lang={lang} booted={booted} theme={theme} />
    <Section id="experience" index="01" eyebrow={['Journey', '经历']} title={['Personal journey', '个人经历']} lede={['Learning, research, and the things I build along the way.', '学习、研究，以及将想法做出来的过程。']} lang={lang}>
      <Journey lang={lang} />
    </Section>
    <Section id="papers" index="02" eyebrow={['Research', '研究']} title={['Selected publications', '代表论文']} lede={['AI agents, vision-language models, language-model reasoning, and real-time rendering. Each paper comes with a small voxel diagram of its core idea.', 'AI 智能体、视觉语言模型、大语言模型推理与实时渲染。每篇论文配一段讲它核心想法的体素示意动画。']} lang={lang} alt wide>
      <PaperArcade lang={lang} />
      <InternalLink className="more" href="/papers.html"><T en="All publications" zh="全部论文" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="infernux" index="03" eyebrow={['Featured engine', '主打项目']} title={['Infernux', 'Infernux']} lede={[infernux.headline, infernux.headlineZh]} lang={lang} wide>
      <p className="intro rv"><T en={infernux.introduction} zh={infernux.introductionZh} lang={lang} /></p>
      <MissionMonitor lang={lang} />
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

function Section({ id, index, eyebrow, title, lede, lang, alt, wide, children }) {
  const zh = lang === 'zh';
  return <section className={`sec ${alt ? 'sec--alt' : ''} ${wide ? 'sec--wide' : ''}`} id={id}>
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

/* ------------------------------------------------------------------
   archive pages
   ------------------------------------------------------------------ */
function ArchivePage({ page, lang }) {
  const zh = lang === 'zh';
  const [filter, setFilter] = useState('all');
  useReveal(`${page}-${filter}-${lang}`);
  const config = {
    papers: { eyebrow: ['Publication archive', '论文档案'], title: ['Publications', '论文'], intro: ['Research in AI agents, computer graphics, visual understanding and language-model reasoning.', 'AI 智能体、计算机图形学、视觉理解与语言模型推理相关研究。'], count: publications.length, code: 'LC/02' },
    projects: { eyebrow: ['Project archive', '项目档案'], title: ['Systems & tools', '系统与工具'], intro: ['Open-source projects I build and contribute to.', '我开发和参与的开源项目。'], count: projects.length, code: 'LC/04' },
    games: { eyebrow: ['Games', '游戏'], title: ['Portfolio', '作品集'], intro: ['Game projects and demos.', '游戏项目与演示。'], count: games.length, code: 'LC/05' },
    awards: { eyebrow: ['Awards', '荣誉'], title: ['Honors', '奖项'], intro: ['Selected competition results.', '部分竞赛与评选结果。'], count: awards.length, code: 'LC/06' }
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
