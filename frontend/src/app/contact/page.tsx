export const dynamic = 'force-dynamic';

import Link from "next/link";

type ContactOption = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly href: string;
  readonly ariaLabel: string;
};

const contactOptions: readonly ContactOption[] = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Escríbenos para coordinar una clase personalizada o resolver dudas al instante.",
    actionLabel: "Abrir chat",
    href: "https://wa.me/51900000000",
    ariaLabel: "Abrir conversación de WhatsApp"
  },
  {
    id: "phone",
    title: "Llámanos",
    description: "Nuestro equipo responde de lunes a domingo de 8:00 a 20:00.",
    actionLabel: "Marcar",
    href: "tel:+51900000000",
    ariaLabel: "Llamar por teléfono"
  },
  {
    id: "email",
    title: "Correo electrónico",
    description: "Recibe una respuesta detallada en menos de 24 horas.",
    actionLabel: "Enviar correo",
    href: "mailto:hola@clasedesurf.com",
    ariaLabel: "Enviar correo electrónico"
  }
];

export const metadata = {
  title: "Contáctanos | Clases de Surf",
  description: "Conecta con el equipo de Clases de Surf para recibir ayuda, cotizaciones y resolver dudas."
};

export default function ContactPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#F6F7F8] pb-20 pt-16">
      <section className="container mx-auto px-4">
        <header className="text-center">
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#2EC4B6]">
            Estamos aquí para ayudarte
          </span>
          <h1 className="mt-6 text-4xl font-black text-[#011627] sm:text-5xl">
            Conversemos sobre tu próxima experiencia en el mar
          </h1>
          <p className="mt-4 text-base text-[#46515F] sm:text-lg">
            Escríbenos para reservar una clase, coordinar paquetes grupales o recibir recomendaciones de escuelas certificadas.
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {contactOptions.map((option) => (
            <article
              key={option.id}
              tabIndex={0}
              role="link"
              aria-label={option.ariaLabel}
              className="group flex h-full flex-col justify-between rounded-3xl bg-white p-8 shadow-xl shadow-[#011627]/10 transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2EC4B6] hover:-translate-y-2"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#011627]">{option.title}</h2>
                <p className="mt-3 text-sm text-[#46515F]">{option.description}</p>
              </div>
              <Link
                href={option.href}
                aria-label={option.ariaLabel}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2EC4B6] px-6 py-3 text-sm font-semibold text-[#011627] transition-all duration-300 group-hover:bg-[#24AD9D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2EC4B6]"
              >
                {option.actionLabel}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-20 rounded-3xl bg-[#011627] px-8 py-10 text-white shadow-2xl shadow-[#011627]/30">
          <h2 className="text-3xl font-bold">¿Qué necesitas?</h2>
          <p className="mt-4 max-w-3xl text-sm text-white/80 sm:text-base">
            Cuéntanos tu nivel, objetivos y disponibilidad. Nuestro equipo te ayudará a encontrar la escuela ideal y reservar en cuestión de minutos. También podemos coordinar eventos corporativos o experiencias para grupos grandes.
          </p>
        </section>
      </section>
    </main>
  );
}
