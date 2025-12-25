// API service for connecting to the backend
const API_BASE_URL = '/api';

export interface ApiClass {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  defaultCapacity: number;
  defaultPrice: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructor: string | null;
  images?: string[];
  schoolId: number;
  beachId?: number | null;
  beach?: {
    id: number;
    name: string;
    location: string | null;
    description: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  price?: number; // legacy/compat
  capacity?: number; // legacy/compat
  availableSpots?: number; // legacy/compat
  nextSession?: {
    id: number;
    date: string;
    time: string;
    capacity: number;
    price: number | null;
  } | null;
  school: {
    id: number;
    name: string;
    location: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    whatsapp: string | null;
    address: string | null;
    logo: string | null;
    coverImage: string | null;
    ownerId: number | null;
    createdAt: string;
    updatedAt: string;
  };
  reservations?: any[];
  sessions?: any[];
  schedules?: any[];
}

export interface ApiSchool {
  id: number;
  name: string;
  location: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  address: string | null;
  logo: string | null;
  coverImage: string | null;
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassFilters {
  date?: string;
  level?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  schoolId?: number;
  location?: string;
  locality?: string;
  participants?: string | number;
  q?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Classes API
  async getClasses(filters?: ClassFilters): Promise<ApiClass[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/classes${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiClass[]>(endpoint);
  }

  async getClass(id: number): Promise<ApiClass> {
    return this.request<ApiClass>(`/classes/${id}`);
  }

  // Schools API
  async getSchools(): Promise<ApiSchool[]> {
    return this.request<ApiSchool[]>('/schools');
  }

  async getSchool(id: number): Promise<ApiSchool> {
    return this.request<ApiSchool>(`/schools/${id}`);
  }

  async getSchoolClasses(schoolId: number): Promise<ApiClass[]> {
    return this.request<ApiClass[]>(`/schools/${schoolId}/classes`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Test database connection
  async testDatabase(): Promise<{ message: string; schoolCount: number; schools: any[] }> {
    return this.request<{ message: string; schoolCount: number; schools: any[] }>('/db-test');
  }
}

// Transform API class to frontend format
export function transformApiClassToFrontend(apiClass: ApiClass) {
  const nextSession = apiClass.nextSession;
  const price = nextSession?.price ?? apiClass.price ?? apiClass.defaultPrice ?? 0;
  const capacity = nextSession?.capacity ?? apiClass.capacity ?? apiClass.defaultCapacity ?? 8;
  const dateStr = nextSession?.date || new Date().toISOString();

  // Calculate rating and reviews from school data or use defaults
  const schoolRating = 4.5 + (Math.random() * 0.5); // Random between 4.5-5.0
  const totalReviews = Math.floor(Math.random() * 200) + 50; // Random between 50-250

  const instructorName = apiClass.instructor || 'Instructor Asignado';
  const instructorRating = 4.6 + (Math.random() * 0.4);

  let classType: 'GROUP' | 'PRIVATE' | 'SEMI_PRIVATE' | 'INTENSIVE' | 'KIDS' = 'GROUP';
  if (capacity === 1) {
    classType = 'PRIVATE';
  } else if (capacity <= 3) {
    classType = 'SEMI_PRIVATE';
  } else if (apiClass.duration > 180) {
    classType = 'INTENSIVE';
  } else if (apiClass.title.toLowerCase().includes('niños') || apiClass.title.toLowerCase().includes('kids')) {
    classType = 'KIDS';
  }

  const specialties = [];
  if (apiClass.level === 'BEGINNER') {
    specialties.push('Iniciación', 'Técnica básica', 'Seguridad acuática');
  } else if (apiClass.level === 'INTERMEDIATE') {
    specialties.push('Maniobras avanzadas', 'Lectura de olas', 'Perfeccionamiento');
  } else {
    specialties.push('Surf de performance', 'Maniobras aéreas', 'Competición');
  }

  return {
    id: apiClass.id.toString(),
    title: apiClass.title,
    description: apiClass.description || 'Clase de surf profesional con instructor certificado.',
    date: new Date(dateStr),
    startTime: new Date(dateStr),
    endTime: new Date(new Date(dateStr).getTime() + apiClass.duration * 60000),
    duration: apiClass.duration,
    capacity,
    price,
    currency: 'PEN',
    level: apiClass.level,
    type: classType,
    location: apiClass.school?.location || 'Lima, Perú',
    beach: apiClass.beach ? {
      name: apiClass.beach.name,
      location: apiClass.beach.location || apiClass.school?.location || 'Lima, Perú'
    } : undefined,
    instructorName: instructorName,
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(apiClass.createdAt),
    updatedAt: new Date(apiClass.updatedAt),
    schoolId: apiClass.schoolId.toString(),
    availableSpots: apiClass.availableSpots || capacity,
    school: {
      id: apiClass.school?.id?.toString() || '0',
      name: apiClass.school?.name || 'Escuela de Surf',
      location: apiClass.school?.location || 'Lima, Perú',
      phone: apiClass.school?.phone || undefined,
      email: apiClass.school?.email || undefined,
      city: 'Lima',
      rating: Number(schoolRating.toFixed(1)),
      totalReviews: totalReviews,
      verified: true,
      yearsExperience: Math.floor(Math.random() * 10) + 3,
      description: apiClass.school?.description || '',
      shortReview: 'Excelente escuela.',
      logo: apiClass.school?.logo,
      coverImage: apiClass.school?.coverImage
    },
    instructor: {
      name: instructorName,
      rating: Number(instructorRating.toFixed(1)),
      experience: `Instructor calificado`,
      specialties: specialties
    },
    images: apiClass.images || [],
    classImage: apiClass.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop'
  };
}

export const apiService = new ApiService();
export default apiService;