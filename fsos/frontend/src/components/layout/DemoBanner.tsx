'use client';

import { useState } from 'react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-20 flex items-center justify-center gap-3 px-4 py-2 bg-gradient-to-r from-aethelos-primary/10 via-aethelos-secondary/10 to-aethelos-primary/10 border-b border-aethelos-border/50">
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-aethelos-primary/20 text-aethelos-primary">Demo</span>
      <p className="text-xs text-aethelos-text-secondary">This is a live demo with simulated data. Sign in with demo credentials to explore.</p>
      <button onClick={() => setDismissed(true)} className="text-aethelos-muted hover:text-aethelos-text transition-colors text-xs shrink-0">&times;</button>
    </div>
  );
}
