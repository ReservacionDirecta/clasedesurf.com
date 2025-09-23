import { NextResponse } from 'next/server'

export async function GET() {
  // Reservations API will be implemented in later tasks
  return NextResponse.json({ message: 'Reservations API endpoint' })
}

export async function POST() {
  // Create reservation API will be implemented in later tasks
  return NextResponse.json({ message: 'Create reservation API endpoint' })
}