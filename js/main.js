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
    const heroContent = document.querySelector('.hero-content');
    const heroPhoto = document.querySelector('.hero-photo');

    requestAnimationFrame(() => {
        if (heroContent) heroContent.classList.add('loaded');
        if (heroPhoto) heroPhoto.classList.add('loaded');
    });

    // Fade-up elements on scroll
    const fadeSelectors = [
        '.work-card',
        '.process-step',
        '.pricing-card',
        '.about-content',
        '.start-card',
        '.section-work h2',
        '.section-work .section-intro',
        '.section-process h2',
        '.section-process .section-intro',
        '.section-pricing h2',
        '.section-pricing .section-intro',
        '.section-start h2',
        '.section-start .section-intro'
    ];

    fadeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 0.08}s`;
            observer.observe(el);
        });
    });

    // Chat widget
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatPanelClose = document.getElementById('chatPanelClose');
    const openQuoteHero = document.getElementById('openQuoteHero');
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

    chatToggle.addEventListener('click', toggleChat);
    chatPanelClose.addEventListener('click', closeChat);

    if (openQuoteHero) {
        openQuoteHero.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    }

    if (openQuoteCTA) {
        openQuoteCTA.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    }

    // Close chat on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWidget.classList.contains('open')) {
            closeChat();
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
