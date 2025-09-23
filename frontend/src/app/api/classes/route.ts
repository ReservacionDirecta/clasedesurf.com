import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ClassLevel } from '@/types';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      date,
      duration,
      capacity,
      price,
      level,
      schoolId,
    } = await req.json();

    if (!title || !date || !duration || !capacity || !price || !level || !schoolId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const classDate = new Date(date);

    if (classDate < new Date()) {
      return NextResponse.json({ message: 'Class date cannot be in the past' }, { status: 400 });
    }

    if (capacity <= 0) {
      return NextResponse.json({ message: 'Class capacity must be greater than zero' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        date: classDate,
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        price: parseFloat(price),
        level: level as ClassLevel,
        school: {
          connect: { id: parseInt(schoolId) },
        },
      },
    });

    return NextResponse.json({ message: 'Class created successfully', class: newClass }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Implement GET /api/classes to list all classes (Task 3.3)
  try {
    const classes = await prisma.class.findMany({
      include: { school: true },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
