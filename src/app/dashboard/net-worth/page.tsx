'use client';

import { useState, useEffect } from 'react';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  subtype: string | null;
  mask: string | null;
  balance: number;
}

export default function NetWorthPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/bank-accounts?userId=${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setAccounts)
      .finally(() => setLoading(false));
  }, []);

  // Plaid balances for credit/loan accounts represent amount owed (liabilities)
  const liabilityTypes = ['credit', 'loan'];
  const assets = accounts.filter((a) => !liabilityTypes.includes(a.type));
  const liabilities = accounts.filter((a) => liabilityTypes.includes(a.type));

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading net worth...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">💎 Net Worth</h1>
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-600">
          <p>No bank accounts linked yet. Link a bank account in Settings to see your net worth.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">💎 Net Worth</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Net Worth Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-lg border-2 border-green-200">
          <p className="text-gray-700 text-sm font-semibold">TOTAL NET WORTH</p>
          <p className="text-5xl font-bold text-green-600 mt-4">${netWorth.toFixed(2)}</p>
        </div>

        {/* Assets vs Liabilities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Assets</p>
            <p className="text-3xl font-bold text-green-600 mt-2">${totalAssets.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Total Liabilities</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${totalLiabilities.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Assets Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-6">Assets Breakdown</h2>
        {assets.length === 0 ? (
          <p className="text-gray-600">No asset accounts linked.</p>
        ) : (
          <div className="space-y-4">
            {assets.map((item) => {
              const percent = totalAssets > 0 ? (item.balance / totalAssets) * 100 : 0;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">
                      {item.name} {item.mask ? `••••${item.mask}` : ''}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">${item.balance.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">{percent.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Liabilities Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Liabilities Breakdown</h2>
        {liabilities.length === 0 ? (
          <p className="text-gray-600">No liability accounts linked.</p>
        ) : (
          <div className="space-y-4">
            {liabilities.map((item) => {
              const percent = totalLiabilities > 0 ? (item.balance / totalLiabilities) * 100 : 0;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">
                      {item.name} {item.mask ? `••••${item.mask}` : ''}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">${item.balance.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">{percent.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

