import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './dynamic.css';
import './flight.css';
import './constellation.css';
import { SpatialField, SpatialGlyph } from './spatial-field.jsx';
import { PublicationCard, ProjectViewport, GameTheater, HonorsGallery } from './content-experiences.jsx';
import './content-experiences.css';
import './finish.css';
import { ResearchExhibit } from './research-exhibit.jsx';
import { MetricsProvider, RepositoryStars } from './live-data.jsx';
import { MotionProvider, ScrollEffects } from './motion.jsx';
import { VideoDeck } from './video-deck.jsx';
import { ExperienceJourney } from './experience-journey.jsx';
import { Icon, linkIcon } from './icons.jsx';
import {
  awards,
  games,
  infernux,
  profile,
  projects,
  publications
} from './content.js';

const NavigationContext = createContext(null);

const SPA_HREFS = new Set(['/', '/index.html', '/papers.html', '/projects.html', '/games.html', '/awards.html']);

function normalizePathname() {
  let p = window.location.pathname.replace(/\/+$/, '');
  if (p === '') p = '/';
  return p;
}

function pageFromPath() {
  const path = normalizePathname();
  if (path.endsWith('/papers.html') || path === '/papers') return 'papers';
  if (path.endsWith('/projects.html') || path === '/projects') return 'projects';
  if (path.endsWith('/games.html') || path === '/games') return 'games';
  if (path.endsWith('/awards.html') || path === '/awards') return 'awards';
  if (path === '/' || path === '/index.html') return 'home';
  return 'home';
}

function isClientNavigable(href) {
  if (!href) return false;
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:')) return false;
  const pathPart = href.split('#')[0];
  if (pathPart === '' || pathPart === undefined) return false;
  if (!pathPart.startsWith('/')) return false;
  let path = pathPart.replace(/\/+$/, '') || '/';
  if (path === '/index.html') path = '/';
  return SPA_HREFS.has(path);
}

function InternalLink({ href, children, className, ...rest }) {
  const navigate = useContext(NavigationContext);
  if (!isClientNavigable(href)) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate?.(href);
      }}
    >
      {children}
    </a>
  );
}

const DOC_TITLES = {
  home: 'Lizhe Chen | Research & Creative Work',
  papers: 'Publications | Lizhe Chen',
  projects: 'Projects | Lizhe Chen',
  games: 'Games | Lizhe Chen',
  awards: 'Awards | Lizhe Chen'
};

function usePreference(key, fallback) {
  const [value, setValue] = useState(() => localStorage.getItem(key) || fallback);

  useEffect(() => {
    localStorage.setItem(key, value);
    document.documentElement.dataset[key] = value;
    if (key === 'lang') document.documentElement.lang = value;
  }, [key, value]);

  return [value, setValue];
}

function T({ en, zh, lang }) {
  return lang === 'zh' ? zh || en : en;
}

function Html({ value }) {
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
}

function Shell() {
  const [lang, setLang] = usePreference('lang', 'en');
  const [theme, setTheme] = usePreference('theme', 'light');
  const [page, setPage] = useState(() => pageFromPath());
  const isHome = page === 'home';

  const navigate = useCallback((href) => {
    window.history.pushState(null, '', href);
    setPage(pageFromPath());
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = () => setPage(pageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.title = DOC_TITLES[page] || DOC_TITLES.home;
  }, [page]);

  const toggleLang = () => setLang(lang === 'en' ? 'zh' : 'en');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <NavigationContext.Provider value={navigate}>
      <MetricsProvider><MotionProvider lang={lang}>
      <div className="app">
        <SpatialField/>
        <ScrollEffects page={page} />
        <Masthead lang={lang} page={page} toggleLang={toggleLang} toggleTheme={toggleTheme} theme={theme} />
        <main className="main">
          <div key={page} className="page-transition">
            {isHome ? <Home lang={lang} /> : <ArchivePage lang={lang} page={page} />}
          </div>
        </main>
      </div>
      </MotionProvider></MetricsProvider>
    </NavigationContext.Provider>
  );
}

function Masthead({ lang, page, toggleLang, toggleTheme, theme }) {
  const nav = [
    ['home', '/', 'Home', '主页'],
    ['papers', '/papers.html', 'Papers', '论文'],
    ['projects', '/projects.html', 'Projects', '项目'],
    ['games', '/games.html', 'Games', '游戏'],
    ['awards', '/awards.html', 'Awards', '荣誉']
  ];

  return (
    <header className="masthead">
      <InternalLink className="masthead__brand" href="/">
        <span className="masthead__mark">LC</span>
        <span>
          <strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
          <small><T en="A graphics & large vision-model engineer" zh="一个图形学与视觉大模型工程师" lang={lang} /></small>
        </span>
      </InternalLink>
      <nav className="masthead__nav" aria-label="Main navigation">
        {nav.map(([id, href, en, zh]) => (
          <InternalLink key={id} className={page === id ? 'is-active' : ''} href={href}>
            <T en={en} zh={zh} lang={lang} />
          </InternalLink>
        ))}
      </nav>
      <div className="masthead__actions">
        <button type="button" onClick={toggleLang}><Icon name="language"/>{lang === 'en' ? '中' : 'EN'}</button>
        <button type="button" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'}/>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </div>
    </header>
  );
}

function Home({ lang }) {
  return (
    <>
      <Hero lang={lang} />
      <ResearchAndCareer lang={lang} />
      <PublicationEvidence lang={lang} />
      <InfernuxFeature lang={lang} />
      <ProjectPreview lang={lang} />
      <GamePreview lang={lang} />
      <Honors lang={lang} />
      <Footer lang={lang} />
    </>
  );
}

function Hero({ lang }) {
  return (
    <section className="section hero">
      <div className="hero__primary">
        <h1 className="hero__title"><span className="hero__greeting"><T en="Hello, I’m" zh="你好，我是" lang={lang} /></span><T en="Lizhe Chen." zh="陈立哲。" lang={lang} /></h1>
        <p className="hero__text hero__current"><T en="I love making things that people can play with. Lately, I’ve been spending my time on Agentic Runtime and imagining what the next generation of AI-native games and engines could be." zh="我喜欢把脑海里的想法，做成可以亲手玩到的东西。最近在折腾 Agentic Runtime，也想看看下一代 AI-native 游戏和游戏引擎会是什么样。" lang={lang} /></p>
        <p className="hero__text hero__about"><T en="I’m a master’s student at Tsinghua University. Along the way, I do graphics and visual intelligence research, contribute to open source, and make indie games. Welcome to have a look around." zh="现在在清华读研，做一些图形学与视觉智能研究，也写开源项目、做独立游戏。欢迎来逛逛。" lang={lang} /></p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#experience"><Icon name="down"/><T en="More about me" zh="了解更多" lang={lang} /></a>
          <a className="btn btn--quiet" href="/attaches/CV.pdf" target="_blank" rel="noreferrer"><Icon name="download"/><T en="Résumé" zh="个人简历" lang={lang} /></a>
        </div>
        <div className="hero__socials">{profile.links.filter(l => ['GitHub', 'Google Scholar'].includes(l.label)).map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(link.label)}/>{link.label}</a>)}<a href={`mailto:${profile.emails[0]}`}><Icon name="mail"/>Email</a></div>
      </div>
      <aside className="hero__aside">
        <div className="portrait-panel"><div className="portrait-register"><span>LIZHE CHEN</span><span>陈立哲</span></div><div className="portrait-stage"><SpatialGlyph/><div className="profile-display"><img src="/img/profile.webp" alt="Lizhe Chen" /></div></div><div className="portrait-footer"><span>GRAPHICS / VLM</span><i aria-hidden="true"/></div></div>
      </aside>
    </section>
  );
}

function ResearchAndCareer({ lang }) {
  return <section className="section career-section" id="experience">
    <header className="section__head"><span className="section__id">01</span><div><h2 className="section__title"><T en="Personal journey" zh="个人经历" lang={lang} /></h2></div><p className="section__lede"><T en="Learning, research, and the things I build along the way." zh="学习、研究，以及将想法做出来的过程。" lang={lang} /></p></header>
    <ExperienceJourney lang={lang} />
  </section>;
}

function InfernuxFeature({ lang }) {
  return <section className="section feature" id="infernux">
    <header className="section__head"><span className="section__id">03</span><div><h2 className="section__title">Infernux</h2></div><p className="section__lede"><T en={infernux.headline} zh={infernux.headlineZh} lang={lang}/></p></header>
    <VideoDeck lang={lang}/>
    <div className="link-row feature-links"><a className="btn btn--primary" href={infernux.website} target="_blank" rel="noreferrer"><Icon name="globe"/><T en="Visit Infernux" zh="进入引擎官网" lang={lang}/><Icon name="external"/></a><a className="btn btn--quiet" href={infernux.url} target="_blank" rel="noreferrer"><Icon name="github"/>GitHub</a><RepositoryStars lang={lang}/></div>
  </section>;
}

function PublicationEvidence({ lang }) {
  return (
    <section className="section">
      <header className="section__head">
        <span className="section__id">02</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Papers" zh="论文" lang={lang} /></p>
          <h2 className="section__title"><T en="Selected publications" zh="代表论文" lang={lang} /></h2>
        </div>
        <p className="section__lede">
          <T
            en="Vision-language models, reasoning with large language models, and real-time rendering."
            zh="视觉语言模型、大语言模型推理与实时渲染。"
            lang={lang}
          />
        </p>
      </header>
      <ResearchExhibit lang={lang}/>
      <InternalLink className="text-link" href="/papers.html"><T en="All publications" zh="全部论文" lang={lang} /></InternalLink>
    </section>
  );
}

function ProjectPreview({ lang }) {
  return (
    <section className="section">
      <header className="section__head">
        <span className="section__id">04</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Projects" zh="项目" lang={lang} /></p>
          <h2 className="section__title"><T en="Software" zh="软件项目" lang={lang} /></h2>
        </div>
        <p className="section__lede">
          <T
            en="Open-source projects I build and contribute to."
            zh="我开发和参与的开源项目。"
            lang={lang}
          />
        </p>
      </header>
      <div className="project-grid">
        {projects.filter((p) => p.featured).map((project) => <ProjectCard key={project.name} project={project} lang={lang} />)}
      </div>
      <InternalLink className="text-link" href="/projects.html"><T en="All projects" zh="全部项目" lang={lang} /></InternalLink>
    </section>
  );
}

function GamePreview({ lang }) {
  return (
    <section className="section">
      <header className="section__head">
        <span className="section__id">05</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Games" zh="游戏" lang={lang} /></p>
          <h2 className="section__title"><T en="Game work" zh="游戏作品" lang={lang} /></h2>
        </div>
        <p className="section__lede">
          <T en="Making games is my purest hobby." zh="做游戏是我最纯粹的爱好。" lang={lang} />
        </p>
      </header>
      <GameTheater games={[games.find(g=>g.name==='Dong! Da-Dong!'),...games.filter(g=>g.name!=='Dong! Da-Dong!')]} lang={lang}/>
      <InternalLink className="text-link" href="/games.html"><T en="All games" zh="全部游戏" lang={lang} /></InternalLink>
    </section>
  );
}

function Honors({ lang }) {
  return (
    <section className="section">
      <header className="section__head section__head--stack">
        <span className="section__id">06</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Awards" zh="荣誉" lang={lang} /></p>
          <h2 className="section__title"><T en="Honors" zh="奖项" lang={lang} /></h2>
        </div>
        <p className="section__lede section__lede--narrow">
          <T
            en="Some milestones from building, competing and working with wonderful teammates."
            zh="和伙伴们一起做作品、参加比赛，留下的一些纪念。"
            lang={lang}
          />
        </p>
      </header>
      <HonorsGallery awards={awards} lang={lang}/>
    </section>
  );
}

function ProjectCard({ project, lang }) {
  return (
    <article className="project-card">
      <PanelRegister label={project.name} index={project.name === 'Infernux' ? '01' : '02'} icon="github"/>
      <div className="project-layout">
      <ProjectViewport project={project} lang={lang}/>
      <div className="project-card__body">
        <span className="badge">{lang === 'zh' ? project.statusZh : project.status}</span>
        <h3><a href={project.url} target="_blank" rel="noreferrer">{project.name}</a></h3>
        <p className="project-card__summary"><T en={project.desc} zh={project.descZh} lang={lang} /></p>
        {project.detail && (
          <p className="project-card__detail">
            <Html value={lang === 'zh' ? (project.detailZh || project.detail) : project.detail} />
          </p>
        )}
        <strong><T en={project.role} zh={project.roleZh} lang={lang} /></strong>
        <TagRow tags={project.tags} />
        <a className="detail-link project-source" href={project.url} target="_blank" rel="noreferrer"><Icon name="github"/>{lang==='zh'?'查看项目':'Explore project'}<Icon name="external"/></a>
      </div>
      </div>
    </article>
  );
}

function TagRow({ tags }) {
  return (
    <div className="tag-row">
      {tags.map((tag) => <span key={tag}>{tag}</span>)}
    </div>
  );
}

function PanelRegister({ label, index, icon }) {
  return <div className="panel-register"><span><Icon name={icon}/>{label}</span><span>{index}</span></div>;
}

function ArchivePage({ page, lang }) {
  const [filter, setFilter] = useState('all');
  const config = {
    papers: {
      eyebrow: 'Publication archive',
      eyebrowZh: '论文档案',
      title: 'Publications',
      titleZh: '论文',
      intro: 'Research in computer graphics, visual understanding and language-model reasoning.',
      introZh: '计算机图形学、视觉理解与语言模型推理相关研究。',
      items: publications,

    },
    projects: {
      eyebrow: 'Project archive',
      eyebrowZh: '项目档案',
      title: 'Systems & tools',
      titleZh: '系统与工具',
      intro: 'Open-source projects I build and contribute to.',
      introZh: '我开发和参与的开源项目。',
      items: projects,
      render: (item) => <ProjectCard key={item.name} project={item} lang={lang} />
    },
    games: {
      eyebrow: 'Games',
      eyebrowZh: '游戏',
      title: 'Portfolio',
      titleZh: '作品集',
      intro: 'Game projects and demos.',
      introZh: '游戏项目与演示。',
      items: games,
    },
    awards: {
      eyebrow: 'Awards',
      eyebrowZh: '荣誉',
      title: 'Honors',
      titleZh: '奖项',
      intro: 'Selected competition results.',
      introZh: '部分竞赛与评选结果。',
      items: awards,

    }
  }[page];

  const paperGroup = paper => /infernux|spatial-learning|3d-pose|fi-gs|words-to-worlds|npr-manga|lightweight-3d/.test(paper.image) ? 'graphics' : /promptcd|corrdetail|innate-reasoning|graph-descriptive|pis|fema|vit-tcm/.test(paper.image) ? 'vision' : 'other';
  const categories = [['all','全部','All'],['graphics','图形与三维','Graphics & 3D'],['vision','视觉与语言','Vision & language'],['other','其他研究','Other research']];
  const visibleItems = page==='papers' && filter!=='all' ? config.items.filter(p=>paperGroup(p)===filter) : config.items;


  return (
    <>
      <h1 className="visually-hidden">{lang==='zh'?config.titleZh:config.title}</h1>
      {page==='papers' && <div className="archive-filters" aria-label={lang==='zh'?'研究方向':'Research areas'}>{categories.map(([id,zh,en])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{lang==='zh'?zh:en}</button>)}</div>}
      <section className={['games','awards'].includes(page)?`content-archive content-archive--${page}`:`archive-list ${page} archive-content`}>
        {page==='papers' ? visibleItems.map(p=><PublicationCard key={p.title} paper={p} lang={lang}/>) : page==='games' ? <GameTheater games={[games.find(g=>g.name==='Dong! Da-Dong!'),...games.filter(g=>g.name!=='Dong! Da-Dong!')]} lang={lang}/> : page==='awards' ? <HonorsGallery awards={awards} lang={lang}/> : visibleItems.map(config.render)}
      </section>
      <Footer lang={lang} />
    </>
  );
}

function Footer({ lang }) {
  return (
    <footer className="footer">
      <div>
        <strong>{lang === 'zh' ? profile.nameZh : profile.name}</strong>
        <p><T en="Bridging virtual worlds and physical reality." zh="Bridging virtual worlds and physical reality." lang={lang} /></p>
      </div>
      <div className="footer-links">
        {profile.links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(link.label)}/>{link.label}</a>)}
      </div>
    </footer>
  );
}

// Keep the React root when Vite refreshes the entry module during design edits.
const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Shell />);
