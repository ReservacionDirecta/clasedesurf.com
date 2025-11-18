import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/schools/${params.id}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    
    console.log('[API Route] Updating school:', params.id, 'with data:', JSON.stringify(body, null, 2));
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/schools/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('[API Route] Backend response status:', response.status);
    console.log('[API Route] Backend response body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Backend error' };
      }
      console.error('[API Route] Backend error updating school:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: 'Invalid JSON response' };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Error updating school:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Internal server error',
        error: error instanceof Error ? error.stack : String(error)
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${BACKEND}/schools/${params.id}`, {
      method: 'DELETE',
      headers
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
