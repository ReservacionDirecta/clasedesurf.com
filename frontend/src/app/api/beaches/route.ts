import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' as const;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    console.log('🏖️ GET /api/beaches called');
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log('🏖️ Fetching from backend:', `${BACKEND}/beaches`);
    const response = await fetch(`${BACKEND}/beaches`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    console.log('🏖️ Backend response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Backend beaches error:', errorData);
      // Si la tabla no existe, devolver array vacío en lugar de error
      if (response.status === 500 && (errorData.error?.includes('does not exist') || errorData.code === 'P2021')) {
        return NextResponse.json([]);
      }
      // Si es 404, también devolver array vacío (tabla no existe)
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    console.log('🏖️ Beaches data received:', data.length, 'beaches');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Beaches proxy error:', error);
    // En caso de error de conexión, devolver array vacío
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();
    
    const response = await fetch(`${BACKEND}/beaches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error creating beach:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

