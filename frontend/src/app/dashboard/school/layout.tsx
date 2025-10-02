import { SchoolNavbar } from '@/components/layout/SchoolNavbar';

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolNavbar />
      <main>{children}</main>
    </div>
  );
}
