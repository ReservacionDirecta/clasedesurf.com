import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' as const;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    console.log('Classes proxy GET called');
    console.log('BACKEND URL:', BACKEND);
    
    const authHeader = req.headers.get('authorization');
    console.log('🔑 Authorization header presente:', !!authHeader);
    
    const url = new URL(req.url);
    const searchParams = url.search;
    const backendUrl = `${BACKEND}/classes${searchParams}`;
    console.log('Fetching from:', backendUrl);
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers
    });
    
    console.log('Backend response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Backend data received:', data.length, 'classes');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Classes proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('🔄 Proxy POST /api/classes iniciado');
    console.log('🎯 Backend URL:', BACKEND);
    
    const authHeader = req.headers.get('authorization');
    console.log('🔑 Authorization header presente:', !!authHeader);
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();
    console.log('📦 Body recibido del frontend:', JSON.stringify(body, null, 2));
    
    const backendUrl = `${BACKEND}/classes`;
    console.log('📡 Enviando a:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log('📥 Respuesta del backend:', response.status, response.statusText);

    const data = await response.json();
    console.log('📄 Data del backend:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Error en proxy:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();
    
    const response = await fetch(`${BACKEND}/classes`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}