'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CATEGORIES, categoryIcon } from '@/lib/categories';
import { getMerchantInitials } from '@/lib/merchants';

interface Transaction {
  id: string;
  amount: string;
  type: string;
  category: string;
  description: string | null;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  limit: string;
  spent: string;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface Bill {
  id: string;
  name: string;
  dueDate: string;
  amount: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const [txnsRes, budgetsRes, accountsRes, billsRes] = await Promise.all([
          fetch(`/api/transactions?userId=${userId}`),
          fetch(`/api/budgets?userId=${userId}`),
          fetch(`/api/bank-accounts?userId=${userId}`),
          fetch(`/api/bills?userId=${userId}`),
        ]);
        setTransactions(txnsRes.ok ? await txnsRes.json() : []);
        setBudgets(budgetsRes.ok ? await budgetsRes.json() : []);
        setBankAccounts(accountsRes.ok ? await accountsRes.json() : []);
        setBills(billsRes.ok ? await billsRes.json() : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = thisMonthTxns
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = thisMonthTxns
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const lastMonthIncome = lastMonthTxns
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const lastMonthExpenses = lastMonthTxns
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const incomeChange = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseChange = lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  const recentTransactions = transactions.slice(0, 5);

  // Monthly trend data
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthTxns = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      income: monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expenses: monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    };
  });

  // Spending by category data
  const categorySpending = CATEGORIES.map((cat) => {
    const spent = thisMonthTxns
      .filter((t) => t.category === cat.name && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const budget = budgets.find((b) => b.category === cat.name);
    return {
      name: cat.name,
      spent,
      limit: budget ? Number(budget.limit) : 0,
    };
  }).filter((c) => c.spent > 0 || c.limit > 0);

  // Financial health metrics
  const budgetUsage = budgets.length > 0
    ? (budgets.reduce((sum, b) => sum + Number(b.spent), 0) / budgets.reduce((sum, b) => sum + Number(b.limit), 0)) * 100
    : 0;

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const upcomingBills = bills.filter((b) => {
    const dueDate = new Date(b.dueDate);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dueDate >= now && dueDate <= nextWeek;
  }).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading dashboard...</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header - Compact */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your financial overview</p>
      </div>

      {/* KPI Cards - Modern & Clean */}
      <div className="grid md:grid-cols-3 gap-4">
        <KPICard
          title="Income"
          amount={totalIncome.toFixed(2)}
          change={incomeChange}
          changeLabel="vs last month"
          type="income"
        />
        <KPICard
          title="Expenses"
          amount={totalExpenses.toFixed(2)}
          change={expenseChange}
          changeLabel="vs last month"
          type="expense"
        />
        <KPICard
          title="Net Balance"
          amount={netBalance.toFixed(2)}
          change={null}
          changeLabel="This month"
          type="balance"
          highlight
        />
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Left Column - 65% */}
        <div className="md:col-span-2 space-y-5">
          {/* Income vs Expenses Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses</h2>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(0)}`}
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                <a href="/dashboard/transactions" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  View All →
                </a>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-3 hover:bg-gray-50 transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
                        {getMerchantInitials(tx.description || 'T')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{tx.description || tx.category}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Budget Progress</h2>
            {categorySpending.length > 0 ? (
              <div className="space-y-4">
                {categorySpending.slice(0, 5).map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcon(cat.name)}</span>
                        <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        ${cat.spent.toFixed(0)}{cat.limit > 0 ? ` / $${cat.limit.toFixed(0)}` : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((cat.spent / (cat.limit || cat.spent)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No budget data yet</p>
            )}
          </div>
        </div>

        {/* Right Column - 35% */}
        <div className="space-y-5">
          {/* Financial Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Savings Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{savingsRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Budget Usage</span>
                  <span className="text-lg font-bold text-amber-600">{budgetUsage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(budgetUsage, 100)}%` }}></div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming Bills</span>
                  <span className="text-lg font-bold text-gray-900">{upcomingBills}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Connected Accounts</h2>
            {bankAccounts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{bankAccounts.length} Accounts</p>
                <div className="space-y-2">
                  {bankAccounts.slice(0, 3).map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition">
                      <span className="text-sm text-gray-700">{acc.name}</span>
                      <span className="text-sm font-semibold text-gray-900">${acc.balance.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <a href="/dashboard/settings" className="inline-block text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-2">
                  View All →
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No accounts connected</p>
                <a href="/dashboard/settings" className="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium">
                  Link Account
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions - Compact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/dashboard/transactions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span>➕</span> Add Transaction
              </a>
              <a href="/dashboard/budgets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span>🎯</span> Create Budget
              </a>
              <a href="/dashboard/goals" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span>🚀</span> Savings Goal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  amount,
  change,
  changeLabel,
  type,
  highlight,
}: {
  title: string;
  amount: string;
  change: number | null;
  changeLabel: string;
  type: 'income' | 'expense' | 'balance';
  highlight?: boolean;
}) {
  const bgClass = highlight ? 'bg-gray-50' : 'bg-white';
  const borderClass = highlight ? 'border-2 border-emerald-200' : 'border border-gray-200';
  const amountColorClass = {
    income: 'text-emerald-600',
    expense: 'text-red-600',
    balance: highlight ? 'text-gray-900' : 'text-gray-700',
  }[type];

  const changeColorClass = change && change > 0 ? 'text-emerald-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className={`${bgClass} ${borderClass} rounded-2xl p-5 shadow-sm transition hover:shadow-md`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${amountColorClass} mt-2`}>${amount}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        {change !== null ? (
          <>
            <span className={`font-semibold ${changeColorClass}`}>
              {change > 0 ? '+' : ''}{change.toFixed(0)}%
            </span>
            <span className="text-gray-500">{changeLabel}</span>
          </>
        ) : (
          <span className="text-gray-500">{changeLabel}</span>
        )}
      </div>
    </div>
  );
}
