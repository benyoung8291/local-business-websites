// ===========================
// Custom Cursor
// ===========================
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    // Dot follows instantly
    cursorDot.style.left = cursorX + 'px';
    cursorDot.style.top = cursorY + 'px';
});

// Smooth cursor follow with lerp
function animateCursor() {
    dotX += (cursorX - dotX) * 0.15;
    dotY += (cursorY - dotY) * 0.15;
    cursor.style.left = dotX + 'px';
    cursor.style.top = dotY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover states
function setupCursorHover() {
    const hoverTargets = document.querySelectorAll('a, button, .work-card, .btn');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorDot.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursor.classList.remove('cursor-accent');
            cursorDot.classList.remove('cursor-hover');
        });
    });

    // Orange accent cursor on CTA buttons
    const accentTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .chat-toggle');
    accentTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-accent');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-accent');
        });
    });
}


// ===========================
// Perspective-shifting Images
// ===========================
function setupPerspectiveImages() {
    const images = document.querySelectorAll('.hero-photo, .about-image');
    images.forEach(container => {
        container.classList.add('perspective-img');
        const img = container.querySelector('img');
        if (!img) return;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotateY = x * 20;
            const rotateX = -y * 15;
            img.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.03)`;
        });

        container.addEventListener('mouseleave', () => {
            img.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
        });
    });
}


// ===========================
// Parallax Text on Scroll
// ===========================
function setupParallax() {
    const parallaxElements = [];

    // Hero lines get different parallax speeds
    document.querySelectorAll('.hero-line').forEach((el, i) => {
        el.classList.add('parallax-text');
        parallaxElements.push({ el, speed: 0.08 + i * 0.04, offset: 0 });
    });

    // Section headers parallax
    document.querySelectorAll('.section-header h2').forEach(el => {
        el.classList.add('parallax-text');
        parallaxElements.push({ el, speed: 0.05, offset: 0 });
    });

    // Process step numbers
    document.querySelectorAll('.step-number').forEach(el => {
        el.classList.add('parallax-text');
        parallaxElements.push({ el, speed: -0.06, offset: 0 });
    });

    // Work card numbers
    document.querySelectorAll('.work-number').forEach(el => {
        el.classList.add('parallax-text');
        parallaxElements.push({ el, speed: -0.04, offset: 0 });
    });

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        parallaxElements.forEach(({ el, speed }) => {
            const rect = el.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const distanceFromCenter = elementCenter - windowHeight / 2;
            const translateY = distanceFromCenter * speed;
            el.style.transform = `translateY(${translateY}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    // Initial update
    updateParallax();
}


// ===========================
// Scroll Animations (Intersection Observer)
// ===========================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});


// ===========================
// Init
// ===========================
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
            el.style.transitionDelay = `${i * 0.1}s`;
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
    }, { passive: true });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

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

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (chatWidget && chatWidget.classList.contains('open')) closeChat();
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

    // Initialize interactive features
    setupCursorHover();
    setupPerspectiveImages();
    setupParallax();
});
