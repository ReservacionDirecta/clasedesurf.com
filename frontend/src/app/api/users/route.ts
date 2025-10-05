import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '/api';

async function proxy(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api', '');
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

export async function PUT(req: Request) {
  return proxy(req);
}