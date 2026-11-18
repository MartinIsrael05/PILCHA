import Link from "next/link";
import { crearPrenda } from "@/lib/actions/prendas";
import PrendaForm from "@/components/placard/PrendaForm";

export const metadata = {
  title: "Nueva prenda",
};

export default function NuevaPrendaPage() {
  return (
    <section className="flex flex-col gap-6">
      <Link href="/placard" className="text-sm text-muted hover:underline">
        ← Volver al placard
      </Link>
      <h1 className="text-3xl font-bold">Nueva prenda</h1>
      <PrendaForm accion={crearPrenda} />
    </section>
  );
}
