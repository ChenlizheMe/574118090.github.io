import test from 'node:test';
import assert from 'node:assert/strict';
import { githubMetrics, videoMetrics, collectSource, mergeSnapshots, isFresh, GITHUB_TTL } from '../src/metrics-core.js';

test('a failed refresh preserves the value and original success timestamp', async () => {
  const previous = { stars: 123, updatedAt: '2026-09-07T00:00:00Z' };
  const actual = await collectSource(previous, async () => { throw new Error('rate limited'); }, '2026-09-08T00:00:00Z');
  assert.equal(actual.stars, 123); assert.equal(actual.updatedAt, previous.updatedAt); assert.equal(actual.status, 'stale');
});
test('first-run failures never create fake zero counts', async () => {
  const value = await collectSource(undefined, async () => { throw new Error('offline'); });
  assert.equal(value.stars, undefined); assert.equal(value.updatedAt, undefined); assert.equal(value.status, 'unavailable');
});
test('real zeros are valid; missing, negative and wrong-source numbers are rejected', () => {
  assert.equal(githubMetrics({ full_name: 'ChenlizheMe/Infernux', stargazers_count: 0, forks_count: 0 }).stars, 0);
  assert.throws(() => githubMetrics({ full_name: 'someone/else', stargazers_count: 4, forks_count: 2 }));
  assert.throws(() => githubMetrics({ full_name: 'ChenlizheMe/Infernux', stargazers_count: -1, forks_count: 2 }));
  assert.throws(() => videoMetrics({ code: -412 }, 'BV123'));
  assert.throws(() => videoMetrics({ code: 0, data: { bvid: 'BV123', stat: {} } }, 'BV123'));
  assert.equal(videoMetrics({ code: 0, data: { bvid: 'BV123', stat: { view: 0, like: 0 } } }, 'BV123').views, 0);
});
test('hourly snapshot cannot regress newer browser GitHub data; videos update independently', () => {
  const a = { github: { stars: 15, updatedAt: '2026-09-08T01:00:00Z' } };
  const b = { github: { stars: 10, updatedAt: '2026-09-08T00:00:00Z' }, videos: { bv: { views: 5, updatedAt: '2026-09-08T01:00:00Z' } } };
  const merged = mergeSnapshots(a, b);
  assert.equal(merged.github.stars, 15); assert.equal(merged.videos.bv.views, 5);
});
test('later failed attempts mark cached data stale with the same success timestamp', () => {
  const a = { stars: 1, updatedAt: '2026-09-08T00:00:00Z', attemptedAt: '2026-09-08T00:00:00Z', status: 'ok' };
  const b = { ...a, attemptedAt: '2026-09-08T01:00:00Z', status: 'stale' };
  assert.equal(mergeSnapshots({ github: a }, { github: b }).github.status, 'stale');
});
test('expired or future timestamps never masquerade as fresh data', () => {
  const now = Date.parse('2026-09-08T00:10:00Z');
  assert.equal(isFresh({ updatedAt: '2026-09-08T00:09:00Z' }, GITHUB_TTL, now), true);
  for (const updatedAt of [undefined, 'broken', '2026-09-08T00:00:00Z', '2027-09-08T00:00:00Z']) assert.equal(isFresh({ updatedAt }, GITHUB_TTL, now), false);
});
