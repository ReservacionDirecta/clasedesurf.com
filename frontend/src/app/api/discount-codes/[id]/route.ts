import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function proxy(req: NextRequest, paramsPromise: Promise<{ id: string }>) {
  const params = await paramsPromise;
  try {
    const url = new URL(req.url);
    const path = `/discount-codes/${params.id}${url.search}`;
    const backendUrl = `${backendBaseUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const method = req.method;
    const body = method !== 'GET' && method !== 'HEAD' ? await req.text() : undefined;

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying discount-codes request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  return proxy(req, props.params);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  return proxy(req, props.params);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  return proxy(req, props.params);
}











