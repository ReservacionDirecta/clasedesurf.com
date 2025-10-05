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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    phone: '',
    email: ''
  });

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

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${BACKEND}/schools`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create school');
      
      // Refresh schools list
      const schoolsRes = await fetch(`${BACKEND}/schools`, { headers: { Authorization: `Bearer ${token}` } });
      const schoolsData = await schoolsRes.json();
      setSchools(schoolsData);
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        phone: '',
        email: ''
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create school');
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading schools...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Schools</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create New School'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New School</h2>
            <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Create School
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="space-y-4">
          {schools && schools.length > 0 ? (
            schools.map((s) => (
              <div key={s.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{s.name}</h3>
                    <p className="text-gray-600 mt-1">{s.location}</p>
                    {s.description && (
                      <p className="text-gray-500 mt-2">{s.description}</p>
                    )}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {s.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {s.phone}
                        </div>
                      )}
                      {s.email && (
                        <div>
                          <span className="font-medium">Email:</span> {s.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link 
                      href={`/dashboard/admin/schools/${s.id}`} 
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View / Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
              No schools found. Create your first school!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
