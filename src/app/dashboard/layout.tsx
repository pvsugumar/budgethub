'use client';

import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 md:ml-0 ml-0 pt-16 md:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
