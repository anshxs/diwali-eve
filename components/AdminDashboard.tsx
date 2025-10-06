'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Eye, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';

interface RegistrationSummary {
  ticket_id: string;
  name: string;
  email: string;
  phone: string;
  registration_type: string;
  total_attendees: number;
  amount_due: number;
  payment_verified: boolean;
  payment_screenshot_url: string;
  registration_date: string;
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<RegistrationSummary[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    totalAmount: 0,
    totalAttendees: 0
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchTerm, filterStatus, registrations]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registration_summary')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: RegistrationSummary[]) => {
    const stats = {
      total: data.length,
      verified: data.filter(r => r.payment_verified).length,
      pending: data.filter(r => !r.payment_verified).length,
      totalAmount: data.reduce((sum, r) => sum + r.amount_due, 0),
      totalAttendees: data.reduce((sum, r) => sum + r.total_attendees, 0)
    };
    setStats(stats);
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(reg =>
        filterStatus === 'verified' ? reg.payment_verified : !reg.payment_verified
      );
    }

    setFilteredRegistrations(filtered);
  };

  const verifyPayment = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('payment_verifications')
        .update({ verified: true })
        .eq('ticket_id', ticketId);

      if (error) throw error;

      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.ticket_id === ticketId 
            ? { ...reg, payment_verified: true }
            : reg
        )
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Ticket ID', 'Name', 'Email', 'Phone', 'Type', 'Attendees', 'Amount', 'Verified', 'Date'],
      ...filteredRegistrations.map(reg => [
        reg.ticket_id,
        reg.name,
        reg.email,
        reg.phone,
        reg.registration_type,
        reg.total_attendees.toString(),
        reg.amount_due.toString(),
        reg.payment_verified ? 'Yes' : 'No',
        new Date(reg.registration_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diwali-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Diwali Night 2025 - Admin Dashboard</h1>
            <button
              onClick={fetchRegistrations}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Registrations</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Verified</p>
              <p className="text-2xl font-bold text-green-800">{stats.verified}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Total Attendees</p>
              <p className="text-2xl font-bold text-purple-800">{stats.totalAttendees}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600">Expected Revenue</p>
              <p className="text-2xl font-bold text-orange-800">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, ticket ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.ticket_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                        <div className="text-sm text-gray-500">{registration.email}</div>
                        <div className="text-sm text-gray-500">{registration.phone}</div>
                        <div className="text-xs text-blue-600 font-mono">{registration.ticket_id}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(registration.registration_date).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{registration.registration_type}</span>
                        <span className="text-sm text-gray-500">{registration.total_attendees} attendees</span>
                        <span className="text-sm font-bold text-green-600">₹{registration.amount_due}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {registration.payment_verified ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {registration.payment_screenshot_url && (
                          <a
                            href={registration.payment_screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                            View Screenshot
                          </a>
                        )}
                        {!registration.payment_verified && (
                          <button
                            onClick={() => verifyPayment(registration.ticket_id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No registrations found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}