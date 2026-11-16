// Carga los datos iniciales en Firestore:
// 1. Las paletas de colores (una por clima).
// 2. El usuario de prueba con un placard cargado.
// Se puede correr las veces que haga falta: las paletas se pisan por id y,
// si el usuario ya existe, se reutiliza y se reemplazan sus prendas.
//
// Uso:  npm run seed            (paletas + usuario de prueba)
//       npm run seed:paletas    (solo paletas, no toca el placard)
// (lee las credenciales de .env.local con la opción --env-file de Node)
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const USUARIO = {
  email: "prueba@pilcha.app",
  password: "pilcha-prueba-2026",
  nombre: "Usuario de prueba",
};

// Paletas iniciales. El id del documento es el clima, así volver a correr el
// seed actualiza la misma paleta en lugar de duplicarla.
const PALETAS = [
  {
    clima: "soleado-calido",
    nombre: "Mediodía de verano",
    armonia: "complementaria",
    colores: ["#e07a5f", "#f2a65a", "#3d9a9b", "#81c3c4", "#f4f1de"],
    descripcion:
      "Terracotas y naranjas contra turquesas: el contraste de un día de sol fuerte. Ideal para telas livianas.",
  },
  {
    clima: "soleado-templado",
    nombre: "Primavera templada",
    armonia: "analoga",
    colores: ["#31572c", "#4f772d", "#90a955", "#c5d86d", "#f4f9e9"],
    descripcion:
      "Verdes que van del oscuro al pastel, como un parque a la tarde. Combinan entre sí sin pensarlo.",
  },
  {
    clima: "nublado",
    nombre: "Cielo gris",
    armonia: "neutros-acento",
    colores: ["#343a40", "#6c757d", "#adb5bd", "#e9ecef", "#4f7cac"],
    descripcion:
      "Grises de todos los tonos con un azul de acento. Una base tranquila para un día sin sol.",
  },
  {
    clima: "lluvia",
    nombre: "Piloto amarillo",
    armonia: "complementaria",
    colores: ["#1d3557", "#457b9d", "#a8dadc", "#f1faee", "#e9c46a"],
    descripcion:
      "Azules de tormenta con un amarillo de piloto: el color que se ve de lejos cuando llueve.",
  },
  {
    clima: "frio",
    nombre: "Invierno abrigado",
    armonia: "neutros-acento",
    colores: ["#3d2b1f", "#8b5e3c", "#d6c6b0", "#f5f0e8", "#9b2335"],
    descripcion:
      "Marrones, camel y crudo de lana, con un bordó que levanta el conjunto.",
  },
  {
    clima: "noche",
    nombre: "Salida de noche",
    armonia: "analoga",
    colores: ["#14213d", "#2b2d42", "#5c4d7d", "#8d99ae", "#edf2f4"],
    descripcion:
      "Azules profundos y violetas apagados. Elegantes y fáciles de combinar con negro.",
  },
];

// [nombre, categoria, hex, color, abrigo, impermeable]
const PRENDAS = [
  ["Remera blanca de algodón", "superior", "#ffffff", "Blanco", 1, false],
  ["Remera negra básica", "superior", "#111111", "Negro", 1, false],
  ["Musculosa celeste", "superior", "#7fb8e6", "Celeste", 1, false],
  ["Camisa de lino beige", "superior", "#d8c8a8", "Beige", 2, false],
  ["Camisa a cuadros azul", "superior", "#2f5d8a", "Azul", 2, false],
  ["Buzo gris de algodón", "superior", "#8a8d91", "Gris", 3, false],
  ["Sweater de lana verde", "superior", "#3f6b4f", "Verde bosque", 4, false],
  ["Short de jean", "inferior", "#4a6fa5", "Azul jean", 1, false],
  ["Bermuda beige", "inferior", "#cbb994", "Beige", 1, false],
  ["Jean azul oscuro", "inferior", "#1f3250", "Azul marino", 3, false],
  ["Pantalón de vestir gris", "inferior", "#55595e", "Gris oscuro", 2, false],
  ["Jogging negro", "inferior", "#1a1a1a", "Negro", 3, false],
  ["Ojotas negras", "calzado", "#1a1a1a", "Negro", 1, true],
  ["Zapatillas blancas", "calzado", "#f2f2f2", "Blanco", 2, false],
  ["Zapatillas de running grises", "calzado", "#9a9ea3", "Gris", 2, false],
  ["Botas de lluvia amarillas", "calzado", "#e8c230", "Amarillo", 3, true],
  ["Botas de cuero marrón", "calzado", "#5b3a29", "Marrón", 4, false],
  ["Cardigan fino crema", "abrigo", "#efe6d2", "Crema", 2, false],
  ["Campera de jean", "abrigo", "#3d5f8c", "Azul jean", 3, false],
  ["Rompeviento azul", "abrigo", "#2a4d8f", "Azul", 3, true],
  ["Piloto impermeable verde", "abrigo", "#46614a", "Verde oliva", 3, true],
  ["Campera de abrigo negra", "abrigo", "#151515", "Negro", 4, false],
  ["Parka con corderito", "abrigo", "#5a4636", "Marrón tabaco", 5, true],
  ["Gorra negra", "accesorio", "#1a1a1a", "Negro", 1, false],
  ["Anteojos de sol", "accesorio", "#222222", "Negro", 1, false],
  ["Bufanda de lana gris", "accesorio", "#7d8084", "Gris", 5, false],
  ["Gorro de lana bordó", "accesorio", "#6e2433", "Bordó", 4, false],
];

function faltante(nombre) {
  console.error(`Falta la variable ${nombre}. Completá .env.local (ver .env.example).`);
  process.exit(1);
}

async function main() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId) faltante("FIREBASE_ADMIN_PROJECT_ID");
  if (!clientEmail) faltante("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!privateKey) faltante("FIREBASE_ADMIN_PRIVATE_KEY");

  const app = initializeApp({
    credential: cert({
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey: privateKey.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n"),
    }),
  });
  const auth = getAuth(app);
  const db = getFirestore(app);

  await cargarPaletas(db);
  if (process.argv.includes("--solo-paletas")) return;

  // 1. Usuario en Firebase Auth (se reutiliza si ya existe).
  let usuario;
  try {
    usuario = await auth.getUserByEmail(USUARIO.email);
    console.log(`Usuario existente: ${usuario.uid}`);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    usuario = await auth.createUser({
      email: USUARIO.email,
      password: USUARIO.password,
      displayName: USUARIO.nombre,
    });
    console.log(`Usuario creado: ${usuario.uid}`);
  }

  // 2. Documento users/{uid}, igual al que crea el registro.
  const userRef = db.collection("users").doc(usuario.uid);
  await userRef.set({
    nombre: USUARIO.nombre,
    email: USUARIO.email,
    rol: "user",
    ciudad: { nombre: "Buenos Aires", lat: -34.61, lon: -58.38 },
    horaSalida: 9,
    horaVuelta: 20,
    sensibilidad: "normal",
    ajusteTermico: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 3. Prendas: borramos las anteriores y cargamos de nuevo.
  const prendasRef = userRef.collection("prendas");
  const existentes = await prendasRef.get();
  const batch = db.batch();
  existentes.docs.forEach((doc) => batch.delete(doc.ref));

  PRENDAS.forEach(([nombre, categoria, hex, colorNombre, abrigo, impermeable]) => {
    batch.set(prendasRef.doc(), {
      nombre,
      categoria,
      color: { hex, nombre: colorNombre },
      abrigo,
      impermeable,
      imagenUrl: null,
      usos: 0,
      ultimoUso: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  console.log(`${PRENDAS.length} prendas cargadas.`);
  console.log(`Ingresá con ${USUARIO.email} / ${USUARIO.password}`);
}

async function cargarPaletas(db) {
  const batch = db.batch();
  PALETAS.forEach((paleta) => {
    batch.set(db.collection("paletas").doc(paleta.clima), paleta);
  });
  await batch.commit();
  console.log(`${PALETAS.length} paletas cargadas.`);
}

main().catch((error) => {
  console.error("El seed falló:", error);
  process.exit(1);
});
