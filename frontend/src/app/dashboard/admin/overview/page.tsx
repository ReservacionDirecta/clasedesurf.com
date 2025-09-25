"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminOverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState<any>({ classes: [], reservations: [], payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const [classesRes, reservationsRes, paymentsRes] = await Promise.all([
          fetch(`${BACKEND}/classes`, { headers }),
          fetch(`${BACKEND}/reservations/all`, { headers }),
          fetch(`${BACKEND}/payments`, { headers }),
        ]);

        const [classesData, reservationsData, paymentsData] = await Promise.all([
          classesRes.json(),
          reservationsRes.json(),
          paymentsRes.json(),
        ]);

        setSummary({ classes: classesData, reservations: reservationsData, payments: paymentsData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading admin overview...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Platform Overview</h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Classes</h2>
            <p className="mt-2 text-3xl text-gray-900 dark:text-white">{summary.classes.length}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reservations</h2>
            <p className="mt-2 text-3xl text-gray-900 dark:text-white">{summary.reservations.length}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payments</h2>
            <p className="mt-2 text-3xl text-gray-900 dark:text-white">{summary.payments.length}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Recent Reservations</h2>
          <div className="space-y-4">
            {summary.reservations.slice(0, 10).map((r: any) => (
              <div key={r.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Reservation #{r.id}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Class: {r.class?.title || r.classId}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">User: {r.user?.name || r.userId}</div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
