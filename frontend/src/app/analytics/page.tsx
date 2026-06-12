'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [agentPerf, setAgentPerf] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<any>('/analytics/dashboard'),
      apiClient.get<any>('/analytics/lead-sources'),
      apiClient.get<any>('/analytics/agent-performance'),
      apiClient.get<any>('/analytics/forecast'),
    ]).then(([d, l, a, f]) => {
      setDashboard(d);
      setLeadSources(l.data || []);
      setAgentPerf(a.data || []);
      setForecast(f.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="animate-pulse space-y-6">
    {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
  </div></div>;

  const metrics = dashboard?.metrics || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Agency performance overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Annual Premium Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(metrics.annual_premium_total) || 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Monthly Premium</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(metrics.monthly_premium) || 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Active X-Dates</p>
          <p className="text-2xl font-bold text-amber-600">{metrics.active_xdates || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Pending Quotes</p>
          <p className="text-2xl font-bold text-purple-600">{metrics.pending_quotes || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {forecast && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-800">Locked Revenue</span>
                <span className="text-lg font-bold text-emerald-700">{formatCurrency(Number(forecast.locked_revenue) || 0, 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-fsos-50 rounded-lg">
                <span className="text-sm text-fsos-800">Pipeline Weighted</span>
                <span className="text-lg font-bold text-fsos-700">{formatCurrency(Number(forecast.pipeline_weighted) || 0, 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm text-amber-800">Renewals Next 90 Days</span>
                <span className="text-lg font-bold text-amber-700">{forecast.renewals_next_90 || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Source Performance</h3>
          <div className="space-y-3">
            {leadSources.slice(0, 6).map((src: any) => (
              <div key={src.lead_source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{src.lead_source || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{src.count}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{src.conversion_rate || 0}%</span>
                </div>
              </div>
            ))}
            {leadSources.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Agent Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Agent</th>
                <th className="table-header">Assigned</th>
                <th className="table-header">Clients</th>
                <th className="table-header">Deals Won</th>
                <th className="table-header">Revenue</th>
                <th className="table-header">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentPerf.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{agent.first_name} {agent.last_name}</td>
                  <td className="table-cell">{agent.total_assigned || 0}</td>
                  <td className="table-cell">{agent.clients || 0}</td>
                  <td className="table-cell">{agent.deals_won || 0}</td>
                  <td className="table-cell font-semibold">{formatCurrency(agent.revenue_generated || 0)}</td>
                  <td className="table-cell">{agent.appointments_completed || 0}</td>
                </tr>
              ))}
              {agentPerf.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">No agent data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
