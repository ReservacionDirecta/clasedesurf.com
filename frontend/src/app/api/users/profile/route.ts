import { NextResponse } from 'next/server';

// Proxy the frontend profile API to the backend so the frontend doesn't access Prisma directly.
const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '/api';

async function proxy(req: Request) {
  // Build backend URL by stripping the /api prefix
  const url = new URL(req.url);
  const path = url.pathname.replace('/api', ''); // /api/users/profile -> /users/profile
  const backendUrl = `${BACKEND}${path}`;

  const res = await fetch(backendUrl, {
    method: req.method,
    headers: Object.fromEntries(req.headers),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined,
  });

  // Return backend response (preserve status and headers)
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: Object.fromEntries(res.headers) });
}

export async function GET(req: Request) {
  return proxy(req);
}

export async function PUT(req: Request) {
  return proxy(req);
}
