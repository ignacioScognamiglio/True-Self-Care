import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Politica de Privacidad — ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Politica de Privacidad</h1>
      <p className="text-muted-foreground">
        Ultima actualizacion: febrero 2026
      </p>

      <p>
        En {APP_NAME} nos tomamos tu privacidad en serio. Esta politica
        describe que datos recopilamos, como los usamos y cuales son tus
        derechos.
      </p>

      <h2>1. Datos que recopilamos</h2>

      <h3>Datos de cuenta</h3>
      <p>
        Cuando te registras, recopilamos tu nombre, direccion de correo
        electronico y foto de perfil (si la proporcionas) a traves de nuestro
        proveedor de autenticacion (Clerk).
      </p>

      <h3>Datos de bienestar</h3>
      <p>
        Recopilamos los datos que tu ingresas voluntariamente en la plataforma:
        registros de estado de animo, alimentacion, ejercicio, sueno, habitos,
        cuidado de la piel, hidratacion y notas de diario. Estos datos son
        necesarios para ofrecerte recomendaciones personalizadas.
      </p>

      <h3>Datos de uso</h3>
      <p>
        Recopilamos informacion anonima sobre como interactuas con la app
        (paginas visitadas, funciones usadas) a traves de PostHog para mejorar
        el servicio. Puedes desactivar estas cookies de analytics en cualquier
        momento.
      </p>

      <h2>2. Como usamos tus datos</h2>
      <ul>
        <li>
          <strong>Personalizacion IA:</strong> Tus datos de bienestar se
          procesan por agentes de IA para generar recomendaciones, detectar
          patrones y crear planes personalizados.
        </li>
        <li>
          <strong>Mejora del servicio:</strong> Los datos de uso anonimos nos
          ayudan a entender que funciones son mas utiles y donde podemos
          mejorar.
        </li>
        <li>
          <strong>Comunicaciones:</strong> Tu email puede usarse para enviarte
          notificaciones importantes sobre el servicio (nunca spam comercial).
        </li>
      </ul>

      <h2>3. Datos de salud — Disclaimer importante</h2>
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 not-prose">
        <p className="text-sm font-medium text-destructive">
          {APP_NAME} NO es un servicio medico.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Las recomendaciones generadas por IA son orientativas y estan
          disenadas para ayudarte a mejorar tus habitos de bienestar general.
          No sustituyen el consejo, diagnostico o tratamiento de un profesional
          de la salud. Si tienes una condicion medica, consulta siempre a tu
          medico.
        </p>
      </div>
      <p>
        Los datos de salud que proporcionas (tipo de piel, restricciones
        alimentarias, nivel de fitness, etc.) se usan exclusivamente para
        personalizar tus recomendaciones de bienestar. No se comparten con
        terceros ni se usan con fines publicitarios.
      </p>

      <h2>4. Almacenamiento y seguridad</h2>
      <ul>
        <li>
          Tus datos se almacenan de forma segura en Convex, con cifrado en
          transito (TLS) y en reposo.
        </li>
        <li>Los servidores estan ubicados en Estados Unidos.</li>
        <li>
          La autenticacion se gestiona a traves de Clerk con estandares de
          seguridad de la industria.
        </li>
      </ul>

      <h2>5. IA y tus datos</h2>
      <p>
        Las conversaciones con nuestros agentes de IA se procesan para generar
        recomendaciones personalizadas. No compartimos tus conversaciones ni
        datos personales con terceros proveedores de IA de forma identificable.
        Los modelos de IA no se entrenan con tus datos personales.
      </p>

      <h2>6. Tus derechos</h2>
      <p>Tienes derecho a:</p>
      <ul>
        <li>
          <strong>Acceso:</strong> Solicitar una copia de todos tus datos
          personales.
        </li>
        <li>
          <strong>Rectificacion:</strong> Corregir datos incorrectos desde la
          seccion de Configuracion.
        </li>
        <li>
          <strong>Eliminacion:</strong> Solicitar la eliminacion completa de tu
          cuenta y todos los datos asociados.
        </li>
        <li>
          <strong>Exportacion:</strong> Solicitar tus datos en formato legible
          por maquina.
        </li>
        <li>
          <strong>Oposicion:</strong> Desactivar las cookies de analytics en
          cualquier momento.
        </li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        Usamos cookies esenciales para la autenticacion y cookies opcionales
        de analytics. Consulta nuestra{" "}
        <Link href="/cookies" className="text-primary hover:underline">
          Politica de Cookies
        </Link>{" "}
        para mas detalles.
      </p>

      <h2>8. Cambios a esta politica</h2>
      <p>
        Podemos actualizar esta politica periodicamente. Te notificaremos de
        cambios significativos por email o mediante un aviso en la app.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta politica o quieres ejercer tus
        derechos, contactanos en:{" "}
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
