// ======================================================================
// SITE — Dream Salon Carpi
// ======================================================================

// ---------------- SKELETONS ----------------
function showSkeletons() {
  const heroHeadline = document.getElementById('heroHeadline');
  const heroSub = document.getElementById('heroSub');
  const heroMeta = document.getElementById('heroMeta');
  if (heroHeadline) heroHeadline.innerHTML = '<span class="skeleton skeleton-title" style="display:block;"></span>';
  if (heroSub) heroSub.innerHTML = '<span class="skeleton skeleton-text" style="display:block; max-width:520px;"></span>';
  if (heroMeta) heroMeta.innerHTML = '<span class="skeleton skeleton-meta" style="display:block;"></span>';

  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) {
    featuredGrid.innerHTML = '<div class="service-card skeleton-card skeleton"></div>'.repeat(3);
  }

  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid) {
    servicesGrid.innerHTML = '<div class="service-card skeleton-card skeleton"></div>'.repeat(6);
  }

  const packagesGrid = document.getElementById('packagesGrid');
  if (packagesGrid) {
    packagesGrid.innerHTML = '<div class="package-card skeleton-card skeleton"></div>'.repeat(2);
  }

  const teamGrid = document.getElementById('teamGrid');
  if (teamGrid) {
    teamGrid.innerHTML = Array.from({length: 3}, () => `
      <div class="team-card">
        <div class="avatar skeleton-avatar skeleton"></div>
        <div class="skeleton skeleton-title" style="max-width:200px; height:24px; margin-bottom:8px;"></div>
        <div class="skeleton skeleton-text" style="max-width:150px; height:12px;"></div>
      </div>
    `).join('');
  }

  const breakdownGrid = document.getElementById('breakdownGrid');
  if (breakdownGrid) {
    breakdownGrid.innerHTML = Array.from({length: 4}, () => `
      <div class="bd-card">
        <div class="skeleton skeleton-text" style="max-width:60px; height:30px; margin-bottom:8px;"></div>
        <div class="skeleton skeleton-text" style="max-width:120px; height:12px;"></div>
      </div>
    `).join('');
  }

  const hoursTable = document.getElementById('hoursTable');
  if (hoursTable) {
    hoursTable.innerHTML = Array.from({length: 7}, () => `
      <tr>
        <td class="skeleton skeleton-text" style="max-width:80px; height:14px; display:block;"></td>
        <td class="skeleton skeleton-text" style="max-width:150px; height:14px; display:block;"></td>
      </tr>
    `).join('');
  }
}

// ---------------- HELPERS ----------------
const PHONE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

function setPhone(el, phone) {
  if (!el) return;
  const clean = (phone || '059 640544').replace(/\s/g, '');
  el.href = `tel:${clean}`;
  el.innerHTML = `${PHONE_SVG} ${phone || '059 640544'}`;
}

// ---------------- RENDER ----------------
function renderHero(data) {
  const settings = data.settings;
  const headline = document.getElementById('heroHeadline');
  const sub = document.getElementById('heroSub');
  const meta = document.getElementById('heroMeta');

  if (headline && settings.hero_headline) {
    headline.innerHTML = settings.hero_headline;
  }
  if (sub && settings.hero_sub) {
    sub.textContent = settings.hero_sub;
  }
  if (meta && settings) {
    const score = settings.rating_score || '4,9';
    const count = settings.rating_count || '37';
    let treatwellLink = '';
    if (settings.treatwell_url && settings.treatwell_url.trim()) {
      treatwellLink = ` <a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a>`;
    } else {
      treatwellLink = ' Treatwell';
    }
    meta.innerHTML = `
      <span>★ ${score} / 5 —${treatwellLink}</span>
      <span>${count} recensioni</span>
      <span>Trattamenti Davines · Kemon</span>
    `;
  }

  // Hero CTA phone icon + dynamic number
  const heroCta = document.getElementById('heroCta');
  if (heroCta && settings) {
    setPhone(heroCta, settings.phone);
  }
}

function renderServicesList(containerId, list, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
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
  renderServicesList('featuredGrid', data.services, 3);
}

function renderServices(data) {
  renderServicesList('servicesGrid', data.services);
}

function renderPackages(data) {
  const pkgs = document.getElementById('packagesGrid');
  if (!pkgs) return;
  pkgs.innerHTML = data.packages.map(p => `
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
  if (!grid) return;
  grid.innerHTML = data.team.map(t => `
    <div class="team-card reveal">
      <div class="avatar"><span>${t.name.charAt(0)}</span></div>
      <h3>${t.name}</h3>
      <span class="role">${t.role}</span>
      <p class="bio">${t.bio}</p>
      ${t.confirmed !== 'true' ? '<span class="tbc">— da confermare</span>' : ''}
    </div>
  `).join('');
}

function renderBreakdown(data) {
  const grid = document.getElementById('breakdownGrid');
  if (!grid) return;
  grid.innerHTML = data.reviews.map(r => `
    <div class="bd-card">
      <div class="bd-score">${r.score}</div>
      <div class="bd-label">${r.label}</div>
    </div>
  `).join('');
}

function renderHours(data) {
  const table = document.getElementById('hoursTable');
  if (!table) return;
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

  if (address && settings) {
    address.textContent = settings.address;
    address.href = `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}`;
  }
  if (map && settings) {
    map.src = `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`;
  }
}

function renderNavContact(data) {
  const phone = document.getElementById('navPhone');
  if (phone) setPhone(phone, data.settings?.phone);
}

function updateAllPhones(data) {
  setPhone(document.getElementById('navPhone'), data.settings?.phone);
  setPhone(document.getElementById('footerPhone'), data.settings?.phone);
  setPhone(document.getElementById('contactPhone'), data.settings?.phone);
  const heroCta = document.getElementById('heroCta');
  if (heroCta) setPhone(heroCta, data.settings?.phone);
  const finalCta = document.getElementById('finalCta');
  if (finalCta) setPhone(finalCta, data.settings?.phone);
}

function renderTreatwellFresha(data) {
  const settings = data.settings;

  // Hero Treatwell mention
  const heroTreatwell = document.getElementById('heroTreatwell');
  if (heroTreatwell && settings) {
    if (settings.treatwell_url && settings.treatwell_url.trim()) {
      heroTreatwell.innerHTML = `★ ${settings.rating_score || '4,9'} / 5 — <a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a>`;
    } else {
      heroTreatwell.innerHTML = `★ ${settings.rating_score || '4,9'} / 5 — Treatwell`;
    }
  }

  // Rating source Treatwell
  const ratingSource = document.getElementById('ratingSource');
  if (ratingSource && settings) {
    if (settings.treatwell_url && settings.treatwell_url.trim()) {
      ratingSource.innerHTML = `Fonte: <a href="${settings.treatwell_url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline; text-underline-offset:3px;">Treatwell</a> — profilo Dream Salon Carpi`;
    } else {
      ratingSource.textContent = 'Fonte: Treatwell — profilo Dream Salon Carpi';
    }
  }

  // Fresha link (shown near booking CTAs)
  const freshaLink = document.getElementById('freshaLink');
  if (freshaLink && settings) {
    if (settings.fresha_url && settings.fresha_url.trim()) {
      freshaLink.href = settings.fresha_url;
      freshaLink.style.display = '';
    } else {
      freshaLink.style.display = 'none';
    }
  }
}

function renderFooterSocial(data) {
  const settings = data.settings;
  const fb = document.getElementById('footerFacebook');
  const ig = document.getElementById('footerInstagram');

  if (fb && settings) {
    if (settings.facebook_url && settings.facebook_url.trim()) {
      fb.href = settings.facebook_url;
      fb.classList.remove('disabled');
      fb.innerHTML = 'Facebook';
      fb.removeAttribute('aria-disabled');
    } else {
      fb.classList.add('disabled');
      fb.setAttribute('aria-disabled', 'true');
      fb.innerHTML = 'Facebook — da collegare';
    }
  }

  if (ig && settings) {
    if (settings.instagram_url && settings.instagram_url.trim()) {
      ig.href = settings.instagram_url;
      ig.classList.remove('disabled');
      ig.innerHTML = 'Instagram';
      ig.removeAttribute('aria-disabled');
    } else {
      ig.classList.add('disabled');
      ig.setAttribute('aria-disabled', 'true');
      ig.innerHTML = 'Instagram — da collegare';
    }
  }
}

function renderContactSocial(data) {
  const settings = data.settings;
  const wa = document.getElementById('contactWhatsApp');

  if (wa && settings) {
    if (settings.whatsapp && settings.whatsapp.trim()) {
      wa.href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      wa.classList.remove('disabled');
      wa.innerHTML = `WhatsApp`;
      wa.removeAttribute('aria-disabled');
    } else {
      wa.classList.add('disabled');
      wa.setAttribute('aria-disabled', 'true');
      wa.innerHTML = 'WhatsApp — da collegare';
    }
  }
}

// ---------------- PAGE DETECTION ----------------
const page = window.location.pathname.split('/').pop() || 'index.html';

// ---------------- INIT ----------------
async function init() {
  showSkeletons();

  try {
    await window.DS.loadData();
  } catch (e) {
    console.warn('[site] Errore caricamento dati, uso fallback:', e);
  }

  const data = window.DS.getData();

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
  }

  renderNavContact(data);
  updateAllPhones(data);
  renderTreatwellFresha(data);
  renderFooterSocial(data);
  renderContactSocial(data);

  // Final CTA phone icon + dynamic number
  const finalCta = document.getElementById('finalCta');
  if (finalCta) setPhone(finalCta, data.settings?.phone);

  // Active nav
  document.querySelectorAll('.nav-links a:not(.cta-pill)').forEach(a => {
    const href = a.getAttribute('href').split('#')[0] || 'index.html';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Nav scroll
  const nav = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

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

init();

