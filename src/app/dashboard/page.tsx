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
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Get user name from localStorage
    const name = localStorage.getItem('userName');
    setUserName(name || '');

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

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

  const userFirstName = userName.split(' ')[0] || 'there';

  const upcomingBillsCount = bills.filter((b) => {
    const dueDate = new Date(b.dueDate);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dueDate >= now && dueDate <= nextWeek;
  }).length;

  const upcomingBillsText = upcomingBillsCount === 0 ? '0 bills due' : `${upcomingBillsCount} bill${upcomingBillsCount > 1 ? 's' : ''} due`;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading dashboard...</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header - With Personalized Greeting */}
      <div className="flex items-start justify-between mb-6">
        {/* Left Side */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Your financial overview</p>
        </div>

        {/* Right Side - Personalized Greeting */}
        <div className="text-right hidden md:block">
          <p className="text-lg font-semibold text-gray-900">
            {greeting}, {userFirstName} 👋
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {bankAccounts.length} connected accounts • {upcomingBillsText}
          </p>
        </div>
      </div>

      {/* KPI Cards - Net Balance Primary */}
      <div className="grid md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <KPICard
            title="Net Balance"
            amount={netBalance.toFixed(2)}
            change={null}
            changeLabel="This month"
            type="balance"
            highlight
            large
          />
        </div>
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
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Left Column - 65% */}
        <div className="md:col-span-2 space-y-4">
          {/* Income vs Expenses Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Income vs Expenses</h2>
            <div style={{ width: '100%', height: 140 }}>
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
            <div className="px-5 py-3 border-b border-gray-100">
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
                  <div key={tx.id} className="px-5 py-2.5 hover:bg-gray-50 transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                        {getMerchantInitials(tx.description || 'T')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{tx.description || tx.category}</p>
                        <p className="text-xs text-gray-500">{tx.category} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Budget Progress</h2>
            {categorySpending.length > 0 ? (
              <div className="space-y-3">
                {categorySpending.slice(0, 5).map((cat) => {
                  const percentUsed = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                  let statusColor = 'bg-emerald-500';
                  let statusLabel = '✅';
                  if (percentUsed >= 100) {
                    statusColor = 'bg-red-500';
                    statusLabel = '🚨';
                  } else if (percentUsed >= 80) {
                    statusColor = 'bg-amber-500';
                    statusLabel = '⚠️';
                  }
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoryIcon(cat.name)}</span>
                          <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                          <span className="text-xs text-gray-500">{statusLabel}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          ${cat.spent.toFixed(0)}{cat.limit > 0 ? ` / $${cat.limit.toFixed(0)}` : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${statusColor} h-2 rounded-full transition-all`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No budget data yet</p>
            )}
          </div>
        </div>

        {/* Right Column - 35% */}
        <div className="space-y-4">
          {/* Financial Insights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Insights</h2>
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Top Spending Category</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {categorySpending.length > 0 ? categorySpending[0].name : 'No data'}
                </p>
              </div>
              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Largest Expense</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ${recentTransactions.length > 0 ? Math.max(...recentTransactions.map(t => Number(t.amount))).toFixed(0) : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Upcoming Bills</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{upcomingBillsCount} Due This Week</p>
              </div>
            </div>
          </div>

          {/* Connected Accounts Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Connected Accounts</h2>
            {bankAccounts.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-600">🏦 Banking</span>
                  <span className="font-semibold text-gray-900">({bankAccounts.filter(a => !a.name.toLowerCase().includes('credit') && !a.name.toLowerCase().includes('loan')).length})</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-sm border-t border-gray-100 pt-2">
                  <span className="text-gray-600">💳 Credit Cards</span>
                  <span className="font-semibold text-gray-900">({bankAccounts.filter(a => a.name.toLowerCase().includes('credit')).length})</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-600">🏠 Loans</span>
                  <span className="font-semibold text-gray-900">({bankAccounts.filter(a => a.name.toLowerCase().includes('loan')).length})</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm font-semibold text-emerald-600 border-t border-gray-100 mt-1 pt-2">
                  <span>{bankAccounts.length} Total Accounts</span>
                  <a href="/dashboard/settings" className="text-xs text-emerald-600 hover:text-emerald-700">View →</a>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-gray-600 mb-3">No accounts connected</p>
                <a href="/dashboard/settings" className="inline-block px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition font-medium">
                  Link Account
                </a>
              </div>
            )}
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
  large,
}: {
  title: string;
  amount: string;
  change: number | null;
  changeLabel: string;
  type: 'income' | 'expense' | 'balance';
  highlight?: boolean;
  large?: boolean;
}) {
  const bgClass = highlight ? 'bg-emerald-50' : 'bg-white';
  const borderClass = highlight ? 'border-2 border-emerald-200' : 'border border-gray-200';
  const amountColorClass = {
    income: 'text-emerald-600',
    expense: 'text-red-600',
    balance: highlight ? 'text-emerald-700' : 'text-gray-700',
  }[type];

  const changeColorClass = change && change > 0 ? 'text-emerald-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const amountSizeClass = large ? 'text-4xl' : 'text-3xl';
  const paddingClass = large ? 'p-6' : 'p-5';

  return (
    <div className={`${bgClass} ${borderClass} rounded-2xl ${paddingClass} shadow-sm transition hover:shadow-md`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`${amountSizeClass} font-bold ${amountColorClass} mt-2`}>${amount}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
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
