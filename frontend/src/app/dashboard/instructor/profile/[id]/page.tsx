"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InstructorProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;

  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchInstructor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const res = await fetch(`${BACKEND}/users/${id}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch instructor profile');
        const data = await res.json();
        setInstructor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [session, status, router, id]);

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading instructor profile...</div>;

  if (!instructor) return <div className="p-8 dark:text-white">Instructor not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{instructor.name}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{instructor.email}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Assigned Classes</h2>
          <div className="space-y-4">
            {instructor.classes && instructor.classes.length > 0 ? (
              instructor.classes.map((c: any) => (
                <div key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{c.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.description}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(c.date).toLocaleDateString()} | {c.level}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">This instructor has no classes assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}