/* ============================================
   WELLINGTON BOZO — TEMPLATE V2 JAVASCRIPT
   Vanilla JS — sem dependências
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- HEADER SCROLL ---------- */
    const header = document.getElementById('siteHeader');
    const backTopBtn = document.getElementById('backToTop');

    const onScroll = () => {
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 40);
        if (backTopBtn) backTopBtn.classList.toggle('visible', y > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- MOBILE NAV TOGGLE ---------- */
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('headerNav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            nav.classList.toggle('open');
        });
        // Close on link click
        nav.querySelectorAll('.header-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('open');
                nav.classList.remove('open');
            });
        });
    }

    /* ---------- HERO CAROUSEL ---------- */
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroIndicators = document.querySelectorAll('.hero-indicator');
    const heroPrev = document.querySelector('.hero-arrow-prev');
    const heroNext = document.querySelector('.hero-arrow-next');
    let heroIdx = 0;
    let heroTimer;
    const heroCount = heroSlides.length;

    function setHeroSlide(idx) {
        heroSlides.forEach((s, i) => s.classList.toggle('active', i === idx));
        heroIndicators.forEach((d, i) => d.classList.toggle('active', i === idx));
        heroIdx = idx;
    }

    function nextHero() { setHeroSlide((heroIdx + 1) % heroCount); }
    function prevHero() { setHeroSlide((heroIdx - 1 + heroCount) % heroCount); }

    function startHeroTimer() {
        clearInterval(heroTimer);
        heroTimer = setInterval(nextHero, 6000);
    }

    if (heroCount > 0) {
        heroIndicators.forEach((dot, i) => {
            dot.addEventListener('click', () => { setHeroSlide(i); startHeroTimer(); });
        });
        if (heroPrev) heroPrev.addEventListener('click', () => { prevHero(); startHeroTimer(); });
        if (heroNext) heroNext.addEventListener('click', () => { nextHero(); startHeroTimer(); });
        startHeroTimer();
    }

    /* ---------- OPINIÃO CAROUSEL ---------- */
    const opSlides = document.querySelectorAll('.opiniao-slide');
    const opPrev = document.querySelector('.opiniao-prev');
    const opNext = document.querySelector('.opiniao-next');
    const opDotsContainer = document.querySelector('.opiniao-dots');
    let opIdx = 0;
    const opCount = opSlides.length;
    let opTimer;

    // Generate dots
    if (opDotsContainer && opCount > 0) {
        for (let i = 0; i < opCount; i++) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => { setOpSlide(i); startOpTimer(); });
            opDotsContainer.appendChild(d);
        }
    }

    function setOpSlide(idx) {
        opSlides.forEach((s, i) => s.classList.toggle('active', i === idx));
        opDotsContainer?.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
        opIdx = idx;
    }

    function startOpTimer() {
        clearInterval(opTimer);
        opTimer = setInterval(() => setOpSlide((opIdx + 1) % opCount), 7000);
    }

    if (opCount > 0) {
        if (opPrev) opPrev.addEventListener('click', () => {
            setOpSlide((opIdx - 1 + opCount) % opCount);
            startOpTimer();
        });
        if (opNext) opNext.addEventListener('click', () => {
            setOpSlide((opIdx + 1) % opCount);
            startOpTimer();
        });
        startOpTimer();
    }

    /* ---------- COUNTER ANIMATION ---------- */
    const counters = document.querySelectorAll('[data-count]');
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * ease).toLocaleString('pt-BR');
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

    /* ---------- SCROLL FADE-IN ---------- */
    const fadeEls = document.querySelectorAll(
        '.noticia-card, .pronunc-card, .bandeira-card, .video-thumb, .sobre-layout, .animal-cta-inner, .contato-layout, .city-parallax-content, .nossa-cidade-text, .nossa-cidade-card, .cidade-fact'
    );
    fadeEls.forEach(el => el.classList.add('fade-in'));

    if (fadeEls.length) {
        const fadeObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    fadeObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(el => fadeObs.observe(el));
    }

    /* ---------- PARALLAX SCROLL ---------- */
    const parallaxBgs = document.querySelectorAll('.city-parallax-bg, .nossa-cidade-bg');
    if (parallaxBgs.length) {
        const handleParallax = () => {
            parallaxBgs.forEach(bg => {
                const section = bg.parentElement;
                const rect = section.getBoundingClientRect();
                const vh = window.innerHeight;
                if (rect.top < vh && rect.bottom > 0) {
                    const progress = (vh - rect.top) / (vh + rect.height);
                    const offset = (progress - 0.5) * 60;
                    bg.style.transform = `translateY(${offset}px) scale(1.05)`;
                }
            });
        };
        window.addEventListener('scroll', handleParallax, { passive: true });
        handleParallax();
    }

    /* ---------- ACTIVE NAV ON SCROLL ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header-nav-link[href^="#"]');

    const updateActiveNav = () => {
        const scrollPos = window.scrollY + 150;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    /* ---------- CONTACT FORM (mock) ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
            btn.style.background = '#27ae60';
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.style.background = '';
                form.reset();
            }, 2500);
        });
    }

});
