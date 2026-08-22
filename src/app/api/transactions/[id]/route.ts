import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
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
    const { amount, type, category, description, date } = await req.json();

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        type,
        category,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
