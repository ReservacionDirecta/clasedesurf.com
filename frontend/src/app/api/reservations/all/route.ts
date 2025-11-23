import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('[GET /api/reservations/all] No session found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    if (!token) {
      console.error('[GET /api/reservations/all] No backend token in session');
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }

    // Verificar que el usuario tenga rol ADMIN
    const userRole = (session as any).user?.role;
    if (userRole !== 'ADMIN') {
      console.error('[GET /api/reservations/all] User does not have ADMIN role. Current role:', userRole);
      return NextResponse.json({ message: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const backendUrl = `${BACKEND}/reservations/all`;
    console.log('[GET /api/reservations/all] Calling backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      console.error('[GET /api/reservations/all] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    console.log('[GET /api/reservations/all] Success, returning', Array.isArray(data) ? `${data.length} reservations` : 'data');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[GET /api/reservations/all] Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Proxy error', error: errorMessage }, 
      { status: 500 }
    );
  }
}

