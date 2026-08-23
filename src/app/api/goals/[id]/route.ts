import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, targetAmount, currentAmount, targetDate, category } = await req.json();

    const goal = await prisma.savingsGoal.update({
      where: { id: params.id },
      data: {
        name,
        targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        category,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.savingsGoal.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
