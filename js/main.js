// ========================
// Ben Young — Main JS
// Scroll animations, nav, chat widget
// ========================

// Scroll-triggered fade-up animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
});

document.addEventListener('DOMContentLoaded', () => {

    // Hero entrance animation
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    requestAnimationFrame(() => {
        if (heroContent) heroContent.classList.add('loaded');
        if (heroVisual) heroVisual.classList.add('loaded');
    });

    // Fade-up elements on scroll
    const fadeSelectors = [
        '.section-label',
        '.section-header-flex',
        '.section-header-center',
        '.work-card',
        '.process-card',
        '.testimonial-card',
        '.about-image',
        '.about-content',
        '.contact-text',
        '.contact-form-wrap',
        '.work-cta-row'
    ];

    fadeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 0.06}s`;
            observer.observe(el);
        });
    });

    // Sticky nav
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }, { passive: true });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Chat widget
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatPanelClose = document.getElementById('chatPanelClose');
    const openQuoteCTA = document.getElementById('openQuoteCTA');

    function toggleChat() {
        chatWidget.classList.toggle('open');
    }

    function openChat() {
        chatWidget.classList.add('open');
    }

    function closeChat() {
        chatWidget.classList.remove('open');
    }

    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (chatPanelClose) chatPanelClose.addEventListener('click', closeChat);

    if (openQuoteCTA) {
        openQuoteCTA.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (chatWidget && chatWidget.classList.contains('open')) {
                closeChat();
            }
            if (navLinks && navLinks.classList.contains('open')) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
