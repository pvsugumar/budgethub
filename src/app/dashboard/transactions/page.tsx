'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { CATEGORIES, categoryIcon } from '@/lib/categories';
import { getMerchantLogo, getMerchantInitials } from '@/lib/merchants';

interface Transaction {
  id: string;
  amount: string;
  type: string;
  category: string;
  description: string | null;
  date: string;
  accountId?: string | null;
}

interface BankAccount {
  id: string;
  name: string;
  mask?: string | null;
  type: string;
}

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
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

// Component for merchant avatar with logo loading
function MerchantAvatar({ merchantName }: { merchantName: string | null }) {
  const [logoError, setLogoError] = useState(false);
  const merchantLabel = merchantName || 'Transaction';
  const logoUrl = getMerchantLogo(merchantLabel);
  const initials = getMerchantInitials(merchantLabel);
  
  if (logoError || !logoUrl) {
    // Fallback: show initials with gradient background
    return (
      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
        {initials}
      </span>
    );
  }
  
  return (
    <img
      src={logoUrl}
      alt={merchantLabel}
      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center object-cover flex-shrink-0 border border-gray-100"
      onError={() => setLogoError(true)}
    />
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateRangeOption, setDateRangeOption] = useState('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '', date: '', type: 'expense' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [inlineEditField, setInlineEditField] = useState<string | null>(null); // "${id}-merchant" or "${id}-category"
  const [inlineEditValue, setInlineEditValue] = useState('');
  const [inlineCategoryDropdownOpen, setInlineCategoryDropdownOpen] = useState(false);
  const inlineCategoryDropdownRef = useRef<HTMLDivElement>(null);
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

  const loadAccounts = async (uid: string) => {
    try {
      const res = await fetch(`/api/bank-accounts?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadTransactions(storedUserId);
      loadAccounts(storedUserId);
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
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
      if (inlineCategoryDropdownRef.current && !inlineCategoryDropdownRef.current.contains(e.target as Node)) {
        setInlineCategoryDropdownOpen(false);
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
      if (userId) loadTransactions(userId);
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
    if (accountFilter !== 'all' && t.accountId !== accountFilter) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (search !== '') {
      const searchLower = search.toLowerCase();
      if (
        !t.category.toLowerCase().includes(searchLower) &&
        !(t.description || '').toLowerCase().includes(searchLower) &&
        !t.amount.includes(search)
      ) {
        return false;
      }
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
      setActionMenuId(null);
      loadTransactions(userId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok && userId) {
      setActionMenuId(null);
      loadTransactions(userId);
    }
  };

  const startInlineEdit = (id: string, field: 'merchant' | 'category', currentValue: string) => {
    setInlineEditField(`${id}-${field}`);
    setInlineEditValue(currentValue);
    if (field === 'category') {
      setInlineCategoryDropdownOpen(true);
    }
  };

  const saveInlineEdit = async (id: string) => {
    if (!inlineEditField) return;
    
    const [transactionId, field] = inlineEditField.split('-');
    if (transactionId !== id) return;

    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const updateData = field === 'merchant' 
      ? { ...transaction, description: inlineEditValue }
      : { ...transaction, category: inlineEditValue };

    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (res.ok && userId) {
      setInlineEditField(null);
      setInlineEditValue('');
      setInlineCategoryDropdownOpen(false);
      loadTransactions(userId);
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditField(null);
    setInlineEditValue('');
    setInlineCategoryDropdownOpen(false);
  };

  const formatAmount = (amount: string): string => {
    const num = Number(amount);
    return num.toFixed(2);
  };

  const hasActiveFilters = filter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all' || dateRangeOption !== 'all' || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Manage, search, and organize your financial activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Export feature coming soon')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Export
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Transaction</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Merchant or description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium text-sm">
                Add Transaction
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Smart Search Bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search merchants, descriptions, categories, notes, or amounts..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-2 items-center">
        {/* Type Filter Pill */}
        <div className="relative">
          <button
            onClick={() => setFilter(filter === 'all' ? 'expense' : filter === 'expense' ? 'income' : 'all')}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              filter === 'all'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : filter === 'expense'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {filter === 'all' ? 'All Types' : filter === 'expense' ? 'Expenses' : 'Income'} ▼
          </button>
        </div>

        {/* Date Range Filter Pill */}
        <div className="relative" ref={dateDropdownRef}>
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${
              dateRangeOption === 'all'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeOption)?.label} ▼
          </button>
          {dateDropdownOpen && (
            <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 max-h-72 overflow-y-auto">
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
                  {dateRangeOption === opt.value && <span className="text-primary font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accounts Filter Pill */}
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition flex items-center gap-2 ${
              accountFilter === 'all'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <span>🏦</span>
            <span>{accountFilter === 'all' ? 'All Accounts' : accounts.find(a => a.id === accountFilter)?.name || 'Account'}</span>
            <span>▼</span>
          </button>
          {accountDropdownOpen && (
            <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-3">
              <div className="max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAccountFilter('all');
                    setAccountDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">🏦</span>
                  <span className="font-medium text-gray-700">All Accounts</span>
                </button>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      setAccountFilter(account.id);
                      setAccountDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left ${
                      accountFilter === account.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-lg">💳</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{account.name}</div>
                      {account.mask && <div className="text-xs text-gray-500">•••• {account.mask}</div>}
                    </div>
                    {accountFilter === account.id && <span className="ml-auto text-primary font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Pill */}
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition flex items-center gap-2 ${
              categoryFilter === 'all'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <span>{categoryFilter === 'all' ? '🏷️' : categoryIcon(categoryFilter)}</span>
            <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
            <span>▼</span>
          </button>
          {categoryDropdownOpen && (
            <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-3">
              <div className="px-3 pb-2 border-b border-gray-100">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search categories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">🏷️</span>
                  <span className="font-medium text-gray-700">All Categories</span>
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
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-lg">
                        {categoryIcon(c)}
                      </span>
                      <span className="font-medium text-gray-700">{c}</span>
                      {categoryFilter === c && <span className="ml-auto text-primary font-bold">✓</span>}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setFilter('all');
              setCategoryFilter('all');
              setAccountFilter('all');
              setDateRangeOption('all');
              setSearch('');
            }}
            className="ml-auto text-sm text-primary hover:text-opacity-80 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new transaction to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((t) =>
                  editingId === t.id ? (
                    <tr key={t.id} className="bg-blue-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid md:grid-cols-5 gap-3">
                          <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            placeholder="Merchant/Description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                          <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            {!CATEGORIES.some((c) => c.name === editForm.category) && editForm.category && (
                              <option value={editForm.category}>{editForm.category}</option>
                            )}
                            {CATEGORIES.map((c) => (
                              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                            ))}
                          </select>
                          <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            placeholder="Amount"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleUpdate(t.id)} className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-medium text-sm">
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {inlineEditField === `${t.id}-merchant` ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              value={inlineEditValue}
                              onChange={(e) => setInlineEditValue(e.target.value)}
                              onBlur={() => saveInlineEdit(t.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(t.id);
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <button
                              onClick={() => saveInlineEdit(t.id)}
                              className="p-1 hover:bg-green-100 rounded text-green-600 font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="p-1 hover:bg-red-100 rounded text-red-600 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => startInlineEdit(t.id, 'merchant', t.description || '')}
                          >
                            <MerchantAvatar merchantName={t.description || 'Transaction'} />
                            <span className="font-medium text-gray-900 truncate group-hover:text-primary transition">
                              {t.description || 'Transaction'}
                            </span>
                            <span className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition">✎</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inlineEditField === `${t.id}-category` ? (
                          <div className="relative" ref={inlineCategoryDropdownRef}>
                            <button
                              onClick={() => setInlineCategoryDropdownOpen(!inlineCategoryDropdownOpen)}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition"
                            >
                              {categoryIcon(inlineEditValue)} {inlineEditValue} ▼
                            </button>
                            {inlineCategoryDropdownOpen && (
                              <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 max-h-60 overflow-y-auto">
                                {CATEGORIES.map((c) => (
                                  <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => {
                                      setInlineEditValue(c.name);
                                      saveInlineEdit(t.id);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left ${
                                      inlineEditValue === c.name ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                                      {c.icon}
                                    </span>
                                    <span className="font-medium text-gray-700">{c.name}</span>
                                    {inlineEditValue === c.name && <span className="ml-auto text-primary font-bold">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            onClick={() => startInlineEdit(t.id, 'category', t.category)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium cursor-pointer hover:bg-blue-100 transition group"
                          >
                            {categoryIcon(t.category)} {t.category}
                            <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition">✎</span>
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className="flex items-center justify-end gap-1">
                          <span>${formatAmount(t.amount)}{t.type === 'income' ? '▲' : '▼'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative" ref={actionMenuId === t.id ? actionMenuRef : undefined}>
                          <button
                            onClick={() => setActionMenuId(actionMenuId === t.id ? null : t.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            ⋮
                          </button>
                          {actionMenuId === t.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                              <button
                                onClick={() => startEdit(t)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit Transaction
                              </button>
                              <button
                                onClick={() => {
                                  setForm({
                                    type: t.type,
                                    amount: t.amount,
                                    category: t.category,
                                    date: t.date.split('T')[0],
                                    description: t.description || '',
                                  });
                                  setShowAddForm(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Duplicate Transaction
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div className="flex justify-end gap-8 text-sm">
          <div>
            <p className="text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              ${filteredTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              ${filteredTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Net</p>
            <p className={`text-2xl font-bold ${
              filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0) >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              ${(
                filteredTransactions.reduce(
                  (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
                  0
                )
              ).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
