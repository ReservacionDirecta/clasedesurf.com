/**
 * School Context Helper
 * 
 * Provides utilities to work with school context in the frontend.
 * The backend automatically filters data by schoolId based on the JWT token.
 */

export interface SchoolContext {
  id: number;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
}

/**
 * Fetch the current user's school (for SCHOOL_ADMIN role)
 * The backend uses the JWT token to identify the school
 */
export const fetchMySchool = async (token: string): Promise<SchoolContext | null> => {
  try {
    const response = await fetch('/api/schools/my-school', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch school:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching school:', error);
    return null;
  }
};

/**
 * Check if the current user has access to school admin features
 */
export const isSchoolAdmin = (role?: string): boolean => {
  return role === 'SCHOOL_ADMIN';
};

/**
 * Check if the current user is a global admin
 */
export const isGlobalAdmin = (role?: string): boolean => {
  return role === 'ADMIN';
};

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Note: The frontend does NOT need to manually filter data by schoolId.
 * The backend automatically scopes all queries based on the JWT token:
 * 
 * - SCHOOL_ADMIN: Only sees data from their school
 * - ADMIN: Sees all data
 * - STUDENT: Only sees their own data
 * 
 * This is enforced by the backend middleware (resolve-school.ts) and
 * route handlers that check req.schoolId.
 */
