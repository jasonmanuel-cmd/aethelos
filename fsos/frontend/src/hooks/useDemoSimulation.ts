'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import { generateDemoEvents, type DemoEvent } from '@/lib/demo-sim';

const SIMULATION_INTERVAL = 15000;

export function useDemoSimulation() {
  const { addToast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const fire = () => {
      const events = generateDemoEvents(Math.floor(Math.random() * 3) + 1);
      events.forEach((e: DemoEvent) => {
        addToast({ title: e.title, description: e.description, severity: e.severity });
      });
    };

    fire();
    intervalRef.current = setInterval(fire, SIMULATION_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addToast]);
}
