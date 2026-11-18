# PILCHA

Una webapp que, según el clima de donde estás, te arma el outfit del día con la ropa de tu propio placard y te sugiere paletas de colores que combinan con el día.

**Demo:** https://pilcha-ropa.vercel.app

TP Final de Programación Multimedial III (UMAI). Consigna: https://github.com/lamaro/maimo-2026-tp-final

> README en construcción. Se completa al cierre del proyecto con descripción, benchmark, modelo de datos, mapa de navegación, opcionales, usuario de prueba, capturas y reflexión sobre el uso de IA.

## Tecnologías

- Next.js 16 (App Router, JavaScript)
- Tailwind CSS 4
- Firebase Authentication y Cloud Firestore
- Vercel Blob para imágenes
- Open-Meteo para clima y geocoding
- Deploy en Vercel

## Decisiones técnicas

- **Cache Components desactivado.** `create-next-app` lo activa por defecto en Next.js 16. Lo apagamos para usar el modelo de caché clásico: el layout privado puede leer la cookie de sesión directamente y las llamadas al clima se cachean con `fetch(..., { next: { revalidate: 1800 } })`.
- **`proxy.js` en lugar de `middleware.js`.** En Next.js 16 `middleware.js` se renombró a `proxy.js`.
- **La ubicación y el horario van en la URL** (`/?lat=...&lon=...&ciudad=...&desde=9&hasta=20`). Así la página pide el clima en el servidor con caché de 30 minutos y el link se puede compartir. Las coordenadas se redondean a 2 decimales (~1 km) para no exponer la ubicación exacta.

## Librerías

| Librería | Para qué |
| --- | --- |
| `firebase` | Login con email/contraseña y Google desde el navegador |
| `firebase-admin` | Verificar sesiones y escribir en Firestore desde el servidor. Es la única forma de validar en el servidor quién es el usuario |
| `@vercel/blob` | Subir y borrar las fotos de las prendas (Firebase Storage pide plan pago para buckets nuevos) |
| `recharts` | Gráficos de `/stats`. Arma gráficos de barras accesibles con React sin dibujar el SVG a mano |

**Override de `jose`.** `firebase-admin` usa `jwks-rsa`, que carga `jose` con `require()`. Desde `jose` 6 la librería es solo ESM, y en el runtime de Vercel ese `require()` falla (`ERR_REQUIRE_ESM`) y tira abajo todas las rutas que usan Firebase Admin. En `package.json` forzamos `jose` 5 solo para `jwks-rsa` (`overrides`), que trae versión CommonJS y tiene las mismas dos funciones que usa (`importJWK` y `exportSPKI`).

## Placard

- **Alta, edición y baja** con Server Actions (`lib/actions/prendas.js`). Cada una verifica la sesión con `requireUser()` y escribe solo bajo `users/{uid}/prendas`.
- **Una sola validación** (`lib/prendas.js`) usada por el formulario del navegador y por la Server Action, así no puede haber diferencias entre las dos.
- **Filtros en la URL.** El listado es un Server Component y los filtros son un `<form method="GET">` común: no hace falta estado de cliente y la búsqueda se puede compartir.
- **Foto opcional** a Vercel Blob. Si se reemplaza o se elimina la prenda, se borra la foto vieja.

## Paletas

- **Viven en Firestore** (`paletas`), una por clima. Se cargan con `npm run seed:paletas`, que no toca el placard del usuario de prueba.
- **La paleta del día** sale de `condicionPaleta(clima)` en `lib/clima.js`. El motor la usa para priorizar prendas que combinan con ella.
- **La interfaz cambia con el clima.** `variablesDeTema()` (`lib/paletas.js`) define `--tema-acento` con el color más vivo de la paleta y `--tema-acento-texto` con negro o blanco según el contraste WCAG. La tarjeta del outfit usa esas variables y, si no hay paleta, vuelve a los colores de siempre.
- **`/paletas` y `/paletas/[clima]`** se generan en el build y se renuevan cada hora. Cada paleta tiene título, descripción e imagen de Open Graph propios (`opengraph-image.js`, hecha con los colores reales).

## Perfil

- `/perfil` guarda la ciudad por defecto, el horario de salida y vuelta y la sensibilidad (friolento, normal o caluroso). `/hoy` y la portada los usan cuando no hay otra ubicación u horario en la URL.
- La validación (`lib/perfil.js`) es la misma en el formulario y en la Server Action (`lib/actions/perfil.js`).
- Muestra lo que PILCHA aprendió de las calificaciones y permite reiniciarlo.

## Historial y aprendizaje

- **"Usé este outfit"** (en `/hoy`) guarda el outfit con un snapshot del clima y suma un uso a cada prenda. El clima **no viene del navegador**: la Server Action recibe la ubicación y el horario y lo vuelve a calcular con el pronóstico (que está en caché). También verifica que las prendas sean del usuario.
- **Calificación** en `/historial/[id]`: frío, bien o calor. Ajusta `ajusteTermico`: frío resta 0.5 y calor suma 0.5, entre -5 y +5. Va en el mismo sentido que el offset de "friolento": si tuviste frío, el día "se siente" más frío para vos y la próxima te abriga más. (El plan original lo tenía al revés; hay una prueba que muestra el efecto en `tests/historial.test.js`.)
- Si se cambia la calificación de un outfit, primero se deshace el efecto de la anterior, así no cuenta dos veces. El outfit y el ajuste se guardan juntos en una transacción de Firestore.

## Estadísticas

- `/stats` muestra números sueltos (prendas, outfits, cuántos calificaste), las prendas más usadas, los colores del placard agrupados por familia, las prendas nunca usadas y las calificaciones por rango de sensación térmica.
- Los cálculos están en `lib/stats.js` (con pruebas); los gráficos solo dibujan.
- **Colores de los gráficos.** Las calificaciones usan un par divergente (azul para frío, rojo para calor, gris al medio para "bien"), validado para daltonismo y contraste en modo claro y oscuro. Las demás series son de un solo color. Cada gráfico tiene leyenda o título, el número escrito en cada barra y una tabla desplegable con los mismos datos, así la información nunca depende solo del color.
- El seed le carga al usuario de prueba un historial de 9 outfits (8 calificados) para que el dashboard tenga datos.

## Autenticación

1. El usuario se loguea con Firebase Auth en el navegador y obtiene un ID token.
2. El cliente manda el token a `POST /api/session`. El servidor lo verifica con Firebase Admin y lo cambia por una session cookie `httpOnly` de 5 días. Si es el primer ingreso, crea el documento `users/{uid}`.
3. `proxy.js` redirige a `/login` si alguien entra a una ruta privada sin la cookie. Es un chequeo rápido que no valida la cookie.
4. El layout privado y las Server Actions llaman a `getCurrentUser()` (`lib/auth/session.js`), que sí verifica la cookie con Firebase Admin.
5. Para salir, `DELETE /api/session` borra la cookie y el cliente cierra la sesión de Firebase.

`AuthContext` guarda el usuario del lado del cliente solo para la interfaz (nombre y botón de salir).

## Instalación

Requiere **Node.js 22** o superior (lo pide `firebase-admin`; también está fijado en `engines` del `package.json` para Vercel).

```bash
git clone https://github.com/MartinIsrael05/TP-Final-PMIII.git
cd TP-Final-PMIII
npm install
cp .env.example .env.local   # completar con las credenciales
npm run dev
```

La app queda en http://localhost:3000.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run seed` | Carga las paletas y crea el usuario de prueba con un placard (necesita `.env.local`) |
| `npm run seed:paletas` | Carga solo las paletas, sin tocar el placard de prueba |
| `npm test` | Pruebas del motor de recomendación y de colores (`node:test`, sin dependencias) |

## Variables de entorno

Ver `.env.example`. Nunca commitear `.env.local`.

## Usuario de prueba

Correr `npm run seed` una vez con `.env.local` completo. Crea (o reutiliza) el usuario, reemplaza su placard por 27 prendas de ejemplo y borra su historial.

- Email: `prueba@pilcha.app`
- Contraseña: `pilcha-prueba-2026`
