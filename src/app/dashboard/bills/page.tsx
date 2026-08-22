'use client';

import { useState } from 'react';

export default function BillsPage() {
  const [bills, setBills] = useState([]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Bills</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Add Bill Reminder</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Name
              </label>
              <input type="text" className="input" placeholder="Electric Bill" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input type="number" className="input" placeholder="100.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Day of Month)
              </label>
              <input type="number" className="input" placeholder="15" min="1" max="31" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select className="input">
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Bill
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Upcoming Bills</h2>
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No bills added yet. Add one to get reminders!</p>
        </div>
      </div>
    </div>
  );
}
