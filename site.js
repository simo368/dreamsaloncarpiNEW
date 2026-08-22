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

function renderGallery(data) {
  // Popola la gallery con le foto dal tab Photos del foglio Google
  // Struttura colonne foglio: slot | url | alt | tag
  // slot accetta: reception, facciata, postazioni, team, dettagli
  if (!data.photos || data.photos.length === 0) return;

  const SLOT_MAP = {
    reception:  { selector: '.g-item.tall',                   isFirst: true },
    facciata:   { selector: '.g-item:not(.tall):nth-child(2)', isFirst: false },
    postazioni: { selector: '.g-item:not(.tall):nth-child(3)', isFirst: false },
    team:       { selector: '.g-item:not(.tall):nth-child(4)', isFirst: false },
    dettagli:   { selector: '.g-item:not(.tall):nth-child(5)', isFirst: false },
  };

  // Ordina: reception + facciata come "tall" + normali
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
      <img src="${photo.url}" loading="lazy" decoding="async" alt="${alt}">
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
      <td class="${h.closed === 'true' || h.closed === true ? 'closed' : ''}">${h.text}${h.confirm === 'true' ? '<span class="flag">DA CONFERMARE</span>' : ''}</td>
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
    // Le pagine interne (senza hero scuro) devono avere sempre il nav visibile
    const isInnerPage = page !== 'index.html' && page !== '';
    if (isInnerPage) {
      nav.classList.add('scrolled');
    }
    window.addEventListener('scroll', () => {
      if (isInnerPage) {
        nav.classList.add('scrolled'); // mantieni sempre visibile sulle pagine interne
      } else {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      }
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
    console.warn('[site] Progressive enhancement error:', e);
  }
}

init();
