'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface NavItem {
  href: string;
  label: string;
  submenu?: { href: string; label: string }[];
}

const navigationItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
  },
  {
    href: '/dashboard/transactions',
    label: 'Transactions',
    submenu: [
      { href: '/dashboard/transactions', label: 'All Transactions' },
      { href: '/dashboard/transactions', label: 'Categories' },
      { href: '/dashboard/transactions', label: 'Merchants' },
      { href: '/dashboard/transactions', label: 'Recurring' },
    ],
  },
  {
    href: '/dashboard/budgets',
    label: 'Planning',
    submenu: [
      { href: '/dashboard/bills', label: 'Bills' },
      { href: '/dashboard/budgets', label: 'Budgets' },
      { href: '/dashboard/goals', label: 'Goals' },
    ],
  },
  {
    href: '/dashboard/spending',
    label: 'Insights',
    submenu: [
      { href: '/dashboard/spending', label: 'Spending Trends' },
      { href: '/dashboard/spending', label: 'Cash Flow' },
      { href: '/dashboard/spending', label: 'Reports' },
      { href: '/dashboard/spending', label: 'Financial Health' },
    ],
  },
  {
    href: '/dashboard/net-worth',
    label: 'Accounts',
    submenu: [
      { href: '/dashboard/net-worth', label: 'Net Worth' },
      { href: '/dashboard/settings', label: 'Connected Accounts' },
      { href: '/dashboard/net-worth', label: 'Assets' },
      { href: '/dashboard/net-worth', label: 'Liabilities' },
    ],
  },
];

export default function UnifiedNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

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
      if (submenuRef.current && !submenuRef.current.contains(e.target as Node)) {
        setOpenSubmenu(null);
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

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isSubmenuActive = (item: NavItem) => {
    if (item.submenu) {
      return item.submenu.some((sub) => pathname.startsWith(sub.href.split('?')[0]));
    }
    return isActive(item.href);
  };

  return (
    <div className="sticky top-0 z-50 bg-[#0b1f14] text-white shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-emerald-400 text-2xl font-bold">💰</span>
            <span className="text-2xl font-bold tracking-tight hidden sm:inline">BudgetHub</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>

          {/* Center: Navigation (Desktop) */}
          <nav
            className={`${
              mobileOpen ? 'flex' : 'hidden md:flex'
            } flex-col md:flex-row absolute md:static left-0 right-0 top-full md:top-auto bg-[#0b1f14] md:bg-transparent border-t md:border-t-0 border-emerald-900 md:border-0 w-full md:w-auto gap-0 md:gap-1`}
          >
            {navigationItems.map((item) => {
              const active = isSubmenuActive(item);
              const hasSubmenu = item.submenu !== undefined && item.submenu.length > 0;
              const primaryHref = hasSubmenu ? item.submenu![0].href : item.href;

              return (
                <div key={item.href} className="relative" ref={submenuRef}>
                  <Link
                    href={primaryHref}
                    onClick={(e) => {
                      // On mobile, prevent default and toggle submenu instead
                      if (window.innerWidth < 768 && hasSubmenu) {
                        e.preventDefault();
                        setOpenSubmenu(openSubmenu === item.href ? null : item.href);
                      } else {
                        setMobileOpen(false);
                      }
                    }}
                    className={`w-full md:w-auto px-4 py-3 md:py-2 text-sm font-medium flex items-center justify-between md:justify-center gap-2 transition-all duration-150 relative group block ${
                      active
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    >
                      {item.label}
                      {hasSubmenu && (
                        <span
                          className={`text-xs transition-transform duration-200 ${
                            openSubmenu === item.href ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      )}

                      {/* Desktop underline */}
                      {active && (
                        <div className="hidden md:block absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-400 rounded-full"></div>
                      )}

                      {/* Hover background */}
                      <div className="hidden md:block absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-8 transition-opacity duration-150 -z-10"></div>
                    </Link>

                  {/* Submenu - Desktop Dropdown */}
                  {hasSubmenu && item.submenu && (
                    <>
                      {/* Desktop Dropdown */}
                      <div
                        className="hidden md:block absolute top-full left-0 mt-1 bg-[#0f2818] border border-emerald-900 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 min-w-[200px]"
                        onMouseLeave={() => setOpenSubmenu(null)}
                      >
                        {item.submenu.map((sub) => {
                          const subActive = pathname.startsWith(sub.href.split('?')[0]);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setOpenSubmenu(null);
                              }}
                              className={`block px-4 py-2.5 text-sm transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                                subActive
                                  ? 'bg-emerald-600 text-white font-medium'
                                  : 'text-gray-300 hover:bg-emerald-500/20 hover:text-white'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Mobile Accordion */}
                      {openSubmenu === item.href && item.submenu && (
                        <div className="md:hidden bg-emerald-950 border-t border-emerald-900">
                          {item.submenu.map((sub) => {
                            const subActive = pathname.startsWith(sub.href.split('?')[0]);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => {
                                  setMobileOpen(false);
                                  setOpenSubmenu(null);
                                }}
                                className={`block px-6 py-2.5 text-sm transition-colors duration-150 ${
                                  subActive
                                    ? 'bg-emerald-600 text-white font-medium'
                                    : 'text-gray-300 hover:bg-emerald-500/20 hover:text-white'
                                }`}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Profile & Notifications */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notification Icon */}
            <button className="p-2 hover:bg-emerald-900/30 rounded-lg transition-colors duration-150">
              <span className="text-lg">🔔</span>
            </button>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-emerald-900/30 transition-colors duration-150"
              >
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  {initial}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <Link
                    href="/dashboard/settings"
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Profile (Bottom of Mobile Menu) */}
          {mobileOpen && (
            <div className="absolute top-full left-0 right-0 border-t border-emerald-900 bg-[#0b1f14] px-4 py-3 md:hidden flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  {initial}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-150"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
