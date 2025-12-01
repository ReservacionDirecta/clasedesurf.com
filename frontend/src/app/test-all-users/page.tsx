'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const testUsers = [
  {
    name: 'Admin (surfschool)',
    email: 'admin@surfschool.com',
    password: 'surfschool123',
    expectedRole: 'ADMIN',
    expectedRedirect: '/dashboard/admin'
  },
  {
    name: 'Admin (clasedesurf)',
    email: 'admin@clasedesurf.com',
    password: 'admin123',
    expectedRole: 'ADMIN',
    expectedRedirect: '/dashboard/admin'
  },
  {
    name: 'School Admin',
    email: 'schooladmin@surfschool.com',
    password: 'surfschool123',
    expectedRole: 'SCHOOL_ADMIN',
    expectedRedirect: '/dashboard/school'
  },
  {
    name: 'Director Escuela',
    email: 'director@escuelalimasurf.com',
    password: 'school123',
    expectedRole: 'SCHOOL_ADMIN',
    expectedRedirect: '/dashboard/school'
  },
  {
    name: 'Student 1',
    email: 'student1@surfschool.com',
    password: 'surfschool123',
    expectedRole: 'STUDENT',
    expectedRedirect: '/dashboard/student/profile'
  }
];

export default function TestAllUsersPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const testLogin = async (user: typeof testUsers[0]) => {
    setLoading(user.email);
    
    try {
      // Sign out first
      await signOut({ redirect: false });
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to sign in
      const result = await signIn('credentials', {
        redirect: false,
        email: user.email,
        password: user.password,
      });

      const newResult = {
        user: user.name,
        email: user.email,
        loginResult: result,
        timestamp: new Date().toISOString()
      };

      setResults(prev => [newResult, ...prev]);

      if (result?.ok) {
        // Wait for session to update
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      const errorResult = {
        user: user.name,
        email: user.email,
        loginResult: { error: 'Exception occurred', details: error },
        timestamp: new Date().toISOString()
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test All Users Login</h1>
        
        {/* Current Session */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <p><strong>Status:</strong> {status}</p>
          {session?.user && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
              </div>
              <div>
                <p><strong>Role:</strong> {session.user.role}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
              </div>
            </div>
          )}
          {session && (
            <button
              onClick={handleSignOut}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Test Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Users</h2>
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testUsers.map((user, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <p className="text-xs text-gray-500 mb-3">
                  Expected: {user.expectedRole} → {user.expectedRedirect}
                </p>
                <button
                  onClick={() => testLogin(user)}
                  disabled={loading === user.email}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {loading === user.email ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{result.user}</h3>
                      <p className="text-sm text-gray-600">{result.email}</p>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                    <div className="text-right">
                      {result.loginResult?.ok ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Success
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                  {result.loginResult?.error && (
                    <p className="text-red-600 text-sm mt-2">
                      Error: {result.loginResult.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Force Admin Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/school')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Force School Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/student/profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Force Student Dashboard
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
    </div>
  );
}