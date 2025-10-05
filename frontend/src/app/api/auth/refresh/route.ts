import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function proxy(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api', '');
  const backendUrl = `${BACKEND}${path}`; // /api/auth/refresh -> /auth/refresh

  const res = await fetch(backendUrl, {
    method: req.method,
    headers: Object.fromEntries(req.headers),
    // body not needed for refresh
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: Object.fromEntries(res.headers) });
}

export async function POST(req: Request) {
  return proxy(req);
}
