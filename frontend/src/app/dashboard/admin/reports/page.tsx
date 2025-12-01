"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

// Helper functions for filtering data
function filterReservationsByDateRange(reservations: any[], startDate: string, endDate: string) {
  return reservations.filter((r: any) => {
    if (!r.createdAt) return false;
    const reservationDate = new Date(r.createdAt).toISOString().split('T')[0];
    return reservationDate >= startDate && reservationDate <= endDate;
  });
}

function filterClassesByDateRange(classes: any[], startDate: string, endDate: string) {
  return classes.filter((c: any) => {
    if (!c.date) return false;
    const classDate = new Date(c.date).toISOString().split('T')[0];
    return classDate >= startDate && classDate <= endDate;
  });
}

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

  // Filter data by date range with safety checks using useMemo for performance
  const filteredData = useMemo(() => {
    const reservationsArray = Array.isArray(data.reservations) ? data.reservations : [];
    const classesArray = Array.isArray(data.classes) ? data.classes : [];
    
    return { 
      reservations: filterReservationsByDateRange(reservationsArray, dateRange.start, dateRange.end),
      classes: filterClassesByDateRange(classesArray, dateRange.start, dateRange.end)
    };
  }, [data.reservations, data.classes, dateRange.start, dateRange.end]);

  // Calculate metrics using useMemo
  const metrics = useMemo(() => {
    const { reservations: filteredReservations, classes: filteredClasses } = filteredData;
    
    const totalRevenue = filteredReservations
      .filter((r: any) => r.status === 'PAID')
      .reduce((sum: number, r: any) => sum + (r.class?.price || 0), 0);

    const averageClassCapacity = filteredClasses.length > 0 
      ? filteredClasses.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0) / filteredClasses.length 
      : 0;

    const totalCapacity = filteredClasses.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0);
    const bookingRate = totalCapacity > 0
      ? (filteredReservations.filter((r: any) => r.status !== 'CANCELED').length / totalCapacity) * 100
      : 0;

    // Group reservations by status
    const reservationsByStatus = filteredReservations.reduce((acc: any, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      averageClassCapacity,
      bookingRate,
      reservationsByStatus
    };
  }, [filteredData]);

  // Additional calculations using useMemo
  const additionalData = useMemo(() => {
    const { reservations: filteredReservations, classes: filteredClasses } = filteredData;
    
    // Group classes by level
    const classesByLevel = filteredClasses.reduce((acc: any, c: any) => {
      acc[c.level] = (acc[c.level] || 0) + 1;
      return acc;
    }, {});

    // Top performing schools with safety checks
    const schoolPerformance = (data.schools || []).map((school: any) => {
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

    return { classesByLevel, schoolPerformance };
  }, [filteredData, data.schools]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Reports & Analytics' }
      ]} />
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">${metrics.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">From paid reservations</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Reservations</h3>
              <p className="text-3xl font-bold text-blue-600">{filteredData.reservations.length}</p>
              <p className="text-xs text-gray-500 mt-1">In selected period</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Booking Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics.bookingRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Capacity utilization</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Avg Class Size</h3>
              <p className="text-3xl font-bold text-orange-600">{metrics.averageClassCapacity.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">Students per class</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reservation Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservations by Status</h2>
          <div className="space-y-3">
            {Object.entries(metrics.reservationsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{status.toLowerCase()}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${filteredData.reservations.length > 0 ? ((count as number) / filteredData.reservations.length) * 100 : 0}%`}}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes by Level */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Classes by Level</h2>
          <div className="space-y-3">
            {Object.entries(additionalData.classesByLevel).map(([level, count]) => (
              <div key={level} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{level.toLowerCase()}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${filteredData.classes.length > 0 ? ((count as number) / filteredData.classes.length) * 100 : 0}%`}}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* School Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">School Performance</h2>
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
              {additionalData.schoolPerformance.map((school: any) => (
                <tr key={school.id} className="hover:bg-gray-50">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(data.users || []).filter((u: any) => u.role === 'STUDENT').length}
            </div>
            <div className="text-blue-700 font-medium">Students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(data.users || []).filter((u: any) => u.role === 'SCHOOL_ADMIN').length}
            </div>
            <div className="text-green-700 font-medium">School Admins</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {(data.users || []).filter((u: any) => u.role === 'ADMIN').length}
            </div>
            <div className="text-purple-700 font-medium">Platform Admins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
