'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b-4 border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">📈</span> Budget<span className="text-green-400">Hub</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/dashboard/transactions" label="Transactions" />
            <NavLink href="/dashboard/budgets" label="Budgets" />
            <NavLink href="/dashboard/goals" label="Goals" />
            <NavLink href="/dashboard/bills" label="Bills" />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:bg-slate-700 rounded-lg"
          >
            ☰
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-slate-800 rounded-lg mt-2">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/dashboard/transactions" label="Transactions" />
            <NavLink href="/dashboard/budgets" label="Budgets" />
            <NavLink href="/dashboard/goals" label="Goals" />
            <NavLink href="/dashboard/bills" label="Bills" />
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-gray-600 hover:text-blue-600 transition-colors">
      {label}
    </Link>
  );
}
