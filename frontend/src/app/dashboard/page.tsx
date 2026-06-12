'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatRelativeDate, cn } from '@/lib/utils';
import type { DashboardMetrics, XDateTracker, Appointment } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [xdates, setXdates] = useState<XDateTracker[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<any>('/analytics/dashboard'),
      apiClient.get<any>('/xdates/upcoming?days=60'),
      apiClient.get<any>('/appointments/today'),
    ]).then(([m, x, a]) => {
      setMetrics(m.metrics || m.data);
      setXdates(x.data || []);
      setAppointments(a.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="animate-pulse space-y-6">
    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
  </div></div>;

  const stats = [
    { label: 'Total Leads', value: metrics?.total_leads || 0, color: 'from-blue-500 to-blue-600', icon: '👥' },
    { label: 'Active Clients', value: metrics?.active_clients || 0, color: 'from-green-500 to-emerald-600', icon: '⭐' },
    { label: 'Bound Policies', value: metrics?.bound_policies || 0, color: 'from-purple-500 to-violet-600', icon: '📄' },
    { label: 'Monthly Premium', value: formatCurrency(metrics?.monthly_premium || 0), color: 'from-amber-500 to-orange-600', icon: '💰' },
    { label: 'Upcoming Appts', value: metrics?.upcoming_appointments || 0, color: 'from-rose-500 to-pink-600', icon: '📅' },
    { label: 'Active X-Dates', value: metrics?.active_xdates || 0, color: 'from-cyan-500 to-teal-600', icon: '⏰' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your agency at a glance</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '/leads'}>
          + New Lead
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', s.color)}>
                <span className="text-white text-xs font-bold">↑</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Upcoming X-Dates (60 days)</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {xdates.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No upcoming X-dates</p>
            ) : xdates.map((x) => (
              <div key={x.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {x.first_name} {x.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{x.line_of_business} · {x.carrier_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">{formatRelativeDate(x.target_x_date)}</p>
                  <p className="text-xs text-gray-400">{x.current_campaign_stage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No appointments today</p>
            ) : appointments.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.first_name} {a.last_name} · {a.phone}</p>
                </div>
                <span className="badge bg-blue-50 text-blue-700">
                  {new Date(a.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
