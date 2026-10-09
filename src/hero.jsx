import React, { useEffect, useRef, useState } from 'react';
import { Icon, linkIcon } from './icons.jsx';
import { useMetrics, AnimatedNumber } from './live-data.jsx';
import { useMotion } from './motion.jsx';
import { profile, publications } from './content.js';

/* Hero · ZWAARD-style voxel diorama behind a tape-deck dialogue panel.
   The scene is a CPU canvas (src/voxel-hero.js), no WebGL. */
const T = ({ en, zh, lang }) => (lang === 'zh' ? zh || en : en);

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

export function MissionHero({ lang, booted }) {
  const zh = lang === 'zh';
  const metrics = useMetrics();
  const { paused } = useMotion();
  const canvas = useRef(null);

  useEffect(() => {
    let api = null, dead = false;
    import('./voxel-hero.js').then(({ mountVoxelHero }) => { if (!dead) api = mountVoxelHero(canvas.current, { reduced: paused }); });
    return () => { dead = true; api?.dispose(); };
  }, [paused]);

  return <section className={`hero ${booted ? 'is-booted' : ''}`}>
    <canvas className="hero__scene" ref={canvas} aria-label={zh ? '体素场景：苔藓覆盖的废墟中躺着一盘巨大的磁带，旁边是一台 CRT 终端' : 'Voxel diorama: a giant cassette lying in overgrown ruins next to a CRT terminal'} />

    <div className="hero__wrap">
      <div className="dlg hero__copy">
        <div className="dlg__tab"><span className="dlg__avatar"><img src="/img/profile.webp" alt="" /></span><b>{zh ? '陈立哲' : 'Lizhe Chen'}</b><em>TAPE-01 · SIDE A</em></div>
        <h1 className="hero__title">
          <span className="hero__hello"><T en="Hello, I’m" zh="你好，我是" lang={lang} /></span>
          <span className="hero__name" data-t={zh ? '陈立哲' : 'LIZHE CHEN'}>{zh ? '陈立哲' : 'LIZHE CHEN'}</span>
        </h1>
        <p className="hero__text"><T en="I love making things that people can play with. Lately, I’ve been spending my time on Agentic Runtime and imagining what the next generation of AI-native games and engines could be." zh="我喜欢把脑海里的想法，做成可以亲手玩到的东西。最近在折腾 Agentic Runtime，也想看看下一代 AI-native 游戏和游戏引擎会是什么样。" lang={lang} /></p>
        <p className="hero__text hero__text--dim"><T en="I’m a master’s student at Tsinghua University. Along the way, I do graphics and visual intelligence research, contribute to open source, and make indie games. Welcome to have a look around." zh="现在在清华读研，做一些图形学与视觉智能研究，也写开源项目、做独立游戏。欢迎来逛逛。" lang={lang} /></p>
        <div className="hero__contacts">
          <CopyableContact label={zh ? '邮箱' : 'Email'} value={profile.emails[0]} lang={lang} />
          <CopyableContact label={zh ? '微信' : 'WeChat'} value={profile.wechat} lang={lang} />
        </div>
        <div className="btn-row">
          <a className="btn btn--hot" href="#experience"><Icon name="down" /><T en="More about me" zh="了解更多" lang={lang} /></a>
          <a className="btn btn--cyan" href="/attaches/CV.pdf" target="_blank" rel="noreferrer"><Icon name="download" /><T en="Résumé" zh="个人简历" lang={lang} /></a>
          {profile.links.filter(l => ['GitHub', 'Google Scholar'].includes(l.label)).map(l => <a key={l.label} className="btn btn--ghost" href={l.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(l.label)} />{l.label}</a>)}
        </div>
        <span className="dlg__next" aria-hidden="true">▼</span>
      </div>
    </div>

    <div className="hero__deck">
      <div className="tm"><span>{zh ? '论文' : 'PAPERS'}</span><b>{String(publications.length).padStart(2, '0')}</b></div>
      <div className="tm"><span>INFERNUX ★</span><b><AnimatedNumber value={metrics.github?.stars} lang={lang} /></b></div>
      <div className="tm"><span>{zh ? '基地' : 'BASE'}</span><b className="tm__txt">{zh ? '清华 · 深圳' : 'TSINGHUA · SZ'}</b></div>
      <div className="tm tm--vu"><span>{zh ? '磁带电平' : 'TAPE LEVEL'}</span><b className="vu">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--d': `${(i * 0.37) % 1.3}s` }} />)}</b></div>
    </div>
  </section>;
}
