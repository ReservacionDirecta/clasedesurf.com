"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminSchoolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchSchools = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${BACKEND}/schools`, { headers });
        if (!res.ok) throw new Error('Failed to fetch schools');
        const data = await res.json();
        setSchools(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="p-8 dark:text-white">Loading schools...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Schools</h1>
        <div className="space-y-4">
          {schools.map((s) => (
            <div key={s.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{s.location}</div>
              </div>
              <div>
                <Link href={`/dashboard/school/profile/${s.id}`} className="text-blue-600 dark:text-blue-400">View / Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
