import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '/api';

async function proxy(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api', ''); // /api/schools -> /schools
  const backendUrl = `${BACKEND}${path}`;

  const res = await fetch(backendUrl, {
    method: req.method,
    headers: Object.fromEntries(req.headers),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: Object.fromEntries(res.headers) });
}

export async function GET(req: Request) {
  return proxy(req);
}

export async function POST(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Get form data (includes file upload)
    const formData = await req.formData();
    
    // Forward the form data to backend
    const response = await fetch(`${BACKEND}/schools`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.text();
    
    return new NextResponse(data, { 
      status: response.status, 
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return proxy(req);
}

export async function DELETE(req: Request) {
  return proxy(req);
}
