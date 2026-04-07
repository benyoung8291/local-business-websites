// ===========================
// Bold scroll animations & interactions
// Inspired by laurahiggins.com & boldside.com.au
// ===========================

// Scroll-triggered animations with varied directions
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

document.addEventListener('DOMContentLoaded', () => {

    // ---- Hero entrance with word reveal ----
    const heroText = document.querySelector('.hero-text');
    const heroTagline = document.querySelector('.hero-tagline');
    const heroPhoto = document.querySelector('.hero-photo');

    requestAnimationFrame(() => {
        if (heroText) heroText.classList.add('loaded');
        if (heroTagline) heroTagline.classList.add('loaded');
        if (heroPhoto) heroPhoto.classList.add('loaded');
    });

    // ---- Directional scroll animations ----
    // Different animation classes for visual variety
    const animationMap = [
        { selector: '.section-label', anim: 'fade-up' },
        { selector: '.section-header', anim: 'fade-up' },
        { selector: '.section-header-aside', anim: 'fade-up' },
        { selector: '.work-card:nth-child(odd)', anim: 'slide-left' },
        { selector: '.work-card:nth-child(even)', anim: 'slide-right' },
        { selector: '.process-card', anim: 'scale-up' },
        { selector: '.about-image', anim: 'slide-left' },
        { selector: '.about-content', anim: 'slide-right' },
        { selector: '.contact-text', anim: 'slide-left' },
        { selector: '.contact-form', anim: 'slide-right' },
        { selector: '.stat-item', anim: 'blur-in' },
    ];

    animationMap.forEach(({ selector, anim }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add(anim);
            el.style.transitionDelay = `${i * 0.08}s`;
            observer.observe(el);
        });
    });

    // ---- Animated stat counters ----
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => {
        statObserver.observe(el);
    });

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '+';
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current + (progress >= 1 ? suffix : '');
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    // ---- Parallax-lite on scroll ----
    let ticking = false;
    const nav = document.getElementById('nav');
    const heroEl = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Sticky nav
                if (scrollY > 60) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }

                // Subtle parallax on hero elements
                if (heroEl && scrollY < window.innerHeight) {
                    const ratio = scrollY / window.innerHeight;
                    const heroTextEl = heroEl.querySelector('.hero-text');
                    const heroPhotoEl = heroEl.querySelector('.hero-photo');
                    if (heroTextEl) {
                        heroTextEl.style.transform = `translateY(${ratio * 40}px)`;
                        heroTextEl.style.opacity = 1 - ratio * 0.5;
                    }
                    if (heroPhotoEl) {
                        heroPhotoEl.style.transform = `translateY(${ratio * -20}px)`;
                    }
                }

                ticking = false;
            });
            ticking = true;
        }
    });

    // ---- Mobile nav toggle ----
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

    // ---- Chat widget ----
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

    // Close chat/nav on escape key
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

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- Magnetic hover on CTA buttons ----
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translateY(-3px) translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
});
