'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

interface Transaction {
  id: string;
  amount: string;
  type: string;
  category: string;
  description: string | null;
  date: string;
}

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'this-year', label: 'This year' },
  { value: 'last-year', label: 'Last year' },
];

function getDateRange(option: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (option) {
    case '7d': {
      const from = new Date(now); from.setDate(from.getDate() - 7);
      return { from, to: now };
    }
    case '30d': {
      const from = new Date(now); from.setDate(from.getDate() - 30);
      return { from, to: now };
    }
    case '90d': {
      const from = new Date(now); from.setDate(from.getDate() - 90);
      return { from, to: now };
    }
    case 'this-month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case 'last-month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    }
    case 'this-year':
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case 'last-year':
      return { from: new Date(now.getFullYear() - 1, 0, 1), to: new Date(now.getFullYear() - 1, 11, 31) };
    default:
      return { from: null, to: null };
  }
}

function categoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('auto') || c.includes('transport') || c.includes('car') || c.includes('gas')) return '🚗';
  if (c.includes('food') || c.includes('dining') || c.includes('restaurant')) return '🍔';
  if (c.includes('coffee')) return '☕';
  if (c.includes('shop')) return '🛍️';
  if (c.includes('travel')) return '✈️';
  if (c.includes('entertain')) return '🎬';
  if (c.includes('home') || c.includes('rent') || c.includes('mortgage')) return '🏠';
  if (c.includes('util')) return '💡';
  if (c.includes('health') || c.includes('medical')) return '🩺';
  if (c.includes('education') || c.includes('school')) return '🎓';
  if (c.includes('gift') || c.includes('donat')) return '🎁';
  if (c.includes('kid')) return '🧸';
  if (c.includes('financ') || c.includes('fee') || c.includes('interest')) return '🏦';
  if (c.includes('atm') || c.includes('withdraw') || c.includes('cash')) return '💼';
  if (c.includes('income') || c.includes('salary') || c.includes('payroll')) return '💰';
  return '🏷️';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeOption, setDateRangeOption] = useState('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '', date: '', type: 'expense' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setShowAddForm(false);
      loadTransactions(userId);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    const { from, to } = getDateRange(dateRangeOption);
    if (filter !== 'all' && t.type !== filter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (
      search !== '' &&
      !t.category.toLowerCase().includes(search.toLowerCase()) &&
      !(t.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({
      amount: t.amount,
      category: t.category,
      description: t.description || '',
      date: t.date.split('T')[0],
      type: t.type,
    });
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!userId || selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected transaction(s)?`)) return;
    await Promise.all(
      Array.from(selectedIds).map((id) => fetch(`/api/transactions/${id}`, { method: 'DELETE' }))
    );
    setSelectedIds(new Set());
    loadTransactions(userId);
  };

  const handleBulkCategoryChange = async () => {
    if (!userId || selectedIds.size === 0 || !bulkCategory) return;
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/transactions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: bulkCategory }),
        })
      )
    );
    setSelectedIds(new Set());
    setBulkCategory('');
    loadTransactions(userId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {showAddForm && (
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
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
          <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          {/* Date range dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="input w-auto flex items-center gap-2 justify-between"
            >
              <span>{DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeOption)?.label}</span>
              <span className="text-gray-400 text-xs">▾</span>
            </button>
            {dateDropdownOpen && (
              <div className="absolute z-20 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-72 overflow-y-auto">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setDateRangeOption(opt.value);
                      setDateDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 text-left"
                  >
                    <span>{opt.label}</span>
                    {dateRangeOption === opt.value && <span className="text-gray-900">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category dropdown with search + icons */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="input w-auto flex items-center gap-2 justify-between min-w-[170px]"
            >
              <span className="flex items-center gap-2">
                <span>{categoryFilter === 'all' ? '🏷️' : categoryIcon(categoryFilter)}</span>
                <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
              </span>
              <span className="text-gray-400 text-xs">▾</span>
            </button>
            {categoryDropdownOpen && (
              <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                <div className="px-3 pb-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="input"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setCategoryDropdownOpen(false);
                      setCategorySearch('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                  >
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">🏷️</span>
                    <span>All Categories</span>
                  </button>
                  {categories
                    .filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(c);
                          setCategoryDropdownOpen(false);
                          setCategorySearch('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left ${
                          categoryFilter === c ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          {categoryIcon(c)}
                        </span>
                        <span>{c}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Search category or description..."
            className="input flex-1 min-w-[180px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(filter !== 'all' || categoryFilter !== 'all' || dateRangeOption !== 'all' || search) && (
            <button
              onClick={() => {
                setFilter('all');
                setCategoryFilter('all');
                setDateRangeOption('all');
                setSearch('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk actions toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-sm font-semibold text-blue-900">{selectedIds.size} selected</span>
            <input
              type="text"
              placeholder="Set category..."
              className="input w-auto"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
            />
            <button onClick={handleBulkCategoryChange} className="btn btn-secondary text-sm">
              Apply Category
            </button>
            <button onClick={handleBulkDelete} className="btn btn-danger text-sm">
              Delete Selected
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-600 hover:text-gray-800">
              Clear selection
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No transactions found. Start by adding one or link a bank account!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) =>
                  editingId === t.id ? (
                    <tr key={t.id} className="border-b border-blue-100 bg-blue-50">
                      <td colSpan={6} className="py-3 px-2">
                        <div className="grid md:grid-cols-5 gap-2">
                          <input
                            type="date"
                            className="input"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Category"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          />
                          <select
                            className="input"
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            className="input"
                            placeholder="Amount"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleUpdate(t.id)} className="btn btn-primary text-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-secondary text-sm">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(t.id)}
                          onChange={() => toggleSelect(t.id)}
                        />
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {t.description || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge badge-info">{categoryIcon(t.category)} {t.category}</span>
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-bold whitespace-nowrap ${
                          t.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3 pr-2 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


