/**
 * Lizhe Chen — Academic Homepage
 * Data-driven rendering from /data/*.json
 * Theme toggle, i18n, scroll reveal, sidebar nav, mobile menu
 */
document.addEventListener('DOMContentLoaded', () => {

    const html = document.documentElement;

    /* ═══════ Theme (light / dark) ═══════ */
    const themeBtn = document.getElementById('themeToggle');
    const themeBtnM = document.getElementById('themeToggleMobile');

    function setTheme(t) {
        html.dataset.theme = t;
        localStorage.setItem('theme', t);
        const icon = t === 'dark' ? 'fa-sun' : 'fa-moon';
        [themeBtn, themeBtnM].forEach(b => {
            if (b) b.innerHTML = `<i class="fas ${icon}"></i>`;
        });
    }

    function toggleTheme() {
        setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (themeBtnM) themeBtnM.addEventListener('click', toggleTheme);

    /* ═══════ Language ═══════ */
    const langBtn = document.getElementById('langToggle');
    const langBtnM = document.getElementById('langToggleMobile');

    function setLang(l) {
        html.lang = l;
        localStorage.setItem('lang', l);
    }
    function toggleLang() {
        setLang(html.lang === 'en' ? 'zh' : 'en');
    }

    const savedLang = localStorage.getItem('lang');
    if (savedLang) html.lang = savedLang;

    if (langBtn) langBtn.addEventListener('click', toggleLang);
    if (langBtnM) langBtnM.addEventListener('click', toggleLang);

    /* ═══════ Mobile sidebar ═══════ */
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuToggle');
    const overlay = document.getElementById('overlay');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
    }
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    /* ═══════ Active nav on scroll ═══════ */
    const sections = document.querySelectorAll('.sec[id]');
    const navItems = document.querySelectorAll('.nav-item[data-sec]');

    if (sections.length && navItems.length) {
        const sectObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const id = e.target.id;
                    navItems.forEach(n => {
                        n.classList.toggle('active', n.dataset.sec === id);
                    });
                }
            });
        }, { threshold: 0.2, rootMargin: '-10% 0px -60% 0px' });

        sections.forEach(s => sectObs.observe(s));

        navItems.forEach(n => {
            n.addEventListener('click', () => closeSidebar());
        });
    }

    /* ═══════ Scroll reveal ═══════ */
    function observeReveals() {
        const reveals = document.querySelectorAll('.reveal:not(.observed)');
        const revObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

        reveals.forEach(el => {
            el.classList.add('observed');
            revObs.observe(el);
        });
    }

    observeReveals();

    /* ═══════ Smooth scroll ═══════ */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ═══════ Intro animation ═══════ */
    const glitch = document.querySelector('.glitch-text');
    if (glitch) {
        glitch.style.opacity = '0';
        setTimeout(() => {
            glitch.style.transition = 'opacity .5s';
            glitch.style.opacity = '1';
        }, 200);
    }

    /* ═════════════════════════════════════════════════════════════
       DATA-DRIVEN RENDERING
       Load JSON from /data/ and render into containers
       ═════════════════════════════════════════════════════════════ */

    // ── Renderers ──

    function renderPub(p) {
        const link = p.link ? ` href="${p.link}" target="_blank" rel="noopener"` : '';
        const titleTag = p.link ? `<a${link}>${p.title}</a>` : p.title;
        return `
        <div class="pub reveal">
            <div class="pub-thumb">
                <img src="${p.image}" alt="" onerror="this.style.display='none'">
                <span class="pub-thumb-label mono">${p.thumbLabel}</span>
            </div>
            <div class="pub-body">
                <span class="pub-badge ${p.level}">${p.levelLabel}</span>
                <h3>${titleTag}</h3>
                <p class="pub-meta">${p.authors}</p>
                <p class="pub-venue">
                    <span class="en">${p.venue}</span>
                    <span class="zh">${p.venueZh || p.venue}</span>
                </p>
            </div>
        </div>`;
    }

    function renderProjCard(p) {
        const badgeCls = p.status;
        const labelEn = p.statusLabel;
        const labelZh = p.statusLabelZh || p.statusLabel;
        const badgeContent = p.statusLabelZh
            ? `<span class="en">${labelEn}</span><span class="zh">${labelZh}</span>`
            : labelEn;
        return `
        <div class="proj-card reveal">
            <div class="proj-head">
                <span class="proj-icon mono">&gt;_</span>
                <span class="proj-badge ${badgeCls}">${badgeContent}</span>
            </div>
            <h3><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3>
            <p>
                <span class="en">${p.desc}</span>
                <span class="zh">${p.descZh || p.desc}</span>
            </p>
            <div class="tag-row">
                ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </div>`;
    }

    function renderProjDetail(p) {
        const badgeCls = p.status;
        const labelEn = p.statusLabel;
        const labelZh = p.statusLabelZh || p.statusLabel;
        const badgeContent = p.statusLabelZh
            ? `<span class="en">${labelEn}</span><span class="zh">${labelZh}</span>`
            : labelEn;
        const roleHtml = p.role ? `
            <p class="proj-detail-role">
                <i class="fas fa-user-cog"></i>
                <span class="en">${p.role}</span>
                <span class="zh">${p.roleZh || p.role}</span>
            </p>` : '';
        const imgHtml = p.image ? `
            <div class="proj-detail-img">
                <img src="${p.image}" alt="${p.name}">
            </div>` : '';
        return `
        <div class="proj-detail-card reveal">
            <div class="proj-detail-top">
                <div class="proj-head">
                    <span class="proj-icon mono">&gt;_</span>
                    <span class="proj-badge ${badgeCls}">${badgeContent}</span>
                </div>
                <h3><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3>
                ${roleHtml}
            </div>
            ${imgHtml}
            <div class="proj-detail-body">
                <span class="en">${p.detail || p.desc}</span>
                <span class="zh">${p.detailZh || p.descZh || p.desc}</span>
            </div>
            <div class="tag-row">
                ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </div>`;
    }

    function renderAward(a, detailed) {
        const contribHtml = a.contribution ? `
            <p class="award-note">
                <span class="en">${a.contribution}</span>
                <span class="zh">${a.contributionZh || a.contribution}</span>
            </p>` : '';
        const officialHtml = detailed && a.official ? `
            <p class="award-official mono">
                <span class="en">${a.official}</span>
                <span class="zh">${a.officialZh || a.official}</span>
            </p>` : '';
        return `
        <div class="award reveal">
            <span class="award-icon"><i class="fas ${a.icon}"></i></span>
            <div>
                <h4>
                    <span class="en">${a.title} — <strong>${a.result}</strong></span>
                    <span class="zh">${a.titleZh || a.title} —— <strong>${a.resultZh || a.result}</strong></span>
                </h4>
                ${officialHtml}
                ${contribHtml}
            </div>
        </div>`;
    }

    // ── Load & inject ──

    async function loadJSON(url) {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch (e) {
            console.warn('Failed to load', url, e);
            return [];
        }
    }

    // Publications
    const pubFeatured = document.getElementById('pub-featured');
    const pubAll = document.getElementById('pub-all');
    const pubCount = document.getElementById('pub-count');
    const pubAllCount = document.getElementById('pub-all-count');

    if (pubFeatured || pubAll) {
        loadJSON('/data/publications.json').then(data => {
            if (pubFeatured) {
                const featured = data.filter(p => p.featured);
                pubFeatured.innerHTML = featured.map(renderPub).join('');
                if (pubCount) {
                    const total = data.length;
                    const fCount = featured.length;
                    pubCount.innerHTML = `
                        <span class="en">${total} publications</span>
                        <span class="zh">${total} 篇论文</span>`;
                }
            }
            if (pubAll) {
                pubAll.innerHTML = data.map(renderPub).join('');
                if (pubAllCount) {
                    pubAllCount.innerHTML = `
                        <span class="en">${data.length} publications</span>
                        <span class="zh">${data.length} 篇论文</span>`;
                }
            }
            observeReveals();
        });
    }

    // Projects
    const projFeatured = document.getElementById('proj-featured');
    const projAll = document.getElementById('proj-all');

    if (projFeatured || projAll) {
        loadJSON('/data/projects.json').then(data => {
            if (projFeatured) {
                const featured = data.filter(p => p.featured);
                projFeatured.innerHTML = featured.map(renderProjCard).join('');
            }
            if (projAll) {
                projAll.innerHTML = data.map(renderProjDetail).join('');
            }
            observeReveals();
        });
    }

    // Awards
    const awardFeatured = document.getElementById('award-featured');
    const awardAll = document.getElementById('award-all');

    if (awardFeatured || awardAll) {
        loadJSON('/data/awards.json').then(data => {
            if (awardFeatured) {
                const featured = data.filter(a => a.featured);
                awardFeatured.innerHTML = featured.map(a => renderAward(a, false)).join('');
            }
            if (awardAll) {
                awardAll.innerHTML = data.map(a => renderAward(a, true)).join('');
            }
            observeReveals();
        });
    }
});
