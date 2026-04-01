// Navigation scroll effect
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
    });
});

// Scroll animations with Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add animation classes to elements
document.addEventListener('DOMContentLoaded', () => {
    // Fade up elements
    const fadeUpElements = [
        '.problem-card',
        '.service-card',
        '.process-step',
        '.proof-item',
        '.section-header',
        '.hero-stats',
        '.trust-inner',
        '.value-visual',
        '.process-cta',
        '.contact-checklist',
        '.contact-form',
        '.proof-visual'
    ];

    fadeUpElements.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 0.08}s`;
            observer.observe(el);
        });
    });

    // Slide in from left
    document.querySelectorAll('.about-photo, .contact-content').forEach(el => {
        el.classList.add('slide-in-left');
        observer.observe(el);
    });

    // Slide in from right
    document.querySelectorAll('.about-content, .proof-content').forEach(el => {
        el.classList.add('slide-in-right');
        observer.observe(el);
    });

    // Fade in value blocks with stagger
    document.querySelectorAll('.value-block').forEach((el, i) => {
        el.classList.add('fade-up');
        el.style.transitionDelay = `${i * 0.15}s`;
        observer.observe(el);
    });

    // Animate hero elements on load
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateY(20px)';
        heroVisual.style.transition = 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s';
        setTimeout(() => {
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Parallax effect on hero glows
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            const glows = document.querySelectorAll('.hero-glow');
            glows.forEach((glow, i) => {
                const speed = 0.3 + (i * 0.1);
                glow.style.transform = `translateY(${scrolled * speed}px)`;
            });
            ticking = false;
        });
        ticking = true;
    }
});