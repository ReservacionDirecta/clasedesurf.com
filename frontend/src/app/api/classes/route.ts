import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    console.log('Classes proxy GET called');
    console.log('BACKEND URL:', BACKEND);
    
    const url = new URL(req.url);
    const searchParams = url.search;
    const backendUrl = `${BACKEND}/classes${searchParams}`;
    console.log('Fetching from:', backendUrl);
    
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
      { message: 'Proxy error', error: errorMessage }, 
      { status: 500 }
    );
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
    
    const response = await fetch(`${BACKEND}/classes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}