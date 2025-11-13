// API service for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface ApiClass {
  id: number;
  title: string;
  description: string | null;
  date: string;
  duration: number;
  capacity: number;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructor: string | null;
  images?: string[];  // Array de URLs de imágenes
  schoolId: number;
  createdAt: string;
  updatedAt: string;
  availableSpots: number;
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
  reservations: Array<{
    id: number;
    userId: number;
    classId: number;
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELED' | 'COMPLETED';
    specialRequest: string | null;
    createdAt: string;
    updatedAt: string;
    payment?: {
      id: number;
      amount: number;
      status: 'UNPAID' | 'PAID' | 'REFUNDED';
      paymentMethod: string | null;
      transactionId: string | null;
      paidAt: string | null;
    };
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  paymentInfo?: {
    totalReservations: number;
    paidReservations: number;
    totalRevenue: number;
    occupancyRate: number;
  };
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
  // Calculate rating and reviews from school data or use defaults
  const schoolRating = 4.5 + (Math.random() * 0.5); // Random between 4.5-5.0
  const totalReviews = Math.floor(Math.random() * 200) + 50; // Random between 50-250
  
  // Generate instructor info
  const instructorName = apiClass.instructor || 'Instructor Asignado';
  const instructorRating = 4.6 + (Math.random() * 0.4); // Random between 4.6-5.0
  
  // Map class type based on capacity and other factors
  let classType: 'GROUP' | 'PRIVATE' | 'SEMI_PRIVATE' | 'INTENSIVE' | 'KIDS' = 'GROUP';
  if (apiClass.capacity === 1) {
    classType = 'PRIVATE';
  } else if (apiClass.capacity <= 3) {
    classType = 'SEMI_PRIVATE';
  } else if (apiClass.duration > 180) {
    classType = 'INTENSIVE';
  } else if (apiClass.title.toLowerCase().includes('niños') || apiClass.title.toLowerCase().includes('kids')) {
    classType = 'KIDS';
  }

  // Generate specialties based on level and type
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
    date: new Date(apiClass.date),
    startTime: new Date(apiClass.date),
    endTime: new Date(new Date(apiClass.date).getTime() + apiClass.duration * 60000),
    duration: apiClass.duration,
    capacity: apiClass.capacity,
    price: apiClass.price,
    currency: 'USD',
    level: apiClass.level,
    type: classType,
    location: apiClass.school.location || 'Lima, Perú',
    instructorName: instructorName,
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(apiClass.createdAt),
    updatedAt: new Date(apiClass.updatedAt),
    schoolId: apiClass.schoolId.toString(),
    availableSpots: apiClass.availableSpots,
    school: {
      id: apiClass.school.id.toString(),
      name: apiClass.school.name,
      location: apiClass.school.location || 'Lima, Perú',
      phone: apiClass.school.phone || undefined,
      email: apiClass.school.email || undefined,
      city: 'Lima',
      rating: Number(schoolRating.toFixed(1)),
      totalReviews: totalReviews,
      verified: true,
      yearsExperience: Math.floor(Math.random() * 10) + 3, // Random between 3-13 years
      description: apiClass.school.description || `Escuela de surf profesional especializada en ${apiClass.level.toLowerCase()} con instructores certificados.`,
      shortReview: 'Excelente escuela con instructores muy profesionales y metodología probada.'
    },
    instructor: {
      name: instructorName,
      rating: Number(instructorRating.toFixed(1)),
      experience: `${Math.floor(Math.random() * 8) + 3} años de experiencia, Instructor certificado`,
      specialties: specialties
    },
    images: apiClass.images || [],
    classImage: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
  };
}

export const apiService = new ApiService();
export default apiService;