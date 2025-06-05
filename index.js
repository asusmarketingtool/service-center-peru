// index.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir CORS y leer JSON
app.use(cors());
app.use(express.json());

// Función auxiliar para normalizar nombres de región (minusculas, sin tildes ni espacios extra)
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Lista de centros de servicio en Perú
// Cada objeto tiene: región, nombre, dirección, productos, (si quieres agregar imagen, puedes añadir imageUrl).
const serviceCenters = [
  {
    region: "Áncash",
    name: "Team Support Service S.A.C. – Huaraz",
    address: "Jr. Bolognesi N° 263, Huaraz (278.1 km)",
    phone: "+51 987 654 321",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Áncash",
    name: "Team Support Service S.A.C. – Nuevo Chimbote",
    address: "Av. Pacífico Urb. Unicreto Mz S3 – Lt 21, Nuevo Chimbote (385.5 km)",
    phone: "+51 954 321 678",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Arequipa",
    name: "Team Support Service S.A.C. – Arequipa",
    address:
      "Av. San Martín 2219, Distrito de Miraflores, Arequipa (884.1 km)",
    phone: "+51 987 123 456",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB",
    reference: "A espaldas del Colegio Luna Pizarro"
  },
  {
    region: "Ayacucho",
    name: "Team Support Service S.A.C. – Ayacucho",
    address: "Jr. Juan Espinoza Medrano 160, Ayacucho (449.2 km)",
    phone: "+51 988 765 432",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Cajamarca",
    name: "Team Support Service S.A.C. – Cajamarca",
    address: "Jr. José Sabogal 711, Cajamarca (446.4 km)",
    phone: "+51 987 001 234",
    products:
      "Notebook, All-in-one PCs, Chromebox, Commercial NB, ZenPad, Gaming NB",
    reference: "Intersección José Sabogal y Dos de Mayo"
  },
  {
    region: "Cusco",
    name: "Team Support Service S.A.C. – Cusco",
    address: "Psj. Ramón Castilla 104-B, distrito Wanchaq, Cusco (587.0 km)",
    phone: "+51 994 321 000",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Ica",
    name: "Team Support Service S.A.C. – Ica",
    address: "Calle Libertad 280-C, Ica (547.3 km)",
    phone: "+51 987 987 987",
    products:
      "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB, Gaming Handhelds"
  },
  {
    region: "Junín",
    name: "Team Support Service S.A.C. – Huancayo",
    address: "Av. Ferrocarril N° 058, Huancayo (319.0 km)",
    phone: "+51 976 543 210",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "La Libertad",
    name: "Team Support Service S.A.C. – Trujillo",
    address:
      "Calle Ayacucho 279, Urb. Vista Alegre (Víctor Larco), Trujillo (458.0 km)",
    phone: "+51 987 123 789",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Lambayeque",
    name: "Team Support Service S.A.C. – Chiclayo",
    address:
      "Av. Francisco Bolognesi 536, Int. 301, Chiclayo (594.8 km)",
    phone: "+51 974 321 555",
    products: "Notebook, Desktop PC, All-in-one PCs, Chromebox"
  },
  {
    region: "Lima",
    name: "Team Support Service S.A.C. (Cyberplaza)",
    address:
      "Av. Garcilaso de la Vega No 1348, Cyberplaza Local 1B-155, Lima (387.7 km)",
    phone: "+51 965 432 111",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB",
    reference: "Nueva dirección desde marzo 2020"
  },
  {
    region: "Lima",
    name: "Grupo Deltron S.A.",
    address:
      "Calle Raúl Rebagliati 170, La Victoria, Lima (389.6 km)",
    phone: "+51 964 123 222",
    products: "Notebook, All-in-one PCs, ZenFone, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Lima",
    name: "Team Support Service S.A.C. – Surco",
    address:
      "Av. Monte de los Olivos 993, Surco, Lima (392.7 km)",
    phone: "+51 987 555 666",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Madre de Dios",
    name: "Team Support Service S.A.C. – Madre de Dios",
    address:
      "Jr. Ica Mz 9B Lote 5A, Tambopata, Madre de Dios (738.7 km)",
    phone: "+51 986 123 444",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Pasco",
    name: "TEAM SUPPORT – Cerro de Pasco",
    address:
      "Av. Daniel Alcides Carrión N° 108 Int. B y N° 114 Int. B, Cerro de Pasco (212.9 km)",
    phone: "+51 987 222 333",
    products:
      "Notebook, All-in-one PCs, Commercial NB, Gaming NB, Gaming Handhelds, Embedded IPC System"
  },
  {
    region: "Piura",
    name: "Team Support Service S.A.C. – Piura",
    address: "Jr. Huánuco 633-A, Piura (761.6 km)",
    phone: "+51 975 123 111",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Piura",
    name: "Team Support Service S.A.C. – Piura 2",
    address: "Libertad 639, Dpto. 203, Piura (765.0 km)",
    phone: "+51 975 123 222",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Puno",
    name: "Team Support Service S.A.C. – Puno",
    address: "Jr. Libertad 215, Cercado, Puno (915.4 km)",
    phone: "+51 976 321 333",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB"
  },
  {
    region: "San Martín",
    name: "Team Support Service – Tarapoto",
    address: "Jr. José Olaya 194, Tarapoto (334.4 km)",
    phone: "+51 977 123 444",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  },
  {
    region: "Ucayali",
    name: "Team Support Service S.A.C. – Pucallpa",
    address: "Jr. Huáscar 546, Callería, Pucallpa (103.8 km)",
    phone: "+51 978 432 555",
    products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB"
  }
];

// Endpoint POST /nearest
// Recibe { "region": "nombre de la región" }
// Responde siempre con status 200, y devuelve EITHER richContent (para carousel) O text (para mensaje de “sin centros”).
app.post("/nearest", (req, res) => {
  const rawInput = req.body.region || "";
  const regionInput = normalize(rawInput);

  console.log("🔍 Received region:", rawInput);
  console.log("🧼 Normalized region:", regionInput);

  // Filtrar centros que coincidan con la región
  const matches = serviceCenters.filter(
    (sc) => normalize(sc.region) === regionInput
  );

  if (matches.length === 0) {
    // Si no hay coincidencias: responder con { text: "..." }
    return res.json({
      text: "No hay ningún centro de servicio cercano en esa región."
    });
  }

  // Si sí hay coincidencias: armar un carrusel (richContent)
  // Freshchat espera un array de “cards”, donde cada card es un array de tantos elementos como quieras (image, descripción, botón, etc.).
  // Aquí omitimos la imagen (si no tienes imageUrl, la mostramos sólo con descripción y botón).

  const richContent = matches.map((center) => {
    // Cada “fila” del carousel es un array con los elementos que quieras mostrar en esa tarjeta.
    // En este ejemplo: descripción + botón a Google Maps.
    return [
      {
        type: "description",
        title: center.name,
        text:
          `${center.address}\n` +
          `Productos: ${center.products}\n` +
          (center.phone ? `Teléfono: ${center.phone}` : "")
      },
      {
        type: "button",
        text: "Ver ubicación",
        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          center.address
        )}`
      }
    ];
  });

  return res.json({
    richContent // Freshchat interpretará esto como carrusel
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API de Perú corriendo en http://localhost:${port}`);
});