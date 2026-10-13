import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/source-serif-4/opsz.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './style.css';
import { MetricsProvider } from './live-data.jsx';
import { MotionProvider, useMotion } from './motion.jsx';
import { Icon, linkIcon } from './icons.jsx';
import { MissionHero } from './hero.jsx';
import { Journey, PaperArcade, PaperCard, MissionMonitor, InfernuxLinks, RackUnit, GameDeck, AwardWall } from './sections.jsx';
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
  /* a small targeting reticle wherever a control is pressed */
  useEffect(() => {
    const onDown = e => {
      if (e.button !== 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!e.target.closest?.('a, button, [role="tab"]')) return;
      const s = document.createElement('span');
      s.className = 'ping'; s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 700);
    };
    addEventListener('pointerdown', onDown);
    return () => removeEventListener('pointerdown', onDown);
  }, []);

  return <NavigationContext.Provider value={navigate}>
    <MotionProvider><MetricsProvider>
      <div className={`app app--${page}`}>
        <Masthead lang={lang} page={page} theme={theme}
          toggleLang={() => setLang(lang === 'en' ? 'zh' : 'en')}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="main">
          <div key={page} className="page">
            {page === 'home' ? <Home lang={lang} theme={theme} /> : <ArchivePage lang={lang} page={page} />}
          </div>
        </main>
      </div>
    </MetricsProvider></MotionProvider>
  </NavigationContext.Provider>;
}

/* ------------------------------------------------------------------
   masthead
   ------------------------------------------------------------------ */
function Patch() {
  return <svg className="patch" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-24 16 16)" opacity=".55" />
    <circle cx="16" cy="16" r="5.2" fill="currentColor" />
    <circle cx="27.4" cy="11" r="2" fill="var(--red)" />
  </svg>;
}

function Masthead({ lang, page, toggleLang, toggleTheme, theme }) {
  const nav = [['home', '/', 'Home', '主页'], ['papers', '/papers.html', 'Papers', '论文'], ['projects', '/projects.html', 'Projects', '项目'], ['games', '/games.html', 'Games', '游戏'], ['awards', '/awards.html', 'Awards', '荣誉']];
  const [paper, setPaper] = useState(false);
  const counter = useRef(null), bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, scrollY / max);
      if (counter.current) counter.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setPaper(scrollY > 8);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); update();
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [page]);
  return <header className={`nav ${paper ? 'is-paper' : ''}`}>
    <InternalLink className="nav__brand" href="/">
      <Patch />
      <span><strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
        <small><T en="Graphics & vision-model engineer" zh="图形学与视觉大模型工程师" lang={lang} /></small></span>
    </InternalLink>
    <nav className="nav__links" aria-label="Main navigation">
      {nav.map(([id, href, en, zh]) => <InternalLink key={id} className={page === id ? 'is-active' : ''} href={href} aria-current={page === id ? 'page' : undefined}>
        <T en={en} zh={zh} lang={lang} /></InternalLink>)}
    </nav>
    <div className="nav__tools">
      <span className="nav__met" title={lang === 'zh' ? '阅读进度' : 'Reading progress'}>T+<b ref={counter}>000</b></span>
      <button type="button" className="icon-btn icon-btn--txt" onClick={toggleLang} aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}>{lang === 'zh' ? 'EN' : '中'}</button>
      <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
    </div>
    <div className="nav__progress" aria-hidden="true"><i ref={bar} /></div>
  </header>;
}

/* ------------------------------------------------------------------
   home
   ------------------------------------------------------------------ */
function Home({ lang, theme }) {
  useReveal(lang);
  return <>
    <MissionHero lang={lang} theme={theme} />
    <Section id="experience" index="01" eyebrow={['Journey', '经历']} title={['Personal journey', '个人经历']} lede={['Learning, research, and the things I build along the way.', '学习、研究，以及将想法做出来的过程。']} lang={lang}>
      <Journey lang={lang} />
    </Section>
    <Section id="papers" index="02" eyebrow={['Research', '研究']} title={['Selected publications', '代表论文']} lede={['AI agents, vision-language models, language-model reasoning, and real-time rendering.', 'AI 智能体、视觉语言模型、大语言模型推理与实时渲染。']} lang={lang} alt>
      <PaperArcade lang={lang} />
      <InternalLink className="more" href="/papers.html"><T en="All publications" zh="全部论文" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="infernux" index="03" eyebrow={['Featured engine', '主打项目']} title={['Infernux', 'Infernux']} lede={[infernux.headline, infernux.headlineZh]} lang={lang}>
      <p className="lead lead--sub rv"><T en={infernux.introduction} zh={infernux.introductionZh} lang={lang} /></p>
      <MissionMonitor lang={lang} />
      <InfernuxLinks lang={lang} />
    </Section>
    <Section id="projects" index="04" eyebrow={['Projects', '项目']} title={['Software', '软件项目']} lede={['Open-source projects I build and contribute to.', '我开发和参与的开源项目。']} lang={lang} alt>
      <div className="projs">{projects.filter(p => p.featured).map((p, i) => <RackUnit key={p.name} project={p} index={i} lang={lang} />)}</div>
      <InternalLink className="more" href="/projects.html"><T en="All projects" zh="全部项目" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="games" index="05" eyebrow={['Games', '游戏']} title={['Game work', '游戏作品']} lede={['Making games is my purest hobby.', '做游戏是我最纯粹的爱好。']} lang={lang}>
      <GameDeck games={orderedGames()} lang={lang} />
      <InternalLink className="more" href="/games.html"><T en="All games" zh="全部游戏" lang={lang} /><Icon name="arrow" /></InternalLink>
    </Section>
    <Section id="honors" index="06" eyebrow={['Awards', '荣誉']} title={['Honors', '奖项']} lede={['Some milestones from building, competing and working with wonderful teammates.', '和伙伴们一起做作品、参加比赛，留下的一些纪念。']} lang={lang} alt>
      <AwardWall awards={awards} lang={lang} />
    </Section>
    <Footer lang={lang} />
  </>;
}
const orderedGames = () => [games.find(g => g.name === 'Dong! Da-Dong!'), ...games.filter(g => g.name !== 'Dong! Da-Dong!')];

function Section({ id, index, eyebrow, title, lede, lang, alt, children }) {
  const zh = lang === 'zh';
  return <section className={`section ${alt ? 'section--alt' : ''}`} id={id}>
    <aside className="section__side" aria-hidden="true">
      <b className="sidx">{index}</b>
      <span className="sname">{zh ? eyebrow[1] : eyebrow[0]}</span>
      <span className="scode">LC/{index}</span>
      <i className="stripe" />
      <span className="scode scode--sht">SHT {index} / 06</span>
      <i className="barcode" />
    </aside>
    <div className="section__main">
      <header className="section__head rv">
        <p className="eyebrow eyebrow--sec"><span className="code">§{index}</span>{zh ? eyebrow[1] : eyebrow[0]}</p>
        <h2 className="h2">{zh ? title[1] : title[0]}</h2>
        <p className="lead">{zh ? lede[1] : lede[0]}</p>
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
  const group = p => /skillforge|compact-bench/.test(p.image) ? 'agents' : /infernux|spatial-learning|3d-pose|fi-gs|words-to-worlds|npr-manga|lightweight-3d/.test(p.image) ? 'graphics' : /promptcd|corrdetail|innate-reasoning|graph-descriptive|pis|fema|vit-tcm/.test(p.image) ? 'vision' : 'other';
  const cats = [['all', '全部', 'All'], ['agents', '智能体与强化学习', 'Agents & RL'], ['graphics', '图形与三维', 'Graphics & 3D'], ['vision', '视觉与语言', 'Vision & language'], ['other', '其他研究', 'Other research']];
  const papers = filter === 'all' ? publications : publications.filter(p => group(p) === filter);
  return <>
    <header className="arch">
      <div className="arch__label">
        <p className="eyebrow eyebrow--sec"><span className="code">{config.code}</span>{zh ? config.eyebrow[1] : config.eyebrow[0]}</p>
        <h1 className="h1">{zh ? config.title[1] : config.title[0]}</h1>
        <p className="lead">{zh ? config.intro[1] : config.intro[0]}</p>
      </div>
      <div className="arch__count"><span>{zh ? '条目' : 'Entries'}</span><b>{String(config.count).padStart(2, '0')}</b><i className="stripe" /></div>
    </header>
    <div className="arch__body">
      {page === 'papers' && <>
        <div className="seg-ctl" role="group" aria-label={zh ? '研究方向' : 'Research areas'}>
          {cats.map(([id, z, e]) => <button key={id} type="button" aria-pressed={filter === id} className={filter === id ? 'is-on' : ''} onClick={() => setFilter(id)}>
            {zh ? z : e}<small>{id === 'all' ? publications.length : publications.filter(p => group(p) === id).length}</small></button>)}
        </div>
        <div className="pgrid">{papers.map((p, i) => <PaperCard key={p.title} paper={p} index={i} lang={lang} />)}</div>
      </>}
      {page === 'projects' && <div className="projs">{projects.map((p, i) => <RackUnit key={p.name} project={p} index={i} lang={lang} />)}</div>}
      {page === 'games' && <GameDeck games={orderedGames()} lang={lang} />}
      {page === 'awards' && <AwardWall awards={awards} lang={lang} />}
    </div>
    <Footer lang={lang} />
  </>;
}

function MissionClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="foot__clock"><i className="led on" />UTC {now.toISOString().slice(11, 19)}</span>;
}

function Footer({ lang }) {
  return <footer className="foot">
    <div className="foot__bar" aria-hidden="true"><i className="stripe stripe--wide" /><i className="hazard" /></div>
    <div className="foot__in">
      <div>
        <strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
        <p><T en="Bridging virtual worlds and physical reality." zh="连接虚拟世界与物理现实。" lang={lang} /></p>
        <small>© {new Date().getFullYear()} · LC-01 · <T en="End of transmission" zh="通讯结束" lang={lang} /> · <MissionClock /></small>
      </div>
      <div className="foot__links">{profile.links.map(l => <a key={l.label} href={l.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(l.label)} />{l.label}</a>)}</div>
    </div>
  </footer>;
}

const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Shell />);
