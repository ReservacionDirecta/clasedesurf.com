import { AdminNavbar } from '@/components/layout/AdminNavbar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}