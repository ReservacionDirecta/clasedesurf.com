"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function AdminAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }
    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Account Settings' }
      ]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
          <p className="text-gray-500 mb-4">This page is under development</p>
          <p className="text-sm text-gray-400">Coming soon: Account preferences, privacy settings, and more</p>
        </div>
      </div>
    </div>
  );
}