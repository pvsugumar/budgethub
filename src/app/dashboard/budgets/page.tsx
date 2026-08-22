'use client';

export default function BudgetsPage() {

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Budgets</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Create Budget</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input type="text" className="input" placeholder="Food" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Limit
              </label>
              <input type="number" className="input" placeholder="500.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select className="input">
                <option>January</option>
                <option>February</option>
                <option>March</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Budget
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="text-center py-12 text-gray-600 col-span-full">
          <p className="text-lg">No budgets yet. Create one to get started!</p>
        </div>
      </div>
    </div>
  );
}
