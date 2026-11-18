// Le da (o le saca) el rol de admin a una cuenta existente.
//
// Uso:  npm run admin -- persona@mail.com           (le da admin)
//       npm run admin -- persona@mail.com --quitar  (se lo saca)
//
// Hace dos cosas:
// 1. Custom claim { admin: true } en Firebase Auth. Es lo que valida el
//    servidor (viene firmado en la cookie de sesión) y las reglas de Firestore.
// 2. rol: "admin" en users/{uid}, para mostrarlo en la app.
// El claim se aplica en el próximo login: la persona tiene que salir y entrar.
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

async function main() {
  const email = process.argv[2];
  const quitar = process.argv.includes("--quitar");
  if (!email || email.startsWith("--")) {
    console.error("Uso: npm run admin -- persona@mail.com [--quitar]");
    process.exit(1);
  }

  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID?.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\\n/g, "\n"),
    }),
  });

  const usuario = await getAuth(app).getUserByEmail(email);
  await getAuth(app).setCustomUserClaims(
    usuario.uid,
    quitar ? { admin: false } : { admin: true },
  );
  await getFirestore(app)
    .collection("users")
    .doc(usuario.uid)
    .set({ rol: quitar ? "user" : "admin" }, { merge: true });

  console.log(
    `${email} ${quitar ? "ya no es" : "ahora es"} admin. Tiene que cerrar sesión y volver a entrar.`,
  );
}

main().catch((error) => {
  console.error("No se pudo cambiar el rol:", error.message);
  process.exit(1);
});
