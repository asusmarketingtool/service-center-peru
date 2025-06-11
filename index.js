const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1) Servir estáticos de /public/images en /images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Helper para normalizar cadenas (minúsculas, sin tildes ni espacios extra)
const normalize = str =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// 2) Definir URLs de las imágenes
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const IMAGES = {
  teamSupport: `${BASE_URL}/images/team-support.png`,
  deltron:     `${BASE_URL}/images/grupo-deltron.png`
};

// 3) Lista completa de centros de servicio en Perú, con imageUrl
const serviceCenters = [
  {
    region: 'Áncash',
    name: 'Team Support Service S.A.C. – Huaraz',
    address: 'Jr. Bolognesi N° 263, Huaraz (278.1 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Áncash',
    name: 'Team Support Service S.A.C. – Nuevo Chimbote',
    address: 'Av. Pacífico Urb. Unicreto Mz S3 – Lt 21, Nuevo Chimbote (385.5 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Arequipa',
    name: 'Team Support Service S.A.C. – Arequipa',
    address: 'Av. San Martín 2219, Distrito de Miraflores, Arequipa (884.1 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    reference: 'A espaldas del Colegio Luna Pizarro',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Ayacucho',
    name: 'Team Support Service S.A.C. – Ayacucho',
    address: 'Jr. Juan Espinoza Medrano 160, Ayacucho (449.2 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Cajamarca',
    name: 'Team Support Service S.A.C. – Cajamarca',
    address: 'Jr. José Sabogal 711, Cajamarca (446.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, ZenPad, Gaming NB',
    reference: 'Intersección José Sabogal y Dos de Mayo',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Cusco',
    name: 'Team Support Service S.A.C. – Cusco',
    address: 'Psj. Ramón Castilla 104-B, distrito Wanchaq, Cusco (587.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Ica',
    name: 'Team Support Service S.A.C. – Ica',
    address: 'Calle Libertad 280-C, Ica (547.3 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB, Gaming Handhelds',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Junín',
    name: 'Team Support Service S.A.C. – Huancayo',
    address: 'Av. Ferrocarril N° 058, Huancayo (319.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'La Libertad',
    name: 'Team Support Service S.A.C. – Trujillo',
    address: 'Calle Ayacucho 279, Urb. Vista Alegre (Víctor Larco), Trujillo (458.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Lambayeque',
    name: 'Team Support Service S.A.C. – Chiclayo',
    address: 'Av. Francisco Bolognesi 536, Int. 301, Chiclayo (594.8 km)',
    products: 'Notebook, Desktop PC, All-in-one PCs, Chromebox',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Lima',
    name: 'Team Support Service S.A.C. (Cyberplaza)',
    address: 'Av. Garcilaso de la Vega No 1348, Cyberplaza Local 1B-155, Lima (387.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    reference: 'Nueva dirección desde marzo 2020',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Lima',
    name: 'Grupo Deltron S.A.',
    address: 'Calle Raúl Rebagliati 170, La Victoria, Lima (389.6 km)',
    products: 'Notebook, All-in-one PCs, ZenFone, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.deltron
  },
  {
    region: 'Lima',
    name: 'Team Support Service S.A.C. – Surco',
    address: 'Av. Monte de los Olivos 993, Surco, Lima (392.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Madre de Dios',
    name: 'Team Support Service S.A.C. – Madre de Dios',
    address: 'Jr. Ica Mz 9B Lote 5A, Tambopata, Madre de Dios (738.7 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Pasco',
    name: 'TEAM SUPPORT – Cerro de Pasco',
    address: 'Av. Daniel Alcides Carrión N° 108 Int. B y N° 114 Int. B, Cerro de Pasco (212.9 km)',
    products: 'Notebook, All-in-one PCs, Commercial NB, Gaming NB, Gaming Handhelds, Embedded IPC System',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Piura',
    name: 'Team Support Service S.A.C. – Piura',
    address: 'Jr. Huánuco 633-A, Piura (761.6 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Piura',
    name: 'Team Support Service S.A.C. – Piura 2',
    address: 'Libertad 639, Dpto. 203, Piura (765.0 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Puno',
    name: 'Team Support Service S.A.C. – Puno',
    address: 'Jr. Libertad 215, Cercado, Puno (915.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'San Martín',
    name: 'Team Support Service – Tarapoto',
    address: 'Jr. José Olaya 194, Tarapoto (334.4 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  },
  {
    region: 'Ucayali',
    name: 'Team Support Service S.A.C. – Pucallpa',
    address: 'Jr. Huáscar 546, Callería, Pucallpa (103.8 km)',
    products: 'Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB',
    imageUrl: IMAGES.teamSupport
  }
];

// 4) Ruta POST /nearest
app.post('/nearest', (req, res) => {
  const rawInput = req.body.region || '';
  const regionInput = normalize(rawInput);

  console.log('🔍 Received region:', rawInput);
  console.log('🧼 Normalized region:', regionInput);

  const matches = serviceCenters.filter(sc => normalize(sc.region) === regionInput);
  if (!matches.length) {
    return res.status(404).json({ error: 'Sin centro de servicio en esta región.' });
  }

  const centersWithExtras = matches.map(sc => {
    const encoded = encodeURIComponent(sc.address);
    return {
      region: sc.region,
      name: sc.name,
      address: sc.address,
      products: sc.products,
      ...(sc.reference ? { reference: sc.reference } : {}),
      mapLink: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
      imageUrl: sc.imageUrl
    };
  });

  res.json({ centers: centersWithExtras });
});

// 5) Ruta GET /map (opcional)
app.get('/map', (req, res) => {
  const rawAddr = req.query.address || '';
  const enc = encodeURIComponent(rawAddr);
  const url = `https://maps.google.com/maps?q=${enc}&output=embed`;
  res.send(`
    <!DOCTYPE html><html lang="es">
      <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
        <title>Mapa</title>
        <style>html,body{margin:0;padding:0;height:100%}iframe{width:100%;height:100%;border:none}</style>
      </head>
      <body><iframe src="${url}" allowfullscreen loading="lazy"></iframe></body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});