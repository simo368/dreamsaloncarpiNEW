// ======================================================================
// DATA LAYER — Dream Salon Carpi
// ======================================================================
// Questo modulo carica i dati da un Google Sheet pubblico in formato CSV.
// Se il fetch fallisce (Sheet non configurato o non raggiungibile),
// usa automaticamente i dati di fallback identici alla demo attuale.
//
// CONFIGURAZIONE:
//   1. Crea un Google Sheet con 6 tab: Settings, Hours, Services, Team, Reviews, Gallery
//   2. Imposta la condivisione su "Chiunque con il link può visualizzare"
//   3. Sostituisci ID_SPREADSHEET con l'ID del foglio (es: 1aBcD...)
//   4. Sostituisci i GID con quelli reali dei tab (visibili nell'URL)
// ======================================================================

// ----------------------------------------------------------------------
// CONFIG — sostituisci questi valori prima del deploy
// ----------------------------------------------------------------------
const ID_SPREADSHEET = '1JAmaDtiJBgNiRg_lbOTWDidXUcoJEmAXgzhEwzFeOK4'; // es: '1aBcD2EfGhIjKlMnOpQrStUvWxYz123456'

const GID = {
  Settings: 1586047803,  // Sostituisci con il GID del tab "Settings"
  Hours: 369855458,     // Sostituisci con il GID del tab "Hours"
  Services: 1888300907,  // Sostituisci con il GID del tab "Services"
  Team: 308563470,      // Sostituisci con il GID del tab "Team"
  Reviews: 1420541429,   // Sostituisci con il GID del tab "Reviews"
  Gallery: 0,           // TODO: sostituisci con il GID reale del tab "Gallery"
                        // Struttura colonne: id | image_url | title | alt | category | order | visible | featured
};

// ----------------------------------------------------------------------
// CSV Parser minimale — gestisce campi quotati e virgole interne
// ----------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(cell);
        cell = '';
      } else if (c === '\r' && next === '\n') {
        row.push(cell);
        cell = '';
        rows.push(row);
        row = [];
        i++;
      } else if (c === '\n') {
        row.push(cell);
        cell = '';
        rows.push(row);
        row = [];
      } else {
        cell += c;
      }
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function csvToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.some(c => c.trim())).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || '').trim();
    });
    return obj;
  });
}

function csvToKeyValue(rows) {
  if (rows.length < 2) return {};
  const headers = rows[0].map(h => h.trim());
  const keyIdx = headers.indexOf('key');
  const valIdx = headers.indexOf('value');
  const obj = {};
  rows.slice(1).forEach(row => {
    if (keyIdx >= 0 && valIdx >= 0 && row[keyIdx]) {
      obj[row[keyIdx].trim()] = (row[valIdx] || '').trim();
    }
  });
  return obj;
}

// ----------------------------------------------------------------------
// FALLBACK DATA — identica ai dati attualmente hardcoded nella demo
// ----------------------------------------------------------------------
const FALLBACK = {
  settings: {
    business_name: "Dream Salon Carpi",
    phone: "+39 059 640544",
    whatsapp: "",
    email: "dreamsalon2012@libero.it",
    address: "Via Cuneo, 5 — 41012 Carpi (MO)",
    maps_query: "Via+Cuneo+5+41012+Carpi+MO",
    treatwell_url: "",
    fresha_url: "",
    facebook_url: "",
    instagram_url: "",
    hero_headline: "Ogni taglio parte da un'analisi, non da un'idea presa a caso.",
    hero_sub: "Dream Salon è il salone dove Cristina Guanci, con più di venticinque anni di esperienza, costruisce un'immagine su misura: morfologia del viso, colore dell'incarnato, stile personale — prima ancora del taglio.",
    rating_score: "4,9",
    rating_count: "37",
    hero_bg_url: "",  // Se valorizzato sovrascrive la foto hero di default
  },
  hours: [
    { day: "Lunedì", text: "Chiuso", closed: "true", confirm: "false" },
    { day: "Martedì", text: "09:00–16:00", confirm: "false" },
    { day: "Mercoledì", text: "09:00–16:00", confirm: "false" },
    { day: "Giovedì", text: "09:00–20:00", confirm: "false" },
    { day: "Venerdì", text: "09:00–17:00", confirm: "false" },
    { day: "Sabato", text: "08:00–15:00", confirm: "false" },
    { day: "Domenica", text: "Chiuso", closed: "true", confirm: "false" },
  ],
  services: [
    { name: "Consulenza", description: "Punto fondamentale per un servizio accurato e personalizzato.", duration: "", price: "", category: "Base", is_package: "false" },
    { name: "Piega", description: "Creiamo tecniche di styling utilizzando anche ferri e piastre.", duration: "", price: "", category: "Styling", is_package: "false" },
    { name: "Colore", description: "Colorazione senza ammoniaca con principi attivi Velian Complex, per colori brillanti e rispettosi della fibra.", duration: "", price: "", category: "Colore", is_package: "false" },
    { name: "Demi Permanente", description: "Texture in gel per creare giochi di profondità e luminosità personalizzati.", duration: "", price: "", category: "Colore", is_package: "false" },
    { name: "Elumen", description: "Colorazione diretta senza ossigeno per mascherare i capelli bianchi con un effetto naturale.", duration: "", price: "", category: "Colore", is_package: "false" },
    { name: "Colpi di Luce", description: "Servizio personalizzato di schiaritura, adatto a ogni tipo di capello e incarnato.", duration: "", price: "", category: "Colore", is_package: "false" },
    { name: "Effetti Moda", description: "Sfumature naturali e personalizzate per soddisfare le esigenze di ogni cliente.", duration: "", price: "", category: "Colore", is_package: "false" },
    { name: "Trattamenti Cute", description: "Trattamenti per il cuoio capelluto.", duration: "", price: "", category: "Trattamenti", is_package: "false" },
    { name: "Trattamenti Lunghezze", description: "Rituali benessere personalizzati per ogni tipo di capello: lucentezza e corposità garantite.", duration: "", price: "", category: "Trattamenti", is_package: "false" },
    { name: "Kerasilk", description: "Trattamento disciplinante per capelli ondulati, ricci e crespi. 100% vegano.", duration: "", price: "", category: "Trattamenti", is_package: "false" },
  ],
  packages: [],
  team: [
    { name: "Cristina Guanci", role: "Titolare", bio: "Più di venticinque anni di carriera, con un percorso accanto a brand stilisti di grande rilievo. Guida la consulenza d'immagine e il taglio sartoriale: ascolta, osserva e costruisce un look personalizzato per ogni cliente.", confirmed: "true", photo_url: "" },
    { name: "Martina", role: "Collaboratrice", bio: "Lo styling è il suo cavallo di battaglia, molto abile con onde e lisci perfetti.", confirmed: "true", photo_url: "" },
    { name: "Monia", role: "Collaboratrice", bio: "Esuberante. Ricopre ogni mansione in salone. Specializzata in trattamenti olistici.", confirmed: "true", photo_url: "" },
  ],
  reviews: [
    { label: "Colore / Colpi di sole", score: "5,0" },
    { label: "Taglio donna", score: "5,0" },
    { label: "Taglio uomo", score: "5,0" },
    { label: "Piega", score: "4,8" },
  ],
  // Le fotografie della galleria vengono caricate dal tab "Gallery" su Google Sheets.
  // Struttura attesa: { id, image_url, title, alt, category, order, visible, featured }
  // image_url: accetta link Google Drive (formato /file/d/ID/view) — normalizzati automaticamente.
  // visible: TRUE/FALSE — se FALSE la foto viene nascosta.
  // featured: TRUE/FALSE — se TRUE la foto riceve layout hero (più grande).
  // order: numero — ordine di visualizzazione (ascendente).
  gallery: [],
};

// ----------------------------------------------------------------------
// FETCH
// ----------------------------------------------------------------------
async function fetchTab(name) {
  const gid = GID[name];
  if (gid === undefined) {
    console.warn(`[data] Tab "${name}" non configurato in GID.`);
    return null;
  }

  const url = `https://docs.google.com/spreadsheets/d/${ID_SPREADSHEET}/gviz/tq?tqx=out:csv&gid=${gid}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const rows = parseCSV(text);
    return csvToObjects(rows);
  } catch (err) {
    console.warn(`[data] Impossibile caricare il tab "${name}" dallo Sheet:`, err.message);
    return null;
  }
}

// ----------------------------------------------------------------------
// DATA STORE
// ----------------------------------------------------------------------
let store = null;

async function loadData() {
  if (store) return store;

  const tabs = ['Settings', 'Hours', 'Services', 'Team', 'Reviews', 'Gallery'];
  const results = await Promise.all(tabs.map(tab => fetchTab(tab)));
  const [settingsRaw, hours, services, team, reviews, galleryRaw] = results;

  // Settings: converti key/value o righe in oggetto in modo ultra-flessibile
  let settings = { ...FALLBACK.settings };
  if (settingsRaw && settingsRaw.length > 0) {
    settingsRaw.forEach(row => {
      const vals = Object.values(row).map(v => (v || '').trim());
      if (vals.length >= 2) {
        const k = vals[0].toLowerCase();
        const v = vals[1];
        if (k && FALLBACK.settings.hasOwnProperty(k) && v && !v.startsWith('(')) {
          settings[k] = v;
        }
      }
    });
  }

  // Services: separa servizi da pacchetti tramite is_package
  const allServices = services || FALLBACK.services;
  const servicesList = allServices.filter(s => s.is_package !== 'true');
  const packagesList = allServices.filter(s => s.is_package === 'true');

  // Gallery: filtra solo righe con image_url valido (header row check)
  const galleryList = galleryRaw
    ? galleryRaw.filter(g => g && typeof g === 'object' && 'image_url' in g)
    : null;

  store = {
    settings: settings,
    hours: hours || FALLBACK.hours,
    services: servicesList,
    packages: packagesList,
    team: team || FALLBACK.team,
    reviews: reviews || FALLBACK.reviews,
    gallery: galleryList || FALLBACK.gallery,
  };

  console.log('[data] Dati caricati:', store);
  return store;
}

// ----------------------------------------------------------------------
// API PUBBLICA
// ----------------------------------------------------------------------
window.DS = {
  loadData,
  getData: () => store,
};

// Avvia il caricamento immediato
loadData();