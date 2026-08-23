'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface Transaction {
  amount: string;
  type: string;
  category: string;
  date: string;
}

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-gray-100 text-sm">
      <span className="font-semibold text-gray-900">{payload[0].name}</span>
      <span className="text-gray-500"> : ${Number(payload[0].value).toFixed(2)}</span>
    </div>
  );
}

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
      <div className="flex items-center gap-3 mb-1">
        <span className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">💸</span>
        <h1 className="text-3xl font-bold text-gray-900">Spending Analysis</h1>
      </div>
      <p className="text-gray-500 mb-6 ml-14">Track where your money goes</p>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-gray-600">During</span>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-rose-500">
          <p className="text-gray-500 text-sm font-medium">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${monthTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-medium">Budget Remaining</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${budgetRemaining.toFixed(2)}</p>
          <p className="text-gray-400 text-xs mt-2">
            {budgetTotal > 0 ? `${((budgetRemaining / budgetTotal) * 100).toFixed(0)}% of budget available` : 'No budget set'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
          <p className="text-gray-500 text-sm font-medium">Daily Average</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${dailyAverage.toFixed(2)}</p>
          <p className="text-gray-400 text-xs mt-2">Based on {daysInRange} days</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h2>
        {categoryBreakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses recorded this month yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="relative" style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900">${monthTotal.toFixed(0)}</p>
              </div>
            </div>
            <div className="space-y-3">
              {categoryBreakdown.map((item, index) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <p className="font-medium text-gray-700 text-sm">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-sm">${item.amount.toFixed(2)}</span>
                      <span className="text-gray-400 text-xs ml-2">{item.percent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Trend</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Expenses"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#trendGradient)"
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


