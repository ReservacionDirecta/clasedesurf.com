import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[GET /api/notes] Session exists:', !!session);
    console.log('[GET /api/notes] Session user:', session?.user);
    
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    console.log('[GET /api/notes] Token exists:', !!token);
    console.log('[GET /api/notes] Token length:', token?.length);
    
    if (!token) {
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const url = date 
      ? `${BACKEND_URL}/notes?date=${date}`
      : `${BACKEND_URL}/notes`;

    console.log('[GET /api/notes] Fetching from:', url);
    console.log('[GET /api/notes] Backend URL:', BACKEND_URL);
    console.log('[GET /api/notes] Headers:', headers);

    const response = await fetch(url, { 
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error desconocido' };
      }
      console.error('[GET /api/notes] Backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[GET /api/notes] Error completo:', error);
    console.error('[GET /api/notes] Error message:', error?.message);
    return NextResponse.json(
      { 
        message: 'Error al obtener las notas',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[POST /api/notes] Session exists:', !!session);
    console.log('[POST /api/notes] Session user:', session?.user);
    
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    console.log('[POST /api/notes] Token exists:', !!token);
    console.log('[POST /api/notes] Token length:', token?.length);
    
    if (!token) {
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }

    const body = await req.json();

    console.log('[POST /api/notes] Request body:', body);
    console.log('[POST /api/notes] Backend URL:', BACKEND_URL);
    console.log('[POST /api/notes] Full URL:', `${BACKEND_URL}/notes`);

    const response = await fetch(`${BACKEND_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    console.log('[POST /api/notes] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error desconocido' };
      }
      console.error('[POST /api/notes] Backend error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[POST /api/notes] Success:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/notes] Error completo:', error);
    console.error('[POST /api/notes] Error message:', error?.message);
    console.error('[POST /api/notes] Error stack:', error?.stack);
    return NextResponse.json(
      { 
        message: 'Error al crear la nota',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

