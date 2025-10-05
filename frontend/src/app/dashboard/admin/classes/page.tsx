"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    capacity: '',
    price: '',
    level: 'BEGINNER',
    instructor: '',
    schoolId: ''
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
        const [classesRes, schoolsRes] = await Promise.all([
          fetch('/api/classes', { headers }),
          fetch('/api/schools', { headers })
        ]);

        if (!classesRes.ok || !schoolsRes.ok) throw new Error('Failed to fetch data');
        
        const [classesData, schoolsData] = await Promise.all([
          classesRes.json(),
          schoolsRes.json()
        ]);
        
        setClasses(classesData);
        setSchools(schoolsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          schoolId: parseInt(formData.schoolId)
        })
      });

      if (!res.ok) throw new Error('Failed to create class');
      
      // Refresh classes list
      const classesRes = await fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      const classesData = await classesRes.json();
      setClasses(classesData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        duration: '',
        capacity: '',
        price: '',
        level: 'BEGINNER',
        instructor: '',
        schoolId: ''
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create class');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch('/api/classes/${classId}', {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Failed to delete class');
      
      // Refresh classes list
      setClasses(classes.filter(c => c.id !== classId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete class');
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading classes...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Classes</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create New Class'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
            <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <select
                  required
                  value={formData.schoolId}
                  onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Instructor name (optional)"
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {classes && classes.length > 0 ? (
            classes.map((cls) => (
              <div key={cls.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{cls.title}</h3>
                    <p className="text-gray-600 mt-1">{cls.description}</p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">School:</span> {cls.school?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(cls.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {cls.duration} min
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {cls.capacity}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ${cls.price}
                      </div>
                      <div>
                        <span className="font-medium">Level:</span> {cls.level}
                      </div>
                      <div>
                        <span className="font-medium">Instructor:</span> {cls.instructor || 'Not assigned'}
                      </div>
                      <div>
                        <span className="font-medium">Occupancy:</span> {cls.paymentInfo?.totalReservations || 0}/{cls.capacity}
                      </div>
                    </div>
                    
                    {/* Payment Information */}
                    {cls.paymentInfo && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <h4 className="font-medium text-sm mb-2">Payment Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Total Reservations:</span> {cls.paymentInfo.totalReservations}
                          </div>
                          <div>
                            <span className="font-medium">Paid Reservations:</span> {cls.paymentInfo.paidReservations}
                          </div>
                          <div>
                            <span className="font-medium">Total Revenue:</span> ${cls.paymentInfo.totalRevenue.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Occupancy Rate:</span> {cls.paymentInfo.occupancyRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
              No classes found. Create your first class!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}