'use client';

import UnifiedNav from '@/components/UnifiedNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNav />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
