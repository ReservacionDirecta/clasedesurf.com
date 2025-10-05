// Utility for making API calls through proxy routes
import { getSession } from 'next-auth/react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  // Get session for authentication
  const session = await getSession();
  const token = (session as any)?.backendToken;
  
  // Set default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge headers
  const finalHeaders = { ...defaultHeaders, ...headers };
  
  // Make the API call through proxy routes
  const response = await fetch(`/api${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

// Convenience methods
export const api = {
  get: (endpoint: string, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'GET', headers }),
    
  post: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'POST', body, headers }),
    
  put: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'PUT', body, headers }),
    
  delete: (endpoint: string, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'DELETE', headers }),
};