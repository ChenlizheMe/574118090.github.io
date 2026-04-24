import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import {
  awards,
  education,
  games,
  infernux,
  profile,
  projects,
  publications,
  researchDirections,
  workExperience
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
  home: 'Lizhe Chen | Graphics Systems, Infernux, Rendering Tools',
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
      <div className="app">
        <Masthead lang={lang} page={page} toggleLang={toggleLang} toggleTheme={toggleTheme} theme={theme} />
        <main className="main">
          <div key={page} className="page-transition">
            {isHome ? <Home lang={lang} /> : <ArchivePage lang={lang} page={page} />}
          </div>
        </main>
      </div>
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
        <button type="button" onClick={toggleLang}>{lang === 'en' ? '中' : 'EN'}</button>
        <button type="button" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </div>
    </header>
  );
}

function Home({ lang }) {
  return (
    <>
      <Hero lang={lang} />
      <ResearchAndCareer lang={lang} />
      <InfernuxFeature lang={lang} />
      <PublicationEvidence lang={lang} />
      <ProjectPreview lang={lang} />
      <GamePreview lang={lang} />
      <Honors lang={lang} />
      <Footer lang={lang} />
    </>
  );
}

function Hero({ lang }) {
  const interests = lang === 'zh' ? profile.interestsZh : profile.interests;
  return (
    <section className="section hero">
      <div className="hero__primary">
        <p className="hero__kicker">
          <T en="GRAPHICS SYSTEMS · TSINGHUA UNIVERSITY" zh="图形系统 · 清华大学" lang={lang} />
        </p>
        <h1 className="hero__title">
          <T en={`${profile.name} · ${profile.nameZh}`} zh={`${profile.nameZh} · ${profile.name}`} lang={lang} />
        </h1>
        <p className="hero__role"><T en={profile.title} zh={profile.titleZh} lang={lang} /></p>
        <p className="hero__text"><T en={profile.thesis} zh={profile.thesisZh} lang={lang} /></p>
        <p className="hero__text"><T en={profile.about} zh={profile.aboutZh} lang={lang} /></p>
        <div className="hero__tags">
          {interests.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#infernux">Infernux</a>
          <InternalLink className="btn btn--quiet" href="/papers.html"><T en="Publications" zh="论文" lang={lang} /></InternalLink>
        </div>
        <div className="hero__contacts">
          {profile.emails.map((email) => <span key={email}>{email}</span>)}
        </div>
      </div>
      <aside className="hero__aside">
        <div className="portrait">
          <img src="/img/profile.png" alt="Lizhe Chen" />
          <div className="portrait__meta">
            <p><T en={profile.affiliation} zh={profile.affiliationZh} lang={lang} /></p>
            <h2>{lang === 'zh' ? profile.nameZh : profile.name}</h2>
          </div>
        </div>
        <div className="stat-grid">
          <Metric value="14+" label="papers" labelZh="论文" lang={lang} />
          <Metric value="662+" label="Infernux ★" labelZh="Infernux ★" lang={lang} />
        </div>
      </aside>
    </section>
  );
}

function Metric({ value, label, labelZh, lang }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span><T en={label} zh={labelZh} lang={lang} /></span>
    </div>
  );
}

function ResearchAndCareer({ lang }) {
  return (
    <section className="section">
      <header className="section__head">
        <span className="section__id">01</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Focus & path" zh="方向与路径" lang={lang} /></p>
          <h2 className="section__title"><T en="Research, school & work" zh="研究方向与学业/工作" lang={lang} /></h2>
        </div>
        <p className="section__lede">
          <T
            en="Neural rendering and large-scale graphics engineering on one side, VLM problems on the other—the timeline below is where those threads meet school and industry."
            zh="一边是神经渲染和大规模图形工程，一边是视觉大模型相关题目；下面的时间线就是它们和学业、工作交汇的地方。"
            lang={lang}
          />
        </p>
      </header>
      <div className="card-grid">
        {researchDirections.map((item, i) => (
          <article className="card" key={item.title}>
            <div className="card__idx">{String(i + 1).padStart(2, '0')}</div>
            <h3><T en={item.title} zh={item.titleZh} lang={lang} /></h3>
            <p><T en={item.body} zh={item.bodyZh} lang={lang} /></p>
          </article>
        ))}
      </div>
      <div className="two-col research-career__timelines">
        <div>
          <header className="section__head section__head--stack">
            <span className="section__id section__id--sub">01a</span>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Academic" zh="学历" lang={lang} /></p>
              <h2 className="section__title section__title--sub"><T en="Education" zh="教育经历" lang={lang} /></h2>
            </div>
          </header>
          <div className="timeline">
            {education.map((item) => (
              <article key={`${item.place}-${item.date}`}>
                <span><T en={item.date} zh={item.dateZh || item.date} lang={lang} /></span>
                <h3><T en={item.place} zh={item.placeZh} lang={lang} /></h3>
                <strong><T en={item.role} zh={item.roleZh} lang={lang} /></strong>
                <p><T en={item.desc} zh={item.descZh} lang={lang} /></p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <header className="section__head section__head--stack">
            <span className="section__id section__id--sub">01b</span>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Professional" zh="职业" lang={lang} /></p>
              <h2 className="section__title section__title--sub"><T en="Work experience" zh="工作经历" lang={lang} /></h2>
            </div>
          </header>
          <div className="timeline">
            {workExperience.map((item) => (
              <article key={`${item.place}-${item.date}`}>
                <span><T en={item.date} zh={item.dateZh || item.date} lang={lang} /></span>
                <h3><T en={item.place} zh={item.placeZh} lang={lang} /></h3>
                <strong><T en={item.role} zh={item.roleZh} lang={lang} /></strong>
                <p><T en={item.desc} zh={item.descZh} lang={lang} /></p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfernuxFeature({ lang }) {
  return (
    <section className="section feature" id="infernux">
      <header className="section__head">
        <span className="section__id">02</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Highlight project" zh="代表项目" lang={lang} /></p>
          <h2 className="section__title">{infernux.name}</h2>
        </div>
        <p className="section__lede"><T en={infernux.headline} zh={infernux.headlineZh} lang={lang} /></p>
      </header>

      <div className="feature__split">
        <div className="media media--infernux-video">
          <iframe
            src={infernux.demoVideo}
            title="Infernux demo"
            loading="lazy"
            allowFullScreen
          />
        </div>
        <div className="feature__copy">
          <p><T en={infernux.summary} zh={infernux.summaryZh} lang={lang} /></p>
          <p><T en={infernux.proposition} zh={infernux.propositionZh} lang={lang} /></p>
          <div className="link-row">
            <a className="btn btn--primary" href={infernux.url} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn btn--quiet" href={infernux.website} target="_blank" rel="noreferrer">Site</a>
            <a className="btn btn--quiet" href={infernux.docs} target="_blank" rel="noreferrer">Docs</a>
            <a className="btn btn--quiet" href={infernux.report} target="_blank" rel="noreferrer">arXiv</a>
          </div>
        </div>
      </div>

      <div className="layer-grid">
        {infernux.layers.map((layer) => (
          <article className="layer" key={layer.title}>
            <h3><T en={layer.title} zh={layer.titleZh} lang={lang} /></h3>
            <p><Html value={lang === 'zh' ? (layer.bodyZh || layer.body) : layer.body} /></p>
          </article>
        ))}
      </div>

      <div className="capability">
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Implementation" zh="实现范围" lang={lang} /></p>
          <h3><T en="Current technical scope (preview)." zh="当前技术范围（预览）。" lang={lang} /></h3>
        </div>
        <ul>
          {(lang === 'zh' ? infernux.capabilitiesZh : infernux.capabilities).map((cap) => <li key={cap}>{cap}</li>)}
        </ul>
      </div>
    </section>
  );
}

function PublicationEvidence({ lang }) {
  return (
    <section className="section">
      <header className="section__head">
        <span className="section__id">03</span>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 0.5rem' }}><T en="Papers" zh="论文" lang={lang} /></p>
          <h2 className="section__title"><T en="Selected publications" zh="代表论文" lang={lang} /></h2>
        </div>
        <p className="section__lede">
          <T
            en="Graphics and 3D representation work alongside VLM reasoning, graph-structured prompts, and vision-heavy detection."
            zh="图形与三维表示相关论文，以及 VLM 推理、图结构提示与视觉密集型检测等工作。"
            lang={lang}
          />
        </p>
      </header>
      <div className="list-gap">
        {publications.filter((p) => p.featured).map((paper) => <PaperCard key={paper.title} paper={paper} lang={lang} />)}
      </div>
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
            en="Rendering stacks, GPU visualization, and local tooling for graphics and multimodal experiments."
            zh="渲染技术栈、GPU 可视化，以及服务图形与多模态实验的本地工具。"
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
      <div className="game-grid game-grid--home">
        {games.slice(0, 5).map((game) => <GameCard key={game.name} game={game} lang={lang} />)}
      </div>
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
            en="Competition highlights with a one-line “what is this?” so friends outside the field can skim."
            zh="挑了一些比赛成绩，每条附一句白话说明，方便非同行快速扫一眼。"
            lang={lang}
          />
        </p>
      </header>
      <div className="award-list award-list--verbose">
        {awards.map((item) => (
          <article key={item.title}>
            <h3><T en={item.title} zh={item.titleZh} lang={lang} /></h3>
            <p className="award-list__result"><T en={item.result} zh={item.resultZh} lang={lang} /></p>
            <p className="award-list__blurb"><T en={item.blurb} zh={item.blurbZh} lang={lang} /></p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PaperCard({ paper, lang }) {
  const body = (
    <>
      <span className={`badge ${paper.level === 'ccf-a' ? 'badge--ccf-a' : ''} ${paper.level === 'journal' ? 'badge--journal' : ''}`}>{paper.levelLabel}</span>
      <h3>{paper.title}</h3>
      <p><Html value={paper.authors} /></p>
      {(paper.intro || paper.introZh) && (
        <p className="paper-card__intro"><T en={paper.intro} zh={paper.introZh || paper.intro} lang={lang} /></p>
      )}
      <small><T en={paper.venue} zh={paper.venueZh} lang={lang} /></small>
    </>
  );

  return (
    <article className="paper-card">
      {paper.link ? <a href={paper.link} target="_blank" rel="noreferrer">{body}</a> : body}
    </article>
  );
}

function ProjectCard({ project, lang }) {
  return (
    <article className="project-card">
      <a
        className="project-card__media"
        href={project.url}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={project.image}
          alt={project.name}
          onError={(e) => { e.currentTarget.parentElement?.classList.add('is-missing'); }}
        />
      </a>
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
      </div>
    </article>
  );
}

function GameCard({ game, lang }) {
  return (
    <article className="game-card">
      <div className="video-frame">
        <iframe src={game.video} title={game.name} loading="lazy" allowFullScreen />
      </div>
      <div>
        <h3><T en={game.name} zh={game.nameZh} lang={lang} /></h3>
        <strong><T en={game.role} zh={game.roleZh} lang={lang} /></strong>
        <p className="game-card__summary"><T en={game.desc} zh={game.descZh} lang={lang} /></p>
        {game.detail && (
          <p className="game-card__detail">
            <Html value={lang === 'zh' ? (game.detailZh || game.detail) : game.detail} />
          </p>
        )}
        {(game.awards || game.awardsZh) && (
          <small><T en={game.awards} zh={game.awardsZh} lang={lang} /></small>
        )}
        {game.bilibili && (
          <p className="game-card__links">
            <a href={game.bilibili} target="_blank" rel="noreferrer">Bilibili</a>
          </p>
        )}
        <TagRow tags={game.tags} />
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

function ArchivePage({ page, lang }) {
  const config = {
    papers: {
      eyebrow: 'Publication archive',
      eyebrowZh: '论文档案',
      title: 'Research outputs',
      titleZh: '研究产出',
      intro: 'Papers, reports, and preprints across graphics, engines, and reasoning.',
      introZh: '图形、引擎与推理相关的论文、报告与预印本。',
      items: publications,
      render: (item) => <PaperCard key={item.title} paper={item} lang={lang} />
    },
    projects: {
      eyebrow: 'Project archive',
      eyebrowZh: '项目档案',
      title: 'Systems & tools',
      titleZh: '系统与工具',
      intro: 'Graphics stacks, GPU tools, and VLM-facing workbenches with repository links.',
      introZh: '图形技术栈、GPU 工具与面向 VLM 的工作台，附仓库链接。',
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
      render: (item) => <GameCard key={item.name} game={item} lang={lang} />
    },
    awards: {
      eyebrow: 'Awards',
      eyebrowZh: '荣誉',
      title: 'Honors',
      titleZh: '奖项',
      intro: 'Selected competition results.',
      introZh: '部分竞赛与评选结果。',
      items: awards,
      render: (item) => (
        <article className="award-card" key={item.title}>
          <h3><T en={item.title} zh={item.titleZh} lang={lang} /></h3>
          <p className="award-list__result"><T en={item.result} zh={item.resultZh} lang={lang} /></p>
          <p className="award-list__blurb"><T en={item.blurb} zh={item.blurbZh} lang={lang} /></p>
        </article>
      )
    }
  }[page];

  return (
    <>
      <section className="archive-hero">
        <p className="eyebrow"><T en={config.eyebrow} zh={config.eyebrowZh} lang={lang} /></p>
        <h1><T en={config.title} zh={config.titleZh} lang={lang} /></h1>
        <p><T en={config.intro} zh={config.introZh} lang={lang} /></p>
      </section>
      <section className={`archive-list ${page}`}>
        {config.items.map(config.render)}
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
        <p><T en="Graphics, vision-language models, publications, and game shipping." zh="图形学、视觉语言模型、论文与游戏交付。" lang={lang} /></p>
      </div>
      <div className="footer-links">
        {profile.links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<Shell />);
