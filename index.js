// index.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const port = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(cors());
// Acepta JSON estricto y también text/plain (Freshchat a veces envía texto)
app.use(express.json({ limit: '1mb', strict: false }));
app.use(express.text({ type: ['text/*', 'application/vnd.freshchat*'] }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ---------- Utils ----------
const normalize = (str = '') =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/\s+/g, ' ')            // colapsa espacios
    .trim();

function levenshtein(a = '', b = '') {
  a = normalize(a); b = normalize(b);
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[m][n];
}

function getBaseUrl(req) {
  const envBase = process.env.BASE_URL;
  if (envBase && /^https?:\/\//i.test(envBase)) return envBase.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host  = req.get('host');
  return `${proto}://${host}`;
}

function buildImageUrl(req, fileName) {
  if (!fileName) return null;
  const base = getBaseUrl(req);
  return `${base}/images/${encodeURIComponent(fileName)}`;
}

function cleanInput(val) {
  if (val == null) return '';
  let s = String(val).trim();
  // Placeholders típicos de Freshchat: ${{custom::...}} -> ignorar
  if (/^\$\{\{.*\}\}$/.test(s)) return '';
  return s;
}

// Intenta extraer "region" o "city" del body aunque venga en text/plain
function extractRegionOrCity(raw) {
  if (raw == null) return '';
  if (typeof raw === 'string') {
    const t = raw.trim();
    // Si parece JSON, intentar parsear
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try { raw = JSON.parse(t); } catch { return cleanInput(t); }
    } else {
      return cleanInput(t);
    }
  }
  if (typeof raw !== 'object' || raw === null) return '';

  const keys = [
    'region','Region','REGION',
    'city','City','CITY',
    'location','Location',
    'selected_region','selectedRegion','user_region',
    'user_input','text','value'
  ];
  for (const k of keys) {
    if (k in raw) {
      const v = cleanInput(raw[k]);
      if (v) return v;
    }
  }
  return '';
}

// ---------- Datos: Perú ----------
const REGION_ALIASES = {
  'ancash':        ['ancas','chimbote','nuevo chimbote','huaraz'],
  'arequipa':      ['miraflores arequipa','aqp','arequipa'],
  'ayacucho':      ['huamanga','ayacucho'],
  'cajamarca':     ['cajamarca'],
  'cusco':         ['cuzco','wanchaq','cusco'],
  'ica':           ['ica'],
  'junin':         ['junin','huancayo'],
  'la libertad':   ['trujillo','victor larco','vista alegre'],
  'lambayeque':    ['chiclayo'],
  'lima':          ['lima','surco','la victoria','cyberplaza','centro de lima'],
  'madre de dios': ['tambopata','puerto maldonado','madre de dios'],
  'pasco':         ['cerro de pasco','pasco'],
  'piura':         ['piura'],
  'puno':          ['puno'],
  'san martin':    ['san martin','tarapoto'],
  'ucayali':       ['ucayali','pucallpa','callería','calleria']
};

const IMAGE_FILES = {
  teamSupport: 'team-support.png',
  deltron:     'grupo-deltron.png'
};

const serviceCenters = [
  { region: 'Áncash', name: 'Team Support Service S.A.C. – Huaraz',
    address: 'Jr. Bolognesi N° 263, Huaraz (278.1 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },
  { region: 'Áncash', name: 'Team Support Service S.A.C. – Nuevo Chimbote',
    address: 'Av. Pacífico Urb. Unicreto Mz S3 – Lt 21, Nuevo Chimbote (385.5 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Arequipa', name: 'Team Support Service S.A.C. – Arequipa',
    address: 'Av. San Martín 2219, Distrito de Miraflores, Arequipa (884.1 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    reference: 'A espaldas del Colegio Luna Pizarro',
    image: IMAGE_FILES.teamSupport },

  { region: 'Ayacucho', name: 'Team Support Service S.A.C. – Ayacucho',
    address: 'Jr. Juan Espinoza Medrano 160, Ayacucho (449.2 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Cajamarca', name: 'Team Support Service S.A.C. – Cajamarca',
    address: 'Jr. José Sabogal 711, Cajamarca (446.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, ZenPad, Gaming NB',
    reference: 'Intersección José Sabogal y Dos de Mayo',
    image: IMAGE_FILES.teamSupport },

  { region: 'Cusco', name: 'Team Support Service S.A.C. – Cusco',
    address: 'Psj. Ramón Castilla 104-B, distrito Wanchaq, Cusco (587.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Ica', name: 'Team Support Service S.A.C. – Ica',
    address: 'Calle Libertad 280-C, Ica (547.3 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB, Gaming Handhelds',
    image: IMAGE_FILES.teamSupport },

  { region: 'Junín', name: 'Team Support Service S.A.C. – Huancayo',
    address: 'Av. Ferrocarril N° 058, Huancayo (319.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'La Libertad', name: 'Team Support Service S.A.C. – Trujillo',
    address: 'Calle Ayacucho 279, Urb. Vista Alegre (Víctor Larco), Trujillo (458.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Lambayeque', name: 'Team Support Service S.A.C. – Chiclayo',
    address: 'Av. Francisco Bolognesi 536, Int. 301, Chiclayo (594.8 km)',
    products: 'Notebook, Desktop PC, All-in-one PCs, Chromebox',
    image: IMAGE_FILES.teamSupport },

  { region: 'Lima', name: 'Team Support Service S.A.C. (Cyberplaza)',
    address: 'Av. Garcilaso de la Vega No 1348, Cyberplaza Local 1B-155, Lima (387.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    reference: 'Nueva dirección desde marzo 2020',
    image: IMAGE_FILES.teamSupport },

  { region: 'Lima', name: 'Grupo Deltron S.A.',
    address: 'Calle Raúl Rebagliati 170, La Victoria, Lima (389.6 km)',
    products: 'Notebook, All-in-one PCs, ZenFone, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.deltron },

  { region: 'Lima', name: 'Team Support Service S.A.C. – Surco',
    address: 'Av. Monte de los Olivos 993, Surco, Lima (392.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Madre de Dios', name: 'Team Support Service S.A.C. – Madre de Dios',
    address: 'Jr. Ica Mz 9B Lote 5A, Tambopata, Madre de Dios (738.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Pasco', name: 'TEAM SUPPORT – Cerro de Pasco',
    address: 'Av. Daniel Alcides Carrión N° 108 Int. B y N° 114 Int. B, Cerro de Pasco (212.9 km)',
    products: 'Notebook, All-in-one PCs, Commercial NB, Gaming NB, Gaming Handhelds, Embedded IPC System',
    image: IMAGE_FILES.teamSupport },

  { region: 'Piura', name: 'Team Support Service S.A.C. – Piura',
    address: 'Jr. Huánuco 633-A, Piura (761.6 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Piura', name: 'Team Support Service S.A.C. – Piura 2',
    address: 'Libertad 639, Dpto. 203, Piura (765.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Puno', name: 'Team Support Service S.A.C. – Puno',
    address: 'Jr. Libertad 215, Cercado, Puno (915.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'San Martín', name: 'Team Support Service – Tarapoto',
    address: 'Jr. José Olaya 194, Tarapoto (334.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport },

  { region: 'Ucayali', name: 'Team Support Service S.A.C. – Pucallpa',
    address: 'Jr. Huáscar 546, Callería, Pucallpa (103.8 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    image: IMAGE_FILES.teamSupport }
];

// ---------- Matching ----------
function matchCentersPeru(inputRegionOrCity) {
  const norm = normalize(inputRegionOrCity);
  if (!norm) return [];

  // 1) exacto por región
  let out = serviceCenters.filter(sc => normalize(sc.region) === norm);
  if (out.length) return out;

  // 2) alias/ciudades por región
  for (const [regionKey, aliases] of Object.entries(REGION_ALIASES)) {
    if (norm === regionKey || aliases.map(normalize).includes(norm)) {
      out = serviceCenters.filter(sc => normalize(sc.region) === regionKey);
      if (out.length) return out;
    }
  }

  // 3) fuzzy leve (distancia <= 2) contra nombre de región
  out = serviceCenters.filter(sc => levenshtein(norm, normalize(sc.region)) <= 2);
  if (out.length) return out;

  // 4) fuzzy leve contra alias
  out = serviceCenters.filter(sc => {
    const key = normalize(sc.region);
    const aliases = REGION_ALIASES[key] || [];
    return aliases.some(a => levenshtein(norm, normalize(a)) <= 2);
  });
  if (out.length) return out;

  return [];
}

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    regionsConfigured: [...new Set(serviceCenters.map(sc => sc.region))].length,
    totalCenters: serviceCenters.length
  });
});

// ---------- Endpoints ----------
app.post('/nearest', (req, res) => {
  console.log('POST /nearest raw body:', typeof req.body, req.body);

  const regionOrCityRaw = extractRegionOrCity(req.body);
  const regionOrCity    = cleanInput(regionOrCityRaw);

  const results = matchCentersPeru(regionOrCity);

  const centers = results.map(sc => {
    const enc = encodeURIComponent(sc.address);
    return {
      region:   sc.region,
      name:     sc.name,
      address:  sc.address,
      products: sc.products,
      ...(sc.reference ? { reference: sc.reference } : {}),
      imageUrl: buildImageUrl(req, sc.image),
      mapLink:     `https://www.google.com/maps/dir/?api=1&destination=${enc}`,
      addressLink: `https://www.google.com/maps/search/?api=1&query=${enc}`,
      embedUrl:    `https://maps.google.com/maps?q=${enc}&output=embed`
    };
  });

  // Siempre 200 para Freshchat
  res.json({
    ok: true,
    query: { input: regionOrCity || null },
    count: centers.length,
    centers
  });
});

// GET para pruebas rápidas en navegador: /nearest?region=lima
app.get('/nearest', (req, res) => {
  const region = cleanInput(req.query.region || '');
  const results = matchCentersPeru(region);
  const centers = results.map(sc => ({
    region: sc.region,
    name:   sc.name,
    address: sc.address,
    products: sc.products
  }));
  res.json({ ok: true, query: { input: region || null }, count: centers.length, centers });
});

// Página simple de mapa
app.get('/map', (req, res) => {
  const enc = encodeURIComponent(req.query.address || '');
  res.send(`<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Mapa</title>
<style>html,body{margin:0;height:100%}iframe{width:100%;height:100%;border:none}</style>
</head><body>
<iframe src="https://maps.google.com/maps?q=${enc}&output=embed" allowfullscreen loading="lazy"></iframe>
</body></html>`);
});

// ---------- Start ----------
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
