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
    await paletasRef().add(datos);
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
    if (!(await ref.get()).exists)
      return { errores: {}, mensaje: "Esa paleta ya no existe." };
    await ref.set(datos);
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

export async function eliminarPaleta(id) {
  await requireAdmin();
  if (id && !id.includes("/")) await paletasRef().doc(id).delete();
  revalidarPaletas();
  redirect("/admin");
}
