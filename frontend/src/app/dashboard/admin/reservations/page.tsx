"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Using API proxy routes instead of direct backend calls
        const res = await fetch('/api/reservations/all', { headers });
        if (!res.ok) throw new Error('Failed to fetch reservations');
        const data = await res.json();
        setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [session, status, router]);

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update reservation');
      
      // Update local state
      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to update reservation status');
    }
  };

  const filteredReservations = filter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading reservations...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PAID">Paid</option>
              <option value="CANCELED">Canceled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations && filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{reservation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{reservation.user?.name || 'N/A'}</div>
                          <div className="text-gray-500">{reservation.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{reservation.class?.title || 'N/A'}</div>
                          <div className="text-gray-500">{reservation.class?.school?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.class?.date ? new Date(reservation.class.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={reservation.status}
                          onChange={(e) => updateReservationStatus(reservation.id, e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PAID">Paid</option>
                          <option value="CANCELED">Canceled</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No reservations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {reservations && reservations.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status === 'PENDING').length}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reservations.filter(r => r.status === 'CONFIRMED').length}
                </div>
                <div className="text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.status === 'PAID').length}
                </div>
                <div className="text-gray-600">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {reservations.filter(r => r.status === 'CANCELED').length}
                </div>
                <div className="text-gray-600">Canceled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {reservations.filter(r => r.status === 'COMPLETED').length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}