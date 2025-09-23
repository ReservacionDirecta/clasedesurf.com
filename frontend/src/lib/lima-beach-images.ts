// Imágenes específicas de surf en playas de Lima, Perú
export const limaBeachImages = {
  // Playas específicas de Lima con imágenes reales de surf
  beaches: {
    'Miraflores': {
      surf: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surfista en ola
      general: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    'San Bartolo': {
      surf: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surfista profesional
      general: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    'Chorrillos': {
      surf: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surf en tubo
      general: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    'Callao': {
      surf: 'https://visitamiraflores.com/wp-content/uploads/2024/01/Playa-La-Pampilla.jpg', // Surf aéreo
      general: 'https://visitamiraflores.com/wp-content/uploads/2024/01/Playa-La-Pampilla.jpg'
    },
    'Punta Negra': {
      surf: 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Ola grande
      general: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    'Punta Hermosa': {
      surf: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surf al atardecer
      general: 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3'
    }
  },

  // Surf específico por nivel en Lima
  waterSports: {
    surf: {
      beginner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Principiante con tabla
      intermediate: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surfista en ola
      advanced: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surf en tubo
      expert: 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Ola grande
      kids: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surf al atardecer (familia)
      private: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surfista profesional
      intensive: 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3' // Ola grande
    }
  },

  // Tipos de clase específicos para surf en Lima
  classTypes: {
    'GROUP': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Principiante con tabla
    'PRIVATE': 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surfista profesional
    'KIDS': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Surf al atardecer
    'INTENSIVE': 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3', // Ola grande
    'SEMI_PRIVATE': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3' // Surfista en ola
  },

  // Imagen especial para Hero - clase grupal al atardecer
  hero: {
    groupSunset: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3' // Surf al atardecer
  }
}

// Función para obtener imagen específica de surf en playas de Lima
export function getBeachImage(location: string, activity: string = 'surf', level: string = 'beginner'): string {
  const beachName = location.split(',')[0].trim() // Extraer solo el nombre de la playa

  // Mapeo completo de ubicaciones de surf en Lima
  const locationMap: { [key: string]: string } = {
    'Playa Makaha': 'Miraflores',
    'Playa Waikiki': 'San Bartolo',
    'Playa La Herradura': 'Chorrillos',
    'Playa Redondo': 'Callao',
    'Punta Rocas': 'Punta Negra',
    'Playa Señoritas': 'Punta Hermosa',
    // Agregar más ubicaciones específicas de Lima
    'Costa Verde': 'Miraflores',
    'Barranco': 'Miraflores',
    'La Pampilla': 'Callao',
    'Agua Dulce': 'Chorrillos'
  }

  const mappedBeach = locationMap[beachName] || beachName

  // Siempre priorizar imágenes específicas de playas de Lima para surf
  if (limaBeachImages.beaches[mappedBeach as keyof typeof limaBeachImages.beaches]) {
    return limaBeachImages.beaches[mappedBeach as keyof typeof limaBeachImages.beaches].surf
  }

  // Fallback a imagen por nivel de surf específico de Lima
  const levelMap: { [key: string]: keyof typeof limaBeachImages.waterSports.surf } = {
    'BEGINNER': 'beginner',
    'INTERMEDIATE': 'intermediate',
    'ADVANCED': 'advanced',
    'EXPERT': 'expert'
  }

  const mappedLevel = levelMap[level] || 'beginner'
  return limaBeachImages.waterSports.surf[mappedLevel]
}

// Función para obtener imagen de surf por tipo de clase en Lima
export function getClassTypeImage(type: string): string {
  // Siempre devolver imágenes de surf específicas para cada tipo de clase
  return limaBeachImages.classTypes[type as keyof typeof limaBeachImages.classTypes] ||
    limaBeachImages.classTypes.GROUP
}

// Función adicional para obtener imagen de surf por nivel específico
export function getSurfImageByLevel(level: string): string {
  const levelMap: { [key: string]: keyof typeof limaBeachImages.waterSports.surf } = {
    'BEGINNER': 'beginner',
    'INTERMEDIATE': 'intermediate',
    'ADVANCED': 'advanced',
    'EXPERT': 'expert'
  }

  const mappedLevel = levelMap[level] || 'beginner'
  return limaBeachImages.waterSports.surf[mappedLevel]
}

// Función para obtener imagen del Hero
export function getHeroImage(): string {
  return limaBeachImages.hero.groupSunset
}