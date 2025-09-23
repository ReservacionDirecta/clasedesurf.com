'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<Partial<User>>({
    name: '',
    email: '',
    age: undefined,
    weight: undefined,
    height: undefined,
    canSwim: false,
    injuries: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch user profile data from API
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setUserProfile({
          name: data.name || '',
          email: data.email || '',
          age: data.age || undefined,
          weight: data.weight || undefined,
          height: data.height || undefined,
          canSwim: data.canSwim || false,
          injuries: data.injuries || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setUserProfile((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      // Optionally update the session if the name changed
      await update({ name: userProfile.name });
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg max-w-lg w-full">
        <h3 className="text-2xl font-bold text-center">Your Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="block" htmlFor="name">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="name"
                value={userProfile.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 cursor-not-allowed"
                id="email"
                value={userProfile.email || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block" htmlFor="age">Age</label>
              <input
                type="number"
                placeholder="Age"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="age"
                value={userProfile.age || ''}
                onChange={handleChange}
                min="10"
                max="100"
              />
            </div>
            <div>
              <label className="block" htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                placeholder="Weight in kg"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="weight"
                value={userProfile.weight || ''}
                onChange={handleChange}
                min="30"
                max="200"
                step="0.1"
              />
            </div>
            <div>
              <label className="block" htmlFor="height">Height (cm)</label>
              <input
                type="number"
                placeholder="Height in cm"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="height"
                value={userProfile.height || ''}
                onChange={handleChange}
                min="100"
                max="250"
                step="0.1"
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                id="canSwim"
                checked={userProfile.canSwim || false}
                onChange={handleChange}
              />
              <label className="ml-2 block text-gray-900" htmlFor="canSwim">Can Swim?</label>
            </div>
            <div>
              <label className="block" htmlFor="injuries">Past Injuries/Medical Conditions</label>
              <textarea
                placeholder="Any past injuries or medical conditions?"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="injuries"
                value={userProfile.injuries || ''}
                onChange={handleChange}
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="block" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g., +1234567890"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="phone"
                value={userProfile.phone || ''}
                onChange={handleChange}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
