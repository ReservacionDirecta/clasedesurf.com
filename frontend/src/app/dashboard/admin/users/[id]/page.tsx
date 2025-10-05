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
  const [userReservations, setUserReservations] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

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

        // Using API proxy routes instead of direct backend calls
        const [userRes, reservationsRes] = await Promise.all([
          fetch('/api/users/${id}', { headers }),
          fetch('/api/reservations/all', { headers })
        ]);
        
        if (!userRes.ok) throw new Error('Failed to fetch user');
        
        const userData = await userRes.json();
        setUser(userData);
        setEditData(userData);
        
        if (reservationsRes.ok) {
          const allReservations = await reservationsRes.json();
          const userReservations = allReservations.filter((r: any) => r.userId === parseInt(id));
          setUserReservations(userReservations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, status, router, id]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch('/api/users/${id}', {
        method: 'PUT',
        headers,
        body: JSON.stringify(editData)
      });

      if (!res.ok) throw new Error('Failed to update user');
      
      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading user...</div>;

  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Details</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Users
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      value={editData.age || ''}
                      onChange={(e) => setEditData({...editData, age: parseInt(e.target.value) || null})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={editData.weight || ''}
                      onChange={(e) => setEditData({...editData, weight: parseFloat(e.target.value) || null})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={editData.height || ''}
                      onChange={(e) => setEditData({...editData, height: parseFloat(e.target.value) || null})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editData.canSwim || false}
                      onChange={(e) => setEditData({...editData, canSwim: e.target.checked})}
                      className="mr-2"
                    />
                    Can swim
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Injuries/Medical Notes</label>
                  <textarea
                    value={editData.injuries || ''}
                    onChange={(e) => setEditData({...editData, injuries: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {user.role}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {user.phone || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Age:</span> {user.age || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {user.weight ? `${user.weight} kg` : '—'}
                  </div>
                  <div>
                    <span className="font-medium">Height:</span> {user.height ? `${user.height} cm` : '—'}
                  </div>
                  <div>
                    <span className="font-medium">Can swim:</span> {user.canSwim ? 'Yes' : 'No'}
                  </div>
                </div>
                {user.injuries && (
                  <div>
                    <span className="font-medium">Medical Notes:</span>
                    <p className="mt-1 text-gray-600">{user.injuries}</p>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                  <div>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* User Reservations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reservations ({userReservations.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userReservations.length > 0 ? (
                userReservations.map((reservation) => (
                  <div key={reservation.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">#{reservation.id}</div>
                        <div className="text-sm text-gray-600">
                          {reservation.class?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.class?.date ? new Date(reservation.class.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        reservation.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                    {reservation.specialRequest && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Special request:</span> {reservation.specialRequest}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No reservations found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
