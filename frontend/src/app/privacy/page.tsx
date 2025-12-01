export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Política de Privacidad | Clases de Surf",
  description: "Política de Privacidad de la aplicación Clases de Surf"
};

export default function PrivacyPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#F6F7F8] pb-20 pt-16">
      <section className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-12">
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#2EC4B6]">
            Información Legal
          </span>
          <h1 className="mt-6 text-4xl font-black text-[#011627] sm:text-5xl">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-base text-[#46515F] sm:text-lg">
            Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#011627]/10 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">1. Introducción</h2>
            <p className="text-[#46515F] leading-relaxed">
              Clases de Surf (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la aplicación&quot;) se compromete a proteger la privacidad de nuestros usuarios. 
              Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza 
              nuestra plataforma de reserva de clases de surf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">2. Información que Recopilamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">2.1 Información Personal</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Recopilamos información que usted nos proporciona directamente, incluyendo:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#46515F] ml-4">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Información de perfil (foto, biografía, nivel de surf)</li>
                  <li>Información de pago (procesada de forma segura a través de proveedores de terceros)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">2.2 Información de Uso</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Automáticamente recopilamos información sobre cómo utiliza nuestra aplicación:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#46515F] ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Patrones de navegación</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">3. Uso de la Información</h2>
            <p className="text-[#46515F] leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#46515F] ml-4">
              <li>Procesar y gestionar sus reservas de clases</li>
              <li>Comunicarnos con usted sobre sus reservas y servicios</li>
              <li>Mejorar nuestros servicios y experiencia del usuario</li>
              <li>Enviar notificaciones importantes sobre la aplicación</li>
              <li>Personalizar su experiencia en la plataforma</li>
              <li>Cumplir con obligaciones legales y prevenir fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">4. Compartir Información</h2>
            <p className="text-[#46515F] leading-relaxed mb-4">
              No vendemos su información personal. Podemos compartir su información únicamente en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#46515F] ml-4">
              <li><strong>Con escuelas e instructores:</strong> Para facilitar la reserva y coordinación de clases</li>
              <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar (procesamiento de pagos, hosting, etc.)</li>
              <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
              <li><strong>Con su consentimiento:</strong> En cualquier otra situación con su autorización explícita</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">5. Seguridad de los Datos</h2>
            <p className="text-[#46515F] leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, 
              alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico 
              es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">6. Sus Derechos</h2>
            <p className="text-[#46515F] leading-relaxed mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#46515F] ml-4">
              <li>Acceder a su información personal</li>
              <li>Rectificar información incorrecta o incompleta</li>
              <li>Solicitar la eliminación de sus datos personales</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-[#46515F] leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso de la aplicación y personalizar contenido. 
              Puede gestionar sus preferencias de cookies a través de la configuración de su navegador o mediante nuestro banner de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">8. Retención de Datos</h2>
            <p className="text-[#46515F] leading-relaxed">
              Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, 
              a menos que la ley requiera o permita un período de retención más largo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">9. Menores de Edad</h2>
            <p className="text-[#46515F] leading-relaxed">
              Nuestros servicios están dirigidos a personas mayores de 18 años. Si un menor de edad utiliza nuestra plataforma, 
              debe hacerlo bajo la supervisión de un padre o tutor legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">10. Cambios a esta Política</h2>
            <p className="text-[#46515F] leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando 
              la nueva política en esta página y actualizando la fecha de &quot;Última actualización&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">11. Contacto</h2>
            <p className="text-[#46515F] leading-relaxed">
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede contactarnos en:
            </p>
            <div className="mt-4 p-4 bg-[#F6F7F8] rounded-lg">
              <p className="text-[#011627] font-semibold">Clases de Surf</p>
              <p className="text-[#46515F]">Email: info@clasedesurf.com</p>
              <p className="text-[#46515F]">Teléfono: +51 1 234 5678</p>
              <p className="text-[#46515F]">Lima, Perú</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

