const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const normalize = str =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').trim();

const serviceCenters = [
  { region: "Áncash", name: "Team Support Service S.A.C. – Huaraz", address: "Jr. Bolognesi N° 263, Huaraz (278.1 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Áncash", name: "Team Support Service S.A.C. – Nuevo Chimbote", address: "Av. Pacífico Urb. Unicreto Mz S3 – Lt 21, Nuevo Chimbote (385.5 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Arequipa", name: "Team Support Service S.A.C. – Arequipa", address: "Av. San Martín 2219, Distrito de Miraflores, Arequipa (884.1 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB", reference: "A espaldas del Colegio Luna Pizarro" },
  { region: "Ayacucho", name: "Team Support Service S.A.C. – Ayacucho", address: "Jr. Juan Espinoza Medrano 160, Ayacucho (449.2 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Cajamarca", name: "Team Support Service S.A.C. – Cajamarca", address: "Jr. José Sabogal 711, Cajamarca (446.4 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, ZenPad, Gaming NB", reference: "Intersección José Sabogal y Dos de Mayo" },
  { region: "Cusco", name: "Team Support Service S.A.C. – Cusco", address: "Psj. Ramón Castilla 104-B, distrito Wanchaq, Cusco (587.0 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Ica", name: "Team Support Service S.A.C. – Ica", address: "Calle Libertad 280-C, Ica (547.3 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB, Gaming Handhelds" },
  { region: "Junín", name: "Team Support Service S.A.C. – Huancayo", address: "Av. Ferrocarril N° 058, Huancayo (319.0 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "La Libertad", name: "Team Support Service S.A.C. – Trujillo", address: "Calle Ayacucho 279, Urb. Vista Alegre (Víctor Larco), Trujillo (458.0 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Lambayeque", name: "Team Support Service S.A.C. – Chiclayo", address: "Av. Francisco Bolognesi 536, Int. 301, Chiclayo (594.8 km)", products: "Notebook, Desktop PC, All-in-one PCs, Chromebox" },
  { region: "Lima", name: "Team Support Service S.A.C. (Cyberplaza)", address: "Av. Garcilaso de la Vega No 1348, Cyberplaza Local 1B-155, Lima (387.7 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB", reference: "Nueva dirección desde marzo 2020" },
  { region: "Lima", name: "Grupo Deltron S.A.", address: "Calle Raúl Rebagliati 170, La Victoria, Lima (389.6 km)", products: "Notebook, All-in-one PCs, ZenFone, Chromebox, Commercial NB, Gaming NB" },
  { region: "Lima", name: "Team Support Service S.A.C. – Surco", address: "Av. Monte de los Olivos 993, Surco, Lima (392.7 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Madre de Dios", name: "Team Support Service S.A.C. – Madre de Dios", address: "Jr. Ica Mz 9B Lote 5A, Tambopata, Madre de Dios (738.7 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Pasco", name: "TEAM SUPPORT – Cerro de Pasco", address: "Av. Daniel Alcides Carrión N° 108 Int. B y N° 114 Int. B, Cerro de Pasco (212.9 km)", products: "Notebook, All-in-one PCs, Commercial NB, Gaming NB, Gaming Handhelds, Embedded IPC System" },
  { region: "Piura", name: "Team Support Service S.A.C. – Piura", address: "Jr. Huánuco 633-A, Piura (761.6 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Piura", name: "Team Support Service S.A.C. – Piura 2", address: "Libertad 639, Dpto. 203, Piura (765.0 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Puno", name: "Team Support Service S.A.C. – Puno", address: "Jr. Libertad 215, Cercado, Puno (915.4 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB" },
  { region: "San Martín", name: "Team Support Service – Tarapoto", address: "Jr. José Olaya 194, Tarapoto (334.4 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" },
  { region: "Ucayali", name: "Team Support Service S.A.C. – Pucallpa", address: "Jr. Huáscar 546, Callería, Pucallpa (103.8 km)", products: "Notebook, All-in-one PCs, Chromebox, Commercial NB, Gaming NB" }
];

app.post('/nearest', (req, res) => {
  const rawInput = req.body.region || "";
  const regionInput = normalize(rawInput);

  console.log("🔍 Received region:", rawInput);
  console.log("🧼 Normalized region:", regionInput);

  const matches = serviceCenters.filter(sc => normalize(sc.region) === regionInput);

  if (matches.length > 0) {
    res.send({ centers: matches });
  } else {
    console.log("❌ No hay centro de servicio para la región:", regionInput);
    res.status(404).send({ error: "Sin centro de servicio en esta región." });
  }
});

app.listen(port, () => {
  console.log(`API de Perú corriendo en http://localhost:${port}`);
});