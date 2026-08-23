import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, amount, dueDate, frequency, paid } = await req.json();

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: {
        name,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        dueDate: dueDate !== undefined ? parseInt(dueDate, 10) : undefined,
        frequency,
        paid,
      },
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.bill.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Bill deleted' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
