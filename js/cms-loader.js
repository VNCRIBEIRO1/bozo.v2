/* ============================================
   CMS LOADER — Carrega dados do CMS no frontend
   Lê localStorage e atualiza o DOM dinamicamente
   ============================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'cms_bozo_data';

    /* ───────── XSS PROTECTION ───────── */
    function esc(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function loadCMS() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return; // Sem dados CMS — manter HTML estático
        let data;
        try { data = JSON.parse(stored); } catch (e) { return; }

        const page = detectPage();
        if (page === 'index') renderIndex(data);
        if (page === 'causa-animal') renderCausaAnimal(data);
        renderCommon(data);
    }

    function detectPage() {
        const path = location.pathname.toLowerCase();
        if (path.includes('causa-animal')) return 'causa-animal';
        if (path.includes('admin')) return 'admin';
        return 'index';
    }

    /* ───────── COMMON (Header, Footer, Draft) ───────── */
    function renderCommon(data) {
        const s = data.settings || {};

        // Site name / role
        document.querySelectorAll('.logo-name').forEach(el => el.textContent = s.siteName || '');
        document.querySelectorAll('.logo-role').forEach(el => el.textContent = s.siteRole || '');

        // Stamp
        document.querySelectorAll('.stamp-years').forEach(el => el.textContent = s.stampYears || '');
        document.querySelectorAll('.stamp-text').forEach(el => {
            el.innerHTML = esc(s.stampText || '').replace(/\n/g, '<br>');
        });

        // Draft bar
        const draftBar = document.querySelector('.draft-bar');
        if (draftBar) {
            if (s.draftMode === false) {
                draftBar.style.display = 'none';
            } else if (s.draftText) {
                draftBar.innerHTML = `<i class="fas fa-drafting-compass"></i> ${esc(s.draftText)}`;
            }
        }

        // Contact info in footer
        const contact = s.contact || {};
        document.querySelectorAll('.contato-item').forEach(item => {
            const icon = item.querySelector('i');
            if (!icon) return;
            const cls = icon.className;
            const pEl = item.querySelector('p');
            if (!pEl) return;
            if (cls.includes('fa-phone') && contact.phone) pEl.textContent = contact.phone;
            if (cls.includes('fa-envelope') && contact.email) pEl.textContent = contact.email;
            if (cls.includes('fa-clock') && contact.hours) pEl.textContent = contact.hours;
            if (cls.includes('fa-map-marker') && contact.address) pEl.textContent = contact.address;
        });

        // Social links
        const soc = s.social || {};
        if (soc.instagram) {
            document.querySelectorAll('a[href*="instagram.com"]').forEach(el => { el.href = soc.instagram; });
        }
        if (soc.facebook) {
            document.querySelectorAll('a[href*="facebook.com"]').forEach(el => { el.href = soc.facebook; });
        }
    }

    /* ───────── INDEX PAGE ───────── */
    function renderIndex(data) {
        renderHeroSlides(data);
        renderNoticias(data);
        renderCityParallax(data);
        renderGaleria(data);
        renderPronunciamentos(data);
        renderOpinioes(data);
        renderInstagram(data);
        renderFacebook(data);
        renderVideos(data);
        renderSobre(data);
        renderSobreStats(data);
        renderBandeiras(data);
        renderCidade(data);
        renderCidadeFacts(data);
    }

    function renderHeroSlides(data) {
        const slides = data.heroSlides;
        if (!slides?.length) return;
        const container = document.querySelector('.hero-slides');
        if (!container) return;

        const activeSlides = slides.filter(s => s.active !== false);
        if (!activeSlides.length) return;

        container.innerHTML = activeSlides.map((slide, i) => {
            const posStyle = slide.imagePosition ? `background-position: ${esc(slide.imagePosition)}` : '';
            return `<div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image: url('${esc(slide.image)}');${posStyle}">
                <div class="hero-gradient"></div>
                <div class="container">
                    <div class="hero-slide-content">
                        <h2>${esc(slide.title)}</h2>
                        <p>${esc(slide.description)}</p>
                        <a href="${esc(slide.link || '#')}" class="hero-btn">${esc(slide.linkText || 'Leia mais')} <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Rebuild indicators
        const indicatorsEl = document.querySelector('.hero-indicators');
        if (indicatorsEl) {
            indicatorsEl.innerHTML = activeSlides.map((_, i) =>
                `<button class="hero-indicator${i === 0 ? ' active' : ''}" data-slide="${i}"></button>`
            ).join('');
        }
    }

    function renderNoticias(data) {
        const noticias = data.noticias;
        if (!noticias?.length) return;
        const grid = document.querySelector('.noticias-grid');
        if (!grid) return;

        grid.innerHTML = noticias.map(n => `
            <a href="${esc(n.link || '#')}" class="noticia-card">
                <div class="noticia-card-img">
                    <img src="${esc(n.image)}" alt="${esc(n.imageAlt || n.title)}" loading="lazy">
                </div>
                <div class="noticia-card-body">
                    <h3>${esc(n.title)}</h3>
                    <p>${esc(n.description)}</p>
                </div>
                <span class="noticia-card-link">Leia mais &raquo;</span>
            </a>
        `).join('');
    }

    function renderCityParallax(data) {
        const cp = data.cityParallax;
        if (!cp) return;

        const tagEl = document.querySelector('.city-tag');
        if (tagEl && cp.tag) tagEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${esc(cp.tag)}`;

        const titleEl = document.querySelector('.city-parallax-content h2');
        if (titleEl && cp.title) titleEl.textContent = cp.title;

        const descEl = document.querySelector('.city-parallax-content p');
        if (descEl && cp.description) descEl.textContent = cp.description;

        if (cp.image) {
            const bgEl = document.querySelector('.city-parallax-bg');
            if (bgEl) bgEl.style.backgroundImage = `url('${cp.image}')`;
        }
    }

    function renderPronunciamentos(data) {
        const items = data.pronunciamentos;
        if (!items?.length) return;
        const grid = document.querySelector('.pronunc-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <a href="${esc(p.link || '#')}" class="pronunc-card">
                <div class="pronunc-card-img">
                    <img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy">
                </div>
                <div class="pronunc-card-body">
                    <span class="pronunc-date">${esc(p.date || '')}</span>
                    <h3>${esc(p.title)}</h3>
                    <p>${esc(p.description)}</p>
                </div>
                <span class="pronunc-link">Leia mais &raquo;</span>
            </a>
        `).join('');
    }

    function renderOpinioes(data) {
        const items = data.opinioes;
        if (!items?.length) return;
        const carousel = document.querySelector('.opiniao-carousel');
        if (!carousel) return;

        const dotsEl = carousel.querySelector('.opiniao-dots');

        // Remove old slides only
        carousel.querySelectorAll('.opiniao-slide').forEach(s => s.remove());

        // Clear old dots so main-v2.js regenerates them fresh
        if (dotsEl) dotsEl.innerHTML = '';

        // Insert new slides before dots container
        items.forEach((op, i) => {
            const slide = document.createElement('div');
            slide.className = 'opiniao-slide' + (i === 0 ? ' active' : '');
            slide.innerHTML = `<div class="opiniao-icon"><i class="fas fa-quote-left"></i></div>
                <blockquote>"${esc(op.quote)}"</blockquote>
                <cite>${esc(op.author)}</cite>`;
            carousel.insertBefore(slide, dotsEl);
        });
    }

    function renderInstagram(data) {
        const items = data.instagram;
        if (!items?.length) return;
        const grid = document.querySelector('.insta-grid');
        if (!grid) return;

        const igUrl = data.settings?.social?.instagram || '#';
        grid.innerHTML = items.map(item => `
            <a href="${esc(igUrl)}" target="_blank" class="insta-item">
                <img src="${esc(item.image)}" alt="${esc(item.alt)}" loading="lazy">
                <div class="insta-overlay"><i class="fab fa-instagram"></i></div>
            </a>
        `).join('');
    }

    function renderSobre(data) {
        const s = data.sobre;
        if (!s) return;

        const photoImg = document.querySelector('.sobre-photo img');
        if (photoImg && s.photo) photoImg.src = s.photo;

        const tag = document.querySelector('.sobre-tag');
        if (tag && s.tag) tag.textContent = s.tag;

        const name = document.querySelector('.sobre-body h2');
        if (name && s.name) name.textContent = s.name;

        const role = document.querySelector('.sobre-role');
        if (role && s.role) role.innerHTML = esc(s.role).replace(/\n/g, '<br>');

        // Bio paragraphs (skip .sobre-role which is also a <p>)
        const bioPs = document.querySelectorAll('.sobre-body > p:not(.sobre-role)');
        if (s.bio && bioPs.length) {
            s.bio.forEach((text, i) => {
                if (bioPs[i]) bioPs[i].textContent = text;
            });
        }
    }

    function renderSobreStats(data) {
        const stats = data.sobre?.stats;
        if (!stats?.length) return;
        const row = document.querySelector('.sobre-stats-row');
        if (!row) return;

        row.innerHTML = stats.map(st => {
            const countAttr = st.isCounter ? ` data-count="${esc(st.value)}"` : '';
            const displayValue = st.isCounter ? '0' : esc(st.value);
            return `<div class="sobre-stat-item">
                <i class="${esc(st.icon)}"></i>
                <strong${countAttr}>${displayValue}</strong>
                <span>${esc(st.label)}</span>
            </div>`;
        }).join('');
    }

    function renderBandeiras(data) {
        const items = data.bandeiras;
        if (!items?.length) return;
        const row = document.querySelector('.bandeiras-row');
        if (!row) return;

        row.innerHTML = items.map(b => `
            <div class="bandeira-card">
                <div class="bandeira-img"><img src="${esc(b.image)}" alt="${esc(b.title)}" loading="lazy"></div>
                <div class="bandeira-icon"><i class="${esc(b.icon)}"></i></div>
                <h3>${esc(b.title)}</h3>
                <p>${esc(b.description)}</p>
            </div>
        `).join('');
    }

    function renderGaleria(data) {
        const items = data.galeria;
        if (!items?.length) return;
        const scroll = document.querySelector('.encontros-scroll');
        if (!scroll) return;

        scroll.innerHTML = items.map(g => `
            <div class="encontro-item">
                <img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy">
                <span class="encontro-caption">${esc(g.caption)}</span>
            </div>
        `).join('');
    }

    function renderVideos(data) {
        const items = data.videos;
        if (!items?.length) return;
        const grid = document.querySelector('.videos-grid');
        if (!grid) return;

        grid.innerHTML = items.map(v => {
            const clickAttr = v.url ? ` onclick="window.open('${esc(v.url)}','_blank')" style="cursor:pointer"` : '';
            return `<div class="video-thumb"${clickAttr}>
                <img src="${esc(v.thumbnail)}" alt="${esc(v.caption)}" loading="lazy">
                <div class="video-play"><i class="fas fa-play"></i></div>
                <span class="video-caption">${esc(v.caption)}</span>
            </div>`;
        }).join('');
    }

    function renderCidade(data) {
        const c = data.cidade;
        if (!c) return;

        const titleEl = document.querySelector('.nossa-cidade-text h2');
        if (titleEl && c.title) titleEl.textContent = c.title;

        const descEl = document.querySelector('.nossa-cidade-text p');
        if (descEl && c.description) descEl.textContent = c.description;

        const captionEl = document.querySelector('.nossa-cidade-card-caption');
        if (captionEl && c.imageCaption) captionEl.innerHTML = `<i class="fas fa-camera"></i> ${esc(c.imageCaption)}`;

        // Update cidade image
        const imgEl = document.querySelector('.nossa-cidade-card img');
        if (imgEl && c.image) imgEl.src = c.image;
    }

    function renderCidadeFacts(data) {
        const facts = data.cidade?.facts;
        if (!facts?.length) return;
        const container = document.querySelector('.cidade-facts');
        if (!container) return;

        container.innerHTML = facts.map(f => {
            const countAttr = f.isCounter ? ` data-count="${esc(f.value)}"` : '';
            const displayValue = f.isCounter ? '0' : esc(f.value);
            return `<div class="cidade-fact">
                <i class="${esc(f.icon)}"></i>
                <strong${countAttr}>${displayValue}</strong>
                <span>${esc(f.label)}</span>
            </div>`;
        }).join('');
    }

    function renderFacebook(data) {
        const fb = data.facebookPost;
        if (!fb) return;
        const textEl = document.querySelector('.fb-text');
        if (textEl && fb.text) textEl.textContent = fb.text;
        const imgEl = document.querySelector('.fb-image img');
        if (imgEl && fb.image) imgEl.src = fb.image;
    }

    /* ───────── CAUSA ANIMAL PAGE ───────── */
    function renderCausaAnimal(data) {
        const ca = data.causaAnimal;
        if (!ca) return;

        renderAnimalHero(ca);
        renderAnimalStats(ca);
        renderAnimalNews(ca);
        renderAnimalLeis(ca);
        renderAnimalProjetos(ca);
        renderAnimalProtetores(ca);
        renderAnimalDenuncia(ca);
    }

    function renderAnimalHero(ca) {
        const hero = ca.hero;
        if (!hero) return;

        const titleEl = document.querySelector('.hub-hero-content h1');
        if (titleEl && hero.title) titleEl.innerHTML = esc(hero.title).replace(/\n/g, '<br>') + ' <span class="paw-emoji">🐾</span>';

        const descEl = document.querySelector('.hub-hero-content > p');
        if (descEl && hero.description) descEl.textContent = hero.description;

        if (hero.image) {
            const bg = document.querySelector('.hub-hero-bg');
            if (bg) bg.style.backgroundImage = `url('${hero.image}')`;
        }
    }

    function renderAnimalStats(ca) {
        const stats = ca.hero?.stats;
        if (!stats?.length) return;
        const container = document.querySelector('.hub-hero-stats');
        if (!container) return;

        container.innerHTML = stats.map(st => {
            const countAttr = st.isCounter ? ` data-count="${esc(st.value)}"` : '';
            const displayValue = st.isCounter ? '0' : esc(st.value);
            return `<div class="hub-stat">
                <strong${countAttr}>${displayValue}</strong>
                <span>${esc(st.label)}</span>
            </div>`;
        }).join('');
    }

    function renderAnimalNews(ca) {
        const items = ca.noticias;
        if (!items?.length) return;
        const grid = document.querySelector('.hub-news-grid');
        if (!grid) return;

        grid.innerHTML = items.map(n => {
            const isExternal = n.external ? ' target="_blank"' : '';
            const extIcon = n.external ? 'fa-external-link-alt' : 'fa-arrow-right';
            const badgeClass = n.badgeType === 'lei' ? 'hub-news-badge-lei' : n.badgeType === 'reuniao' ? 'hub-news-badge-reuniao' : '';

            if (n.type === 'featured') {
                return `<article class="hub-news-featured">
                    <div class="hub-news-img">
                        <img src="${esc(n.image)}" alt="${esc(n.imageAlt || n.title)}" loading="lazy">
                        <span class="hub-news-badge">${esc(n.badge || 'Destaque')}</span>
                    </div>
                    <div class="hub-news-body">
                        <div class="hub-news-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${esc(n.date || '')}</span>
                            ${n.category ? `<span class="hub-news-cat">${esc(n.category)}</span>` : ''}
                        </div>
                        <h3>${esc(n.title)}</h3>
                        <p>${esc(n.description)}</p>
                        <a href="${esc(n.link || '#')}"${isExternal} class="hub-news-link">${esc(n.linkText || 'Ler mais')} <i class="fas ${extIcon}"></i></a>
                    </div>
                </article>`;
            }
            return `<article class="hub-news-card">
                <div class="hub-news-img">
                    <img src="${esc(n.image)}" alt="${esc(n.imageAlt || n.title)}" loading="lazy">
                    <span class="hub-news-badge ${badgeClass}">${esc(n.badge || '')}</span>
                </div>
                <div class="hub-news-body">
                    <div class="hub-news-meta"><span><i class="fas fa-calendar-alt"></i> ${esc(n.date || '')}</span></div>
                    <h3>${esc(n.title)}</h3>
                    <p>${esc(n.description)}</p>
                    <a href="${esc(n.link || '#')}"${isExternal} class="hub-news-link">${esc(n.linkText || 'Ler mais')} <i class="fas ${extIcon}"></i></a>
                </div>
            </article>`;
        }).join('');
    }

    function renderAnimalLeis(ca) {
        const items = ca.leis;
        if (!items?.length) return;
        const grid = document.querySelector('.hub-laws-grid');
        if (!grid) return;

        grid.innerHTML = items.map(lei => {
            const badgeClass = lei.badgeType === 'approved' ? 'hub-law-approved' : 'hub-law-emenda';
            const badgeIcon = lei.badgeType === 'approved' ? 'fa-check-circle' : 'fa-dollar-sign';
            const featuredClass = lei.featured ? ' hub-law-card-featured' : '';
            const details = (lei.details || []).map(d => `<li><i class="fas fa-check"></i> ${esc(d)}</li>`).join('');
            const isExternal = lei.link?.startsWith('http');

            return `<div class="hub-law-card${featuredClass}">
                <div class="hub-law-top">
                    <span class="hub-law-badge ${badgeClass}"><i class="fas ${badgeIcon}"></i> ${esc(lei.badge)}</span>
                    <span class="hub-law-year">${esc(lei.year)}</span>
                </div>
                <div class="hub-law-icon"><i class="${esc(lei.icon)}"></i></div>
                <h3>${esc(lei.title)}</h3>
                <p>${esc(lei.description)}</p>
                <ul class="hub-law-details">${details}</ul>
                <a href="${esc(lei.link || '#')}"${isExternal ? ' target="_blank"' : ''} class="hub-law-link">Saiba mais <i class="fas ${isExternal ? 'fa-external-link-alt' : 'fa-arrow-right'}"></i></a>
            </div>`;
        }).join('');
    }

    function renderAnimalProjetos(ca) {
        const items = ca.projetos;
        if (!items?.length) return;
        const timeline = document.querySelector('.hub-projects-timeline');
        if (!timeline) return;

        timeline.innerHTML = items.map(p => {
            const statusClass = p.status === 'active' ? 'hub-status-active' : p.status === 'completed' ? 'hub-status-completed' : 'hub-status-planned';
            const statusIcon = p.status === 'active' ? 'fa-spinner fa-pulse' : p.status === 'completed' ? 'fa-check-circle' : 'fa-clock';
            return `<div class="hub-timeline-item">
                <div class="hub-timeline-marker"><i class="${esc(p.icon)}"></i></div>
                <div class="hub-timeline-content">
                    <span class="hub-timeline-status ${statusClass}"><i class="fas ${statusIcon}"></i> ${esc(p.statusText)}</span>
                    <h3>${esc(p.title)}</h3>
                    <p>${esc(p.description)}</p>
                    <div class="hub-timeline-progress">
                        <div class="hub-progress-bar" data-progress="${p.progress}" style="--bar-width:${p.progress}%"></div>
                        <span>${esc(p.progressText)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    function renderAnimalProtetores(ca) {
        const items = ca.protetores;
        if (!items?.length) return;
        const grid = document.querySelector('.hub-protectors-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <div class="hub-protector-card">
                <div class="hub-protector-icon"><i class="${esc(p.icon)}"></i></div>
                <h3>${esc(p.name)}</h3>
                <p>${esc(p.description)}</p>
                <span class="hub-protector-tag">${esc(p.tag)}</span>
            </div>
        `).join('');
    }

    function renderAnimalDenuncia(ca) {
        const d = ca.denuncia;
        if (!d) return;

        // Update channels
        const channelEls = document.querySelectorAll('.hub-channel');
        if (channelEls.length && d.channels) {
            channelEls.forEach((el, i) => {
                const ch = d.channels[i];
                if (!ch) return;
                const iconEl = el.querySelector('.hub-channel-icon i');
                if (iconEl) iconEl.className = ch.icon;
                const titleEl = el.querySelector('h4');
                if (titleEl) titleEl.textContent = ch.title;
                const numEl = el.querySelector('.hub-channel-number');
                if (numEl) { numEl.textContent = ch.number; numEl.href = ch.link; }
                const descEl = el.querySelector('.hub-channel-desc');
                if (descEl) descEl.textContent = ch.desc;
            });
        }

        // Update tips
        const tipEls = document.querySelectorAll('.hub-tip p');
        if (tipEls.length && d.tips) {
            tipEls.forEach((el, i) => {
                if (d.tips[i]) el.textContent = d.tips[i];
            });
        }

        // Update FAB channels
        const fabChannels = document.querySelectorAll('.fab-channel');
        if (fabChannels.length && d.channels) {
            const fabOrder = [0, 2, 3, 1]; // 181, 190, WhatsApp, Gabinete
            fabChannels.forEach((el, i) => {
                const ch = d.channels[fabOrder[i]];
                if (!ch) return;
                const strong = el.querySelector('strong');
                const span = el.querySelector('span');
                if (strong) strong.textContent = ch.title;
                if (span) span.textContent = `${ch.number} — ${ch.desc}`;
                if (el.href !== undefined) el.href = ch.link;
            });
        }
    }

    /* ───────── INIT ───────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCMS);
    } else {
        loadCMS();
    }
})();
