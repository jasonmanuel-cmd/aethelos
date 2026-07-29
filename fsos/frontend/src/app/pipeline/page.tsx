'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, cn } from '@/lib/utils';
import type { Deal } from '@/types';

export default function PipelinePage() {
  const [stages, setStages] = useState<any[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<any>('/pipeline/analytics'),
      apiClient.get<any>('/pipeline/deals'),
    ]).then(([s, d]) => {
      setStages(s.data || []);
      setDeals(d.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="animate-pulse space-y-4">
    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
  </div></div>;

  const totalPipelineValue = stages.reduce((sum: number, s: any) => sum + Number(s.total_value), 0);
  const totalWeighted = stages.reduce((sum: number, s: any) => sum + Number(s.weighted_value), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pipeline</h1>
          <p>
            Pipeline: {formatCurrency(totalPipelineValue)} · Weighted: {formatCurrency(totalWeighted)}
          </p>
        </div>
        <button className="btn-primary">+ Add Deal</button>
      </div>

      <div className="px-6 pb-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stages.map((stage: any) => (
          <div key={stage.id} className="card p-4 text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stage.color }} />
            <p className="text-sm font-semibold text-gray-900">{stage.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stage.deal_count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(stage.total_value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stages.map((stage: any) => (
          <div key={stage.id} className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: stage.color + '20' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-xs font-semibold text-gray-700">{stage.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{stage.deal_count}</span>
            </div>

            {deals.filter((d) => d.stage_name === stage.name).map((deal) => (
              <div key={deal.id} className="card-hover p-3 cursor-pointer">
                <p className="text-sm font-medium text-gray-900 truncate">{deal.name}</p>
                <p className="text-xs text-gray-500">{deal.first_name} {deal.last_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-semibold text-gray-900">{formatCurrency(deal.amount || 0)}</span>
                  <span className="text-xs text-gray-400">{deal.probability}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${deal.probability}%`, backgroundColor: stage.color }} />
                </div>
              </div>
            ))}

            {deals.filter((d) => d.stage_name === stage.name).length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400">No deals</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
