'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_KEY = 'aethelos_tour_complete';

const steps = [
  {
    icon: '📊',
    title: 'Dashboard',
    description: 'Your command center. See pipeline value, new leads, upcoming appointments, and expiring policies at a glance.',
  },
  {
    icon: '🎯',
    title: 'Lead Management',
    description: 'AI-qualified leads with SMS and email engagement tracking. Only warm prospects hit your pipeline.',
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    description: 'AI books appointments automatically. Clients pick from your available slots — no back-and-forth.',
  },
  {
    icon: '🔄',
    title: 'X-Date Automation',
    description: '60-day renewal campaigns run automatically. SMS, email, and call sequences fire on schedule.',
  },
  {
    icon: '🛡️',
    title: 'Client Retention',
    description: 'At-risk detection + automated save campaigns. Reduce lapses and protect your book of business.',
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="text-5xl mb-4">{steps[step].icon}</div>
            <h2 className="font-display text-xl font-bold text-aethelos-text mb-2">{steps[step].title}</h2>
            <p className="text-aethelos-text-secondary text-sm leading-relaxed mb-8">{steps[step].description}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-aethelos-primary w-6' : 'bg-aethelos-border'}`} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={dismiss} className="px-4 py-2 rounded-lg text-sm text-aethelos-text-secondary hover:text-aethelos-text transition-colors">Skip</button>
              <button onClick={next} className="px-6 py-2.5 rounded-xl bg-aethelos-primary text-white text-sm font-medium hover:bg-aethelos-primary-light transition-all shadow-sm">
                {step < steps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
