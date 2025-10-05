import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Frontend API test working',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    nodeEnv: process.env.NODE_ENV
  });
}