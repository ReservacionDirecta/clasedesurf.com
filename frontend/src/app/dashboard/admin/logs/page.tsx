"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  level: 'info' | 'warning' | 'error';
}

export default function AdminLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: 'all',
    user: '',
    action: '',
    dateRange: '7d'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    // Generate mock log data
    const generateMockLogs = (): LogEntry[] => {
      const actions = [
        'User Login', 'User Logout', 'Create School', 'Update School', 'Delete School',
        'Create Class', 'Update Class', 'Delete Class', 'Create Reservation', 'Cancel Reservation',
        'Process Payment', 'Refund Payment', 'Update User', 'Delete User', 'Export Data'
      ];
      
      const users = [
        'admin@surfschool.com', 'schooladmin@surfschool.com', 'student1@surfschool.com',
        'instructor@surfschool.com', 'manager@surfschool.com'
      ];
      
      const resources = [
        'User', 'School', 'Class', 'Reservation', 'Payment', 'Report', 'Settings'
      ];
      
      const levels: ('info' | 'warning' | 'error')[] = ['info', 'warning', 'error'];
      
      const mockLogs: LogEntry[] = [];
      
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const action = actions[Math.floor(Math.random() * actions.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const resource = resources[Math.floor(Math.random() * resources.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        
        mockLogs.push({
          id: `log-${i}`,
          timestamp: timestamp.toISOString(),
          user,
          action,
          resource,
          details: `${action} performed on ${resource} by ${user}`,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level
        });
      }
      
      return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    setLogs(generateMockLogs());
    setLoading(false);
  }, [session, status, router]);

  const filteredLogs = logs.filter(log => {
    if (filter.level !== 'all' && log.level !== filter.level) return false;
    if (filter.user && !log.user.toLowerCase().includes(filter.user.toLowerCase())) return false;
    if (filter.action && !log.action.toLowerCase().includes(filter.action.toLowerCase())) return false;
    
    // Date range filter
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const daysAgo = parseInt(filter.dateRange.replace('d', ''));
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    if (logDate < cutoffDate) return false;
    
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
        <p className="text-gray-600">Monitor platform activity and user actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900">{filteredLogs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredLogs.filter(log => log.level === 'error').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔴</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-3xl font-bold text-yellow-600">
                {filteredLogs.filter(log => log.level === 'warning').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🟡</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Info</p>
              <p className="text-3xl font-bold text-blue-600">
                {filteredLogs.filter(log => log.level === 'info').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔵</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={filter.level}
              onChange={(e) => setFilter({...filter, level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
            <input
              type="text"
              placeholder="Filter by user..."
              value={filter.user}
              onChange={(e) => setFilter({...filter, user: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <input
              type="text"
              placeholder="Filter by action..."
              value={filter.action}
              onChange={(e) => setFilter({...filter, action: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Activity Logs ({filteredLogs.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getLevelIcon(log.level)}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No logs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}