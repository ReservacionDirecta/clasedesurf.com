import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    console.log('Instructors proxy GET called');
    console.log('BACKEND URL:', BACKEND);
    
    const url = new URL(req.url);
    const searchParams = url.search;
    const backendUrl = `${BACKEND}/instructors${searchParams}`;
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
    console.log('Backend data received:', data.length, 'instructors');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Instructors proxy error:', error);
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
    
    const response = await fetch(`${BACKEND}/instructors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
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
    
    const response = await fetch(`${BACKEND}/instructors`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error updating instructor:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${BACKEND}/instructors`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}