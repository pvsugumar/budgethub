'use client';

import { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  category: string | null;
}

export default function GoalsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    category: '',
    targetDate: '',
  });

  const loadGoals = async (uid: string) => {
    const res = await fetch(`/api/goals?userId=${uid}`);
    setGoals(res.ok ? await res.json() : []);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadGoals(storedUserId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.name || !form.targetAmount || !form.targetDate) return;

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...form }),
    });

    if (res.ok) {
      setForm({ name: '', targetAmount: '', category: '', targetDate: '' });
      loadGoals(userId);
    }
  };

  const handleAddFunds = async (goal: Goal) => {
    const amount = prompt(`How much would you like to add to "${goal.name}"?`);
    if (!amount || isNaN(Number(amount))) return;

    const newAmount = Number(goal.currentAmount) + Number(amount);
    const res = await fetch(`/api/goals/${goal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentAmount: newAmount }),
    });
    if (res.ok && userId) loadGoals(userId);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok && userId) loadGoals(userId);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading goals...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Savings Goals</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Set New Goal</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Vacation Fund"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="5000.00"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                className="input"
                placeholder="Travel"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                className="input"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Goal
          </button>
        </form>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No goals yet. Set your first goal to start tracking!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount);
            const target = Number(goal.targetAmount);
            const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
            const daysLeft = Math.ceil(
              (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={goal.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{goal.name}</h3>
                    {goal.category && <p className="text-sm text-gray-500">{goal.category}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-600">${current.toFixed(2)} of ${target.toFixed(2)}</span>
                  <span className="text-gray-500">{percent.toFixed(0)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Target date passed'}
                </p>
                <button
                  onClick={() => handleAddFunds(goal)}
                  className="btn btn-secondary mt-4 w-full"
                >
                  Add Funds
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

