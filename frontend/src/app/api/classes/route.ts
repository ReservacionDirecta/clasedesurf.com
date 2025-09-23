import { NextResponse } from 'next/server'

export async function GET() {
  // Classes API will be implemented in later tasks
  return NextResponse.json({ message: 'Classes API endpoint' })
}

export async function POST() {
  // Create class API will be implemented in later tasks
  return NextResponse.json({ message: 'Create class API endpoint' })
}