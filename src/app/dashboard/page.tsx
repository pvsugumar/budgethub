'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [_loading, _setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    _setLoading(false);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          amount="$0.00"
          icon="📈"
          color="green"
        />
        <StatCard
          title="Total Expenses"
          amount="$0.00"
          icon="📉"
          color="red"
        />
        <StatCard
          title="Balance"
          amount="$0.00"
          icon="💰"
          color="blue"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <p className="text-gray-600">No transactions yet.</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Budget Overview</h2>
          <p className="text-gray-600">No budgets yet.</p>
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
}: {
  title: string;
  amount: string;
  icon: string;
  color: string;
}) {
  const bgColor = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
  }[color] || 'bg-gray-50';

  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{amount}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
