import { readFile, writeFile } from 'node:fs/promises';
import { games, infernux } from '../src/content.js';
import { REPOSITORY, badgeCount, githubMetrics, videoMetrics, collectSource, mergeSnapshots } from '../src/metrics-core.js';

const file = new URL('../data/metrics.json', import.meta.url);
async function json(url, headers = {}) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Chenlizhe-Portfolio/1.0', ...headers }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

let previous = {};
try { previous = JSON.parse(await readFile(file, 'utf8')); } catch { /* First run. */ }
if (process.env.CI) {
  try { previous = mergeSnapshots(previous, await json('https://chenlizhe.cn/data/metrics.json')); }
  catch { console.warn('Published snapshot unavailable; retaining local snapshot.'); }
}
const auth = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const result = { schemaVersion: 1, generatedAt: new Date().toISOString(), videos: {} };
result.github = await collectSource(previous.github, async () => {
  try { return githubMetrics(await json(`https://api.github.com/repos/${REPOSITORY}`, auth)); }
  catch {
    const badge = await json(`https://img.shields.io/github/stars/${REPOSITORY}.json`);
    const label = String(badge.message || badge.value || '').trim();
    return { stars: badgeCount(label), starsLabel: label, url: `https://github.com/${REPOSITORY}` };
  }
});
result.release = await collectSource(previous.release, async () => {
  try {
    const data = await json(`https://api.github.com/repos/${REPOSITORY}/releases/latest`, auth);
    if (typeof data.tag_name !== 'string' || !data.html_url?.startsWith(`https://github.com/${REPOSITORY}/releases/`)) throw new Error('Invalid release');
    return { tag: data.tag_name, url: data.html_url, publishedAt: data.published_at };
  } catch {
    const badge = await json(`https://img.shields.io/github/v/release/${REPOSITORY}.json`);
    const tag = String(badge.message || badge.value || '').trim();
    if (!tag) throw new Error('Release unavailable');
    return { tag, url: `https://github.com/${REPOSITORY}/releases/tag/${encodeURIComponent(tag)}` };
  }
});
const ids = [...new Set([infernux.demoVideo, ...infernux.videos.map(v => v.url), ...games.map(g => g.video)].map(url => new URL(url).searchParams.get('bvid')).filter(Boolean))];
// Sequential collection keeps Bilibili traffic small; no cookies or private credentials.
for (const id of ids) {
  result.videos[id] = await collectSource(previous.videos?.[id], async () => videoMetrics(await json(`https://api.bilibili.com/x/web-interface/view?bvid=${id}`, { Referer: 'https://www.bilibili.com/' }), id));
}
await writeFile(file, JSON.stringify(result, null, 2) + '\n');
const sources = { github: result.github, release: result.release, ...result.videos };
for (const [name, source] of Object.entries(sources)) {
  console.log(`${name}: ${source.status}${source.updatedAt ? ` (${source.updatedAt})` : ''}`);
  if (process.env.CI && source.status !== 'ok') console.warn(`::warning::${name} refresh failed; last successful value retained when available.`);
}
