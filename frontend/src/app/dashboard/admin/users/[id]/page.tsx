"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminUserDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${BACKEND}/users/${id}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, status, router, id]);

  if (status === 'loading' || loading) return <div className="p-8">Loading user...</div>;

  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
        <div className="text-gray-700 mb-4">{user.email}</div>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Phone:</strong> {user.phone || '—'}</div>
          <div><strong>Can swim:</strong> {user.canSwim ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}
