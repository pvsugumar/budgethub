export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  paid: boolean;
  nextDue: Date;
  createdAt: Date;
  updatedAt: Date;
}
