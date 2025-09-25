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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{school.name}</h1>
        <div className="text-gray-700 dark:text-gray-300 mb-4">{school.description}</div>
        <div className="grid grid-cols-1 gap-2 text-gray-900 dark:text-white">
          <div><strong>Location:</strong> {school.location}</div>
          <div><strong>Phone:</strong> {school.phone || '—'}</div>
          <div><strong>Email:</strong> {school.email || '—'}</div>
        </div>
      </div>
    </div>
  );
}
