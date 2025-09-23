import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UpdateProfileData } from '@/types';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        age: true,
        weight: true,
        height: true,
        canSwim: true,
        injuries: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const { name, age, weight, height, canSwim, injuries, phone } = (await req.json()) as UpdateProfileData;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age,
        weight,
        height,
        canSwim,
        injuries,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        age: true,
        weight: true,
        height: true,
        canSwim: true,
        injuries: true,
        phone: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
