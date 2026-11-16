import { requireUser } from "@/lib/auth/session";
import PerfilForm from "@/components/perfil/PerfilForm";
import AjusteTermico from "@/components/perfil/AjusteTermico";

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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="text-muted">
          Con estos datos ajustamos el clima y la recomendación a tu día.
        </p>
      </div>

      <PerfilForm perfil={perfil} />
      <AjusteTermico ajuste={user.ajusteTermico} />
    </section>
  );
}
