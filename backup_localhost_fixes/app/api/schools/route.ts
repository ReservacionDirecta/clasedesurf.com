import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

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
  return proxy(req);
}

export async function PUT(req: Request) {
  return proxy(req);
}

export async function DELETE(req: Request) {
  return proxy(req);
}
