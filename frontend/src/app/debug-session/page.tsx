'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleRedirect = () => {
    if (session?.user?.role) {
      switch (session.user.role) {
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'SCHOOL_ADMIN':
          router.push('/dashboard/school');
          break;
        case 'STUDENT':
        default:
          router.push('/dashboard/student/profile');
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Session</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          {session?.user ? (
            <div>
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Role:</strong> {session.user.role}</p>
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button
            onClick={handleRedirect}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
          >
            Redirect to Dashboard
          </button>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
          >
            Force Admin Dashboard
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}