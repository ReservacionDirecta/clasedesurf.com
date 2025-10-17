import { SchoolNavbar } from '@/components/layout/SchoolNavbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolNavbar />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
