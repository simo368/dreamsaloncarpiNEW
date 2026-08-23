// ======================================================================
// DATA LAYER — Dream Salon Carpi
// ======================================================================
// Questo modulo carica i dati da un Google Sheet pubblico in formato CSV.
// Se il fetch fallisce (Sheet non configurato o non raggiungibile),
// usa automaticamente i dati di fallback identici alla demo attuale.
//
// CONFIGURAZIONE:
//   1. Crea un Google Sheet con 5 tab: Settings, Hours, Services, Team, Reviews
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
  Photos: 2088753594,            // Sostituisci con il GID del tab "Photos" (colonne: slot, url, alt, tag)
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
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).filter(r => r.some(c => c.trim())).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = (row[i] || '').trim();
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
    hero_sub: "Dream Salon è il salone dove Cristina Guanci, con vent'anni di esperienza, costruisce un'immagine su misura: morfologia del viso, colore dell'incarnato, stile personale — prima ancora del taglio.",
    rating_score: "4,9",
    rating_count: "37",
    piva: "",
  },
  // TODO: aggiornare con gli orari definitivi dopo il meeting col cliente
  hours: [
    { day: "Lunedì", text: "Chiuso", closed: true, confirm: false },
    { day: "Martedì", text: "09:00–17:00", confirm: false },
    { day: "Mercoledì", text: "09:00–16:00", confirm: false },
    { day: "Giovedì", text: "09:00–19:00", confirm: false },
    { day: "Venerdì", text: "09:00–17:00", confirm: false },
    { day: "Sabato", text: "08:00–15:00", confirm: false },
    { day: "Domenica", text: "Chiuso", closed: true, confirm: false },
  ],
  services: [
    { name: "Taglio donna", description: "Preceduto da consulenza d'immagine e valutazione della morfologia del viso.", duration: "", price: "", category: "", is_package: "false" },
    { name: "Taglio uomo", description: "Taglio su misura, aggiornato sulle tendenze del momento.", duration: "", price: "", category: "", is_package: "false" },
    { name: "Piega Luxury", description: "Piega curata nei dettagli, per un risultato più duraturo.", duration: "45 min", price: "", category: "", is_package: "false" },
    { name: "Piega capelli media lunghezza", description: "Piega classica su lunghezze medie.", duration: "30 min", price: "", category: "", is_package: "false" },
    { name: "Colore & colpi di luce", description: "Colorazione, gloss/tonalizzanti e colpi di luce, in pacchetto dedicato.", duration: "", price: "", category: "", is_package: "false" },
    { name: "Trattamenti cute e capelli", description: "Trattamento cute mirato e ricostruzione profonda della fibra.", duration: "15 min – 1 h", price: "", category: "", is_package: "false" },
    { name: "Barba", description: "Servizio dedicato alla cura della barba.", duration: "", price: "", category: "", is_package: "false" },
    { name: "Piega capelli corti", description: "Piega rapida su lunghezze corte.", duration: "30 min", price: "", category: "", is_package: "false" },
  ],
  packages: [
    { name: "Percorso Effetto Moda", description: "Taglio donna + effetto moda + colore + piega capelli media lunghezza.", duration: "2 h 45 min", price: "", category: "", is_package: "true" },
    { name: "Percorso Luce & Colore", description: "Taglio donna + piega media lunghezza + gloss/tonalizzanti + colpi di luce.", duration: "2 h 45 min", price: "", category: "", is_package: "true" },
  ],
  // TODO: aggiungere gli altri membri del team dopo conferma col cliente
  team: [
    { name: "Cristina Guanci", role: "Titolare", bio: "Esperienza ventennale nel settore. Guida la consulenza d'immagine e il taglio sartoriale.", confirmed: "true", photo_url: "" },
  ],
  reviews: [
    { label: "Colore / Colpi di sole", score: "5,0" },
    { label: "Taglio donna", score: "5,0" },
    { label: "Taglio uomo", score: "5,0" },
    { label: "Piega", score: "4,8" },
  ],
  // Photos: vuoto per default — si popolano dal foglio Google
  // Struttura colonne: slot (reception|facciata|postazioni|team|dettagli), url, alt, tag
  photos: [],
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

  const tabs = ['Settings', 'Hours', 'Services', 'Team', 'Reviews', 'Photos'];
  const results = await Promise.all(tabs.map(tab => fetchTab(tab)));
  const [settingsRaw, hours, services, team, reviews, photos] = results;

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
  const isPkg = s => ['true', 'vero'].includes(String(s.is_package || '').toLowerCase().trim());
  const servicesList = allServices.filter(s => !isPkg(s));
  const packagesList = allServices.filter(s => isPkg(s));

  store = {
    settings: settings,
    hours: hours || FALLBACK.hours,
    services: servicesList,
    packages: packagesList,
    team: team || FALLBACK.team,
    reviews: reviews || FALLBACK.reviews,
    photos: photos || [],
  };

  // console.log rimosso per produzione
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