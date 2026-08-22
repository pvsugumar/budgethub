'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [_loading, _setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    _setLoading(false);
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Income"
          amount="$5,200.00"
          icon="📈"
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Total Expenses"
          amount="$2,840.00"
          icon="📉"
          color="red"
          subtitle="This month"
        />
        <StatCard
          title="Net Balance"
          amount="$2,360.00"
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
              <div className="space-y-4">
                {[
                  { name: 'Starbucks Coffee', amount: '-$5.50', date: 'Today', icon: '☕' },
                  { name: 'Salary Deposit', amount: '+$3,200.00', date: 'Yesterday', icon: '💼' },
                  { name: 'Netflix Subscription', amount: '-$15.99', date: '2 days ago', icon: '🎬' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tx.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.name}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
            <div className="space-y-4">
              {[
                { category: 'Food & Dining', amount: '$580', percent: 35, color: 'bg-orange-500' },
                { category: 'Shopping', amount: '$420', percent: 25, color: 'bg-pink-500' },
                { category: 'Entertainment', amount: '$340', percent: 20, color: 'bg-purple-500' },
                { category: 'Transport', amount: '$200', percent: 12, color: 'bg-blue-500' },
                { category: 'Utilities', amount: '$120', percent: 8, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-600">{item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
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

          {/* Budget Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Status</h2>
            <div className="space-y-4">
              {[
                { name: 'Monthly Budget', used: 62, color: 'bg-yellow-500' },
                { name: 'Spending Limit', used: 45, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm font-bold text-gray-900">{item.used}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full`}
                      style={{ width: `${item.used}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Savings Goals</h2>
            <div className="space-y-4">
              {[
                { goal: 'Emergency Fund', current: 3500, target: 5000 },
                { goal: 'Vacation', current: 1200, target: 2500 },
              ].map((item, i) => (
                <div key={i}>
                  <p className="font-medium text-gray-900 mb-2">{item.goal}</p>
                  <p className="text-xs text-gray-600 mb-2">${item.current.toLocaleString()} / ${item.target.toLocaleString()}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.current / item.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
