import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

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