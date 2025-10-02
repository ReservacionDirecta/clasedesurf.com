"use client";

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearSessionPage() {
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Clear NextAuth session
        await signOut({ redirect: false });
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        alert('Session cleared successfully! You can now login again.');
        router.push('/login');
      } catch (error) {
        console.error('Error clearing session:', error);
        alert('Session cleared. Please try logging in again.');
        router.push('/login');
      }
    };

    clearSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Clearing Session...</h1>
        <p className="text-gray-600">Please wait while we clear your session data.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}