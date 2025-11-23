import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[PUT /api/notes/:id] Session exists:', !!session);
    
    if (!session) {
      console.error('[PUT /api/notes/:id] No session found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    console.log('[PUT /api/notes/:id] Token exists:', !!token);
    
    if (!token) {
      console.error('[PUT /api/notes/:id] No backend token in session');
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }

    const body = await req.json();
    const noteId = params.id;
    console.log('[PUT /api/notes/:id] Updating note:', noteId);
    console.log('[PUT /api/notes/:id] Request body:', body);

    const response = await fetch(`${BACKEND_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log('[PUT /api/notes/:id] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error desconocido' };
      }
      console.error('[PUT /api/notes/:id] Backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[PUT /api/notes/:id] Success:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[PUT /api/notes/:id] Error completo:', error);
    console.error('[PUT /api/notes/:id] Error message:', error?.message);
    return NextResponse.json(
      { 
        message: 'Error al actualizar la nota',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[DELETE /api/notes/:id] Session exists:', !!session);
    
    if (!session) {
      console.error('[DELETE /api/notes/:id] No session found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    console.log('[DELETE /api/notes/:id] Token exists:', !!token);
    
    if (!token) {
      console.error('[DELETE /api/notes/:id] No backend token in session');
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }

    const noteId = params.id;
    console.log('[DELETE /api/notes/:id] Deleting note:', noteId);
    console.log('[DELETE /api/notes/:id] Backend URL:', `${BACKEND_URL}/notes/${noteId}`);

    const response = await fetch(`${BACKEND_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[DELETE /api/notes/:id] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error desconocido' };
      }
      console.error('[DELETE /api/notes/:id] Backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[DELETE /api/notes/:id] Success:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[DELETE /api/notes/:id] Error completo:', error);
    console.error('[DELETE /api/notes/:id] Error message:', error?.message);
    return NextResponse.json(
      { 
        message: 'Error al eliminar la nota',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

