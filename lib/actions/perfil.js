"use server";

// Server Actions del perfil. Como todas las escrituras: verifican la sesión
// en el servidor y escriben solo en users/{uid de la sesión}.
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { validarPerfil } from "@/lib/perfil";

// Las páginas que dependen del perfil (ciudad, horarios, sensibilidad).
function revalidarPaginas() {
  revalidatePath("/perfil");
  revalidatePath("/hoy");
  revalidatePath("/");
}

export async function actualizarPerfil(_estadoPrevio, formData) {
  const user = await requireUser();

  const { errores, datos } = validarPerfil({
    nombre: formData.get("nombre"),
    horaSalida: formData.get("horaSalida"),
    horaVuelta: formData.get("horaVuelta"),
    sensibilidad: formData.get("sensibilidad"),
    ciudadNombre: formData.get("ciudadNombre"),
    ciudadLat: formData.get("ciudadLat"),
    ciudadLon: formData.get("ciudadLon"),
  });
  if (Object.keys(errores).length > 0) {
    return { ok: false, errores, mensaje: "Revisá los campos marcados." };
  }

  try {
    await getAdminDb().collection("users").doc(user.uid).update(datos);
    // El nombre también vive en Firebase Auth: es el que muestra el header.
    if (datos.nombre !== user.nombre) {
      await getAdminAuth().updateUser(user.uid, { displayName: datos.nombre });
    }
  } catch (error) {
    console.error("actualizarPerfil:", error);
    return { ok: false, errores: {}, mensaje: "No pudimos guardar los cambios. Probá de nuevo." };
  }

  revalidarPaginas();
  return { ok: true, errores: {}, mensaje: "Listo, guardamos tus cambios." };
}

// Vuelve a cero lo que el sistema aprendió de las calificaciones.
export async function reiniciarAjuste() {
  const user = await requireUser();
  await getAdminDb().collection("users").doc(user.uid).update({ ajusteTermico: 0 });
  revalidarPaginas();
}
