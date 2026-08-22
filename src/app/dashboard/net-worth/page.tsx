'use client';

export default function NetWorthPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">💎 Net Worth</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Net Worth Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-lg border-2 border-green-200">
          <p className="text-gray-700 text-sm font-semibold">TOTAL NET WORTH</p>
          <p className="text-5xl font-bold text-green-600 mt-4">$45,250.00</p>
          <p className="text-green-600 font-semibold mt-4">↑ $2,150 (4.9%) from last month</p>
        </div>

        {/* Assets vs Liabilities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Assets</p>
            <p className="text-3xl font-bold text-green-600 mt-2">$65,500.00</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Total Liabilities</p>
            <p className="text-3xl font-bold text-red-600 mt-2">$20,250.00</p>
          </div>
        </div>
      </div>

      {/* Assets Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-6">Assets Breakdown</h2>
        <div className="space-y-4">
          {[
            { asset: 'Savings Account', amount: 12500, percent: 19.1 },
            { asset: 'Checking Account', amount: 5200, percent: 7.9 },
            { asset: 'Investment Portfolio', amount: 28000, percent: 42.7 },
            { asset: 'Real Estate Equity', amount: 15000, percent: 22.9 },
            { asset: 'Other Assets', amount: 4800, percent: 7.3 },
          ].map((item) => (
            <div key={item.asset} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-700">{item.asset}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-gray-900">${item.amount.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{item.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-6">Liabilities Breakdown</h2>
        <div className="space-y-4">
          {[
            { liability: 'Mortgage', amount: 12000, percent: 59.2 },
            { liability: 'Car Loan', amount: 6250, percent: 30.8 },
            { liability: 'Credit Card Debt', amount: 2000, percent: 10 },
          ].map((item) => (
            <div key={item.liability} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-700">{item.liability}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-gray-900">${item.amount.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{item.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Net Worth Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Net Worth Growth</h2>
        <div className="h-64 flex items-end justify-around bg-gray-50 p-4 rounded">
          {[
            { month: 'Jan', value: 38000 },
            { month: 'Feb', value: 39500 },
            { month: 'Mar', value: 40200 },
            { month: 'Apr', value: 41800 },
            { month: 'May', value: 42500 },
            { month: 'Jun', value: 43200 },
            { month: 'Jul', value: 44100 },
            { month: 'Aug', value: 45250 },
          ].map((data) => (
            <div key={data.month} className="flex flex-col items-center">
              <div
                className="bg-green-500 rounded-t w-10"
                style={{ height: `${(data.value / 50000) * 200}px` }}
              />
              <p className="text-sm text-gray-600 mt-2">{data.month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
