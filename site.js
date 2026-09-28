// ======================================================================
// SITE — Dream Salon Carpi
// ======================================================================

// ---------------- HELPERS ----------------
const PHONE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

function setPhone(el, phone) {
  if (!el || !phone) return;
  const clean = phone.replace(/\s/g, '');
  if (el.tagName === 'A') {
    el.href = `tel:${clean}`;
  }
  el.innerHTML = `${PHONE_SVG} ${phone}`;
}

// ----------------------------------------------------------------------
// Google Drive URL normalizer — FUNZIONE CENTRALIZZATA
// Converte un link di condivisione Drive in URL immagine ridimensionato.
// Usa l'endpoint /thumbnail?id=...&sz=wXXX che ridimensiona server-side,
// evitando di caricare il file originale pesante.
// NON duplicare questa logica altrove.
// ----------------------------------------------------------------------
function normalizeDriveUrl(rawUrl, size) {
  if (!rawUrl || !rawUrl.trim()) return '';
  const url = rawUrl.trim();

  // URL non Drive: usato direttamente senza modifiche
  if (!url.includes('drive.google.com')) return url;

  // Estrai ID dal formato /file/d/{ID}/view o simili
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=${size || 'w1200'}`;

  // Estrai ID dal formato ?id={ID} o &id={ID}
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=${size || 'w1200'}`;

  // URL Drive non riconoscibile — evita immagine rotta
  console.warn('[gallery] URL Drive non riconoscibile:', url);
  return '';
}

// ---------------- PROGRESSIVE ENHANCEMENT ----------------
// Aggiorna l'HTML statico se ci sono nuovi dati da Google Sheets

function renderHero(data) {
  const settings = data.settings;
  if (!settings) return;

  const headline = document.getElementById('heroHeadline');
  const heroBg = document.getElementById('heroBg');

  // Aggiorna titolo hero da Sheets se valorizzato
  if (headline && settings.hero_headline) headline.innerHTML = settings.hero_headline;

  // Aggiorna foto hero da Sheets (chiave: hero_bg_url)
  if (heroBg && settings.hero_bg_url && settings.hero_bg_url.trim()) {
    const bgUrl = normalizeDriveUrl(settings.hero_bg_url.trim(), 'w1920');
    if (bgUrl) {
      heroBg.style.backgroundImage = `url('${bgUrl}')`;
      heroBg.style.backgroundSize = 'cover';
      heroBg.style.backgroundPosition = 'center';
      heroBg.style.backgroundRepeat = 'no-repeat';
    }
  }
}

// Aggiorna il background della testata nelle pagine interne (chiave: inner_bg_url in Sheets)
function renderInnerHero(data) {
  const settings = data.settings;
  if (!settings || !settings.inner_bg_url || !settings.inner_bg_url.trim()) return;

  const heroEl = document.querySelector('.hero, .page-hero, .section-dark[style*="padding-top"], .section-anthracite[style*="padding-top"]');
  if (!heroEl) return;

  const bgUrl = normalizeDriveUrl(settings.inner_bg_url.trim(), 'w1920');
  if (!bgUrl) return;

  // Nessun gradiente grigio: applica la fotografia pulita
  heroEl.style.backgroundImage = `url('${bgUrl}')`;
  heroEl.style.backgroundPosition = 'center 30%';
  heroEl.style.backgroundSize = 'cover';
  heroEl.style.backgroundRepeat = 'no-repeat';
}

function renderServicesList(containerId, list, limit) {
  const grid = document.getElementById(containerId);
  if (!grid || !list) return;
  const items = limit ? list.slice(0, limit) : list;
  grid.innerHTML = items.map(s => `
    <div class="service-card">
      <div>
        <div class="s-top">
          <h3>${s.name}</h3>
          ${s.duration ? `<span class="dur">${s.duration}</span>` : ''}
        </div>
        <p>${s.description}</p>
      </div>
      ${s.price && s.price.trim() ? `<span class="price-value">${s.price}</span>` : '<span class="price-note">Prezzo su richiesta</span>'}
    </div>
  `).join('');
}

// renderFeaturedServices: la homepage usa una lista statica hardcoded (srv-list).
// Non esiste un contenitore featuredGrid né servicesGrid nel DOM corrente.
// I dati da Sheets sono caricati ma la lista statica è già completa e aggiornata.
function renderFeaturedServices(data) {
  // Nessun aggiornamento DOM necessario — lista servizi è hardcoded in index.html
}

function renderServices(data) {
  // La pagina servizi.html usa card statiche hardcoded.
  // Se in futuro si aggiunge id="servicesGrid", questa funzione si attiva automaticamente.
  if (data.services) renderServicesList('servicesGrid', data.services.filter(s => s.is_package !== 'true'));
}

function renderPackages(data) {
  const pkgs = document.getElementById('packagesGrid');
  if (!pkgs || !data.services) return;
  const list = data.services.filter(s => s.is_package === 'true');
  pkgs.innerHTML = list.map(p => `
    <div class="package-card">
      <p class="eyebrow light">Pacchetto</p>
      <h3 style="color:var(--paper); font-size:20px; font-weight:500;">${p.name}</h3>
      <p>${p.description}</p>
      <span class="dur">${p.duration || ''}${p.duration && p.price ? ' · ' : ''}${p.price && p.price.trim() ? p.price : 'prezzo su richiesta'}</span>
    </div>
  `).join('');
}

function renderTeam(data) {
  const grid = document.getElementById('teamGrid');
  if (!grid || !data.team) return;
  grid.innerHTML = data.team.map(t => `
    <div class="team-card reveal in">
      ${t.photo_url 
        ? `<div class="avatar"><img src="${t.photo_url}" alt="${t.name}" loading="lazy" decoding="async" /></div>` 
        : `<div class="avatar"><span>${t.name.charAt(0)}</span></div>`}
      <h3>${t.name}</h3>
      <span class="role">${t.role}</span>
      <p class="bio">${t.bio}</p>
      ${t.confirmed !== 'true' ? '<span class="tbc">— da confermare</span>' : ''}
    </div>
  `).join('');
}

function renderBreakdown(data) {
  // breakdownGrid non esiste nella homepage (sezione rating usa struttura .rating-section custom).
  // Aggiorna il rating score nella sezione se valorizzato da Sheets.
  const grid = document.getElementById('breakdownGrid');
  if (grid && data.reviews) {
    grid.innerHTML = data.reviews.map(r => `
      <div class="bd-card">
        <div class="bd-score">${r.score}</div>
        <div class="bd-label">${r.label}</div>
      </div>
    `).join('');
  }

  // Aggiorna il numero grande nella rating-section se valorizzato da Sheets
  if (data.settings) {
    const ratingBigNum = document.querySelector('.rating-big-num');
    if (ratingBigNum && data.settings.rating_score) {
      ratingBigNum.textContent = data.settings.rating_score;
    }
  }
}

function renderHours(data) {
  const table = document.getElementById('hoursTable');
  if (!table || !data.hours) return;
  table.innerHTML = data.hours.map(h => `
    <tr>
      <td>${h.day}</td>
      <td class="${h.closed === 'true' || h.closed === true ? 'closed' : ''}">${h.text}${h.confirm === 'true' ? '<span class="flag">DA CONFERMARE</span>' : ''}</td>
    </tr>
  `).join('');
}

// ----------------------------------------------------------------------
// GALLERIA — render editoriale + LQIP blur-up + lazy loading ottimizzato
// ----------------------------------------------------------------------

// Retry con backoff esponenziale per immagini che falliscono
const GAL_MAX_RETRIES = 2;
window.galRetry = function(img) {
  const retries = parseInt(img.dataset.retries || '0', 10);
  if (retries >= GAL_MAX_RETRIES) {
    const item = img.closest('.gal-item');
    if (item) item.classList.add('gal-error');
    img.remove();
    return;
  }
  img.dataset.retries = String(retries + 1);
  const src = img.getAttribute('src');
  if (!src) return;
  const delay = (retries + 1) * 1000;
  setTimeout(() => {
    const sep = src.includes('?') ? '&' : '?';
    img.src = src + sep + '_r=' + Date.now();
  }, delay);
};

// Preload <link> per immagini above-the-fold
function preloadAboveFold(items) {
  items.forEach(item => {
    const url = normalizeDriveUrl(item.image_url, 'w1000');
    if (!url) return;
    if (document.querySelector('link[rel="preload"][href="' + url + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Attiva un'immagine lazy: sposta data-* → attributi reali
function activateImage(img) {
  if (img.dataset.srcset) {
    img.setAttribute('srcset', img.dataset.srcset);
    delete img.dataset.srcset;
  }
  if (img.dataset.sizes) {
    img.setAttribute('sizes', img.dataset.sizes);
    delete img.dataset.sizes;
  }
  if (img.dataset.src) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
}

// IntersectionObserver con buffer 300px per pre-caricare prima del viewport
function setupGalleryObserver() {
  const lazyImages = document.querySelectorAll('.gal-item img[data-src]');
  if (!lazyImages.length) return;

  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(img => activateImage(img));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '300px 0px',
    threshold: 0
  });

  lazyImages.forEach(img => observer.observe(img));
}
function renderGallery(data) {
  const grid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('galleryEmpty');
  if (!grid) return;

  const raw = (data && data.gallery) ? data.gallery : [];

  // Filtra per visible (default: mostra se campo non esplicitamente FALSE)
  // Ordina per order ascendente
  const items = raw
    .filter(g => {
      const vis = (g.visible || '').trim().toUpperCase();
      return vis !== 'FALSE' && vis !== '0';
    })
    .sort((a, b) => parseInt(a.order || '999', 10) - parseInt(b.order || '999', 10));

  if (items.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    grid.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.style.display = '';

  // Numero di immagini above-the-fold da precaricare eagerly
  const EAGER_COUNT = 3;

  // Ciclo di layout editoriale — varia le dimensioni per ritmo visivo
  // featured=TRUE forza sempre gal-hero (item protagonista)
  const layoutCycle = ['gal-hero', 'gal-std', 'gal-tall', 'gal-std', 'gal-std', 'gal-wide', 'gal-std', 'gal-std'];
  let cycleIdx = 0;

  grid.innerHTML = items.map((item, i) => {
    const isFeatured = (item.featured || '').trim().toUpperCase() === 'TRUE';
    let cls;
    if (isFeatured) {
      cls = 'gal-hero';
    } else {
      cls = layoutCycle[cycleIdx % layoutCycle.length];
      cycleIdx++;
    }

    // URL a dimensioni diverse — /thumbnail ridimensiona server-side
    const srcLqip = normalizeDriveUrl(item.image_url, 'w40');   // LQIP ~1-2KB
    const srcSm   = normalizeDriveUrl(item.image_url, 'w600');
    const srcMed  = normalizeDriveUrl(item.image_url, 'w1000');
    const srcLg   = normalizeDriveUrl(item.image_url, 'w1800');
    const srcFull = normalizeDriveUrl(item.image_url, 'w2400'); // Lightbox

    const alt = (item.alt || item.title || 'Dream Salon Carpi').trim();
    const isEager = i < EAGER_COUNT;

    const caption = item.title
      ? `<span class="gal-caption">${item.title}</span>`
      : '';

    // Sizes per srcset responsive
    let sizes;
    if (cls === 'gal-wide') sizes = '100vw';
    else if (cls === 'gal-hero') sizes = '(max-width:640px) 100vw, 66vw';
    else sizes = '(max-width:640px) 50vw, 33vw';

    // LQIP come CSS custom property per il blur placeholder
    const lqipStyle = srcLqip ? `--lqip:url('${srcLqip}')` : '';
    const srcsetAttr = srcSm && srcLg
      ? `${srcSm} 600w, ${srcMed} 1000w, ${srcLg} 1800w`
      : '';

    let imgHtml = '';
    if (srcMed) {
      if (isEager) {
        // Above-the-fold: carica immediatamente
        imgHtml = `<img
          src="${srcMed}"
          ${srcsetAttr ? `srcset="${srcsetAttr}" sizes="${sizes}"` : ''}
          alt="${alt}"
          loading="eager"
          decoding="auto"
          onload="this.closest('.gal-item').classList.add('gal-loaded')"
          onerror="galRetry(this)"
        >`;
      } else {
        // Below-the-fold: differito con IntersectionObserver
        imgHtml = `<img
          data-src="${srcMed}"
          ${srcsetAttr ? `data-srcset="${srcsetAttr}" data-sizes="${sizes}"` : ''}
          alt="${alt}"
          decoding="async"
          onload="this.closest('.gal-item').classList.add('gal-loaded')"
          onerror="galRetry(this)"
        >`;
      }
    }

    return `<div
      class="gal-item ${cls}"
      ${lqipStyle ? `style="${lqipStyle}"` : ''}
      data-src-full="${srcFull}"
      data-alt="${alt.replace(/"/g, '&quot;')}"
      data-title="${(item.title || '').replace(/"/g, '&quot;')}"
      role="button"
      tabindex="${srcFull ? '0' : '-1'}"
      aria-label="${srcFull ? 'Visualizza: ' + alt.replace(/"/g, '&quot;') : alt.replace(/"/g, '&quot;')}"
    >
      ${imgHtml}
      ${caption}
    </div>`;
  }).join('');

  // Gestisci immagini caricate dalla cache del browser prima dell'handler onload
  grid.querySelectorAll('.gal-item img[src]').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.closest('.gal-item').classList.add('gal-loaded');
    }
  });

  // Inietta <link rel="preload"> per le prime immagini above-the-fold
  preloadAboveFold(items.slice(0, EAGER_COUNT));

  // Attiva IntersectionObserver per le immagini lazy
  setupGalleryObserver();

  // Attiva lightbox dopo che il DOM è aggiornato
  initLightbox();
}

function initLightbox() {
  const lb = document.getElementById('lb');
  if (!lb) return;

  const lbImg     = document.getElementById('lbImg');
  const lbTitle   = document.getElementById('lbTitle');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  const lbCounter = document.getElementById('lbCounter');
  if (!lbImg || !lbClose) return;

  // Rimuovi listener precedenti rimpiazzando i nodi (evita duplicati)
  const newClose = lbClose.cloneNode(true);
  lbClose.parentNode.replaceChild(newClose, lbClose);
  if (lbPrev) { const np = lbPrev.cloneNode(true); lbPrev.parentNode.replaceChild(np, lbPrev); }
  if (lbNext) { const nn = lbNext.cloneNode(true); lbNext.parentNode.replaceChild(nn, lbNext); }

  let items = [];
  let current = 0;

  function open(idx) {
    current = ((idx % items.length) + items.length) % items.length;
    const it = items[current];
    lbImg.src = ''; // reset per mostrare loading
    lbImg.alt = it.alt;
    lbImg.src = it.src;
    if (lbTitle) lbTitle.textContent = it.title;
    if (lbCounter) lbCounter.textContent = `${current + 1} / ${items.length}`;
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }

  function close() {
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = ''; // libera memoria
  }

  function go(dir) { open(current + dir); }

  // Raccogli items clickabili
  items = Array.from(document.querySelectorAll('.gal-item[data-src-full]'))
    .filter(el => el.dataset.srcFull)
    .map(el => ({
      src:   el.dataset.srcFull,
      alt:   el.dataset.alt   || 'Dream Salon Carpi',
      title: el.dataset.title || '',
    }));

  // Nascondi nav se c'è solo 1 immagine
  const pBtn = document.getElementById('lbPrev');
  const nBtn = document.getElementById('lbNext');
  if (pBtn) pBtn.style.display = items.length <= 1 ? 'none' : '';
  if (nBtn) nBtn.style.display = items.length <= 1 ? 'none' : '';
  if (lbCounter) lbCounter.style.display = items.length <= 1 ? 'none' : '';

  // Click su gallery items
  document.querySelectorAll('.gal-item[data-src-full]').forEach((el, i) => {
    if (!el.dataset.srcFull) return;
    el.addEventListener('click', () => open(i));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  // Controlli lightbox
  document.getElementById('lbClose').addEventListener('click', close);
  if (document.getElementById('lbPrev')) document.getElementById('lbPrev').addEventListener('click', () => go(-1));
  if (document.getElementById('lbNext')) document.getElementById('lbNext').addEventListener('click', () => go(1));

  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  // Tastiera
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
}

function renderContact(data) {
  const address = document.getElementById('contactAddress');
  const map = document.getElementById('contactMap');
  const settings = data.settings;
  if (!settings) return;

  if (address) {
    address.textContent = settings.address;
    address.href = `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}`;
  }
  if (map) {
    map.src = `https://www.google.com/maps?q=${encodeURIComponent(settings.address || '')}&output=embed`;
  }
}

function updateAllPhones(data) {
  const settings = data.settings;
  if (!settings) return;
  setPhone(document.getElementById('navPhone'), settings.phone);
  setPhone(document.getElementById('footerPhone'), settings.phone);
  setPhone(document.getElementById('contactPhone'), settings.phone);
  setPhone(document.getElementById('heroCta'), settings.phone);
  setPhone(document.getElementById('finalCta'), settings.phone);
}

function updateAllEmails(data) {
  const settings = data.settings;
  if (!settings || !settings.email) return;
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.href = `mailto:${settings.email}`;
    if (a.textContent.includes('@')) {
      a.textContent = settings.email;
    }
  });
}

function renderTreatwellFresha(data) {
  const settings = data.settings;
  if (!settings) return;

  // Treatwell rimosso dal sito — nessun elemento heroTreatwell o ratingSource da aggiornare.

  // Fresha: mostra il pulsante prenota solo se l'URL è configurato in Sheets
  const freshaLink = document.getElementById('freshaLink');
  if (freshaLink) {
    if (settings.fresha_url && settings.fresha_url.trim()) {
      freshaLink.dataset.href = settings.fresha_url;
      freshaLink.style.display = '';
    } else {
      freshaLink.style.display = 'none';
    }
  }
}

function renderSocialLinks(data) {
  const settings = data.settings;
  if (!settings) return;

  const fb = document.getElementById('footerFacebook');
  if (fb) {
    if (settings.facebook_url && settings.facebook_url.trim()) {
      const a = document.createElement('a');
      a.href = settings.facebook_url;
      a.className = 'social-link';
      a.id = 'footerFacebook';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Facebook';
      fb.replaceWith(a);
    }
  }

  const ig = document.getElementById('footerInstagram');
  if (ig) {
    if (settings.instagram_url && settings.instagram_url.trim()) {
      const a = document.createElement('a');
      a.href = settings.instagram_url;
      a.className = 'social-link';
      a.id = 'footerInstagram';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Instagram';
      ig.replaceWith(a);
    }
  }

  const wa = document.getElementById('contactWhatsApp');
  if (wa) {
    if (settings.whatsapp && settings.whatsapp.trim()) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      a.className = 'v social-link';
      a.id = 'contactWhatsApp';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'WhatsApp';
      wa.replaceWith(a);
    }
  }
}

// ---------------- UI INTERACTIONS ----------------
function initUI() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Active nav
  document.querySelectorAll('.nav-links a:not(.cta-pill)').forEach(a => {
    const href = a.getAttribute('href').split('#')[0] || 'index.html';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Nav scroll
  const nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    }));
  }

  // Reveal on scroll
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }
}

// ---------------- INIT ----------------
async function init() {
  initUI();

  try {
    if (window.DS && window.DS.loadData) {
      await window.DS.loadData();
      const data = window.DS.getData();
      if (data) {
        const page = window.location.pathname.split('/').pop() || 'index.html';

        if (page === 'index.html' || page === '') {
          renderHero(data);
          renderFeaturedServices(data);
          renderBreakdown(data);
        } else if (page === 'servizi.html') {
          renderServices(data);
          renderPackages(data);
          renderInnerHero(data);
        } else if (page === 'team.html') {
          renderTeam(data);
          renderInnerHero(data);
        } else if (page === 'contatti.html') {
          renderContact(data);
          renderHours(data);
          renderInnerHero(data);
        } else if (page === 'galleria.html') {
          renderGallery(data);
          renderInnerHero(data);
        }

        updateAllPhones(data);
        updateAllEmails(data);
        renderTreatwellFresha(data);
        renderSocialLinks(data);
      }
    }
  } catch (e) {
    console.warn('[site] Progressive enhancement error:', e);
  }
}

init();
