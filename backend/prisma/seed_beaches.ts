
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DESTINATIONS = [
    {
        name: 'Costa Verde',
        slug: 'costa-verde',
        image: 'https://images.unsplash.com/photo-1518774786638-7f551c96a77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: '25+ escuelas',
        description: 'La circuito de playas de Lima. Se extiende desde Miraflores hasta Chorrillos con múltiples picos. El epicentro del surf urbano en Sudamérica.',
        waveType: 'Beach breaks variados con fondo de canto rodado (piedras). Olas para todos los gustos.',
        level: 'Todos los niveles',
        entryTips: [
            'Ingresa por las escaleras de la bajada Balta o bajada Armendáriz',
            'Camina por la orilla hasta encontrar un canal sin olas para remar',
            'Evita las zonas con rocas visibles',
            'Hay duchas y vestidores disponibles en varios puntos'
        ],
        bestTime: 'Todo el año',
        hazards: ['Tráfico en la costa verde', 'Piedras al entrar'],
        conditions: {
            waveHeight: '0.8 - 1.5m',
            wavePeriod: '14s',
            windSpeed: '12 km/h',
            windDirection: 'SSW',
            tide: 'mid',
            tideTime: 'Estable',
            waterTemp: '18°C',
            rating: 4,
            lastUpdated: 'Hace 15 min'
        }
    },
    {
        name: 'Makaha',
        slug: 'makaha',
        image: 'https://images.unsplash.com/photo-1455729552865-3658a5d39692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Top spots',
        description: 'Icónica playa en el corazón de Miraflores. Makaha es conocida por sus olas consistentes y su ambiente surfero. Aquí nacieron muchos de los mejores surfistas peruanos.',
        waveType: 'Point break izquierdo que rompe sobre fondo rocoso. La ola corre paralela al malecón ofreciendo paredes largas y maniobrables.',
        level: 'Intermedio',
        entryTips: [
            'Baja por las escaleras junto al club Waikiki',
            'Salta desde las rocas solo si conoces bien el spot',
            'Rema hacia la izquierda siguiendo la corriente del canal',
            'Respeta la localía y espera tu turno'
        ],
        bestTime: 'Abril a Octubre',
        hazards: ['Rocas en la entrada', 'Localismo fuerte', 'Erizos'],
        conditions: {
            waveHeight: '1.0 - 1.5m',
            wavePeriod: '16s',
            windSpeed: '8 km/h',
            windDirection: 'S',
            tide: 'low',
            tideTime: 'Bajando',
            waterTemp: '17°C',
            rating: 4,
            lastUpdated: 'Hace 10 min'
        }
    },
    {
        name: 'Waikiki',
        slug: 'waikiki',
        image: 'https://images.unsplash.com/photo-1544473344-f8644e5902bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Ideal aprendices',
        description: 'La cuna del aprendizaje en Lima. Olas muy suaves y largas, perfectas para pararse por primera vez. Ubicada justo al lado de Makaha.',
        waveType: 'Ola izquierda muy suave y predecible. Fondo de arena y piedras redondas.',
        level: 'Principiante',
        entryTips: ['Entrada muy fácil por la orilla', 'Ideal para longboard y funboard', 'Evita cruzarte con otras escuelas'],
        bestTime: 'Verano (Enero-Marzo)',
        hazards: ['Gran cantidad de alumnos', 'Tablas de escuela sueltas'],
        conditions: {
            waveHeight: '0.5 - 1.0m',
            wavePeriod: '13s',
            windSpeed: '10 km/h',
            windDirection: 'SW',
            tide: 'mid',
            tideTime: 'Subiendo',
            waterTemp: '19°C',
            rating: 5,
            lastUpdated: 'Hace 20 min'
        }
    },
    {
        name: 'La Pampilla',
        slug: 'la-pampilla',
        image: 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Clásico derecho',
        description: 'Derecha clásica de la Costa Verde. Ola larga y noble que permite maniobrar con comodidad. Es la favorita de los longboarders.',
        waveType: 'Point break de derecha con fondo de piedras. Rompe lejos de la orilla y ofrece un recorrido largo.',
        level: 'Intermedio',
        entryTips: [
            'Ingresa por la playa de piedras frente al estacionamiento',
            'Calcula bien los tiempos entre series para entrar',
            'Ten cuidado con las rocas al salir',
            'Respeta a los longboarders locales'
        ],
        bestTime: 'Todo el año, especialmente con crecidas del sur',
        hazards: ['Fondo de rocas', 'Erizos', 'Crowd'],
        conditions: {
            waveHeight: '1.0 - 1.8m',
            wavePeriod: '15s',
            windSpeed: '10 km/h',
            windDirection: 'S',
            tide: 'mid',
            tideTime: 'Estable',
            waterTemp: '17°C',
            rating: 4,
            lastUpdated: 'Hace 30 min'
        }
    },
    {
        name: 'Punta Roquitas',
        slug: 'punta-roquitas',
        image: 'https://images.unsplash.com/photo-1505566089201-72f3e8f5223c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Acción constante',
        description: 'Spot versátil y divertido que ofrece tanto izquierdas como derechas. Rompe cerca de la orilla y es conocido por su constancia. Ideal para quienes buscan mejorar maniobras rápidas.',
        waveType: 'Reef break de piedras que ofrece picos variables. La ola es rápida y a veces tubular en la orilla. Funciona con casi cualquier marea.',
        level: 'Intermedio',
        entryTips: [
            'Entrada directa por la orilla de piedras',
            'Usa escarpines si no estás acostumbrado a las piedras',
            'Cuidado con la corriente lateral hacia el espigón',
            'Observa bien dónde rompe el pico antes de entrar'
        ],
        bestTime: 'Todo el año, muy consistente',
        hazards: ['Rocas resbaladizas', 'Corrientes fuertes', 'Espigones cercanos'],
        conditions: {
            waveHeight: '0.8 - 1.5m',
            wavePeriod: '13s',
            windSpeed: '14 km/h',
            windDirection: 'SSW',
            tide: 'high',
            tideTime: 'Bajando',
            waterTemp: '16°C',
            rating: 3,
            lastUpdated: 'Hace 25 min'
        }
    },
    {
        name: 'Playa Redondo',
        slug: 'playa-redondo',
        image: 'https://images.unsplash.com/photo-1415931633537-351070d20b81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Ideal aprendizaje',
        description: 'La continuación natural de Makaha. Ofrece condiciones similares pero suele estar menos concurrida. Sus olas nobles son perfectas para dar el salto de principiante a intermedio.',
        waveType: 'Beach break con secciones de piedras. Olas izquierdas predominantemente, suaves pero con recorrido. Menos fuerza que Pampilla o Roquitas.',
        level: 'Principiante',
        entryTips: [
            'Entrada fácil por la orilla',
            'Busca los canales definidos',
            'Ideal para primeras clases fuera de la espuma',
            'Estacionamiento disponible en el malecón'
        ],
        bestTime: 'Verano y media estación',
        hazards: ['Fondo mixto arena/piedra', 'Principiantes con tablas grandes'],
        conditions: {
            waveHeight: '0.5 - 1.0m',
            wavePeriod: '12s',
            windSpeed: '8 km/h',
            windDirection: 'SW',
            tide: 'mid',
            tideTime: 'Subiendo',
            waterTemp: '19°C',
            rating: 3,
            lastUpdated: 'Hace 45 min'
        }
    },
    {
        name: 'Barranquito',
        slug: 'barranquito',
        image: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Longboard spot',
        description: 'El spot clásico de Barranco. Conocido por su ambiente relajado y sus olas largas ideales para tablón (longboard) y SUP. Un rincón con mucha historia y mística.',
        waveType: 'Point break izquierdo muy suave y largo. No es una ola agresiva, lo que la hace perfecta para estilos clásicos y relajados.',
        level: 'Principiante',
        entryTips: [
            'Ingreso por la playa de arena/piedra chica',
            'Rema con paciencia, el pico está algo adentro',
            'Respeta el estilo relajado del lineup',
            'Disfruta la vista de los acantilados de Barranco'
        ],
        bestTime: 'Invierno para tamaño, Verano para relax',
        hazards: ['Rocas sumergidas', 'Remada larga'],
        conditions: {
            waveHeight: '0.6 - 1.2m',
            wavePeriod: '13s',
            windSpeed: '10 km/h',
            windDirection: 'S',
            tide: 'high',
            tideTime: 'Alta',
            waterTemp: '17°C',
            rating: 4,
            lastUpdated: 'Hace 1h'
        }
    },
    {
        name: 'Los Yuyos',
        slug: 'los-yuyos',
        image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Aguas calmas',
        description: 'La playa favorita para Stand Up Paddle y natación en Barranco. Rara vez tiene olas grandes, lo que la hace muy segura.',
        waveType: 'Beach break muy pequeño, casi flat. Solo rompe con crecidas grandes del norte o sur muy fuertes.',
        level: 'Principiante',
        entryTips: ['Entrada de arena muy fácil', 'Perfecta para niños', 'Ideal para SUP'],
        bestTime: 'Verano',
        hazards: ['Bañistas en la orilla', 'Botes anclados'],
        conditions: {
            waveHeight: '0.2 - 0.5m',
            wavePeriod: '10s',
            windSpeed: '6 km/h',
            windDirection: 'SW',
            tide: 'high',
            tideTime: 'Estable',
            waterTemp: '20°C',
            rating: 5,
            lastUpdated: 'Hace 1h'
        }
    },
    {
        name: 'La Herradura',
        slug: 'la-herradura',
        image: 'https://images.unsplash.com/photo-1522055620701-081699709db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Solo expertos',
        description: 'La leyenda de Lima. Un point break izquierdo de clase mundial ubicado en Chorrillos. Cuando entra el crecidón, ofrece tubos y secciones rápidas solo para los más experimentados.',
        waveType: 'Point break izquierdo sobre fondo de rocas. Ola muy potente, rápida y tubular. Puede alcanzar 3-4 metros en días grandes. Requiere lectura experta.',
        level: 'Avanzado',
        entryTips: [
            'Entrada complicada por las rocas (el "salto")',
            'Calcula perfectamente el timing de la serie',
            'Si dudas, mejor no entres',
            'Localismo fuerte: respeto absoluto'
        ],
        bestTime: 'Creces grandes del Sur (Invierno)',
        hazards: ['Rocas afiladas', 'Corrientes muy fuertes', 'Localismo', 'Fondos bajos'],
        conditions: {
            waveHeight: '2.0 - 3.0m',
            wavePeriod: '17s',
            windSpeed: '15 km/h',
            windDirection: 'SE',
            tide: 'low',
            tideTime: 'Baja',
            waterTemp: '15°C',
            rating: 5,
            lastUpdated: 'Hace 10 min'
        }
    },
    {
        name: 'El Triángulo',
        slug: 'el-triangulo',
        image: 'https://images.unsplash.com/photo-1481190566236-40742a785e05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Pico potente',
        description: 'Ubicado en las playas del sur (San Bartolo/Santa María). Un pico definido que rompe con fuerza en forma triangular, ofreciendo paredes para ambos lados.',
        waveType: 'Reef break potente. Ofrece una "A-frame" (pico triangular) con derechas e izquierdas. Ola con fuerza y buena pared para maniobras.',
        level: 'Avanzado',
        entryTips: [
            'Requiere buena remada para llegar al pico',
            'Posiciónate justo en el vértice del triángulo',
            'Cuidado con la serie sorpresa',
            'Mejor ir acompañado'
        ],
        bestTime: 'Todo el año, consistente',
        hazards: ['Fondo de roca', 'Corrientes de retorno', 'Olas con fuerza'],
        conditions: {
            waveHeight: '1.2 - 2.0m',
            wavePeriod: '14s',
            windSpeed: '12 km/h',
            windDirection: 'S',
            tide: 'mid',
            tideTime: 'Subiendo',
            waterTemp: '16°C',
            rating: 4,
            lastUpdated: 'Hace 40 min'
        }
    },
    {
        name: 'Punta Hermosa',
        slug: 'punta-hermosa',
        image: 'https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Pro surfing',
        description: 'El destino de surf más completo al sur de Lima. Con más de 10 picos diferentes, Punta Hermosa ofrece olas para todos los niveles, desde la suave Playa Norte hasta el poderoso Pico Alto.',
        waveType: 'Variedad de point breaks y beach breaks. Caballeros ofrece paredes largas, mientras Pico Alto puede alcanzar los 8 metros en invierno. Playa Norte es ideal para principiantes.',
        level: 'Todos los niveles',
        entryTips: [
            'Playa Norte: entrada fácil por la arena',
            'Caballeros: ingresa por el canal al sur de las rocas',
            'Pico Alto: solo para expertos, requiere jet ski',
            'Hay estacionamiento y restaurantes cerca'
        ],
        bestTime: 'Todo el año, mejor de Mayo a Septiembre',
        hazards: ['Corrientes fuertes en días grandes', 'Rocas en varios picos', 'Sol intenso'],
        conditions: {
            waveHeight: '1.5 - 2.5m',
            wavePeriod: '18s',
            windSpeed: '15 km/h',
            windDirection: 'SW',
            tide: 'high',
            tideTime: 'Alta',
            waterTemp: '16°C',
            rating: 5,
            lastUpdated: 'Hace 5 min'
        }
    },
    {
        name: 'Punta Negra',
        slug: 'punta-negra',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Pocos crowds',
        description: 'Playa con ambiente local y olas potentes. La "Puntilla" ofrece una derecha rápida y divertida. Ideal para escapar de la multitud de Punta Hermosa.',
        waveType: 'Point break de derecha y beach breaks variables. Fondo de arena y rocas.',
        level: 'Intermedio',
        entryTips: ['Cuidado con las rocas en marea baja', 'Respeta a los locales', 'Entrada por la orilla'],
        bestTime: 'Todo el año',
        hazards: ['Rocas escondidas', 'Corrientes'],
        conditions: {
            waveHeight: '1.0 - 1.8m',
            wavePeriod: '13s',
            windSpeed: '12 km/h',
            windDirection: 'S',
            tide: 'mid',
            tideTime: 'Estable',
            waterTemp: '17°C',
            rating: 4,
            lastUpdated: 'Hace 45 min'
        }
    },
    {
        name: 'San Bartolo',
        slug: 'san-bartolo',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Para todos',
        description: 'Balneario familiar con excelentes olas para aprender. Su playa principal ofrece olas suaves y agua más cálida que Lima. Ambiente relajado y escuelas para todos los niveles.',
        waveType: 'Beach break suave con olas que rompen despacio sobre fondo de arena. Ideal para dar las primeras remadas. Con swell sur pueden formarse buenas paredes.',
        level: 'Principiante',
        entryTips: [
            'Entrada directa por la playa principal',
            'El agua es poco profunda, cuidado al tirarse',
            'Mejor surfear frente al malecón donde hay más espacio',
            'Muchos alquileres de tablas disponibles'
        ],
        bestTime: 'Todo el año, mejor de Noviembre a Marzo',
        hazards: ['Agua poco profunda', 'Mucho crowd en verano', 'Medusas ocasionales'],
        conditions: {
            waveHeight: '0.5 - 1.0m',
            wavePeriod: '12s',
            windSpeed: '10 km/h',
            windDirection: 'SSW',
            tide: 'mid',
            tideTime: 'Subiendo',
            waterTemp: '20°C',
            rating: 3,
            lastUpdated: 'Hace 20 min'
        }
    },
    {
        name: 'Santa María',
        slug: 'santa-maria',
        image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Relax total',
        description: 'El balneario más exclusivo del sur chico. Sus playas embalsadas son piscinas grandes, pero afuera rompen olas divertidas para longboard.',
        waveType: 'Beach break muy suave y point breaks de roca en los extremos.',
        level: 'Principiante',
        entryTips: ['Entrada fácil por el club o playa pública', 'Ideal para SUP', 'Agua muy tranquila'],
        bestTime: 'Verano',
        hazards: ['Yates y botes', 'Bañistas'],
        conditions: {
            waveHeight: '0.3 - 0.8m',
            wavePeriod: '11s',
            windSpeed: '8 km/h',
            windDirection: 'W',
            tide: 'high',
            tideTime: 'Alta',
            waterTemp: '20°C',
            rating: 3,
            lastUpdated: 'Hace 1h'
        }
    },
    {
        name: 'San Pedro',
        slug: 'san-pedro',
        image: 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Tubos de arena',
        description: 'Beach break clásico de Lurín. Conocido por sus tubos de arena cuando las condiciones se alinean. Ola rápida y orillera.',
        waveType: 'Beach break potente. Rompe muy cerca de la orilla (el "shorebreak" es famoso).',
        level: 'Avanzado',
        entryTips: ['Cuidado con el shorebreak al entrar y salir', 'Rema rápido', 'Mejor temprano por el viento'],
        bestTime: 'Verano (Nortes)',
        hazards: ['Shorebreak rompehuesos', 'Resaca fuerte'],
        conditions: {
            waveHeight: '1.0 - 2.0m',
            wavePeriod: '14s',
            windSpeed: '10 km/h',
            windDirection: 'SW',
            tide: 'high',
            tideTime: 'Subiendo',
            waterTemp: '19°C',
            rating: 4,
            lastUpdated: 'Hace 30 min'
        }
    },
    {
        name: 'Arica',
        slug: 'arica',
        image: 'https://images.unsplash.com/photo-1415931633537-351070d20b81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Bodyboard spot',
        description: 'Playa clásica de Lurín con olas orilleras muy potentes. Favorita de los bodyboarders por sus rampas y tubos.',
        waveType: 'Beach break intenso. Olas huecas y rápidas.',
        level: 'Intermedio',
        entryTips: ['Usa aletas si vas en bodyboard', 'Cuidado con el fondo en marea baja', 'Corriente fuerte'],
        bestTime: 'Todo el año',
        hazards: ['Corrientes de retorno', 'Revolcones fuertes'],
        conditions: {
            waveHeight: '1.0 - 1.5m',
            wavePeriod: '13s',
            windSpeed: '11 km/h',
            windDirection: 'SW',
            tide: 'mid',
            tideTime: 'Bajando',
            waterTemp: '18°C',
            rating: 4,
            lastUpdated: 'Hace 20 min'
        }
    },
    {
        name: 'Cerro Azul',
        slug: 'cerro-azul',
        image: 'https://images.unsplash.com/photo-1416331108676-a22edb5be43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        count: 'Clásico del Sur',
        description: 'Famoso wave magnet al sur de Lima. Su icónico muelle y su izquierda perfecta lo hacen un destino obligado en verano.',
        waveType: 'Point break izquierdo de arena y piedras. Ola muy larga y noble que rompe junto al muelle.',
        level: 'Todos los niveles',
        entryTips: ['Salta desde el muelle (expertos)', 'Entra por la playa remojando', 'Cuidado con los pilotes'],
        bestTime: 'Verano',
        hazards: ['Corrientes junto al muelle', 'Multitudes en feriados'],
        conditions: {
            waveHeight: '1.0 - 1.5m',
            wavePeriod: '13s',
            windSpeed: '11 km/h',
            windDirection: 'S',
            tide: 'low',
            tideTime: 'Bajando',
            waterTemp: '19°C',
            rating: 5,
            lastUpdated: 'Hace 50 min'
        }
    }
];

async function main() {
    console.log('Seeding beaches...');

    for (const beach of DESTINATIONS) {
        const beachData = {
            name: beach.name,
            slug: beach.slug,
            image: beach.image,
            count: beach.count,
            description: beach.description,
            waveType: beach.waveType,
            level: beach.level,
            entryTips: beach.entryTips,
            bestTime: beach.bestTime,
            hazards: beach.hazards,
            conditions: beach.conditions
        };

        const existingBeach = await prisma.beach.findUnique({
            where: { name: beach.name },
        });

        if (existingBeach) {
            // Update existing beach to ensure latest content logic
            await prisma.beach.update({
                where: { id: existingBeach.id },
                data: beachData,
            });
            console.log(`Updated beach: ${beach.name}`);
        } else {
            // Create new beach
            await prisma.beach.create({
                data: beachData,
            });
            console.log(`Created beach: ${beach.name}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
