import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Este endpoint es público - no requiere autenticación
    // Las clases de una escuela deben ser visibles para todos
    const session = await getServerSession(authOptions);
    const token = session ? (session as any).backendToken : null;
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    // Si hay sesión, incluir el token (opcional)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call backend to get school classes (el backend ya permite acceso público)
    const response = await fetch(`${BACKEND}/schools/${id}/classes`, {
      method: 'GET',
      headers
    });

    const data = await response.text();
    
    return new NextResponse(data, { 
      status: response.status, 
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching school classes:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}