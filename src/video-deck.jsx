import React from 'react';
import { infernux } from './content.js';
import { useMetrics, VideoStats } from './live-data.jsx';
import { VideoPlayer } from './motion.jsx';

export function VideoDeck({ lang }) {
  const metrics = useMetrics();
  const zh = lang === 'zh';

  return <div className="engine-timeline" role="list" aria-label={zh ? 'Infernux 开发时间轴' : 'Infernux development timeline'}>
    {infernux.videos.map((video, index) => {
      const title = zh ? video.titleZh : video.title;
      const poster = metrics.videos?.[video.bvid]?.poster || infernux.image;

      return <article className="engine-timeline__item" role="listitem" key={video.bvid}>
        <div className="engine-timeline__rail" aria-hidden="true">
          <span className="engine-timeline__number">{String(index + 1).padStart(2, '0')}</span>
          <span className="engine-timeline__marker" />
        </div>
        <div className="engine-timeline__card">
          <div className="engine-timeline__copy">
            <p className="engine-timeline__chapter">{zh ? video.chapterZh : video.chapter} <span>/ {String(infernux.videos.length).padStart(2, '0')}</span></p>
            <h3>{title}</h3>
            <p className="engine-timeline__detail">{zh ? video.detailZh : video.detail}</p>
            <VideoStats url={video.url} lang={lang} />
          </div>
          <div className="engine-timeline__media">
            <VideoPlayer url={video.url} title={title} poster={poster} lang={lang} />
          </div>
        </div>
      </article>;
    })}
  </div>;
}
