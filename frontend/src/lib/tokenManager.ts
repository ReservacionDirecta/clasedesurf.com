// Token Manager - Handles automatic token refresh
import { getSession } from 'next-auth/react';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newToken = data.token;

    isRefreshing = false;
    onTokenRefreshed(newToken);

    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    isRefreshing = false;
    onTokenRefreshed('');
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
  const session = await getSession();
  
  if (!session || !(session as any).backendToken) {
    return null;
  }

  const token = (session as any).backendToken;
  
  // Try to decode the token to check expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // If token expires in less than 5 minutes, refresh it
    if (expiresAt - now < 5 * 60 * 1000) {
      console.log('Token expiring soon, refreshing...');
      const newToken = await refreshAccessToken();
      return newToken || token;
    }
    
    return token;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return token;
  }
}
