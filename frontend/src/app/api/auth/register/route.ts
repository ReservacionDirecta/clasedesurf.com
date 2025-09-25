import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.text();
    if (backendRes.status >= 400) {
      // server-side log to help debugging in dev
      try {
        console.error('[proxy] /api/auth/register backend error', backendRes.status, data);
      } catch (e) {
        console.error('[proxy] /api/auth/register backend error', backendRes.status);
      }
    }
    // Try to parse JSON, otherwise return text
    try {
      const json = JSON.parse(data);
      return NextResponse.json(json, { status: backendRes.status });
    } catch (_e) {
      return new NextResponse(data, { status: backendRes.status });
    }
  } catch (error) {
    console.error('Proxy registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
