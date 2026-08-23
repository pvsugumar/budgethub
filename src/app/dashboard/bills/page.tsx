'use client';

import { useState, useEffect } from 'react';

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: number;
  frequency: string;
  paid: boolean;
  nextDue: string;
}

export default function BillsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
  });

  const loadBills = async (uid: string) => {
    const res = await fetch(`/api/bills?userId=${uid}`);
    setBills(res.ok ? await res.json() : []);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadBills(storedUserId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.name || !form.amount || !form.dueDate) return;

    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...form }),
    });

    if (res.ok) {
      setForm({ name: '', amount: '', dueDate: '', frequency: 'monthly' });
      loadBills(userId);
    }
  };

  const handleTogglePaid = async (bill: Bill) => {
    const res = await fetch(`/api/bills/${bill.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid: !bill.paid }),
    });
    if (res.ok && userId) loadBills(userId);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
    if (res.ok && userId) loadBills(userId);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading bills...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Bills</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Add Bill Reminder</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Electric Bill"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="100.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Day of Month)
              </label>
              <input
                type="number"
                className="input"
                placeholder="15"
                min="1"
                max="31"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                className="input"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Bill
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Upcoming Bills</h2>
        {bills.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No bills added yet. Add one to get reminders!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  bill.paid ? 'bg-green-50 border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bill.paid}
                    onChange={() => handleTogglePaid(bill)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className={`font-semibold ${bill.paid ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {bill.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due day {bill.dueDate} • {bill.frequency} • Next: {new Date(bill.nextDue).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</p>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

