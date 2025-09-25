'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading

    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied'); // Redirect to access denied page if not admin
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="dark:text-white">Loading or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Welcome, {(session as any).user?.name} ({(session as any).user?.role})</p>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Management Options</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/admin/overview" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Platform Overview</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Quick metrics and recent activity.</p>
            </Link>
            <Link href="/dashboard/admin/classes" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Manage Classes</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Create, view, update, and delete surf classes.</p>
            </Link>
            <Link href="/dashboard/admin/schools" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Manage Schools</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Add and manage surf schools in the platform.</p>
            </Link>
            <Link href="/dashboard/admin/reservations" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">View All Reservations</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Monitor and manage all bookings across schools.</p>
            </Link>
            <Link href="/dashboard/admin/reports" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Generate Reports</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Access sales and class statistics.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
