'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatDate, statusColor, cn } from '@/lib/utils';
import { SkeletonTable } from '@/components/ui/Skeleton';
import type { Contact, PaginatedResponse } from '@/types';

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const limit = 20;

  const fetchContacts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    apiClient.get<PaginatedResponse<Contact>>(`/contacts?${params}`)
      .then((res) => { setContacts(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leads & Contacts</h1>
          <p>{total} total contacts</p>
        </div>
        <button className="btn-primary" onClick={() => alert('New lead form coming soon')}>
          + Add Contact
        </button>
      </div>

      <div className="px-6 pb-6 space-y-6">
      <div className="card">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-48">
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active Prospect">Active Prospect</option>
            <option value="Active Client">Active Client</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Status</th>
                <th className="table-header">Source</th>
                <th className="table-header">Next Follow-Up</th>
                <th className="table-header">Created</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="table-cell"><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></td>
                  ))}
                </tr>
              )) : contacts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No contacts found</td></tr>
              ) : contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedContact(c)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br bg-aethelos-primary flex items-center justify-center text-white font-bold text-xs">
                        {c.first_name?.charAt(0)}{c.last_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                        {c.household_name && <p className="text-xs text-gray-400">{c.household_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm">{c.email || '-'}</p>
                    <p className="text-xs text-gray-400">{c.phone || '-'}</p>
                  </td>
                  <td className="table-cell">
                    <span className={cn('badge', statusColor(c.status))}>{c.status}</span>
                  </td>
                  <td className="table-cell text-sm text-gray-500">{c.lead_source || '-'}</td>
                  <td className="table-cell">
                    {c.next_follow_up ? (
                      <span className="text-sm font-medium text-amber-600">{formatDate(c.next_follow_up)}</span>
                    ) : <span className="text-sm text-gray-400">-</span>}
                  </td>
                  <td className="table-cell text-sm text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="table-cell">
                    <button className="btn-ghost text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-xs px-3 py-1.5">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-xs px-3 py-1.5">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContact(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br bg-aethelos-primary flex items-center justify-center text-white font-bold text-lg">
                  {selectedContact.first_name?.charAt(0)}{selectedContact.last_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedContact.first_name} {selectedContact.last_name}</h2>
                  <span className={cn('badge', statusColor(selectedContact.status))}>{selectedContact.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="btn-ghost p-2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Email:</span> <span className="text-gray-900">{selectedContact.email || '-'}</span></div>
              <div><span className="text-gray-400">Phone:</span> <span className="text-gray-900">{selectedContact.phone || '-'}</span></div>
              <div><span className="text-gray-400">Lead Source:</span> <span className="text-gray-900">{selectedContact.lead_source || '-'}</span></div>
              <div><span className="text-gray-400">Dependents:</span> <span className="text-gray-900">{selectedContact.dependents_count}</span></div>
              <div><span className="text-gray-400">Stage:</span> <span className="text-gray-900">{selectedContact.stage}</span></div>
              <div><span className="text-gray-400">Created:</span> <span className="text-gray-900">{formatDate(selectedContact.created_at, 'long')}</span></div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button className="btn-primary flex-1">Schedule Appointment</button>
              <button className="btn-secondary flex-1">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
