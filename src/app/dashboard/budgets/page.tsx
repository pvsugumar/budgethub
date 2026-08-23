'use client';

import { useState, useEffect } from 'react';

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

export default function BudgetsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [form, setForm] = useState({
    category: '',
    limit: '',
    month: now.getMonth() + 1,
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
        month: form.month,
        year: now.getFullYear(),
      }),
    });

    if (res.ok) {
      setForm({ category: '', limit: '', month: now.getMonth() + 1 });
      loadData(userId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    if (res.ok) loadData(userId);
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

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading budgets...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Budgets</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Create Budget</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                className="input"
                placeholder="Food"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Limit
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                className="input"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Budget
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
          <div className="text-center py-12 text-gray-600 col-span-full">
            <p className="text-lg">No budgets yet. Create one to get started!</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = spentByCategory(budget.category, budget.month, budget.year);
            const limit = Number(budget.limit);
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const overBudget = spent > limit;

            return (
              <div key={budget.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-500">{MONTHS[budget.month - 1]} {budget.year}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full ${overBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className={overBudget ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                    ${spent.toFixed(2)} spent
                  </span>
                  <span className="text-gray-600">${limit.toFixed(2)} limit</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

