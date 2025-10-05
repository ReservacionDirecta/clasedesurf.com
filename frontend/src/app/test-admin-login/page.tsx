'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestAdminLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const testAdminLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const loginResult = await signIn('credentials', {
        redirect: false,
        email: 'admin@clasedesurf.com',
        password: 'admin123',
      });

      setResult(loginResult);

      if (loginResult?.ok) {
        // Wait a bit for session to update
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setResult({ error: 'Login failed', details: error });
    } finally {
      setLoading(false);
    }
  };

  const redirectToAdmin = () => {
    router.push('/dashboard/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Admin Login</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <p><strong>Status:</strong> {status}</p>
          {session && (
            <div className="mt-4">
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
              <p><strong>Role Type:</strong> {typeof session.user?.role}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Admin Login</h2>
          <p className="mb-4">
            This will attempt to login with:
            <br />
            <strong>Email:</strong> admin@clasedesurf.com
            <br />
            <strong>Password:</strong> admin123
          </p>
          
          <button
            onClick={testAdminLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
          >
            {loading ? 'Logging in...' : 'Test Admin Login'}
          </button>

          <button
            onClick={redirectToAdmin}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Admin Dashboard
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Login Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Role Comparison Test</h2>
          {session?.user?.role && (
            <div>
              <p><strong>Current Role:</strong> &quot;{session.user.role}&quot;</p>
              <p><strong>Is ADMIN (===):</strong> {String(session.user.role === 'ADMIN')}</p>
              <p><strong>Is ADMIN (==):</strong> {String(session.user.role == 'ADMIN')}</p>
              <p><strong>Includes ADMIN:</strong> {String(session.user.role.includes('ADMIN'))}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}