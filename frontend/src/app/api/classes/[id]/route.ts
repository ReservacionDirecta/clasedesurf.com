import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND}/classes/${params.id}`, {
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
    console.error('Class proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Proxy error', error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();
    
    const response = await fetch(`${BACKEND}/classes/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      console.error('[DELETE /api/classes/:id] No authorization header');
      return NextResponse.json(
        { message: 'No autorizado. Por favor, inicia sesión nuevamente.' }, 
        { status: 401 }
      );
    }
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };

    const classId = params.id;
    console.log('[DELETE /api/classes/:id] Deleting class:', classId);
    console.log('[DELETE /api/classes/:id] Backend URL:', `${BACKEND}/classes/${classId}`);

    const response = await fetch(`${BACKEND}/classes/${classId}`, {
      method: 'DELETE',
      headers
    });

    console.log('[DELETE /api/classes/:id] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Error desconocido del servidor' };
      }
      console.error('[DELETE /api/classes/:id] Backend error:', errorData);
      console.error('[DELETE /api/classes/:id] Error status:', response.status);
      console.error('[DELETE /api/classes/:id] Error text:', errorText);
      
      // Preserve the error message from backend, especially for 400 errors
      return NextResponse.json(
        { 
          message: errorData.message || 'Error al eliminar la clase',
          reservationsCount: errorData.reservationsCount,
          ...errorData
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[DELETE /api/classes/:id] Success:', data);
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    console.error('[DELETE /api/classes/:id] Error completo:', error);
    console.error('[DELETE /api/classes/:id] Error message:', error?.message);
    return NextResponse.json(
      { 
        message: 'Error al eliminar la clase',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, 
      { status: 500 }
    );
  }
}