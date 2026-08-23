import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function computeNextDue(dueDate: number, frequency: string): Date {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), dueDate);
  if (next < now) {
    next.setMonth(next.getMonth() + (frequency === 'yearly' ? 12 : 1));
  }
  return next;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: { nextDue: 'asc' },
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, amount, dueDate, frequency } = await req.json();

    if (!userId || !name || !amount || !dueDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const billFrequency = frequency || 'monthly';
    const bill = await prisma.bill.create({
      data: {
        userId,
        name,
        amount: parseFloat(amount),
        dueDate: parseInt(dueDate, 10),
        frequency: billFrequency,
        nextDue: computeNextDue(parseInt(dueDate, 10), billFrequency),
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
