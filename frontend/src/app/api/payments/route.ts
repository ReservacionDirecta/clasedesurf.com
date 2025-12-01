import { NextResponse } from 'next/server';

// Use same logic as next.config.js - force localhost:4000 in development
const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = new URL(req.url, baseUrl);
    const searchParams = url.search;
    const backendUrl = `${BACKEND}/payments${searchParams}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Payments proxy error:', error);
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
    console.log('[Payments API] Creating payment:', { 
      reservationId: body.reservationId, 
      amount: body.amount, 
      paymentMethod: body.paymentMethod,
      status: body.status,
      hasVoucherImage: !!body.voucherImage
    });
    
    const response = await fetch(`${BACKEND}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('[Payments API] Backend response status:', response.status);
    console.log('[Payments API] Backend response:', responseText.substring(0, 200));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Backend error' };
      }
      console.error('[Payments API] Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[Payments API] Error creating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Internal server error', error: errorMessage }, 
      { status: 500 }
    );
  }
}