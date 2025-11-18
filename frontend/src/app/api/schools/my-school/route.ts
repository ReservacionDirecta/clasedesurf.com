import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' as const;

// Use same logic as next.config.js - force localhost:4000 in development
const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');

export async function GET(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Debug logging
    console.log('[API Route] Backend URL:', BACKEND);
    console.log('[API Route] Has auth header:', !!authHeader);

    // Call backend to get user's school
    const backendUrl = `${BACKEND}/schools/my-school`;
    console.log('[API Route] Calling backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store' // Prevent caching to always get fresh data
    });
    
    console.log('[API Route] Backend response status:', response.status);

    const data = await response.text();
    
    // If error, try to parse and return better error message
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(data);
      } catch {
        errorData = { message: data || 'Unknown error' };
      }
      
      console.error('[API Route] Backend error:', errorData);
      
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    return new NextResponse(data, { 
      status: response.status, 
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching user school:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}