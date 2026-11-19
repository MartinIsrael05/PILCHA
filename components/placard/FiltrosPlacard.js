"use client"; // Al cambiar un filtro navega automáticamente, sin tocar "Aplicar".

// Filtros, búsqueda y orden del placard. Server State + URL: la página sigue
// siendo Server Component; acá solo hacemos que la URL se actualice sola.
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";

export default function FiltrosPlacard({ params, colores }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.q ?? "");
  // Guardamos el último params.q "visto" para detectar navegación hacia atrás.
  // El patrón oficial de React 19 para estado derivado es setState durante
  // render con otra useState. Ver: https://react.dev/learn/you-might-not-need-an-effect
  const [ultimoParam, setUltimoParam] = useState(params.q ?? "");
  if ((params.q ?? "") !== ultimoParam) {
    setUltimoParam(params.q ?? "");
    setQ(params.q ?? "");
  }
  const timer = useRef(null);
  const hayFiltros = Object.values(params).some(Boolean);

  // Navega a /placard con los filtros actuales. reemplazar=true evita llenar
  // el historial del navegador mientras se tipea.
  function irA(nuevos, reemplazar = false) {
    const url = new URL(pathname, window.location.origin);
    // Partimos de los params actuales para no perder filtros al cambiar uno.
    for (const [k, v] of Object.entries({ ...params, ...nuevos })) {
      if (v) url.searchParams.set(k, v);
    }
    const href = `${url.pathname}?${url.searchParams}`;
    if (reemplazar) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }

  // Búsqueda con debounce: evita recargar la lista en cada tecla.
  function cambiarTexto(valor) {
    setQ(valor);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => irA({ q: valor }, true), 300);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        id="q"
        name="q"
        type="search"
        label="Buscar por nombre"
        value={q}
        onChange={(e) => cambiarTexto(e.target.value)}
        className="lg:col-span-2"
      />
      <Select
        id="categoria"
        name="categoria"
        label="Categoría"
        defaultValue={params.categoria ?? ""}
        onChange={(e) => irA({ categoria: e.target.value })}
      >
        <option value="">Todas</option>
        {Object.entries(CATEGORIAS).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Select>
      <Select
        id="color"
        name="color"
        label="Color"
        defaultValue={params.color ?? ""}
        onChange={(e) => irA({ color: e.target.value })}
      >
        <option value="">Todos</option>
        {colores.map((nombre) => (
          <option key={nombre} value={nombre}>
            {nombre}
          </option>
        ))}
      </Select>
      <Select
        id="abrigo"
        name="abrigo"
        label="Nivel de abrigo"
        defaultValue={params.abrigo ?? ""}
        onChange={(e) => irA({ abrigo: e.target.value })}
      >
        <option value="">Todos</option>
        {Object.entries(NIVELES_ABRIGO).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {valor} · {texto}
          </option>
        ))}
      </Select>
      <Select
        id="orden"
        name="orden"
        label="Ordenar por"
        defaultValue={params.orden ?? ""}
        onChange={(e) => irA({ orden: e.target.value })}
      >
        <option value="">Más recientes</option>
        <option value="usadas">Más usadas</option>
      </Select>

      {hayFiltros && (
        <Link
          href={pathname}
          className="self-end py-2.5 text-sm font-medium hover:underline sm:col-span-2 lg:col-span-5"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
