import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' as const;

// Use same logic as next.config.js - force localhost:4000 in development
const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/payments/${params.id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    
    console.log('[Payments API] Updating payment:', { id: params.id, body: { ...body, voucherImage: body.voucherImage ? 'present' : 'missing' } });
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/payments/${params.id}`, {
      method: 'PUT',
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
    console.error('[Payments API] Error updating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: errorMessage 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/payments/${params.id}`, {
      method: 'DELETE',
      headers
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}