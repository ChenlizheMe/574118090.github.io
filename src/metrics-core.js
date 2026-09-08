export const REPOSITORY = 'ChenlizheMe/Infernux';
export const DEMO_BVID = 'BV1jXXaBQE1R';
export const GITHUB_TTL = 5 * 60 * 1000;
export const SNAPSHOT_TTL = 2 * 60 * 60 * 1000;

export function count(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid metric');
  return value;
}

export function githubMetrics(data) {
  if (data.full_name?.toLowerCase() !== REPOSITORY.toLowerCase()) throw new Error('Wrong repository');
  return { stars: count(data.stargazers_count), forks: count(data.forks_count), url: `https://github.com/${REPOSITORY}` };
}

export function videoMetrics(payload, bvid) {
  const data = payload.data;
  if (payload.code !== 0 || data?.bvid !== bvid) throw new Error('Video unavailable');
  const image = new URL(data.pic || 'https://www.bilibili.com');
  const poster = image.hostname.endsWith('.hdslb.com') ? `https://${image.host}${image.pathname}` : null;
  return { views: count(data.stat.view), likes: count(data.stat.like), title: data.title, poster,
    url: `https://www.bilibili.com/video/${bvid}` };
}

export function isFresh(item, ttl, now = Date.now()) {
  const age = now - Date.parse(item?.updatedAt);
  return Number.isFinite(age) && age >= -60000 && age < ttl && item?.status !== 'stale';
}

// Merge independently: a successful video update must not overwrite newer GitHub data.
export function mergeSnapshots(previous = {}, incoming = {}) {
  const newer = (a, b) => {
    if (!a?.updatedAt) return b || a;
    if (!b?.updatedAt) return a;
    const difference = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    if (difference > 0 || (difference === 0 && Date.parse(b.attemptedAt) > Date.parse(a.attemptedAt))) return b;
    return a;
  };
  const videos = { ...previous.videos };
  for (const [key, value] of Object.entries(incoming.videos || {})) videos[key] = newer(videos[key], value);
  return { ...previous, ...incoming, github: newer(previous.github, incoming.github),
    release: newer(previous.release, incoming.release), videos };
}

export async function collectSource(previous, request, now = new Date().toISOString()) {
  try { return { ...await request(), updatedAt: now, attemptedAt: now, status: 'ok' }; }
  catch { return { ...previous, attemptedAt: now, status: previous?.updatedAt ? 'stale' : 'unavailable' }; }
}
