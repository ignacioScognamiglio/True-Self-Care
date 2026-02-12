import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terminos de Servicio — ${APP_NAME}`,
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terminos de Servicio</h1>
      <p className="text-muted-foreground">
        Ultima actualizacion: febrero 2026
      </p>

      <p>
        Al usar {APP_NAME}, aceptas estos terminos de servicio. Por favor,
        leelos con atencion.
      </p>

      <h2>1. Descripcion del servicio</h2>
      <p>
        {APP_NAME} es una plataforma de bienestar personal que utiliza
        inteligencia artificial para ayudarte a mejorar tus habitos de salud.
        El servicio incluye tracking de multiples dimensiones de bienestar
        (nutricion, fitness, salud mental, sueno y habitos),
        recomendaciones personalizadas por IA, y herramientas de gamificacion.
      </p>

      <h2>2. Uso aceptable</h2>
      <p>Al usar el servicio, te comprometes a:</p>
      <ul>
        <li>Proporcionar informacion veraz y actualizada</li>
        <li>No usar la plataforma para fines ilegales o daninos</li>
        <li>No intentar acceder a datos de otros usuarios</li>
        <li>No intentar vulnerar la seguridad de la plataforma</li>
        <li>
          No usar automatizaciones o bots para interactuar con el servicio
        </li>
      </ul>

      <h2>3. Disclaimer de salud</h2>
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 not-prose">
        <p className="text-sm font-medium text-destructive">
          Aviso importante sobre salud
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-4">
          <li>
            {APP_NAME} <strong>NO</strong> es un servicio medico ni un
            sustituto del consejo profesional de salud.
          </li>
          <li>
            Las recomendaciones generadas por IA son orientativas y estan
            basadas en los datos que proporcionas.
          </li>
          <li>
            <strong>NO</strong> diagnosticamos, tratamos ni prevenimos
            enfermedades.
          </li>
          <li>
            Si tienes una condicion medica, estas en tratamiento o
            experimentas sintomas preocupantes, consulta siempre a un
            profesional de la salud.
          </li>
          <li>
            En caso de emergencia medica, llama a los servicios de emergencia
            de tu localidad.
          </li>
        </ul>
      </div>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Todo el contenido de {APP_NAME} (diseno, codigo, textos, graficos,
        logotipos) es propiedad de True Self-Care y esta protegido por leyes
        de propiedad intelectual. No puedes copiar, modificar ni distribuir
        ningun contenido sin autorizacion previa.
      </p>
      <p>
        Los datos y contenido que tu generas (registros de bienestar, notas
        de diario) te pertenecen. Nos otorgas una licencia limitada para
        procesar esos datos con el fin de proporcionarte el servicio.
      </p>

      <h2>5. Disponibilidad del servicio</h2>
      <p>
        Nos esforzamos por mantener el servicio disponible 24/7, pero no
        garantizamos disponibilidad ininterrumpida. Podemos realizar
        mantenimiento programado o de emergencia que afecte temporalmente el
        acceso.
      </p>

      <h2>6. Limitacion de responsabilidad</h2>
      <p>
        {APP_NAME} se proporciona &quot;tal cual&quot; y &quot;segun
        disponibilidad&quot;. En la maxima medida permitida por la ley, no
        seremos responsables de:
      </p>
      <ul>
        <li>
          Danos directos, indirectos, incidentales o consecuentes derivados
          del uso del servicio
        </li>
        <li>
          Decisiones de salud tomadas basandose en las recomendaciones de la
          plataforma
        </li>
        <li>Perdida de datos debido a fallos tecnicos</li>
        <li>
          Interrupciones del servicio fuera de nuestro control razonable
        </li>
      </ul>

      <h2>7. Cancelacion y terminacion</h2>
      <p>
        Puedes cancelar tu cuenta en cualquier momento desde la seccion de
        Configuracion. Al cancelar, tus datos seran eliminados de acuerdo con
        nuestra Politica de Privacidad.
      </p>
      <p>
        Nos reservamos el derecho de suspender o terminar cuentas que violen
        estos terminos.
      </p>

      <h2>8. Cambios a los terminos</h2>
      <p>
        Podemos actualizar estos terminos periodicamente. Te notificaremos de
        cambios significativos con al menos 30 dias de antelacion. El uso
        continuado del servicio despues de los cambios implica la aceptacion
        de los nuevos terminos.
      </p>

      <h2>9. Legislacion aplicable</h2>
      <p>
        Estos terminos se rigen por las leyes aplicables. Cualquier disputa
        se resolvera de acuerdo con los mecanismos de resolucion de conflictos
        vigentes en la jurisdiccion correspondiente.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para preguntas sobre estos terminos, contactanos en:{" "}
        <a
          href="mailto:legal@trueselfcare.app"
          className="text-primary hover:underline"
        >
          legal@trueselfcare.app
        </a>
      </p>
    </article>
  );
}
