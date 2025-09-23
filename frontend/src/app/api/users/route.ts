import { NextResponse } from 'next/server'

export async function GET() {
  // Users API will be implemented in later tasks
  return NextResponse.json({ message: 'Users API endpoint' })
}

export async function PUT() {
  // Update user API will be implemented in later tasks
  return NextResponse.json({ message: 'Update user API endpoint' })
}