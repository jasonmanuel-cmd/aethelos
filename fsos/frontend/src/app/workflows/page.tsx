'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { WorkflowTemplate } from '@/types';

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/workflows/templates')
      .then((res) => setTemplates(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="text-sm text-gray-500 mt-1">DAG-based automation engine</p>
        </div>
        <button className="btn-primary">+ Create Workflow</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse"><div className="h-32 bg-gray-100 rounded-lg" /></div>
        )) : templates.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Workflows Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create automated sequences for lead nurturing, cross-selling, retention, and more.</p>
            <button className="btn-primary">Create Your First Workflow</button>
          </div>
        ) : templates.map((t) => (
          <div key={t.id} className="card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fsos-400 to-brand-500 flex items-center justify-center text-white">
                ⚡
              </div>
              <span className={cn('badge', t.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500')}>
                {t.is_active ? 'Active' : 'Draft'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
            {t.description && <p className="text-sm text-gray-500 mb-3">{t.description}</p>}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{t.nodes?.length || 0} nodes</span>
              <span>·</span>
              <span>{t.edges?.length || 0} connections</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
