"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'users' | 'schools' | 'classes' | 'payouts';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('payouts');
  const [data, setData] = useState<any>({ users: [], schools: [], classes: [], payouts: [] });
  const [loading, setLoading] = useState(true);

  // State for Payout Generation
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fetchTabData = async (tab: Tab) => {
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${tab}`, { headers });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [tab]: result }));
      } else {
        throw new Error(`Failed to fetch ${tab}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session as any).user?.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }
    fetchTabData(activeTab);
  }, [session, status, router, activeTab]);

  const handleGeneratePayouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payouts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to generate payouts');
      alert(result.message);
      fetchTabData('payouts'); // Refresh payouts list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleMarkAsPaid = async (payoutId: number) => {
    const transactionReference = prompt("Enter the transaction reference for this payout:");
    if (!transactionReference) return;

    try {
      const token = (session as any)?.backendToken;
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payouts/${payoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'PAID', transactionReference }),
      });
      fetchTabData('payouts'); // Refresh list
    } catch (err) {
      alert('Failed to update payout status.');
    }
  };

  if (status === 'loading' || !session || (session as any).user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="dark:text-white">Loading or redirecting...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) return <p className="dark:text-white">Loading data...</p>;

    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-4">
            {data.users.map((u: any) => (
              <div key={u.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{u.name} ({u.email})</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Role: {u.role}</div>
                </div>
                <Link href={`/dashboard/admin/users/${u.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View/Edit</Link>
              </div>
            ))}
          </div>
        );
      case 'schools':
        return (
          <div className="space-y-4">
            {data.schools.map((s: any) => (
              <div key={s.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{s.location}</div>
                </div>
                <Link href={`/dashboard/school/profile/${s.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View/Manage</Link>
              </div>
            ))}
          </div>
        );
      case 'classes':
         return (
          <div className="space-y-4">
            {data.classes.map((c: any) => (
              <div key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="font-semibold text-gray-900 dark:text-white">{c.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">School: {c.school.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(c.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        );
      case 'payouts':
        return (
          <div>
            <form onSubmit={handleGeneratePayouts} className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Generate Weekly Payouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-marketplace mt-1" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input-marketplace mt-1" />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={payoutLoading} className="btn-primary-marketplace w-full">
                    {payoutLoading ? 'Generating...' : 'Generate Payouts'}
                  </button>
                </div>
              </div>
            </form>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Payout History</h3>
              {data.payouts.map((p: any) => (
                <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">School: {p.school.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Amount: ${p.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Period: {new Date(p.periodStartDate).toLocaleDateString()} - {new Date(p.periodEndDate).toLocaleDateString()}</div>
                    {p.transactionReference && <div className="text-xs text-gray-500 dark:text-gray-400">Ref: {p.transactionReference}</div>}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      p.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>{p.status}</span>
                    {p.status === 'PENDING' && (
                      <button onClick={() => handleMarkAsPaid(p.id)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">Mark as Paid</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Welcome, {(session as any).user?.name}</p>

        <div className="mt-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Users
              </button>
              <button onClick={() => setActiveTab('schools')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schools' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Schools
              </button>
              <button onClick={() => setActiveTab('classes')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'classes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Classes
              </button>
              <button onClick={() => setActiveTab('payouts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payouts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Payouts
              </button>
            </nav>
          </div>
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}