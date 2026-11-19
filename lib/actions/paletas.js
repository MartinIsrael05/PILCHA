"use server";

// Server Actions del panel de admin: alta, edición y baja de paletas.
// Cada una verifica en el servidor que quien la llama sea admin (custom
// claim dentro de la cookie de sesión). Las paletas no son de un usuario:
// viven en la colección pública "paletas".
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { validarPaleta } from "@/lib/paletas";

function paletasRef() {
  return getAdminDb().collection("paletas");
}

function leerFormulario(formData) {
  return {
    clima: formData.get("clima"),
    nombre: formData.get("nombre"),
    armonia: formData.get("armonia"),
    colores: formData.getAll("color"),
    descripcion: formData.get("descripcion"),
  };
}

// /paletas y las páginas de cada clima se generan en el build: hay que
// avisarle a Next que las regenere. También la portada y /hoy, que muestran
// la paleta del día.
function revalidarPaletas() {
  revalidatePath("/paletas");
  revalidatePath("/paletas/[clima]", "page");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function crearPaleta(_estadoPrevio, formData) {
  await requireAdmin();
  const { errores, datos } = validarPaleta(leerFormulario(formData));
  if (Object.keys(errores).length)
    return { errores, mensaje: "Revisá los campos marcados." };

  try {
    // Si es la primera paleta de ese clima, queda activa automáticamente.
    const existentes = await paletasRef()
      .where("clima", "==", datos.clima)
      .limit(1)
      .get();
    await paletasRef().add({ ...datos, activa: existentes.empty });
  } catch (error) {
    console.error("crearPaleta:", error);
    return {
      errores: {},
      mensaje: "No pudimos guardar la paleta. Probá de nuevo.",
    };
  }
  revalidarPaletas();
  redirect("/admin");
}

export async function editarPaleta(id, _estadoPrevio, formData) {
  await requireAdmin();
  if (!id || id.includes("/"))
    return { errores: {}, mensaje: "Esa paleta no existe." };

  const { errores, datos } = validarPaleta(leerFormulario(formData));
  if (Object.keys(errores).length)
    return { errores, mensaje: "Revisá los campos marcados." };

  try {
    const ref = paletasRef().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return { errores: {}, mensaje: "Esa paleta ya no existe." };
    // Preservamos el campo `activa` al editar: se maneja aparte.
    await ref.set({ ...datos, activa: Boolean(snap.data().activa) });
  } catch (error) {
    console.error("editarPaleta:", error);
    return {
      errores: {},
      mensaje: "No pudimos guardar los cambios. Probá de nuevo.",
    };
  }
  revalidarPaletas();
  redirect("/admin");
}

// Marca una paleta como la activa del clima y desactiva las demás del mismo
// clima en una sola transacción, así nunca queda el clima sin paleta activa
// ni con dos marcadas a la vez.
export async function activarPaleta(id) {
  await requireAdmin();
  if (!id || id.includes("/")) return;

  const db = getAdminDb();
  await db.runTransaction(async (tx) => {
    const ref = paletasRef().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const clima = snap.data().clima;

    const otras = await paletasRef().where("clima", "==", clima).get();
    for (const doc of otras.docs) {
      tx.update(doc.ref, { activa: doc.id === id });
    }
  });
  revalidarPaletas();
}

export async function eliminarPaleta(id) {
  await requireAdmin();
  if (!id || id.includes("/")) {
    redirect("/admin");
  }

  const ref = paletasRef().doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    redirect("/admin");
  }

  const { clima, activa } = snap.data();
  await ref.delete();

  // Si era la activa y queda otra paleta del mismo clima, la promovemos.
  if (activa) {
    const otras = await paletasRef()
      .where("clima", "==", clima)
      .limit(1)
      .get();
    if (!otras.empty) {
      await otras.docs[0].ref.update({ activa: true });
    }
  }

  revalidarPaletas();
  redirect("/admin");
}
