'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
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

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-aethelos-border" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl border border-aethelos-border" />
          <div className="h-80 bg-white rounded-xl border border-aethelos-border" />
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Leads', value: metrics?.total_leads || 0, icon: '⇝', color: 'stat-card-navy' },
    { label: 'Active Clients', value: metrics?.active_clients || 0, icon: '⯐', color: 'stat-card-sage' },
    { label: 'Bound Policies', value: metrics?.bound_policies || 0, icon: '⊞', color: 'stat-card-blue' },
    { label: 'Monthly Premium', value: formatCurrency(metrics?.monthly_premium || 0), icon: '◆', color: 'stat-card-coral' },
    { label: 'Upcoming Appts', value: metrics?.upcoming_appointments || 0, icon: '⊡', color: 'stat-card-purple' },
    { label: 'Active X-Dates', value: metrics?.active_xdates || 0, icon: '⏱', color: 'stat-card-amber' },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your agency at a glance</p>
        </div>
        <Link href="/leads" className="btn-primary">+ New Lead</Link>
      </div>

      <div className="px-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`${s.color} rounded-xl p-5 shadow-md`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg text-white/70">{s.icon}</span>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xs font-bold text-white/80">↑</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white font-display">{s.value}</p>
              <p className="text-xs text-white/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Conversion + Revenue */}
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="card-no-accent card p-5">
            <p className="text-xs text-aethelos-muted mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-aethelos-text font-display">{metrics?.conversion_rate || 0}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-aethelos-primary" style={{ width: `${metrics?.conversion_rate || 0}%` }} />
            </div>
          </div>
          <div className="card-no-accent card p-5">
            <p className="text-xs text-aethelos-muted mb-1">Avg Policy Size</p>
            <p className="text-3xl font-bold text-aethelos-text font-display">{formatCurrency(metrics?.avg_policy_size || 0)}</p>
          </div>
          <div className="card-no-accent card p-5">
            <p className="text-xs text-aethelos-muted mb-1">Active Agents</p>
            <p className="text-3xl font-bold text-aethelos-text font-display">3</p>
            <p className="text-xs text-aethelos-muted mt-1">Sarah · Jason · Mike</p>
          </div>
          <div className="card-no-accent card p-5">
            <p className="text-xs text-aethelos-muted mb-1">Pipeline Value</p>
            <p className="text-3xl font-bold text-aethelos-text font-display">{formatCurrency(1424000)}</p>
            <p className="text-xs text-aethelos-muted mt-1">$1.4M weighted pipeline</p>
          </div>
        </div>

        {/* X-Dates + Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* X-Dates */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-aethelos-border flex items-center justify-between">
              <h3 className="font-semibold text-aethelos-text">Upcoming X-Dates</h3>
              <Link href="/workflows" className="text-xs text-aethelos-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-aethelos-border max-h-80 overflow-y-auto">
              {xdates.length === 0 ? (
                <p className="p-5 text-sm text-aethelos-muted text-center">No upcoming X-dates</p>
              ) : xdates.map((x) => (
                <div key={x.id} className="px-5 py-3 flex items-center justify-between hover:bg-aethelos-card transition-colors">
                  <div>
                    <p className="text-sm font-medium text-aethelos-text">{x.first_name} {x.last_name}</p>
                    <p className="text-xs text-aethelos-muted">{x.line_of_business} · {x.carrier_name} · ${(x.premium_amount || 0).toFixed(2)}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-aethelos-accent">{formatRelativeDate(x.target_x_date)}</p>
                    <p className="text-xs text-aethelos-muted">{x.current_campaign_stage.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-aethelos-border flex items-center justify-between">
              <h3 className="font-semibold text-aethelos-text">Upcoming Appointments</h3>
              <Link href="/appointments" className="text-xs text-aethelos-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-aethelos-border max-h-80 overflow-y-auto">
              {appointments.length === 0 ? (
                <p className="p-5 text-sm text-aethelos-muted text-center">No appointments today</p>
              ) : appointments.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-aethelos-card transition-colors">
                  <div>
                    <p className="text-sm font-medium text-aethelos-text">{a.title}</p>
                    <p className="text-xs text-aethelos-muted">{a.first_name} {a.last_name}{a.phone ? ` · ${a.phone}` : ''}</p>
                  </div>
                  <span className="badge badge-blue">
                    {new Date(a.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
