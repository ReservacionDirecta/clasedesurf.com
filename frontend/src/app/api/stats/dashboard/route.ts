import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('Stats dashboard proxy GET called');
    console.log('🔑 Authorization header presente:', !!authHeader);

    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendUrl = `${BACKEND}/stats/dashboard`;
    console.log('Fetching from:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend stats data received:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Stats proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Proxy error', error: errorMessage },
      { status: 500 }
    );
  }
}
