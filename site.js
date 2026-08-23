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

// ---------------- COOKIE CONSENT ----------------

function loadConsentedResources() {
  // Mostra la mappa Google Maps se presente
  const mapConsent = document.getElementById('mapConsent');
  const map = document.getElementById('contactMap');
  if (mapConsent) mapConsent.style.display = 'none';
  if (map && map.dataset.src) {
    map.src = map.dataset.src;
    map.style.display = '';
  }
}

function acceptCookies() {
  localStorage.setItem('cookie_consent', 'accepted');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transition = 'opacity .3s ease';
    setTimeout(() => banner.remove(), 300);
  }
  loadConsentedResources();
}

function rejectCookies() {
  localStorage.setItem('cookie_consent', 'rejected');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transition = 'opacity .3s ease';
    setTimeout(() => banner.remove(), 300);
  }
}

// Esponi globalmente per chiamate inline da HTML (es. pulsante "Carica mappa" in contatti.html)
window.acceptCookies = acceptCookies;
window.rejectCookies = rejectCookies;

function injectCookieBanner() {
  const consent = localStorage.getItem('cookie_consent');
  if (consent === 'accepted') {
    loadConsentedResources();
    return;
  }
  if (consent === 'rejected') return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consenso cookie');
  banner.innerHTML = `
    <div class="cookie-inner">
      <p>Utilizziamo <strong>Google Maps</strong> per mostrare la nostra sede — questo può impostare cookie di terze parti. Leggi la <a href="privacy.html">Privacy &amp; Cookie Policy</a>.</p>
      <div class="cookie-btns">
        <button class="btn btn-dark" onclick="rejectCookies()">Rifiuta</button>
        <button class="btn btn-primary" onclick="acceptCookies()">Accetta</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
}

// ---------------- PROGRESSIVE ENHANCEMENT ----------------
// Aggiorna l'HTML statico se ci sono nuovi dati da Google Sheets

function renderHero(data) {
  const settings = data.settings;
  if (!settings) return;

  const headline = document.getElementById('heroHeadline');
  const sub = document.getElementById('heroSub');
  const meta = document.getElementById('heroMeta');

  if (headline && settings.hero_headline) headline.innerHTML = settings.hero_headline;
  if (sub && settings.hero_sub) sub.textContent = settings.hero_sub;

  if (meta) {
    const score = settings.rating_score || '4,9';
    const count = settings.rating_count || '37';
    let treatwellLink = settings.treatwell_url && settings.treatwell_url.trim()
      ? ` <a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a>`
      : ' Treatwell';
    meta.innerHTML = `
      <span>★ ${score} / 5 —${treatwellLink}</span>
      <span>${count} recensioni</span>
      <span>Trattamenti Davines · Kemon</span>
    `;
  }
}

function renderServicesList(containerId, list, limit) {
  const grid = document.getElementById(containerId);
  if (!grid || !list) return;
  const items = limit ? list.slice(0, limit) : list;
  grid.innerHTML = items.map(s => {
    const name = (s.name && s.name !== 'undefined') ? s.name : '';
    const description = (s.description && s.description !== 'undefined') ? s.description : '';
    const duration = (s.duration && s.duration !== 'undefined') ? s.duration : '';
    const price = (s.price && s.price !== 'undefined') ? s.price : '';
    if (!name) return '';
    return `
    <div class="service-card">
      <div>
        <div class="s-top">
          <h3>${name}</h3>
          ${duration ? `<span class="dur">${duration}</span>` : ''}
        </div>
        <p>${description}</p>
      </div>
      ${price && price.trim() ? `<span class="price-value">${price}</span>` : '<span class="price-note">Prezzo su richiesta</span>'}
    </div>
  `;
  }).filter(Boolean).join('');
}

function isServicePackage(s) {
  return String(s.is_package || '').toLowerCase() === 'true';
}

function renderFeaturedServices(data) {
  if (data.services) renderServicesList('featuredGrid', data.services.filter(s => !isServicePackage(s)), 3);
}

function renderServices(data) {
  if (data.services) renderServicesList('servicesGrid', data.services.filter(s => !isServicePackage(s)));
}

function renderPackages(data) {
  const pkgs = document.getElementById('packagesGrid');
  if (!pkgs || !data.services) return;
  const list = data.services.filter(s => isServicePackage(s));
  if (!list.length) return;
  pkgs.innerHTML = list.map(p => {
    const name = (p.name && p.name !== 'undefined') ? p.name : '';
    const description = (p.description && p.description !== 'undefined') ? p.description : '';
    const duration = (p.duration && p.duration !== 'undefined') ? p.duration : '';
    const price = (p.price && p.price !== 'undefined') ? p.price : '';
    return `
    <div class="package-card">
      <p class="eyebrow light">Pacchetto</p>
      <h3 style="color:var(--paper); font-size:20px; font-weight:500;">${name}</h3>
      <p>${description}</p>
      <span class="dur">${duration}${duration && price ? ' · ' : ''}${price && price.trim() ? price : 'prezzo su richiesta'}</span>
    </div>
  `;
  }).join('');
}

function renderTeam(data) {
  const grid = document.getElementById('teamGrid');
  if (!grid || !data.team) return;
  // Mostra solo i membri confermati (confirmed === 'true' o 'TRUE')
  const confirmed = data.team.filter(t => String(t.confirmed).toLowerCase() === 'true');
  const list = confirmed.length ? confirmed : data.team;
  grid.innerHTML = list.map(t => `
    <div class="team-card reveal in">
      ${t.photo_url
        ? `<div class="avatar"><img src="${t.photo_url}" alt="Foto di ${t.name}" loading="lazy" decoding="async" /></div>`
        : `<div class="avatar"><span>${t.name.charAt(0)}</span></div>`}
      <h3>${t.name}</h3>
      <span class="role">${t.role}</span>
      <p class="bio">${t.bio}</p>
    </div>
  `).join('');
}

function renderBreakdown(data) {
  const grid = document.getElementById('breakdownGrid');
  if (!grid || !data.reviews) return;
  grid.innerHTML = data.reviews.map(r => `
    <div class="bd-card">
      <div class="bd-score">${r.score}</div>
      <div class="bd-label">${r.label}</div>
    </div>
  `).join('');
}

function renderGallery(data) {
  if (!data.photos || data.photos.length === 0) return;

  const slots = ['reception', 'facciata', 'postazioni', 'team', 'dettagli'];
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return;

  const items = galleryGrid.querySelectorAll('.g-item');
  const photoBySlot = {};
  data.photos.forEach(p => {
    if (p.slot && p.url && p.url.trim()) {
      photoBySlot[p.slot.toLowerCase().trim()] = p;
    }
  });

  items.forEach((item, idx) => {
    const slotName = slots[idx];
    if (!slotName) return;
    const photo = photoBySlot[slotName];
    if (!photo) return;

    const tag = photo.tag || slotName.charAt(0).toUpperCase() + slotName.slice(1);
    const alt = photo.alt || `Dream Salon Carpi — ${tag}`;

    item.classList.remove('g-placeholder');
    item.innerHTML = `
      <img src="${photo.url}" loading="lazy" decoding="async" alt="${alt}" width="800" height="600">
      <span class="g-tag">${tag}</span>
    `;
  });
}

function renderHours(data) {
  const table = document.getElementById('hoursTable');
  if (!table || !data.hours) return;
  table.innerHTML = data.hours.map(h => `
    <tr>
      <td>${h.day}</td>
      <td class="${h.closed === 'true' || h.closed === true ? 'closed' : ''}">${h.text}</td>
    </tr>
  `).join('');
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
    // Aggiorna l'URL della mappa con l'indirizzo reale; il caricamento è controllato dal cookie consent
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.address || '')}&output=embed`;
    map.dataset.src = mapSrc;
    if (localStorage.getItem('cookie_consent') === 'accepted') {
      map.src = mapSrc;
      map.style.display = '';
      const mc = document.getElementById('mapConsent');
      if (mc) mc.style.display = 'none';
    }
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

  const heroTreatwell = document.getElementById('heroTreatwell');
  if (heroTreatwell) {
    heroTreatwell.innerHTML = settings.treatwell_url && settings.treatwell_url.trim()
      ? `<a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a>`
      : 'Treatwell';
  }

  const ratingSource = document.getElementById('ratingSource');
  if (ratingSource) {
    ratingSource.innerHTML = settings.treatwell_url && settings.treatwell_url.trim()
      ? `Fonte: <a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a> — profilo Dream Salon Carpi`
      : 'Fonte: Treatwell — profilo Dream Salon Carpi';
  }

  // Fresha: ora usa tag <a> semantico invece di <span>
  const freshaLink = document.getElementById('freshaLink');
  if (freshaLink) {
    if (settings.fresha_url && settings.fresha_url.trim()) {
      freshaLink.href = settings.fresha_url;
      freshaLink.target = '_blank';
      freshaLink.rel = 'noopener';
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
    } else {
      fb.style.display = 'none';
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
    } else {
      ig.style.display = 'none';
    }
  }

  const wa = document.getElementById('contactWhatsApp');
  const waItem = document.getElementById('whatsappItem');
  if (wa) {
    if (settings.whatsapp && settings.whatsapp.trim()) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      a.className = 'v social-link';
      a.id = 'contactWhatsApp';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = `WhatsApp: ${settings.whatsapp}`;
      wa.replaceWith(a);
      if (waItem) waItem.style.display = '';
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
    const isInnerPage = page !== 'index.html' && page !== '';
    if (isInnerPage) {
      nav.classList.add('scrolled');
    }
    window.addEventListener('scroll', () => {
      if (isInnerPage) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      }
    }, { passive: true });
  }

  // Nav toggle con overlay per mobile
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    // Crea overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.id = 'navOverlay';
    document.body.appendChild(overlay);

    function closeMenu() {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    overlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // Reveal on scroll
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // Cookie consent banner
  injectCookieBanner();
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
          renderGallery(data);
        } else if (page === 'salone.html') {
          renderGallery(data);
        } else if (page === 'servizi.html') {
          renderServices(data);
          renderPackages(data);
        } else if (page === 'team.html') {
          renderTeam(data);
        } else if (page === 'contatti.html') {
          renderContact(data);
          renderHours(data);
        }

        updateAllPhones(data);
        updateAllEmails(data);
        renderTreatwellFresha(data);
        renderSocialLinks(data);
      }
    }
  } catch (e) {
    // Silent fail — il sito funziona comunque con i dati statici
  }
}

init();
