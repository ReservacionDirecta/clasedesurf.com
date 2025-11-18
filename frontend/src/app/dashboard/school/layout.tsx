'use client';

import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20 lg:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
