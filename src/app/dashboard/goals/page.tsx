'use client';

export default function GoalsPage() {

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Savings Goals</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Set New Goal</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input type="text" className="input" placeholder="Vacation Fund" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount
              </label>
              <input type="number" className="input" placeholder="5000.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input type="text" className="input" placeholder="Travel" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input type="date" className="input" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Goal
          </button>
        </form>
      </div>

      <div className="text-center py-12 text-gray-600">
        <p className="text-lg">No goals yet. Set your first goal to start tracking!</p>
      </div>
    </div>
  );
}
