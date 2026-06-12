'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { AiAgent } from '@/types';

const AGENT_ICONS: Record<string, string> = {
  qualification: '🎯',
  appointment: '📅',
  follow_up: '💬',
  cross_sell: '🔗',
  retention: '🛡️',
  document_collection: '📄',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/agents')
      .then((res) => setAgents(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Autonomous digital employees</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(5)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse"><div className="h-28 bg-gray-100 rounded-lg" /></div>
        )) : agents.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No AI Agents Active</h3>
            <p className="text-sm text-gray-500">Configure AI agents to automate lead qualification, appointment setting, follow-ups, and cross-selling.</p>
          </div>
        ) : agents.map((agent) => (
          <div key={agent.id} className="card-hover p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fsos-400 to-brand-500 flex items-center justify-center text-2xl">
                  {AGENT_ICONS[agent.agent_type] || '🤖'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{agent.agent_type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className={cn('w-3 h-3 rounded-full', agent.is_active ? 'bg-green-500' : 'bg-gray-300')} />
            </div>
            {agent.description && <p className="text-sm text-gray-600 mb-3">{agent.description}</p>}
            {agent.metrics && Object.keys(agent.metrics).length > 0 && (
              <div className="flex gap-3 text-xs text-gray-500">
                {Object.entries(agent.metrics).slice(0, 3).map(([key, val]) => (
                  <span key={key}>{key}: {String(val)}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary flex-1 text-xs py-1.5">
                {agent.is_active ? 'Pause' : 'Activate'}
              </button>
              <button className="btn-ghost text-xs py-1.5">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
