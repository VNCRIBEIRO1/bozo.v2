/* ============================================
   CMS LOADER — Carrega dados do CMS no frontend
   Lê localStorage e atualiza o DOM dinamicamente
   ============================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'cms_bozo_data';

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

    /* ───────── COMMON (Header, Footer) ───────── */
    function renderCommon(data) {
        const s = data.settings || {};

        // Site name / role
        document.querySelectorAll('.logo-name').forEach(el => el.textContent = s.siteName || '');
        document.querySelectorAll('.logo-role').forEach(el => el.textContent = s.siteRole || '');

        // Stamp
        document.querySelectorAll('.stamp-years').forEach(el => el.textContent = s.stampYears || '');
        document.querySelectorAll('.stamp-text').forEach(el => el.innerHTML = (s.stampText || '').replace(/\n/g, '<br>'));

        // Draft bar
        const draftBar = document.querySelector('.draft-bar');
        if (draftBar) {
            if (s.draftMode === false) {
                draftBar.style.display = 'none';
            } else if (s.draftText) {
                draftBar.innerHTML = `<i class="fas fa-drafting-compass"></i> ${s.draftText}`;
            }
        }

        // Contact info
        const contact = s.contact || {};
        document.querySelectorAll('.contato-item').forEach(item => {
            const icon = item.querySelector('i');
            if (!icon) return;
            const iconClass = icon.className;
            if (iconClass.includes('fa-phone') && contact.phone) {
                const pEl = item.querySelector('p');
                if (pEl) pEl.textContent = contact.phone;
            }
            if (iconClass.includes('fa-envelope') && contact.email) {
                const pEl = item.querySelector('p');
                if (pEl) pEl.textContent = contact.email;
            }
            if (iconClass.includes('fa-clock') && contact.hours) {
                const pEl = item.querySelector('p');
                if (pEl) pEl.textContent = contact.hours;
            }
        });

        // Social links
        const soc = s.social || {};
        document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
            if (soc.instagram) el.href = soc.instagram;
        });
        document.querySelectorAll('a[href*="facebook.com"]').forEach(el => {
            if (soc.facebook) el.href = soc.facebook;
        });
    }

    /* ───────── INDEX PAGE ───────── */
    function renderIndex(data) {
        renderHeroSlides(data);
        renderNoticias(data);
        renderPronunciamentos(data);
        renderOpinioes(data);
        renderSobre(data);
        renderBandeiras(data);
        renderGaleria(data);
        renderVideos(data);
        renderCidade(data);
        renderFacebook(data);
    }

    function renderHeroSlides(data) {
        const slides = data.heroSlides;
        if (!slides?.length) return;
        const container = document.querySelector('.hero-slides');
        if (!container) return;

        const activeSlides = slides.filter(s => s.active !== false);
        container.innerHTML = activeSlides.map((slide, i) => {
            const posStyle = slide.imagePosition ? `background-position: ${slide.imagePosition}` : '';
            return `<div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image: url('${slide.image}');${posStyle}">
                <div class="hero-gradient"></div>
                <div class="container">
                    <div class="hero-slide-content">
                        <h2>${slide.title}</h2>
                        <p>${slide.description}</p>
                        <a href="${slide.link || '#'}" class="hero-btn">${slide.linkText || 'Leia mais'} <i class="fas fa-arrow-right"></i></a>
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
            <a href="${n.link || '#'}" class="noticia-card">
                <div class="noticia-card-img">
                    <img src="${n.image}" alt="${n.imageAlt || n.title}" loading="lazy">
                </div>
                <div class="noticia-card-body">
                    <h3>${n.title}</h3>
                    <p>${n.description}</p>
                </div>
                <span class="noticia-card-link">Leia mais &raquo;</span>
            </a>
        `).join('');
    }

    function renderPronunciamentos(data) {
        const items = data.pronunciamentos;
        if (!items?.length) return;
        const grid = document.querySelector('.pronunc-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <a href="${p.link || '#'}" class="pronunc-card">
                <div class="pronunc-card-img">
                    <img src="${p.image}" alt="${p.imageAlt || p.title}" loading="lazy">
                </div>
                <div class="pronunc-card-body">
                    <span class="pronunc-date">${p.date || ''}</span>
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
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

        // Keep arrows and dots container, replace slides
        const prevBtn = carousel.querySelector('.opiniao-prev');
        const nextBtn = carousel.querySelector('.opiniao-next');
        const dotsEl = carousel.querySelector('.opiniao-dots');

        // Remove old slides
        carousel.querySelectorAll('.opiniao-slide').forEach(s => s.remove());

        // Insert new slides before dots
        items.forEach((op, i) => {
            const slide = document.createElement('div');
            slide.className = 'opiniao-slide' + (i === 0 ? ' active' : '');
            slide.innerHTML = `<div class="opiniao-icon"><i class="fas fa-quote-left"></i></div>
                <blockquote>"${op.quote}"</blockquote>
                <cite>${op.author}</cite>`;
            carousel.insertBefore(slide, dotsEl);
        });
    }

    function renderSobre(data) {
        const s = data.sobre;
        if (!s) return;

        // Photo
        const photoImg = document.querySelector('.sobre-photo img');
        if (photoImg && s.photo) photoImg.src = s.photo;

        // Tag
        const tag = document.querySelector('.sobre-tag');
        if (tag && s.tag) tag.textContent = s.tag;

        // Name
        const name = document.querySelector('.sobre-body h2');
        if (name && s.name) name.textContent = s.name;

        // Role
        const role = document.querySelector('.sobre-role');
        if (role && s.role) role.innerHTML = s.role.replace(/\n/g, '<br>');

        // Bio paragraphs
        const bioPs = document.querySelectorAll('.sobre-body > p:not(.sobre-role)');
        if (s.bio && bioPs.length) {
            s.bio.forEach((text, i) => {
                if (bioPs[i]) bioPs[i].textContent = text;
            });
        }
    }

    function renderBandeiras(data) {
        const items = data.bandeiras;
        if (!items?.length) return;
        const row = document.querySelector('.bandeiras-row');
        if (!row) return;

        row.innerHTML = items.map(b => `
            <div class="bandeira-card">
                <div class="bandeira-img"><img src="${b.image}" alt="${b.title}" loading="lazy"></div>
                <div class="bandeira-icon"><i class="${b.icon}"></i></div>
                <h3>${b.title}</h3>
                <p>${b.description}</p>
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
                <img src="${g.image}" alt="${g.caption}" loading="lazy">
                <span class="encontro-caption">${g.caption}</span>
            </div>
        `).join('');
    }

    function renderVideos(data) {
        const items = data.videos;
        if (!items?.length) return;
        const grid = document.querySelector('.videos-grid');
        if (!grid) return;

        grid.innerHTML = items.map(v => `
            <div class="video-thumb"${v.url ? ` onclick="window.open('${v.url}','_blank')" style="cursor:pointer"` : ''}>
                <img src="${v.thumbnail}" alt="${v.caption}" loading="lazy">
                <div class="video-play"><i class="fas fa-play"></i></div>
                <span class="video-caption">${v.caption}</span>
            </div>
        `).join('');
    }

    function renderCidade(data) {
        const c = data.cidade;
        if (!c) return;

        const titleEl = document.querySelector('.nossa-cidade-text h2');
        if (titleEl && c.title) titleEl.textContent = c.title;

        const descEl = document.querySelector('.nossa-cidade-text p');
        if (descEl && c.description) descEl.textContent = c.description;

        const captionEl = document.querySelector('.nossa-cidade-card-caption');
        if (captionEl && c.imageCaption) captionEl.innerHTML = `<i class="fas fa-camera"></i> ${c.imageCaption}`;
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
        renderAnimalNews(ca);
        renderAnimalLeis(ca);
        renderAnimalProjetos(ca);
        renderAnimalProtetores(ca);
        renderAnimalDenuncia(ca, data);
    }

    function renderAnimalHero(ca) {
        const hero = ca.hero;
        if (!hero) return;

        const titleEl = document.querySelector('.hub-hero-content h1');
        if (titleEl && hero.title) titleEl.innerHTML = hero.title.replace(/\n/g, '<br>') + ' <span class="paw-emoji">🐾</span>';

        const descEl = document.querySelector('.hub-hero-content > p');
        if (descEl && hero.description) descEl.textContent = hero.description;

        if (hero.image) {
            const bg = document.querySelector('.hub-hero-bg');
            if (bg) bg.style.backgroundImage = `url('${hero.image}')`;
        }
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
                        <img src="${n.image}" alt="${n.imageAlt || n.title}" loading="lazy">
                        <span class="hub-news-badge">${n.badge || 'Destaque'}</span>
                    </div>
                    <div class="hub-news-body">
                        <div class="hub-news-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${n.date || ''}</span>
                            ${n.category ? `<span class="hub-news-cat">${n.category}</span>` : ''}
                        </div>
                        <h3>${n.title}</h3>
                        <p>${n.description}</p>
                        <a href="${n.link || '#'}"${isExternal} class="hub-news-link">${n.linkText || 'Ler mais'} <i class="fas ${extIcon}"></i></a>
                    </div>
                </article>`;
            }
            return `<article class="hub-news-card">
                <div class="hub-news-img">
                    <img src="${n.image}" alt="${n.imageAlt || n.title}" loading="lazy">
                    <span class="hub-news-badge ${badgeClass}">${n.badge || ''}</span>
                </div>
                <div class="hub-news-body">
                    <div class="hub-news-meta"><span><i class="fas fa-calendar-alt"></i> ${n.date || ''}</span></div>
                    <h3>${n.title}</h3>
                    <p>${n.description}</p>
                    <a href="${n.link || '#'}"${isExternal} class="hub-news-link">${n.linkText || 'Ler mais'} <i class="fas ${extIcon}"></i></a>
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
            const details = (lei.details || []).map(d => `<li><i class="fas fa-check"></i> ${d}</li>`).join('');
            const isExternal = lei.link?.startsWith('http');

            return `<div class="hub-law-card${featuredClass}">
                <div class="hub-law-top">
                    <span class="hub-law-badge ${badgeClass}"><i class="fas ${badgeIcon}"></i> ${lei.badge}</span>
                    <span class="hub-law-year">${lei.year}</span>
                </div>
                <div class="hub-law-icon"><i class="${lei.icon}"></i></div>
                <h3>${lei.title}</h3>
                <p>${lei.description}</p>
                <ul class="hub-law-details">${details}</ul>
                <a href="${lei.link || '#'}"${isExternal ? ' target="_blank"' : ''} class="hub-law-link">Saiba mais <i class="fas ${isExternal ? 'fa-external-link-alt' : 'fa-arrow-right'}"></i></a>
            </div>`;
        }).join('');
    }

    function renderAnimalProjetos(ca) {
        const items = ca.projetos;
        if (!items?.length) return;
        const timeline = document.querySelector('.hub-projects-timeline');
        if (!timeline) return;

        timeline.innerHTML = items.map(p => {
            const statusClass = p.status === 'active' ? 'hub-status-active' : 'hub-status-planned';
            const statusIcon = p.status === 'active' ? 'fa-spinner fa-pulse' : 'fa-clock';
            return `<div class="hub-timeline-item">
                <div class="hub-timeline-marker"><i class="${p.icon}"></i></div>
                <div class="hub-timeline-content">
                    <span class="hub-timeline-status ${statusClass}"><i class="fas ${statusIcon}"></i> ${p.statusText}</span>
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="hub-timeline-progress">
                        <div class="hub-progress-bar" data-progress="${p.progress}" style="--bar-width:${p.progress}%"></div>
                        <span>${p.progressText}</span>
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
                <div class="hub-protector-icon"><i class="${p.icon}"></i></div>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <span class="hub-protector-tag">${p.tag}</span>
            </div>
        `).join('');
    }

    function renderAnimalDenuncia(ca, data) {
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
                el.href = ch.link;
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
