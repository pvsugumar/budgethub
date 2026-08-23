'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

interface Transaction {
  amount: string;
  type: string;
  category: string;
  date: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function SpendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('this-month');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/transactions?userId=${userId}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/budgets?userId=${userId}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([txns, budgets]) => {
        setTransactions(txns);
        setBudgetTotal(
          budgets.reduce((sum: number, b: { limit: string }) => sum + Number(b.limit), 0)
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const rangeCutoff = (() => {
    const d = new Date(now);
    if (range === 'last-3') d.setMonth(d.getMonth() - 3);
    else if (range === 'last-6') d.setMonth(d.getMonth() - 6);
    else if (range === 'ytd') return new Date(now.getFullYear(), 0, 1);
    else return new Date(now.getFullYear(), now.getMonth(), 1);
    return d;
  })();

  const thisMonthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d >= rangeCutoff && d <= now;
  });

  const monthTotal = thisMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const budgetRemaining = Math.max(budgetTotal - monthTotal, 0);
  const daysInRange = Math.max(
    1,
    Math.ceil((now.getTime() - rangeCutoff.getTime()) / (1000 * 60 * 60 * 24))
  );
  const dailyAverage = monthTotal / daysInRange;

  const byCategory = thisMonthExpenses.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});
  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: monthTotal > 0 ? (amount / monthTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Last 6 months trend
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = transactions
      .filter((t) => {
        const td = new Date(t.date);
        return (
          t.type === 'expense' &&
          td.getMonth() === d.getMonth() &&
          td.getFullYear() === d.getFullYear()
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { month: d.toLocaleString('default', { month: 'short' }), value: total };
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading spending data...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">💸 Spending Analysis</h1>
      <p className="text-gray-500 mb-6">Track where your money goes</p>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">During:</span>
        <select
          className="input w-auto"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="this-month">This Month</option>
          <option value="last-3">Last 3 Months</option>
          <option value="last-6">Last 6 Months</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Spent</p>
          <p className="text-3xl font-bold text-red-600 mt-2">${monthTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Budget Remaining</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${budgetRemaining.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-2">
            {budgetTotal > 0 ? `${((budgetRemaining / budgetTotal) * 100).toFixed(0)}% of budget available` : 'No budget set'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Daily Average</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">${dailyAverage.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-2">Based on {daysInRange} days</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Spending by Category</h2>
        {categoryBreakdown.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No expenses recorded this month yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}`}
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <p className="font-semibold text-gray-700">{item.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">${item.amount.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">{item.percent.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Monthly Trend</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" name="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


