'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatDate, statusColor, cn } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('scheduled');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    apiClient.get<any>(`/appointments${params}`)
      .then((res) => setAppointments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q)
      || `${a.first_name} ${a.last_name}`.toLowerCase().includes(q)
      || (a.phone || '').includes(q);
  });

  const today = new Date().toDateString();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>Schedule and manage client meetings</p>
        </div>
        <button className="btn-primary" onClick={() => alert('New appointment form coming')}>
          + Schedule
        </button>
      </div>

      <div className="px-6 pb-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['scheduled', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === s ? 'bg-aethelos-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300')}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search appointments..." className="input-field flex-1 sm:max-w-xs" />
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse"><div className="h-12 bg-gray-100 rounded" /></div>
          )) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">No {filter} appointments</p>
          ) : (
            filtered.map((a) => {
              const isToday = new Date(a.start_time).toDateString() === today;
              return (
                <div key={a.id} className={cn('p-4 flex items-center justify-between hover:bg-gray-50',
                  isToday && 'bg-aethelos-primary/5')}>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{new Date(a.start_time).getDate()}</p>
                      <p className="text-xs text-gray-500">{new Date(a.start_time).toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.first_name} {a.last_name}
                        {a.phone && ` · ${a.phone}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {' - '}
                        {new Date(a.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('badge', statusColor(a.status))}>{a.status}</span>
                    {isToday && <span className="badge bg-green-50 text-green-700">Today</span>}
                    <button className="btn-ghost text-xs">Detail</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
