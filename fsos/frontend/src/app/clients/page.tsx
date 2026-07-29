'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import type { Contact, Policy, PaginatedResponse } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.get<PaginatedResponse<Contact>>('/contacts?status=Active Client&limit=100')
      .then((res) => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q)
      || (c.phone || '').toLowerCase().includes(q);
  });

  const loadClientDetails = async (c: Contact) => {
    setSelected(c);
    try {
      const res: any = await apiClient.get(`/contacts/${c.id}`);
      setPolicies(res.data?.policies || []);
    } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>{filtered.length} of {clients.length} active clients</p>
        </div>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="input-field w-48" />
        </div>
      </div>

      <div className="px-6 pb-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="divide-y divide-gray-100">
              {loading ? [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse"><div className="h-10 bg-gray-100 rounded-lg" /></div>
              )) : filtered.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-400">{search ? 'No clients match your search' : 'No active clients yet'}</p>
              ) : filtered.map((c) => (
                <div key={c.id}
                  className={cn('p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors',
                    selected?.id === c.id && 'bg-aethelos-primary/8')}
                  onClick={() => loadClientDetails(c)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-aethelos-secondary flex items-center justify-center text-white font-bold">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-gray-500">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900 font-medium">{c.policy_count || 0} policies</p>
                    <p className="text-xs text-gray-400">Client since {formatDate(c.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selected ? (
            <div className="card p-5 space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br bg-aethelos-secondary flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                  {selected.first_name?.[0]}{selected.last_name?.[0]}
                </div>
                <h3 className="font-bold text-gray-900">{selected.first_name} {selected.last_name}</h3>
                <p className="text-xs text-gray-500">{selected.email}</p>
                <p className="text-xs text-gray-500">{selected.phone}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-green-600">Active Client</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Source</span><span>{selected.lead_source || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Dependents</span><span>{selected.dependents_count}</span></div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Policies</h4>
                {policies.length === 0 ? (
                  <p className="text-xs text-gray-400">No policies on file</p>
                ) : policies.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{p.line_of_business}</p>
                      <p className="text-xs text-gray-500">{p.carrier_name || 'Unknown carrier'}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{formatCurrency(p.premium_amount || 0)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="btn-primary flex-1 text-xs">Contact</button>
                <button className="btn-secondary flex-1 text-xs">Add Policy</button>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-400 text-sm">Select a client to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
