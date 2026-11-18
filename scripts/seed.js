// Carga los datos iniciales en Firestore:
// 1. Las paletas de colores (una por clima).
// 2. El usuario de prueba con un placard cargado y un historial de ejemplo.
// 3. Una cuenta de admin de prueba.
// Se puede correr las veces que haga falta: las paletas se pisan por id y,
// si el usuario ya existe, se reutiliza y se reemplazan sus prendas y su
// historial.
//
// Uso:  npm run seed            (paletas + usuario de prueba)
//       npm run seed:paletas    (solo paletas, no toca el placard)
// (lee las credenciales de .env.local con la opción --env-file de Node)
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");

const USUARIO = {
  email: "prueba@pilcha.app",
  password: "pilcha-prueba-2026",
  nombre: "Usuario de prueba",
};

// Cuenta de admin de prueba, para entrar a /admin y editar las paletas.
const ADMIN = {
  email: "admin@pilcha.app",
  password: "pilcha-admin-2026",
  nombre: "Admin de prueba",
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

// Historial de ejemplo, del más nuevo al más viejo.
// [días atrás, clima, paleta, calificación, prendas]
const HISTORIAL = [
  [0.2, { tempMin: 19, tempMax: 26, sensacion: 23, lluviaProb: 10, viento: 12, uv: 8, codigo: 1 }, "soleado-calido", null,
    ["Remera negra básica", "Short de jean", "Zapatillas blancas"]],
  [1, { tempMin: 20, tempMax: 27, sensacion: 24, lluviaProb: 5, viento: 10, uv: 9, codigo: 1 }, "soleado-calido", "bien",
    ["Remera blanca de algodón", "Short de jean", "Zapatillas blancas", "Gorra negra"]],
  [2, { tempMin: 15, tempMax: 20, sensacion: 18, lluviaProb: 20, viento: 18, uv: 4, codigo: 3 }, "nublado", "frio",
    ["Camisa a cuadros azul", "Jean azul oscuro", "Zapatillas blancas", "Cardigan fino crema"]],
  [4, { tempMin: 10, tempMax: 14, sensacion: 12, lluviaProb: 80, viento: 25, uv: 2, codigo: 63 }, "lluvia", "bien",
    ["Buzo gris de algodón", "Jean azul oscuro", "Botas de lluvia amarillas", "Piloto impermeable verde"]],
  [5, { tempMin: 23, tempMax: 31, sensacion: 28, lluviaProb: 0, viento: 8, uv: 10, codigo: 0 }, "soleado-calido", "calor",
    ["Musculosa celeste", "Bermuda beige", "Ojotas negras"]],
  [7, { tempMin: 6, tempMax: 11, sensacion: 8, lluviaProb: 10, viento: 22, uv: 3, codigo: 2 }, "frio", "frio",
    ["Sweater de lana verde", "Jean azul oscuro", "Botas de cuero marrón", "Campera de abrigo negra"]],
  [8, { tempMin: 17, tempMax: 23, sensacion: 20, lluviaProb: 0, viento: 14, uv: 6, codigo: 0 }, "soleado-templado", "bien",
    ["Remera negra básica", "Pantalón de vestir gris", "Zapatillas de running grises"]],
  [10, { tempMin: 12, tempMax: 18, sensacion: 15, lluviaProb: 30, viento: 20, uv: 3, codigo: 3 }, "nublado", "bien",
    ["Buzo gris de algodón", "Jogging negro", "Zapatillas de running grises", "Campera de jean"]],
  [12, { tempMin: 21, tempMax: 28, sensacion: 25, lluviaProb: 0, viento: 9, uv: 9, codigo: 1 }, "soleado-calido", "calor",
    ["Remera blanca de algodón", "Jean azul oscuro", "Zapatillas blancas"]],
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

  // 3. Prendas: borramos las anteriores y cargamos de nuevo. También borramos
  // el historial, porque sus outfits apuntan a los ids de las prendas viejas.
  const prendasRef = userRef.collection("prendas");
  const [existentes, outfits] = await Promise.all([
    prendasRef.get(),
    userRef.collection("outfits").get(),
  ]);
  const batch = db.batch();
  existentes.docs.forEach((doc) => batch.delete(doc.ref));
  outfits.docs.forEach((doc) => batch.delete(doc.ref));

  const refsPorNombre = {};
  PRENDAS.forEach(([nombre, categoria, hex, colorNombre, abrigo, impermeable]) => {
    const ref = prendasRef.doc();
    refsPorNombre[nombre] = ref;
    batch.set(ref, {
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

  await cargarHistorial(db, userRef, refsPorNombre);
  await crearAdmin(auth, db);
  console.log(`Ingresá con ${USUARIO.email} / ${USUARIO.password}`);
  console.log(`Admin: ${ADMIN.email} / ${ADMIN.password}`);
}

// 5. Cuenta de admin: custom claim { admin: true } (lo que valida el
// servidor) y rol "admin" en su documento. Sin placard ni historial.
async function crearAdmin(auth, db) {
  let admin;
  try {
    admin = await auth.getUserByEmail(ADMIN.email);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    admin = await auth.createUser({
      email: ADMIN.email,
      password: ADMIN.password,
      displayName: ADMIN.nombre,
    });
  }
  await auth.setCustomUserClaims(admin.uid, { admin: true });
  await db.collection("users").doc(admin.uid).set(
    {
      nombre: ADMIN.nombre,
      email: ADMIN.email,
      rol: "admin",
      ciudad: { nombre: "Buenos Aires", lat: -34.61, lon: -58.38 },
      horaSalida: 9,
      horaVuelta: 20,
      sensibilidad: "normal",
      ajusteTermico: 0,
    },
    { merge: true }
  );
  console.log(`Admin listo: ${admin.uid}`);
}

// 4. Historial de ejemplo: outfits de los últimos días, casi todos ya
// calificados, para que /historial y /stats tengan algo que mostrar.
// Los usos de cada prenda y el ajuste térmico salen de este mismo historial.
async function cargarHistorial(db, userRef, refsPorNombre) {
  const DELTA = { frio: -0.5, bien: 0, calor: 0.5 }; // igual que lib/historial.js
  const DIA = 24 * 60 * 60 * 1000;
  const usos = {};
  let ajuste = 0;

  const batch = db.batch();
  HISTORIAL.forEach(([diasAtras, clima, paletaId, calificacion, prendas]) => {
    const fecha = Timestamp.fromMillis(Date.now() - diasAtras * DIA);
    batch.set(userRef.collection("outfits").doc(), {
      prendaIds: prendas.map((nombre) => refsPorNombre[nombre].id),
      fecha,
      clima: { ...clima, ciudad: "Buenos Aires" },
      paletaId,
      calificacion,
      nota: "",
    });
    for (const nombre of prendas) {
      const previo = usos[nombre];
      usos[nombre] = {
        cantidad: (previo?.cantidad ?? 0) + 1,
        // El historial va del más nuevo al más viejo: el primero es el último uso.
        ultimoUso: previo?.ultimoUso ?? fecha,
      };
    }
    ajuste += DELTA[calificacion] ?? 0;
  });

  for (const [nombre, { cantidad, ultimoUso }] of Object.entries(usos)) {
    batch.update(refsPorNombre[nombre], { usos: cantidad, ultimoUso });
  }
  batch.update(userRef, { ajusteTermico: Math.max(-5, Math.min(5, ajuste)) });
  await batch.commit();
  console.log(`${HISTORIAL.length} outfits de ejemplo en el historial.`);
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
