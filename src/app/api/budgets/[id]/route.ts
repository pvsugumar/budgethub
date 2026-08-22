import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!budget) {
      return NextResponse.json(
        { message: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { category, limit, spent, month, year } = await req.json();

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        category,
        limit: limit ? parseFloat(limit) : undefined,
        spent: spent ? parseFloat(spent) : undefined,
        month,
        year,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.budget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
