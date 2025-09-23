import { NextResponse } from 'next/server'

export async function GET() {
  // Payments API will be implemented in later tasks
  return NextResponse.json({ message: 'Payments API endpoint' })
}

export async function POST() {
  // Create payment API will be implemented in later tasks
  return NextResponse.json({ message: 'Create payment API endpoint' })
}