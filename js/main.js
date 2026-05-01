// Scroll-triggered fade-up reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
});

document.addEventListener('DOMContentLoaded', () => {

    // Fade-up elements on scroll (skip the hero so it stays static)
    const fadeSelectors = [
        '.section-head',
        '.entry',
        '.dossier',
        '.flow-stop',
        '.colophon-portrait',
        '.colophon-body',
        '.ticket-text',
        '.ticket-shell'
    ];

    fadeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${Math.min(i, 4) * 0.06}s`;
            observer.observe(el);
        });
    });

    // Sticky nav state
    const nav = document.getElementById('nav');
    if (nav) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 40) nav.classList.add('scrolled');
                    else nav.classList.remove('scrolled');
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Live AEST clock for the status strip — gives the page a "live system" feel
    const clockEl = document.querySelector('[data-clock]');
    if (clockEl) {
        const fmt = new Intl.DateTimeFormat('en-AU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Australia/Sydney'
        });
        const tick = () => { clockEl.textContent = fmt.format(new Date()); };
        tick();
        setInterval(tick, 30 * 1000);
    }

    // Last-revised stamp — shows current YYYY-MM
    const revisedEl = document.querySelector('[data-revised]');
    if (revisedEl) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        revisedEl.textContent = `${yyyy}-${mm}`;
    }
});
