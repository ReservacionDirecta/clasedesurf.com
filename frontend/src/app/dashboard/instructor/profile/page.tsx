"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InstructorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || ((session as any).user?.role !== 'INSTRUCTOR' && (session as any).user?.role !== 'ADMIN')) {
      router.push('/denied');
      return;
    }

    const fetchInstructor = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = { 'Authorization': `Bearer ${token}` };

        const userId = (session as any).user.id;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const res = await fetch(`${BACKEND}/users/${userId}`, { headers });

        if (!res.ok) throw new Error('Failed to fetch instructor profile');

        const data = await res.json();
        setInstructor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchInstructor();
    }
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading instructor profile...</div>;

  if (!instructor) return <div className="p-8 dark:text-white">Instructor not found</div>;

  const totalSales = instructor.classes
    .flatMap((c: any) => c.reservations)
    .filter((r: any) => r.payment && r.payment.status === 'PAID')
    .reduce((sum: number, r: any) => sum + r.payment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{instructor.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{instructor.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Role: {instructor.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Classes Dashboard</h2>
            <div className="space-y-6">
              {instructor.classes && instructor.classes.length > 0 ? (
                instructor.classes.map((c: any) => (
                  <div key={c.id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(c.date).toLocaleDateString('es-ES', { dateStyle: 'full' })} - {c.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {c.reservations?.length || 0} / {c.capacity} Students
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-md text-gray-800 dark:text-gray-200 mb-2">Enrolled Students:</h4>
                      {c.reservations && c.reservations.length > 0 ? (
                        <ul className="space-y-2">
                          {c.reservations.map((r: any) => (
                            <li key={r.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-gray-800 dark:text-gray-200">{r.user.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{r.user.email}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No students enrolled yet.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">You have no classes assigned.</p>
              )}
            </div>
          </div>
          <div className="md:col-span-1">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Sales</h2>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  ${totalSales.toFixed(2)}
                </div>
                <h3 className="font-semibold text-lg dark:text-white mb-2">Sales per Class:</h3>
                <div className="space-y-2">
                  {instructor.classes.map((c: any) => {
                    const classSales = c.reservations
                      .filter((r: any) => r.payment && r.payment.status === 'PAID')
                      .reduce((sum: number, r: any) => sum + r.payment.amount, 0);
                    return (
                      <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between">
                        <span className="text-sm font-medium dark:text-white">{c.title}</span>
                        <span className="text-sm font-bold dark:text-white">${classSales.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}