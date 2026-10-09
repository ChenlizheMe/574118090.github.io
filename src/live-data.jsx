import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import initial from '../data/metrics.json';
import { useMotion } from './motion.jsx';
import { GITHUB_TTL, REPOSITORY, badgeCount, githubMetrics, isFresh, mergeSnapshots } from './metrics-core.js';

const Context = createContext(initial);
export function MetricsProvider({ children }) {
  const [data, setData] = useState(() => {
    try { return mergeSnapshots(initial, JSON.parse(localStorage.getItem('portfolio-metrics-v2') || '{}')); }
    catch { return initial; }
  });
  const current = useRef(data);
  useEffect(() => {
    current.current = data;
    try { localStorage.setItem('portfolio-metrics-v2', JSON.stringify(data)); } catch { /* Private mode. */ }
  }, [data]);
  useEffect(() => {
    let cancelled = false;
    let busy = false;
    const controller = new AbortController();
    async function json(url) {
      const r = await fetch(url, { cache: 'no-cache', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
      if (!r.ok) throw new Error('Unavailable');
      return r.json();
    }
    async function latestGithub() {
      try {
        const raw = await json(`https://api.github.com/repos/${REPOSITORY}`);
        return { github: { ...githubMetrics(raw), updatedAt: new Date().toISOString(), status: 'ok' } };
      } catch {
        const badge = await json(`https://img.shields.io/github/stars/${REPOSITORY}.json`);
        const label = String(badge.message || badge.value || '').trim();
        return { github: { stars: badgeCount(label), starsLabel: label, url: `https://github.com/${REPOSITORY}`, updatedAt: new Date().toISOString(), status: 'ok' } };
      }
    }
    async function latestRelease() {
      try {
        const raw = await json(`https://api.github.com/repos/${REPOSITORY}/releases/latest`);
        if (typeof raw.tag_name !== 'string' || !raw.html_url?.startsWith(`https://github.com/${REPOSITORY}/releases/`)) throw new Error('Invalid release');
        return { release: { tag: raw.tag_name, url: raw.html_url, publishedAt: raw.published_at, updatedAt: new Date().toISOString(), status: 'ok' } };
      } catch {
        const badge = await json(`https://img.shields.io/github/v/release/${REPOSITORY}.json`);
        const tag = String(badge.message || badge.value || '').trim();
        if (!tag) throw new Error('Release unavailable');
        return { release: { tag, url: `https://github.com/${REPOSITORY}/releases/tag/${encodeURIComponent(tag)}`, updatedAt: new Date().toISOString(), status: 'ok' } };
      }
    }
    async function refresh() {
      if (busy || document.hidden) return;
      busy = true;
      const results = await Promise.allSettled([
        json('/data/metrics.json'),
        isFresh(current.current.github, GITHUB_TTL) ? Promise.resolve(null) : latestGithub(),
        isFresh(current.current.release, GITHUB_TTL) ? Promise.resolve(null) : latestRelease()
      ]);
      if (!cancelled) setData(previous => results.reduce((value, result) => {
        if (result.status !== 'fulfilled' || !result.value ||
          !(result.value.schemaVersion === 1 || result.value.github || result.value.release)) return value;
        return mergeSnapshots(value, result.value);
      }, previous));
      busy = false;
    }
    // The build already ships a fresh snapshot (CI refreshes it hourly), so live
    // requests wait until the page and its images have finished loading.
    let idle = 0, timer = 0;
    const start = () => { timer = setTimeout(() => { idle = (window.requestIdleCallback || (f => setTimeout(f, 1)))(refresh); }, 2500); };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    const interval = setInterval(refresh, GITHUB_TTL);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true; controller.abort(); clearInterval(interval); clearTimeout(timer);
      window.cancelIdleCallback?.(idle); window.removeEventListener('load', start);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return <Context.Provider value={data}>{children}</Context.Provider>;
}
export const useMetrics = () => useContext(Context);

export function AnimatedNumber({ value, lang }) {
  const { paused } = useMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!Number.isFinite(value)) { setShown(value); return; }
    if (paused) { setShown(value); return; }
    let frame;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / 1100, 1);
        setShown(Math.round(value * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, paused]);
  return <span ref={ref} aria-label={Number.isFinite(value) ? String(value) : (lang === 'zh' ? '暂无数据' : 'Unavailable')}><span aria-hidden="true">{Number.isFinite(shown) ? shown.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US') : '—'}</span></span>;
}

export function VideoStats({ url, lang }) {
  const id = new URL(url).searchParams.get('bvid');
  const item = useMetrics().videos?.[id];
  return <div className="video-stats"><a href={`https://www.bilibili.com/video/${id}`} target="_blank" rel="noreferrer">▷ <AnimatedNumber value={item?.views} lang={lang} /> {lang === 'zh' ? '播放' : 'views'} <span className="video-stats__likes"> · ♡ <AnimatedNumber value={item?.likes} lang={lang} /></span></a></div>;
}

export function RepositoryStars({ lang }) {
  const data = useMetrics();
  if (!Number.isFinite(data.github?.stars)) return null;
  const value = data.github.starsLabel || <AnimatedNumber value={data.github.stars} lang={lang} />;
  return <a className="repository-stars" href={`https://github.com/${REPOSITORY}`} target="_blank" rel="noreferrer">☆ {value} <span>Stars</span></a>;
}
