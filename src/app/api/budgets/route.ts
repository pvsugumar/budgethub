import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // TODO: Add authentication check
    const userId = 'user-id'; // Should come from session

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication check
    const userId = 'user-id'; // Should come from session
    const { category, limit, month, year } = await req.json();

    if (!category || !limit) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const budgetMonth = month || currentDate.getMonth() + 1;
    const budgetYear = year || currentDate.getFullYear();

    const budget = await prisma.budget.create({
      data: {
        userId,
        category,
        limit: parseFloat(limit),
        month: budgetMonth,
        year: budgetYear,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
