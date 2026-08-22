'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState('');

  // Get user info from localStorage
  React.useEffect(() => {
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-transform duration-300 z-40 overflow-y-auto flex flex-col`}
      >
        <div className="flex-1 p-6">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-8 block"
          >
            💰 BudgetHub
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
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-semibold border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
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
        <div className="border-t border-gray-200 p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
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
