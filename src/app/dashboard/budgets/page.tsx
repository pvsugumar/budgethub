'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES, categoryIcon } from '@/lib/categories';

interface Budget {
  id: string;
  category: string;
  limit: string;
  month: number;
  year: number;
}

interface Transaction {
  amount: string;
  type: string;
  category: string;
  date: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Ring status: how much of the budget is remaining
function ringColor(remaining: number, limit: number): string {
  if (remaining < 0) return '#dc2626'; // over budget - red
  if (limit > 0 && remaining / limit < 0.2) return '#2563eb'; // close to limit - blue
  return '#16a34a'; // healthy - green
}

function BudgetRing({ spent, limit }: { spent: number; limit: number }) {
  const remaining = limit - spent;
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const color = ringColor(remaining, limit);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="17"
        cy="17"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 17 17)"
      />
    </svg>
  );
}

export default function BudgetsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [form, setForm] = useState({
    category: '',
    limit: '',
    month: today.getMonth() + 1,
  });

  const loadData = async (uid: string) => {
    const [budgetsRes, txnsRes] = await Promise.all([
      fetch(`/api/budgets?userId=${uid}`),
      fetch(`/api/transactions?userId=${uid}`),
    ]);
    setBudgets(budgetsRes.ok ? await budgetsRes.json() : []);
    setTransactions(txnsRes.ok ? await txnsRes.json() : []);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadData(storedUserId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.category || !form.limit) return;

    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        category: form.category,
        limit: form.limit,
        month: viewMonth,
        year: viewYear,
      }),
    });

    if (res.ok) {
      setForm({ category: '', limit: '', month: viewMonth });
      setShowAddForm(false);
      loadData(userId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    if (res.ok) loadData(userId);
  };

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const spentByCategory = (category: string, month: number, year: number) => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === category &&
          d.getMonth() + 1 === month &&
          d.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const monthIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() + 1 === viewMonth && d.getFullYear() === viewYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthBudgets = budgets.filter((b) => b.month === viewMonth && b.year === viewYear);
  const totalBudgeted = monthBudgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalActual = monthBudgets.reduce(
    (sum, b) => sum + spentByCategory(b.category, b.month, b.year),
    0
  );
  const totalRemaining = totalBudgeted - totalActual;
  const leftForSavings = monthIncome - totalActual;

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading budgets...</div>;
  }

  return (
    <div>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {MONTHS[viewMonth - 1]} {viewYear} Budget
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 rounded-full border border-gray-300 text-sm hover:bg-gray-50">
            ← {MONTHS[(viewMonth - 2 + 12) % 12].slice(0, 3)}
          </button>
          <button onClick={() => changeMonth(1)} className="px-3 py-1.5 rounded-full border border-gray-300 text-sm hover:bg-gray-50">
            {MONTHS[viewMonth % 12].slice(0, 3)} →
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            {showAddForm ? '✕ Cancel' : '+ Add Budget'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Create Budget for {MONTHS[viewMonth - 1]} {viewYear}</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="500.00"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Budget
            </button>
          </form>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <div className="card text-center py-12 text-gray-600">
          <p className="text-lg">No budgets set for {MONTHS[viewMonth - 1]} {viewYear}. Create one to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-500 tracking-wide">BUDGET CATEGORIES</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium text-right">Budgeted</th>
                <th className="py-3 px-6 font-medium text-right">Actual</th>
                <th className="py-3 px-6 font-medium text-right">Remaining</th>
                <th className="py-3 px-6 w-10"></th>
                <th className="py-3 px-6 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {monthBudgets.map((budget) => {
                const spent = spentByCategory(budget.category, budget.month, budget.year);
                const limit = Number(budget.limit);
                const remaining = limit - spent;

                return (
                  <tr key={budget.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                          {categoryIcon(budget.category)}
                        </span>
                        <span className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2">
                          {budget.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-700">${limit.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right text-gray-700">${spent.toFixed(2)}</td>
                    <td
                      className={`py-4 px-6 text-right font-semibold ${
                        remaining < 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <BudgetRing spent={spent} limit={limit} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                <td className="py-4 px-6 text-gray-900">Spending Budget</td>
                <td className="py-4 px-6 text-right text-gray-900">${totalBudgeted.toFixed(2)}</td>
                <td className="py-4 px-6 text-right text-gray-900">${totalActual.toFixed(2)}</td>
                <td className={`py-4 px-6 text-right ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalRemaining < 0 ? '-' : ''}${Math.abs(totalRemaining).toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="py-3 px-6 text-gray-700 flex items-center gap-2">
                  <span>💵</span> Left For Savings
                </td>
                <td colSpan={3} className="py-3 px-6 text-right font-semibold text-gray-900">
                  ${leftForSavings.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

