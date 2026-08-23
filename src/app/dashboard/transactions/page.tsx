'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  amount: string;
  type: string;
  category: string;
  description: string | null;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '' });
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadTransactions = async (uid: string) => {
    try {
      const res = await fetch(`/api/transactions?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadTransactions(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.amount || !form.category) return;

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...form }),
    });

    if (res.ok) {
      setForm({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      loadTransactions(userId);
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      (filter === 'all' || t.type === filter) &&
      (search === '' ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({ amount: t.amount, category: t.category, description: t.description || '' });
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok && userId) {
      setEditingId(null);
      loadTransactions(userId);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok && userId) loadTransactions(userId);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Transactions</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
                placeholder="Food"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input"
              placeholder="Optional notes"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Transaction
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded ${
              filter === 'income'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded ${
              filter === 'expense'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Expenses
          </button>
          <input
            type="text"
            placeholder="Search category or description..."
            className="input flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No transactions found. Start by adding one or link a bank account!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((t) =>
              editingId === t.id ? (
                <div key={t.id} className="p-3 border-2 border-blue-300 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(t.id)} className="btn btn-primary text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{t.description || t.category}</p>
                    <p className="text-sm text-gray-600">
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-bold ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </p>
                    <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

