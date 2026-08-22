'use client';

export default function SpendingPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">💸 Spending Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">This Month</p>
          <p className="text-3xl font-bold text-red-600 mt-2">$2,450.00</p>
          <p className="text-gray-500 text-xs mt-2">↑ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Budget Remaining</p>
          <p className="text-3xl font-bold text-green-600 mt-2">$3,550.00</p>
          <p className="text-gray-500 text-xs mt-2">71% of budget available</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Daily Average</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">$81.67</p>
          <p className="text-gray-500 text-xs mt-2">Based on 30 days</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Spending by Category</h2>
        <div className="space-y-4">
          {[
            { category: 'Food & Dining', amount: 650, percent: 26.5 },
            { category: 'Transportation', amount: 420, percent: 17.1 },
            { category: 'Entertainment', amount: 380, percent: 15.5 },
            { category: 'Utilities', amount: 450, percent: 18.4 },
            { category: 'Other', amount: 550, percent: 22.5 },
          ].map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-700">{item.category}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-gray-900">${item.amount}</p>
                <p className="text-gray-500 text-sm">{item.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Monthly Trend</h2>
        <div className="h-64 flex items-end justify-around bg-gray-50 p-4 rounded">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, i) => (
            <div key={month} className="flex flex-col items-center">
              <div
                className="bg-blue-500 rounded-t w-10"
                style={{ height: `${100 + (i * 20 - 70)}px` }}
              />
              <p className="text-sm text-gray-600 mt-2">{month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
