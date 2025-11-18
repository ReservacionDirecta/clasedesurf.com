'use client';

import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-6 pb-20 lg:pb-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}