'use client';

import { useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Transactions</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select className="input">
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input type="number" className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input type="text" className="input" placeholder="Food" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input type="date" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea className="input" placeholder="Optional notes" rows={3}></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Transaction
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="mb-4 flex gap-2">
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
        </div>
        <div className="text-center py-8 text-gray-600">
          <p>No transactions found. Start by adding one!</p>
        </div>
      </div>
    </div>
  );
}
