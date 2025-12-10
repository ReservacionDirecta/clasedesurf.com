import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND}/schools/${params.id}/reviews`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching school reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

