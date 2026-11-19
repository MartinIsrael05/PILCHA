// Reglas de las prendas. Funciones y constantes puras (sin red ni Firebase):
// las usan el formulario (cliente) y la Server Action (servidor), así la
// validación es exactamente la misma en los dos lados.

export const CATEGORIAS = {
  superior: "Superior",
  inferior: "Inferior",
  calzado: "Calzado",
  abrigo: "Abrigo",
  accesorio: "Accesorio",
};

export const NIVELES_ABRIGO = {
  1: "Muy liviano",
  2: "Liviano",
  3: "Medio",
  4: "Abrigado",
  5: "Muy abrigado",
};

export const MAX_NOMBRE = 60;
export const MAX_FOTO_BYTES = 4 * 1024 * 1024; // 4 MB
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

const HEX = /^#[0-9a-f]{6}$/i;

// Recibe valores ya sacados del formulario y devuelve { errores, datos }.
// Si no hay errores, `datos` es lo que se guarda en Firestore (limpio).
export function validarPrenda(valores) {
  const errores = {};

  const nombre = String(valores.nombre ?? "").trim();
  if (!nombre) errores.nombre = "Ponele un nombre a la prenda.";
  else if (nombre.length > MAX_NOMBRE) {
    errores.nombre = `Usá ${MAX_NOMBRE} caracteres como máximo.`;
  }

  const categoria = String(valores.categoria ?? "");
  if (!(categoria in CATEGORIAS)) errores.categoria = "Elegí una categoría.";

  const colorHex = String(valores.colorHex ?? "").trim();
  if (!HEX.test(colorHex)) errores.colorHex = "Elegí un color válido.";

  const colorNombre = String(valores.colorNombre ?? "").trim();
  if (!colorNombre) errores.colorNombre = "Decinos cómo se llama el color.";
  else if (colorNombre.length > 30) {
    errores.colorNombre = "Usá 30 caracteres como máximo.";
  }

  const abrigo = Number(valores.abrigo);
  if (!Number.isInteger(abrigo) || abrigo < 1 || abrigo > 5) {
    errores.abrigo = "El nivel de abrigo va de 1 a 5.";
  }

  if (Object.keys(errores).length > 0) return { errores, datos: null };

  return {
    errores: {},
    datos: {
      nombre,
      categoria,
      color: { hex: colorHex.toLowerCase(), nombre: colorNombre },
      abrigo,
      impermeable: Boolean(valores.impermeable),
    },
  };
}

// Valida el archivo de la foto (opcional). Devuelve un mensaje o null.
// `foto` es un File del navegador o del servidor (mismo API en los dos).
export function validarFoto(foto) {
  if (!foto || foto.size === 0) return null; // sin foto está bien
  if (!TIPOS_FOTO.includes(foto.type)) return "La foto tiene que ser JPG, PNG o WebP.";
  if (foto.size > MAX_FOTO_BYTES) return "La foto pesa más de 4 MB.";
  return null;
}

// Mira los primeros bytes del archivo (magic bytes) para confirmar que es
// realmente una imagen JPG, PNG o WebP. Esto cubre el caso en que alguien
// cambie el content-type en el POST para intentar subir otra cosa: el tipo
// declarado puede mentir, los bytes iniciales no.
// Devuelve el MIME real o null si no coincide con los permitidos.
export function detectarTipoImagen(bytes) {
  if (!bytes || bytes.length < 12) return null;
  const b = bytes;
  // JPG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) return "image/png";
  // WebP: "RIFF....WEBP"
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) return "image/webp";
  return null;
}

// Filtros y orden del listado. `params` viene de la URL (searchParams).
export function filtrarPrendas(prendas, params) {
  const { q, categoria, color, abrigo, orden } = params;
  const busqueda = String(q ?? "").trim().toLowerCase();

  const resultado = prendas.filter((p) => {
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda)) return false;
    if (categoria && p.categoria !== categoria) return false;
    if (color && p.color.nombre !== color) return false;
    if (abrigo && p.abrigo !== Number(abrigo)) return false;
    return true;
  });

  // "recientes" (default) o "usadas". Desempatamos por fecha de alta.
  if (orden === "usadas") {
    resultado.sort((a, b) => b.usos - a.usos || b.createdAt - a.createdAt);
  } else {
    resultado.sort((a, b) => b.createdAt - a.createdAt);
  }
  return resultado;
}
