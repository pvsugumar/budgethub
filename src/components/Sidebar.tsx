'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState('');

  // Get user info from localStorage
  useEffect(() => {
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    setUserName(name || email || 'User');
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Redirect to login
    router.push('/auth/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/spending', label: 'Spending', icon: '💸' },
    { href: '/dashboard/net-worth', label: 'Net Worth', icon: '💎' },
    { href: '/dashboard/transactions', label: 'Transactions', icon: '📝' },
    { href: '/dashboard/budgets', label: 'Budgets', icon: '🎯' },
    { href: '/dashboard/goals', label: 'Goals', icon: '🚀' },
    { href: '/dashboard/bills', label: 'Bills', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Hamburger Button - Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg shadow-lg border-b-2 border-green-500"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r-4 border-green-500 shadow-xl transition-transform duration-300 z-40 overflow-y-auto flex flex-col`}
      >
        <div className="flex-1 p-6">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-white flex items-center gap-2 mb-8"
          >
            📈 Budget<span className="text-green-400">Hub</span>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold border-l-4 border-green-400 shadow-md'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-green-400'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-green-700 p-6">
          <div className="mb-4 pb-4 border-b border-green-700">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
