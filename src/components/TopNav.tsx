'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const tabs = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/bills', label: 'Bills' },
  { href: '/dashboard/budgets', label: 'Budgets' },
  { href: '/dashboard/goals', label: 'Goals' },
  { href: '/dashboard/spending', label: 'Trends' },
  { href: '/dashboard/net-worth', label: 'Net Worth' },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    setUserName(name || email || 'User');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/auth/login');
  };

  const initial = userName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="sticky top-0 z-40">
      {/* Top bar */}
      <header className="bg-[#0b1f14] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-white text-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="text-emerald-400">💰</span>
              <span>BudgetHub</span>
            </Link>
          </div>

          <div className="flex items-center gap-5 text-sm text-gray-300">
            <Link href="/dashboard/settings" className="hidden sm:inline hover:text-white transition-colors">
              Settings
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  {initial}
                </span>
                <span className="hidden sm:inline">{userName}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile & Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav
        className={`bg-white border-b border-gray-200 shadow-sm ${
          mobileOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
