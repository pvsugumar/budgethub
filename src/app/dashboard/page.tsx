'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });
  const [transactions] = useState<any[]>([]);
  const [budgets] = useState<any[]>([]);
  const [savingsGoals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Fetch from /api/dashboard endpoint
        // For now, show empty state
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Your financial overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Income"
          amount={`$${stats.totalIncome.toFixed(2)}`}
          icon="📈"
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Total Expenses"
          amount={`$${stats.totalExpenses.toFixed(2)}`}
          icon="📉"
          color="red"
          subtitle="This month"
        />
        <StatCard
          title="Net Balance"
          amount={`$${stats.netBalance.toFixed(2)}`}
          icon="💰"
          color="blue"
          subtitle="Available"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Transactions & Spending */}
        <div className="md:col-span-2 space-y-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <a href="/dashboard/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </a>
              </div>
            </div>
            <div className="p-6">
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tx.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{tx.name}</p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount >= 0 ? '+' : ''} ${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Link your bank account to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                      <span className="text-sm font-semibold text-gray-600">${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No budget data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Summary */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                ➕ Add Transaction
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200">
                🎯 Set Budget
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                🚀 Savings Goal
              </button>
            </div>
          </div>

          {/* Bank Connection Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Connection</h2>
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🏦</p>
              <p className="text-gray-600 font-medium">Not Connected</p>
              <p className="text-sm text-gray-500 mt-2">Link your bank account to sync transactions automatically</p>
              <a href="/dashboard/settings" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Link Bank Account
              </a>
            </div>
          </div>

          {/* Savings Goals */}
          {savingsGoals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Savings Goals</h2>
              <div className="space-y-4">
                {savingsGoals.map((goal) => (
                  <div key={goal.id}>
                    <p className="font-medium text-gray-900 mb-2">{goal.name}</p>
                    <p className="text-xs text-gray-600 mb-2">${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  amount,
  icon,
  color,
  subtitle,
}: {
  title: string;
  amount: string;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const bgColor = {
    green: 'from-green-50 to-green-100',
    red: 'from-red-50 to-red-100',
    blue: 'from-blue-50 to-blue-100',
  }[color] || 'from-gray-50 to-gray-100';

  const textColor = {
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
  }[color] || 'text-gray-700';

  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{amount}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}
