"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<any>({
    classes: [],
    reservations: [],
    schools: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Using API proxy routes instead of direct backend calls
        const [classesRes, reservationsRes, schoolsRes, usersRes] = await Promise.all([
          fetch('/api/classes', { headers }),
          fetch('/api/reservations/all', { headers }),
          fetch('/api/schools', { headers }),
          fetch('/api/users', { headers })
        ]);

        const [classesData, reservationsData, schoolsData, usersData] = await Promise.all([
          classesRes.json(),
          reservationsRes.json(),
          schoolsRes.json(),
          usersRes.json()
        ]);

        setData({
          classes: classesData || [],
          reservations: reservationsData || [],
          schools: schoolsData || [],
          users: usersData || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  // Filter data by date range
  const filteredReservations = data.reservations.filter((r: any) => {
    if (!r.createdAt) return false;
    const reservationDate = new Date(r.createdAt).toISOString().split('T')[0];
    return reservationDate >= dateRange.start && reservationDate <= dateRange.end;
  });

  const filteredClasses = data.classes.filter((c: any) => {
    if (!c.date) return false;
    const classDate = new Date(c.date).toISOString().split('T')[0];
    return classDate >= dateRange.start && classDate <= dateRange.end;
  });

  // Calculate metrics
  const totalRevenue = filteredReservations
    .filter((r: any) => r.status === 'PAID')
    .reduce((sum: number, r: any) => sum + (r.class?.price || 0), 0);

  const averageClassCapacity = filteredClasses.length > 0 
    ? filteredClasses.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0) / filteredClasses.length 
    : 0;

  const bookingRate = filteredClasses.length > 0
    ? (filteredReservations.filter((r: any) => r.status !== 'CANCELED').length / 
       filteredClasses.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0)) * 100
    : 0;

  // Group reservations by status
  const reservationsByStatus = filteredReservations.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // Group classes by level
  const classesByLevel = filteredClasses.reduce((acc: any, c: any) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});

  // Top performing schools
  const schoolPerformance = data.schools.map((school: any) => {
    const schoolClasses = filteredClasses.filter((c: any) => c.schoolId === school.id);
    const schoolReservations = filteredReservations.filter((r: any) => 
      schoolClasses.some((c: any) => c.id === r.classId)
    );
    const revenue = schoolReservations
      .filter((r: any) => r.status === 'PAID')
      .reduce((sum: number, r: any) => sum + (r.class?.price || 0), 0);
    
    return {
      ...school,
      classCount: schoolClasses.length,
      reservationCount: schoolReservations.length,
      revenue
    };
  }).sort((a: any, b: any) => b.revenue - a.revenue);

  if (status === 'loading' || loading) return <div className="p-8">Loading reports...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500">From paid reservations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Reservations</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredReservations.length}</p>
            <p className="text-sm text-gray-500">In selected period</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Booking Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{bookingRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Capacity utilization</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Avg Class Size</h3>
            <p className="text-3xl font-bold text-orange-600">{averageClassCapacity.toFixed(0)}</p>
            <p className="text-sm text-gray-500">Students per class</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservation Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reservations by Status</h2>
            <div className="space-y-3">
              {Object.entries(reservationsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize">{status.toLowerCase()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${((count as number) / filteredReservations.length) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classes by Level */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Classes by Level</h2>
            <div className="space-y-3">
              {Object.entries(classesByLevel).map(([level, count]) => (
                <div key={level} className="flex justify-between items-center">
                  <span className="capitalize">{level.toLowerCase()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${((count as number) / filteredClasses.length) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* School Performance */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">School Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schoolPerformance.map((school: any) => (
                  <tr key={school.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">{school.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.classCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.reservationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${school.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Statistics */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {data.users.filter((u: any) => u.role === 'STUDENT').length}
              </div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {data.users.filter((u: any) => u.role === 'SCHOOL_ADMIN').length}
              </div>
              <div className="text-gray-600">School Admins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {data.users.filter((u: any) => u.role === 'ADMIN').length}
              </div>
              <div className="text-gray-600">Platform Admins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}