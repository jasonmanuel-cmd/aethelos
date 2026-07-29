'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [showDoor, setShowDoor] = useState(true);
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDoorOpen(true), 1200);
    const hide = setTimeout(() => setShowDoor(false), 2200);
    return () => { clearTimeout(timer); clearTimeout(hide); };
  }, []);

  return (
    <div className="relative min-h-screen bg-aethelos-bg overflow-hidden">
      {/* Warm ambient gradient */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-aethelos-primary/4 to-aethelos-secondary/4 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-aethelos-accent/3 to-aethelos-secondary/3 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Door-opening logo animation */}
      <AnimatePresence>
        {showDoor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-aethelos-bg"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="perspective-[1200px]">
              <motion.div
                className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px]"
                style={{ transformOrigin: 'center center', transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0, scale: 1, opacity: 1 }}
                animate={doorOpen ? {
                  rotateY: -110,
                  scale: 0.3,
                  opacity: 0,
                } : {}}
                transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image
                    src="/logo.png"
                    alt="AethelOS"
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>
                {/* Door swing shadow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={doorOpen ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>
            {/* Subtle loading text */}
            <motion.p
              className="absolute bottom-12 text-xs text-aethelos-muted tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Chaotically Organized AI
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <motion.nav
        className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image src="/logo.png" alt="AethelOS" fill className="object-contain" />
          </div>
          <span className="font-display text-lg font-bold text-aethelos-text">Aethel<span className="text-aethelos-primary">OS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-aethelos-text-secondary">
          <a href="#features" className="hover:text-aethelos-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-aethelos-primary transition-colors">About</a>
          <Link href="/login" className="px-5 py-2.5 rounded-xl bg-aethelos-primary text-white text-sm font-medium hover:bg-aethelos-primary-light transition-all shadow-sm hover:shadow-md">Sign In</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-aethelos-border text-xs text-aethelos-text-secondary mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-aethelos-accent" />
            Financial Services Operating System
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-5">
            <span className="text-aethelos-text">The platform for</span><br />
            <span className="text-gradient">Modern Insurance Agencies</span>
          </h1>
          <p className="text-aethelos-text-secondary text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered lead qualification, automated appointment setting, pipeline management,
            and client retention — crafted for <span className="text-aethelos-primary font-medium">financial professionals</span>.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-3 rounded-xl bg-aethelos-primary text-white font-medium hover:bg-aethelos-primary-light transition-all shadow-sm hover:shadow-md">Get Started</Link>
            <a href="#features" className="px-8 py-3 rounded-xl border border-aethelos-border text-aethelos-text bg-white hover:bg-aethelos-card transition-all">Explore Features</a>
          </div>
        </motion.div>
      </section>

      {/* Trust badges */}
      <Section className="relative z-10 pb-20">
        <p className="text-center text-xs text-aethelos-muted uppercase tracking-widest mb-8">Trusted by leading agencies nationwide</p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
          {['Progressive', 'Travelers', 'Nationwide', 'Prudential', 'MetLife', 'State Farm'].map((name) => (
            <div key={name} className="font-display text-lg font-bold text-aethelos-text-secondary/70">{name}</div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <Section className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-aethelos-text">
            Everything you need to <span className="text-gradient">grow your agency</span>
          </h2>
          <p className="text-aethelos-text-secondary max-w-lg mx-auto">Intelligent tools that handle the busywork while you focus on your clients.</p>
        </Section>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { title: 'AI Lead Qualifier', desc: 'Qualifies inbound leads 24/7 via SMS and email. Only warm leads hit your calendar — no more cold call roulette.', icon: '🎯' },
            { title: 'Smart Pipeline', desc: 'Visual deal tracking with automated stage progression and probability scoring. Know exactly where every opportunity stands.', icon: '📊' },
            { title: 'X-Date Automation', desc: '60-day renewal campaigns with SMS, email, and call sequences. Automatically re-engage clients before their policies expire.', icon: '🔄' },
            { title: 'Appointment AI', desc: 'Books meetings automatically. No back-and-forth scheduling. Clients pick from your available slots — 78% show rate.', icon: '📅' },
            { title: 'Cross-Sell Engine', desc: 'Detects life events and policy gaps, triggering tailored coverage suggestions. Turn existing clients into multi-policy households.', icon: '⚡' },
            { title: 'Retention Guardian', desc: 'Monitors at-risk clients and deploys save campaigns before they lapse. Reduce churn and protect your book of business.', icon: '🛡️' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="card p-6 hover:shadow-card-hover group cursor-default"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-lg mb-2 text-aethelos-text group-hover:text-aethelos-primary transition-colors">{f.title}</h3>
              <p className="text-aethelos-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { value: '47%', label: 'Faster Close Rate', desc: 'AI qualification saves 10+ hours/week per agent' },
            { value: '3.2x', label: 'More Appointments', desc: 'Automated scheduling fills your calendar' },
            { value: '89%', label: 'Client Retention', desc: 'Proactive save campaigns reduce lapses' },
            { value: '12 hrs', label: 'Saved Per Week', desc: 'Back to what matters — your clients' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6"
            >
              <div className="font-display text-3xl font-bold text-aethelos-primary mb-1">{s.value}</div>
              <div className="font-medium text-aethelos-text text-sm mb-1">{s.label}</div>
              <div className="text-aethelos-muted text-xs">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-lg mx-auto card p-10">
          <h2 className="font-display text-3xl font-bold mb-3 text-aethelos-text">Ready to get started?</h2>
          <p className="text-aethelos-text-secondary mb-8">Sign in to your agency dashboard and see how AethelOS transforms your workflow.</p>
          <Link href="/login" className="inline-block px-10 py-3 rounded-xl bg-aethelos-primary text-white font-medium hover:bg-aethelos-primary-light transition-all shadow-sm hover:shadow-md">Go to Dashboard</Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-aethelos-border py-8 text-center text-aethelos-muted text-xs">
        AethelOS &copy; 2026 — Chaotically Organized AI
      </footer>
    </div>
  );
}
