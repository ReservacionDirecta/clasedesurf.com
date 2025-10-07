// Custom hook for API calls with automatic token refresh
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  showLoading?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApiCall<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const makeRequest = useCallback(async (
    endpoint: string, 
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { method = 'GET', body, showLoading = true } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const token = (session as any)?.backendToken;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
        credentials: 'include'
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, config);
      
      // Handle different response statuses
      if (response.status === 401) {
        console.log('Token invalid, redirecting to login');
        router.push('/login');
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        if (showLoading) setLoading(false);
        return { data: null as any, error: null, loading: false };
      }

      const data = await response.json();
      
      if (showLoading) setLoading(false);
      return { data, error: null, loading: false };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (showLoading) setLoading(false);
      return { data: null, error: errorMessage, loading: false };
    }
  }, [session, router]);

  return {
    makeRequest,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Specialized hooks for common operations
export function useCreateItem<T = any>() {
  const { makeRequest, loading, error } = useApiCall<T>();
  
  const create = useCallback(async (endpoint: string, data: any) => {
    return makeRequest(endpoint, { method: 'POST', body: data });
  }, [makeRequest]);
  
  return { create, loading, error };
}

export function useUpdateItem<T = any>() {
  const { makeRequest, loading, error } = useApiCall<T>();
  
  const update = useCallback(async (endpoint: string, data: any) => {
    return makeRequest(endpoint, { method: 'PUT', body: data });
  }, [makeRequest]);
  
  return { update, loading, error };
}

export function useDeleteItem() {
  const { makeRequest, loading, error } = useApiCall();
  
  const deleteItem = useCallback(async (endpoint: string) => {
    return makeRequest(endpoint, { method: 'DELETE' });
  }, [makeRequest]);
  
  return { deleteItem, loading, error };
}

export function useFetchData<T = any>() {
  const { makeRequest, loading, error } = useApiCall<T>();
  
  const fetchData = useCallback(async (endpoint: string) => {
    return makeRequest(endpoint, { method: 'GET' });
  }, [makeRequest]);
  
  return { fetchData, loading, error };
}
