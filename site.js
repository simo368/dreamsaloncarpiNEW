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

function renderFeaturedServices(data) {
  if (data.services) renderServicesList('featuredGrid', data.services.filter(s => s.is_package !== 'true'), 3);
}

function renderServices(data) {
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
  const grid = document.getElementById('breakdownGrid');
  if (!grid || !data.reviews) return;
  grid.innerHTML = data.reviews.map(r => `
    <div class="bd-card">
      <div class="bd-score">${r.score}</div>
      <div class="bd-label">${r.label}</div>
    </div>
  `).join('');
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
// GALLERIA — render editoriale + lightbox
// ----------------------------------------------------------------------
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

    // Genera URL a dimensioni diverse per srcset responsive
    // L'endpoint /thumbnail ridimensiona server-side — nessun file originale pesante
    const srcSm  = normalizeDriveUrl(item.image_url, 'w600');
    const srcMed = normalizeDriveUrl(item.image_url, 'w1000');
    const srcLg  = normalizeDriveUrl(item.image_url, 'w1800');
    // URL per lightbox (alta qualità, caricato solo all'apertura)
    const srcFull = normalizeDriveUrl(item.image_url, 'w2400');

    const alt = (item.alt || item.title || 'Dream Salon Carpi').trim();
    // Prima immagine: eager (visibile subito), le altre: lazy
    const isFirst = i === 0;
    const loading = isFirst ? 'eager' : 'lazy';
    const decoding = isFirst ? 'auto' : 'async';

    const caption = item.title
      ? `<span class="gal-caption">${item.title}</span>`
      : '';

    // Determina sizes in base al layout
    let sizes;
    if (cls === 'gal-wide') sizes = '100vw';
    else if (cls === 'gal-hero') sizes = '(max-width:640px) 100vw, 66vw';
    else if (cls === 'gal-tall') sizes = '(max-width:640px) 50vw, 33vw';
    else sizes = '(max-width:640px) 50vw, 33vw';

    const imgHtml = srcMed
      ? `<img
           src="${srcMed}"
           ${srcSm && srcLg ? `srcset="${srcSm} 600w, ${srcMed} 1000w, ${srcLg} 1800w" sizes="${sizes}"` : ''}
           alt="${alt}"
           loading="${loading}"
           decoding="${decoding}"
           onerror="this.closest('.gal-item').classList.add('gal-error'); this.remove();"
         >`
      : ''; // Nessun URL = placeholder CSS puro (nessuna img rotta)

    return `<div
      class="gal-item ${cls}"
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
        } else if (page === 'team.html') {
          renderTeam(data);
        } else if (page === 'contatti.html') {
          renderContact(data);
          renderHours(data);
        } else if (page === 'galleria.html') {
          renderGallery(data);
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
