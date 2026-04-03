// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
    // Hero entrance animation
    const heroText = document.querySelector('.hero-text');
    const heroTagline = document.querySelector('.hero-tagline');
    const heroPhoto = document.querySelector('.hero-photo');

    requestAnimationFrame(() => {
        if (heroText) heroText.classList.add('loaded');
        if (heroTagline) heroTagline.classList.add('loaded');
        if (heroPhoto) heroPhoto.classList.add('loaded');
    });

    // Fade-up elements on scroll
    const fadeSelectors = [
        '.section-label',
        '.section-header',
        '.work-card',
        '.process-step',
        '.about-image',
        '.about-content',
        '.contact-text',
        '.contact-form',
        '.section-intro'
    ];

    fadeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 0.08}s`;
            observer.observe(el);
        });
    });

    // Sticky nav
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
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

    // Close chat on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (chatWidget && chatWidget.classList.contains('open')) {
                closeChat();
            }
            if (navLinks && navLinks.classList.contains('open')) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
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
