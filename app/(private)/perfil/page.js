import { requireUser } from "@/lib/auth/session";
import PerfilForm from "@/components/perfil/PerfilForm";
import AjusteTermico from "@/components/perfil/AjusteTermico";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Mi perfil",
};

export default async function PerfilPage() {
  const user = await requireUser();

  // Solo pasamos al cliente lo que el formulario necesita.
  const perfil = {
    nombre: user.nombre,
    ciudad: user.ciudad,
    horaSalida: user.horaSalida,
    horaVuelta: user.horaVuelta,
    sensibilidad: user.sensibilidad,
  };

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Mi perfil"
        descripcion="Con estos datos ajustamos el clima y la recomendación a tu día."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PerfilForm perfil={perfil} />
        <AjusteTermico ajuste={user.ajusteTermico} />
      </div>
    </section>
  );
}
