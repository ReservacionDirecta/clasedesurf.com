import { 
  ShieldIcon, 
  CheckIcon, 
  EquipmentIcon, 
  TrophyIcon,
  LightningIcon,
  StarIcon
} from '@/components/ui/Icons'

const features = [
  {
    icon: CheckIcon,
    title: 'Instructores Certificados',
    description: 'Aprende con los mejores. Todos nuestros instructores cuentan con certificaciones internacionales y años de experiencia enseñando.',
    color: 'text-[#FF3366]',
    bgColor: 'bg-[#FFCCD9]',
    shadow: 'shadow-[#FF3366]/10'
  },
  {
    icon: ShieldIcon,
    title: 'Seguridad Garantizada',
    description: 'Tu seguridad es primero. Incluimos seguros contra accidentes y protocolos estrictos para que solo te preocupes por divertirte.',
    color: 'text-[#2EC4B6]',
    bgColor: 'bg-[#CCF4EF]',
    shadow: 'shadow-[#2EC4B6]/10'
  },
  {
    icon: EquipmentIcon,
    title: 'Todo Incluido',
    description: 'Olvídate de cargar cosas. Te proporcionamos la tabla ideal para tu nivel y wetsuits de alta gama limpios y desinfectados.',
    color: 'text-[#2D5BE3]',
    bgColor: 'bg-[#D9E8FF]',
    shadow: 'shadow-blue-500/10'
  },
  {
    icon: LightningIcon,
    title: 'Reserva Instantánea',
    description: 'Sin esperas ni correos infinitos. Ve la disponibilidad en tiempo real y asegura tu clase en segundos desde tu celular.',
    color: 'text-[#EBD936]',
    bgColor: 'bg-[#FFF9C4]',
    shadow: 'shadow-yellow-500/10'
  }
]

export function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3 text-blue-600">
            ¿Por qué nosotros?
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-[#011627] mb-6 leading-tight">
            La mejor experiencia de surf,<br/>garantizada.
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Nos aseguramos de que cada detalle esté cuidado para que tu única preocupación sea ponerte de pie en la tabla.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${feature.shadow}`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h4 className="text-xl font-bold text-[#011627] mb-3">
                {feature.title}
              </h4>
              
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
