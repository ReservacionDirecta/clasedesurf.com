import { NextResponse } from 'next/server'

// NextAuth.js configuration will be implemented in later tasks
export async function GET() {
  return NextResponse.json({ message: 'Auth GET endpoint' })
}

export async function POST() {
  return NextResponse.json({ message: 'Auth POST endpoint' })
}