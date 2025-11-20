import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const token = (session as any).backendToken;
    if (!token) {
      return NextResponse.json({ message: 'Token no disponible. Por favor, inicia sesión nuevamente.' }, { status: 401 });
    }
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Call backend to get school classes
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