import React, { useEffect, useRef, useState } from 'react';
import { Icon, linkIcon } from './icons.jsx';
import { useMetrics, AnimatedNumber } from './live-data.jsx';
import { useMotion } from './motion.jsx';
import { awards, games, profile, publications } from './content.js';
import portrait from '../img/profile.webp';

/* Hero · Swiss editorial copy on the left, a crew card on the right and a
   slowly turning survey planet (src/orbit-hero.js) behind both. */
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

export function MissionHero({ lang, theme }) {
  const zh = lang === 'zh';
  const metrics = useMetrics();
  const { paused } = useMotion();
  const canvas = useRef(null);

  useEffect(() => {
    let api = null, dead = false;
    import('./orbit-hero.js').then(({ mountOrbitHero }) => { if (!dead) api = mountOrbitHero(canvas.current, { reduced: paused }); });
    return () => { dead = true; api?.dispose(); };
  }, [paused, theme]);

  return <section className="hero">
    <canvas className="hero__gl" ref={canvas} aria-hidden="true" />
    <div className="hero__vign" aria-hidden="true" />
    <div className="hero__wrap">
      <div className="hero__copy">
        <p className="eyebrow eyebrow--hero"><span className="code">LC-01</span><T en="Graphics · Vision · Games" zh="图形 · 视觉 · 游戏" lang={lang} /></p>
        <h1 className="hero__title">
          <span className="t-mark">{zh ? '陈立哲' : 'Lizhe Chen'}</span>
          <span className="t-rest">{zh
            ? <>把脑海里的想法，做成<span className="hl">可以亲手玩到</span>的东西。</>
            : <>I make ideas into things people can <span className="hl">actually play with</span>.</>}</span>
        </h1>
        <p className="hero__sub"><T en="Lately I’ve been imagining what the next generation of AI-native games and engines could be." zh="最近想看看下一代 AI-native 游戏和游戏引擎会是什么样。" lang={lang} /></p>
        <p className="hero__sub hero__sub--dim"><T en="Master’s student at Tsinghua University. Graphics and visual-intelligence research, open source, and indie games. Welcome aboard." zh="现在在清华读研，做图形学与视觉智能研究，也写开源项目、做独立游戏。欢迎来逛逛。" lang={lang} /></p>
        <div className="hero__contacts">
          <CopyableContact label={zh ? '邮箱' : 'Email'} value={profile.emails[0]} lang={lang} />
          <CopyableContact label={zh ? '微信' : 'WeChat'} value={profile.wechat} lang={lang} />
        </div>
        <div className="btns">
          <a className="btn btn--solid" href="#experience"><Icon name="down" /><T en="More about me" zh="了解更多" lang={lang} /></a>
          <a className="btn" href="/attaches/CV.pdf" target="_blank" rel="noreferrer"><Icon name="download" /><T en="Résumé" zh="个人简历" lang={lang} /></a>
          {profile.links.filter(l => ['GitHub', 'Google Scholar'].includes(l.label)).map(l => <a key={l.label} className="btn" href={l.url} target="_blank" rel="noreferrer"><Icon name={linkIcon(l.label)} />{l.label}</a>)}
        </div>
      </div>

      <figure className="crew">
        <div className="crew__hd"><span className="pill">CREW · LC-01</span><span className="crew__st"><i className="led on" />{zh ? '在岗' : 'On station'}</span></div>
        <div className="crew__img">
          <img src={portrait} width="960" height="960" fetchPriority="high" decoding="async" alt={zh ? '陈立哲的照片' : 'Portrait of Lizhe Chen'} />
          <span className="ticks" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="scan" aria-hidden="true" />
        </div>
        <figcaption>
          <b>{zh ? '陈立哲' : 'Lizhe Chen'}</b>
          <span>{zh ? '清华大学深圳国际研究生院' : 'Tsinghua SIGS · Shenzhen'}</span>
          <i className="stripe" aria-hidden="true" />
        </figcaption>
      </figure>

      <div className="telemetry">
        <div className="tm"><span><em>T1</em>{zh ? '论文' : 'Papers'}</span><b>{String(publications.length).padStart(2, '0')}</b></div>
        <div className="tm tm--hot"><span><em>T2</em>Infernux ★</span><b>{metrics.github?.starsLabel || <AnimatedNumber value={metrics.github?.stars} lang={lang} />}</b></div>
        <div className="tm"><span><em>T3</em>{zh ? '游戏' : 'Games'}</span><b>{String(games.length).padStart(2, '0')}</b></div>
        <div className="tm"><span><em>T4</em>{zh ? '奖项' : 'Awards'}</span><b>{String(awards.length).padStart(2, '0')}</b></div>
        <div className="tm tm--txt"><span><em>T5</em>{zh ? '当前' : 'Now'}</span><b>{zh ? '清华深圳' : 'Shenzhen'}</b></div>
      </div>
    </div>
  </section>;
}
