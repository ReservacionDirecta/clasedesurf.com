import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  try {
    const path = '/discount-codes/validate';
    const backendUrl = `${backendBaseUrl}${path}`;

    // Parse body to validate it
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid request body', error: 'Body must be valid JSON' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { message: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.amount === undefined || typeof body.amount !== 'number') {
      return NextResponse.json(
        { message: 'Amount is required and must be a number' },
        { status: 400 }
      );
    }

    // Validate classId if provided (must be a positive integer)
    if (body.classId !== undefined) {
      const classIdNum = typeof body.classId === 'string' ? parseInt(body.classId, 10) : body.classId;
      if (isNaN(classIdNum) || classIdNum < 1 || !Number.isInteger(classIdNum)) {
        return NextResponse.json(
          { message: 'Class ID must be a positive integer' },
          { status: 400 }
        );
      }
      body.classId = classIdNum;
    }

    console.log('[Discount Validate] Validating code:', body.code, 'for amount:', body.amount, 'classId:', body.classId);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Discount Validate] Backend error:', data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Discount Validate] Error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}




