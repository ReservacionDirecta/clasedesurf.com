"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ClassFormProps {
  schoolId: number;
  classData?: any; // for editing
  onSuccess: () => void;
}

export default function ClassForm({ schoolId, classData, onSuccess }: ClassFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: classData?.title || '',
    description: classData?.description || '',
    date: classData?.date ? new Date(classData.date).toISOString().substring(0, 16) : '',
    duration: classData?.duration || 120,
    capacity: classData?.capacity || 8,
    price: classData?.price || 25,
    level: classData?.level || 'BEGINNER',
    instructorId: classData?.instructorId || null,
  });
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch instructors of the school to populate the selector
    const fetchInstructors = async () => {
      // This is a simplified approach. In a real app, you'd fetch users with role INSTRUCTOR and same schoolId
      const token = (session as any)?.backendToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const allUsers = await res.json();
        const schoolInstructors = allUsers.filter((u: any) => u.role === 'INSTRUCTOR' && u.schoolId === schoolId);
        setInstructors(schoolInstructors);
      }
    };
    if (session) fetchInstructors();
  }, [session, schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = (session as any)?.backendToken;
      const method = classData ? 'PUT' : 'POST';
      const url = classData
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/classes/${classData.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/classes`;

      const body = {
        ...formData,
        schoolId,
        instructorId: formData.instructorId ? Number(formData.instructorId) : null,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        duration: Number(formData.duration),
        date: new Date(formData.date).toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save class');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{classData ? 'Edit Class' : 'Create New Class'}</h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="input-marketplace mt-1" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="input-marketplace mt-1"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date and Time</label>
          <input type="datetime-local" name="date" id="date" value={formData.date} onChange={handleChange} required className="input-marketplace mt-1" />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level</label>
          <select name="level" id="level" value={formData.level} onChange={handleChange} required className="input-marketplace mt-1">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="input-marketplace mt-1" />
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
          <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} required className="input-marketplace mt-1" />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (min)</label>
          <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} required className="input-marketplace mt-1" />
        </div>
      </div>

      <div>
        <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
        <select name="instructorId" id="instructorId" value={formData.instructorId || ''} onChange={handleChange} className="input-marketplace mt-1">
          <option value="">No instructor assigned</option>
          {instructors.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onSuccess} className="btn-outline-marketplace">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary-marketplace">
          {loading ? 'Saving...' : 'Save Class'}
        </button>
      </div>
    </form>
  );
}