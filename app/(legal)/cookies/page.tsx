import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Politica de Cookies — ${APP_NAME}`,
};

export default function CookiesPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Politica de Cookies</h1>
      <p className="text-muted-foreground">
        Ultima actualizacion: febrero 2026
      </p>

      <p>
        Esta politica explica que cookies utilizamos en {APP_NAME}, para que
        sirven y como puedes gestionarlas.
      </p>

      <h2>1. Que son las cookies</h2>
      <p>
        Las cookies son pequenos archivos de texto que se almacenan en tu
        dispositivo cuando visitas un sitio web. Se utilizan ampliamente para
        hacer que los sitios funcionen de manera eficiente y para proporcionar
        informacion a los propietarios del sitio.
      </p>

      <h2>2. Cookies que usamos</h2>

      <h3>Cookies esenciales</h3>
      <p>
        Estas cookies son necesarias para el funcionamiento basico de la app.
        No se pueden desactivar.
      </p>
      <div className="not-prose">
        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium">Cookie</th>
              <th className="p-2 text-left font-medium">Proposito</th>
              <th className="p-2 text-left font-medium">Duracion</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">__clerk_*</td>
              <td className="p-2">
                Autenticacion y gestion de sesion (Clerk)
              </td>
              <td className="p-2">Sesion</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">cookie-consent</td>
              <td className="p-2">
                Recordar tu preferencia de cookies
              </td>
              <td className="p-2">1 ano</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Cookies funcionales</h3>
      <p>
        Mejoran tu experiencia recordando tus preferencias.
      </p>
      <div className="not-prose">
        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium">Cookie</th>
              <th className="p-2 text-left font-medium">Proposito</th>
              <th className="p-2 text-left font-medium">Duracion</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">theme</td>
              <td className="p-2">Preferencia de tema (claro/oscuro)</td>
              <td className="p-2">1 ano</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Cookies de analytics</h3>
      <p>
        Nos ayudan a entender como usas la app para poder mejorarla. Puedes
        desactivarlas sin afectar el funcionamiento.
      </p>
      <div className="not-prose">
        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium">Cookie</th>
              <th className="p-2 text-left font-medium">Proposito</th>
              <th className="p-2 text-left font-medium">Duracion</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">ph_*</td>
              <td className="p-2">
                Analytics de producto (PostHog) — paginas visitadas,
                funciones usadas, rendimiento
              </td>
              <td className="p-2">1 ano</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. Como gestionar las cookies</h2>

      <h3>Nuestro banner de cookies</h3>
      <p>
        Cuando visitas {APP_NAME} por primera vez, te mostramos un banner
        donde puedes elegir entre:
      </p>
      <ul>
        <li>
          <strong>Aceptar todas:</strong> Se activan las cookies esenciales,
          funcionales y de analytics.
        </li>
        <li>
          <strong>Solo esenciales:</strong> Solo se activan las cookies
          necesarias para el funcionamiento. Las cookies de analytics se
          desactivan.
        </li>
      </ul>

      <h3>Configuracion del navegador</h3>
      <p>
        Tambien puedes gestionar las cookies desde la configuracion de tu
        navegador. Ten en cuenta que bloquear las cookies esenciales puede
        afectar el funcionamiento de la app.
      </p>

      <h2>4. Cambios a esta politica</h2>
      <p>
        Podemos actualizar esta politica si cambiamos las cookies que usamos.
        Te notificaremos de cambios significativos y solicitaremos tu
        consentimiento nuevamente si es necesario.
      </p>

      <h2>5. Contacto</h2>
      <p>
        Para preguntas sobre cookies, contactanos en:{" "}
        <a
          href="mailto:privacy@trueselfcare.app"
          className="text-primary hover:underline"
        >
          privacy@trueselfcare.app
        </a>
      </p>
    </article>
  );
}
