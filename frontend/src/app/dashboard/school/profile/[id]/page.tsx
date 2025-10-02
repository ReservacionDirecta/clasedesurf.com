"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClassForm from '@/components/classes/ClassForm';

export default function SchoolProfilePage({ params }: { params: { id?: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const id = params?.id;

  const [school, setSchool] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const fetchSchoolData = async () => {
    if (!id || !session) return;
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [schoolRes, payoutsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools/${id}`, { headers }),
        (session as any).user.role === 'SCHOOL_ADMIN' || (session as any).user.role === 'ADMIN'
          ? fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payouts/school`, { headers })
          : Promise.resolve(null)
      ]);

      if (!schoolRes.ok) throw new Error('Failed to fetch school');
      const schoolData = await schoolRes.json();
      setSchool(schoolData);

      if (payoutsRes && payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchoolData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router, id]);

  const handleDelete = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    // ... (delete logic remains the same)
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClass(null);
    fetchSchoolData(); // Refetch all data
  };

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading school dashboard...</div>;
  if (!school) return <div className="p-8 dark:text-white">School not found.</div>;

  const instructors = school.classes.map((c: any) => c.instructor).filter(Boolean);
  const students = school.classes.flatMap((c: any) => c.reservations.map((r: any) => r.user));
  const canManage = (session as any)?.user?.role === 'ADMIN' || ((session as any)?.user?.role === 'SCHOOL_ADMIN' && (session as any)?.user?.schoolId === school.id);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
              <ClassForm schoolId={school.id} classData={editingClass} onSuccess={handleFormSuccess} />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{school.name}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{school.description}</p>
          {/* ... other school details */}
        </div>

        {canManage && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg dark:text-white">Payout History</h3>
                <div className="space-y-2 mt-2">
                  {payouts.map(p => (
                    <div key={p.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                       <div className="font-semibold dark:text-white">${p.amount.toFixed(2)} - {p.status}</div>
                       <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.periodStartDate).toLocaleDateString()} to {new Date(p.periodEndDate).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg dark:text-white">Sales per Class</h3>
                <div className="space-y-2 mt-2">
                  {school.classes.map((c: any) => {
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Class management section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Classes</h2>
              {canManage && (
                <button
                  onClick={() => { setEditingClass(null); setShowForm(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add New Class
                </button>
              )}
            </div>
            <div className="space-y-4">
              {school.classes.map((c: any) => (
                <div key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{c.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{c.description}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(c.date).toLocaleDateString()} | {c.level} | Instructor: {c.instructor?.name || 'N/A'}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingClass(c); setShowForm(true); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* Instructors and Students section */}
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Team & Students</h2>
             <div className="space-y-3">
              <h3 className="font-semibold text-lg dark:text-white">Instructors</h3>
              {instructors.map((i: any) => (
                <Link href={`/dashboard/instructor/profile/${i.id}`} key={i.id} className="block p-3 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <p className="font-semibold text-gray-900 dark:text-white">{i.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{i.email}</p>
                </Link>
              ))}
            </div>
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-lg dark:text-white">Students</h3>
              {students.map((s: any) => (
                <div key={s.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                  <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}