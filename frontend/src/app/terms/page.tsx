export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Condiciones del Servicio | Clases de Surf",
  description: "Condiciones del Servicio de la aplicación Clases de Surf"
};

export default function TermsPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#F6F7F8] pb-20 pt-16">
      <section className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-12">
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#2EC4B6]">
            Información Legal
          </span>
          <h1 className="mt-6 text-4xl font-black text-[#011627] sm:text-5xl">
            Condiciones del Servicio
          </h1>
          <p className="mt-4 text-base text-[#46515F] sm:text-lg">
            Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#011627]/10 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">1. Aceptación de los Términos</h2>
            <p className="text-[#46515F] leading-relaxed">
              Al acceder y utilizar la aplicación Clases de Surf (&quot;la aplicación&quot;, &quot;nosotros&quot;, &quot;nuestro&quot;), usted acepta estar sujeto 
              a estas Condiciones del Servicio. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">2. Descripción del Servicio</h2>
            <p className="text-[#46515F] leading-relaxed">
              Clases de Surf es una plataforma digital que conecta estudiantes con escuelas e instructores de surf para facilitar la 
              reserva y gestión de clases de surf. Actuamos como intermediario entre estudiantes y proveedores de servicios de surf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">3. Registro y Cuentas de Usuario</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">3.1 Elegibilidad</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Para utilizar nuestros servicios, debe tener al menos 18 años de edad o contar con el consentimiento de un padre o tutor legal.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">3.2 Información de Cuenta</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Debe notificarnos inmediatamente 
                  sobre cualquier uso no autorizado de su cuenta.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">3.3 Precisión de la Información</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Se compromete a proporcionar información precisa, actualizada y completa al crear su cuenta y realizar reservas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">4. Reservas y Pagos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">4.1 Proceso de Reserva</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Las reservas están sujetas a disponibilidad. Al realizar una reserva, usted acepta pagar el precio total indicado, 
                  incluyendo impuestos y tarifas aplicables.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">4.2 Pagos</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Los pagos se procesan a través de proveedores de servicios de pago seguros. Usted acepta proporcionar información 
                  de pago válida y autoriza el cobro de los montos correspondientes.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">4.3 Cancelaciones y Reembolsos</h3>
                <p className="text-[#46515F] leading-relaxed">
                  Las políticas de cancelación y reembolso están sujetas a los términos específicos de cada escuela o instructor. 
                  Consulte las políticas de cancelación antes de realizar su reserva.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">5. Conducta del Usuario</h2>
            <p className="text-[#46515F] leading-relaxed mb-4">
              Usted se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#46515F] ml-4">
              <li>Utilizar la aplicación únicamente para fines legales y de acuerdo con estos términos</li>
              <li>No interferir con el funcionamiento de la aplicación</li>
              <li>No intentar acceder a áreas restringidas o sistemas de la aplicación</li>
              <li>No transmitir virus, malware o código malicioso</li>
              <li>Respetar los derechos de otros usuarios y proveedores de servicios</li>
              <li>Proporcionar información veraz y no engañosa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">6. Responsabilidades y Limitaciones</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">6.1 Servicios de Terceros</h3>
                <p className="text-[#46515F] leading-relaxed">
                  No somos responsables de la calidad, seguridad o legalidad de los servicios proporcionados por escuelas e instructores. 
                  Actuamos únicamente como intermediario en la reserva de servicios.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">6.2 Limitación de Responsabilidad</h3>
                <p className="text-[#46515F] leading-relaxed">
                  En la máxima medida permitida por la ley, no seremos responsables por daños indirectos, incidentales, especiales o 
                  consecuentes derivados del uso de nuestros servicios.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#011627] mb-2">6.3 Actividades de Surf</h3>
                <p className="text-[#46515F] leading-relaxed">
                  El surf es una actividad que conlleva riesgos inherentes. Usted participa en las clases bajo su propio riesgo y debe 
                  asegurarse de tener las habilidades y condición física adecuadas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">7. Propiedad Intelectual</h2>
            <p className="text-[#46515F] leading-relaxed">
              Todo el contenido de la aplicación, incluyendo pero no limitado a texto, gráficos, logos, iconos, imágenes y software, 
              es propiedad de Clases de Surf o sus proveedores de contenido y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">8. Modificaciones del Servicio</h2>
            <p className="text-[#46515F] leading-relaxed">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de la aplicación en cualquier momento, 
              con o sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">9. Terminación</h2>
            <p className="text-[#46515F] leading-relaxed">
              Podemos terminar o suspender su acceso a la aplicación inmediatamente, sin previo aviso, por cualquier motivo, incluyendo 
              si viola estas Condiciones del Servicio. Usted también puede cerrar su cuenta en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">10. Ley Aplicable</h2>
            <p className="text-[#46515F] leading-relaxed">
              Estas Condiciones del Servicio se rigen por las leyes de Perú. Cualquier disputa relacionada con estos términos será 
              resuelta en los tribunales competentes de Lima, Perú.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">11. Modificaciones de los Términos</h2>
            <p className="text-[#46515F] leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al ser 
              publicadas en la aplicación. Su uso continuado de la aplicación después de las modificaciones constituye su aceptación 
              de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#011627] mb-4">12. Contacto</h2>
            <p className="text-[#46515F] leading-relaxed">
              Si tiene preguntas sobre estas Condiciones del Servicio, puede contactarnos en:
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

