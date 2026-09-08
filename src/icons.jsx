import React from 'react';

export function Icon({ name, className = '' }) {
  const shapes = {
    expand: <path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"/>,
    close: <path d="m5 5 14 14M5 19 19 5"/>,
    plus: <path d="M4 12h16M12 4v16"/>,
    minus: <path d="M4 12h16"/>,
    play: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 8 6 4-6 4Z"/></>,
    github: <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.1-1.5 6.1-6.8a5.3 5.3 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7S17.4 1.2 15 3a13 13 0 0 0-6 0C6.6 1.2 5.4 1.5 5.4 1.5a5 5 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.5 3.7c0 5.3 3.1 6.5 6.1 6.8a3.4 3.4 0 0 0-.9 2.7v3.9" />,
    scholar: <path d="m2 9 10-6 10 6-10 6L2 9Zm4 3v6c4 3 8 3 12 0v-6M22 9v8" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    down: <path d="M12 4v16m-6-6 6 6 6-6"/>,
    external: <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c6 4 12 4 18 0M12 12v5"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.7 13a9 9 0 0 1-9.7-9.7A9 9 0 1 0 20.7 13Z"/>,
    language: <path d="M3 5h12M9 3v2m3 0c0 6-3 9-8 11m1-8c1 3 4 6 7 7m2 6 4-11 4 11m-6.5-4h5"/>,
    book: <path d="M12 5c-4-3-9-2-9-2v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16"/>
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name] || shapes.external}</svg>;
}
export const linkIcon = label => ({GitHub:'github','Google Scholar':'scholar',Email:'mail',CV:'download',Blog:'book'}[label] || 'external');
export function GeometricAccent() {
  return <svg className="geometric-accent" viewBox="0 0 360 360" fill="none" aria-hidden="true" focusable="false"><g className="geometry-orbits"><circle cx="180" cy="180" r="148"/><ellipse cx="180" cy="180" rx="148" ry="61" transform="rotate(-36 180 180)"/><ellipse cx="180" cy="180" rx="148" ry="61" transform="rotate(54 180 180)"/><path d="M32 180h296M180 32v296" strokeDasharray="2 9"/></g><g className="geometry-solid"><path d="m99 233 73-42 72 42v83l-72 42-73-42v-83Zm0 0 73 42 72-42m-72 42v83m0-167v84"/><path d="m99 316 73-42 72 42" strokeDasharray="3 6"/></g><circle className="geometry-point" cx="285" cy="75" r="7"/></svg>;
}
