/**
 * Lizhe Chen — Academic Homepage
 * Theme toggle, i18n, scroll reveal, sidebar nav, mobile menu
 */
document.addEventListener('DOMContentLoaded', () => {

    const html = document.documentElement;

    /* ═══════ Theme (dark / light) ═══════ */
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

    // restore
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', toggleTheme);
    themeBtnM.addEventListener('click', toggleTheme);

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

    langBtn.addEventListener('click', toggleLang);
    langBtnM.addEventListener('click', toggleLang);

    /* ═══════ Mobile sidebar ═══════ */
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuToggle');
    const overlay = document.getElementById('overlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    menuBtn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    /* ═══════ Active nav on scroll ═══════ */
    const sections = document.querySelectorAll('.sec[id]');
    const navItems = document.querySelectorAll('.nav-item[data-sec]');

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

    // close mobile when nav clicked
    navItems.forEach(n => {
        n.addEventListener('click', () => closeSidebar());
    });

    /* ═══════ Scroll reveal ═══════ */
    const reveals = document.querySelectorAll('.reveal');
    const revObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(el => revObs.observe(el));

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

    /* ═══════ Typed cursor effect for intro (once) ═══════ */
    const glitch = document.querySelector('.glitch-text');
    if (glitch) {
        glitch.style.opacity = '0';
        setTimeout(() => {
            glitch.style.transition = 'opacity .5s';
            glitch.style.opacity = '1';
        }, 200);
    }
});
