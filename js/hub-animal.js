/* ============================================
   HUB CAUSA ANIMAL — JAVASCRIPT
   Vanilla JS — sem dependências
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- FAB — BOTÃO FLUTUANTE DISQUE DENÚNCIA ---------- */
    const fabBtn = document.getElementById('fabBtn');
    const fabPanel = document.getElementById('fabPanel');
    const fabClose = document.getElementById('fabClose');
    const fabGoTo = document.getElementById('fabGoToSection');

    if (fabBtn && fabPanel) {
        fabBtn.addEventListener('click', () => {
            const isOpen = fabPanel.classList.contains('open');
            fabPanel.classList.toggle('open');
            fabBtn.classList.toggle('active');
            if (!isOpen) {
                // Track interaction
                fabBtn.setAttribute('aria-expanded', 'true');
            } else {
                fabBtn.setAttribute('aria-expanded', 'false');
            }
        });

        if (fabClose) {
            fabClose.addEventListener('click', () => {
                fabPanel.classList.remove('open');
                fabBtn.classList.remove('active');
                fabBtn.setAttribute('aria-expanded', 'false');
            });
        }

        if (fabGoTo) {
            fabGoTo.addEventListener('click', () => {
                fabPanel.classList.remove('open');
                fabBtn.classList.remove('active');
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!fabBtn.contains(e.target) && !fabPanel.contains(e.target)) {
                fabPanel.classList.remove('open');
                fabBtn.classList.remove('active');
                fabBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fabPanel.classList.contains('open')) {
                fabPanel.classList.remove('open');
                fabBtn.classList.remove('active');
            }
        });
    }

    /* ---------- PROGRESS BARS — Animate on scroll ---------- */
    const progressBars = document.querySelectorAll('.hub-progress-bar');
    if (progressBars.length) {
        const progressObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const progress = e.target.dataset.progress || 0;
                    e.target.style.setProperty('--progress', progress + '%');
                    e.target.querySelector('::after') || null;
                    // Use a timeout for the CSS transition
                    setTimeout(() => {
                        e.target.style.cssText = `--progress: ${progress}%`;
                        // Apply width via pseudo-element by adding inline style trick
                        e.target.classList.add('animated');
                    }, 100);
                    progressObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.3 });
        progressBars.forEach(bar => {
            // Set initial width via CSS custom property
            bar.style.setProperty('--bar-width', bar.dataset.progress + '%');
            progressObs.observe(bar);
        });
    }

    /* ---------- HERO PARTICLES — Floating paw prints ---------- */
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        const pawIcons = ['🐾', '🐶', '🐱', '🐕', '🐈', '🦴', '💙'];
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('span');
            particle.className = 'hero-particle';
            particle.textContent = pawIcons[Math.floor(Math.random() * pawIcons.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: ${12 + Math.random() * 18}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.08 + Math.random() * 0.12};
                animation: particleFloat ${8 + Math.random() * 12}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        // Add CSS animation if not exists
        if (!document.getElementById('particleStyle')) {
            const style = document.createElement('style');
            style.id = 'particleStyle';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-20px) rotate(5deg); }
                    50% { transform: translateY(-10px) rotate(-3deg); }
                    75% { transform: translateY(-25px) rotate(4deg); }
                }
                .hub-progress-bar.animated::after {
                    width: var(--bar-width) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /* ---------- FADE-IN ANIMATIONS ---------- */
    const fadeEls = document.querySelectorAll(
        '.hub-news-featured, .hub-news-card, .hub-article-grid, .hub-law-card, .hub-timeline-item, .hub-protector-card, .hub-protector-cta, .hub-denounce-content, .hub-social-btns, .quick-item'
    );
    fadeEls.forEach(el => el.classList.add('fade-in'));

    if (fadeEls.length) {
        const fadeObs = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    // Stagger siblings
                    const delay = Array.from(e.target.parentElement.children).indexOf(e.target) * 100;
                    setTimeout(() => {
                        e.target.classList.add('visible');
                    }, delay);
                    fadeObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        fadeEls.forEach(el => fadeObs.observe(el));
    }

    /* ---------- COUNTER ANIMATION (reuse from main) ---------- */
    const counters = document.querySelectorAll('.hub-hero [data-count]');
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(target * ease);
            el.textContent = target >= 100 ? val.toLocaleString('pt-BR') : val + '+';
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    if (counters.length) {
        const counterObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    animateCounter(e.target);
                    counterObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(c => counterObs.observe(c));
    }

    /* ---------- SMOOTH SCROLL for quick actions ---------- */
    document.querySelectorAll('.quick-item, .hub-hero-actions a, .fab-panel-footer').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerH = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

});
