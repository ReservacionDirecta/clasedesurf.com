"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SchoolProfilePage({ params }: { params: { id?: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const id = params?.id;

  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchSchool = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${BACKEND}/schools/${id}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch school');
        const data = await res.json();
        setSchool(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [session, status, router, id]);

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading school...</div>;

  if (!school) return <div className="p-8 dark:text-white">School not found</div>;

  const instructors = school.classes.map((c: any) => c.instructor).filter((i: any) => i);
  const students = school.classes.flatMap((c: any) => c.reservations.map((r: any) => r.user));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{school.name}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{school.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-900 dark:text-white">
            <div><strong>Location:</strong> {school.location}</div>
            <div><strong>Phone:</strong> {school.phone || '—'}</div>
            <div><strong>Email:</strong> {school.email || '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Classes</h2>
            <div className="space-y-4">
              {school.classes.map((c: any) => (
                <div key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{c.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.description}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(c.date).toLocaleDateString()} | {c.level} | Instructor: {c.instructor?.name || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Instructors</h2>
            <div className="space-y-3">
              {instructors.map((i: any) => (
                <div key={i.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                  <p className="font-semibold text-gray-900 dark:text-white">{i.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{i.email}</p>
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">Students</h2>
            <div className="space-y-3">
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
