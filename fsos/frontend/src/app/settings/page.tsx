'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface ApiKey { service: string; api_key: string; api_secret?: string; is_configured: boolean; config_json?: Record<string, any>; }
interface ApiKeyForm { api_key?: string; api_secret?: string; config_json?: Record<string, any>; }

function getHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fsos_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);

  const [openaiKey, setOpenaiKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [emailKey, setEmailKey] = useState('');

  useEffect(() => { loadApiKeys(); }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/api-keys', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load API keys');
      const data = await res.json();
      const keys: Record<string, ApiKey> = {};
      (data as ApiKey[]).forEach((k: ApiKey) => { keys[k.service] = k; });
      setApiKeys(keys);
      if (keys['openai']) setOpenaiKey(keys['openai'].api_key);
      if (keys['twilio']) {
        const cfg = keys['twilio'].config_json || {};
        setTwilioSid(keys['twilio'].api_key);
        setTwilioToken(keys['twilio'].api_secret || '');
        setTwilioPhone(cfg.phone_number || '');
      }
      if (keys['email']) setEmailKey(keys['email'].api_key);
    } catch {
      setMessage({ type: 'error', text: 'Could not load API keys' });
    } finally { setLoading(false); }
  };

  const isMasked = (val: string) => val.includes('••••••••');

  const saveApiKey = async (service: string, form: ApiKeyForm) => {
    try {
      setSaving(service); setMessage(null);
      const clean: ApiKeyForm = {};
      if (form.api_key && !isMasked(form.api_key)) clean.api_key = form.api_key;
      if (form.api_secret && !isMasked(form.api_secret)) clean.api_secret = form.api_secret;
      if (form.config_json) clean.config_json = form.config_json;
      if (!clean.api_key && !clean.api_secret && !clean.config_json) {
        setMessage({ type: 'success', text: `${service.toUpperCase()} — no changes needed` });
        return;
      }
      const res = await fetch(`/api/v1/api-keys/${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(clean),
      });
      if (!res.ok) throw new Error('Save failed');
      await loadApiKeys();
      setMessage({ type: 'success', text: `${service.toUpperCase()} API key saved` });
    } catch {
      setMessage({ type: 'error', text: `Failed to save ${service.toUpperCase()} API key` });
    } finally { setSaving(null); }
  };

  const deleteApiKey = async (service: string) => {
    try {
      setSaving(service); setMessage(null);
      const res = await fetch(`/api/v1/api-keys/${service}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      await loadApiKeys();
      setMessage({ type: 'success', text: `${service.toUpperCase()} API key removed` });
    } catch {
      setMessage({ type: 'error', text: `Failed to delete ${service.toUpperCase()} API key` });
    } finally { setSaving(null); }
  };

  const handleGoogleAuth = () => {
    window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}&redirect_uri=${window.location.origin}/api/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/calendar%20https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent`,
      '_blank'
    );
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'branding', label: 'Branding' },
    { id: 'carriers', label: 'Carriers' },
    { id: 'team', label: 'Team' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'integrations', label: 'Integrations' },
  ];

  const Btn = ({ children, ...props }: any) => (
    <button {...props} className="px-4 py-2 rounded-lg bg-aethelos-crimson text-white text-sm font-medium hover:bg-aethelos-dark-red transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed">{children}</button>
  );
  const Btn2 = ({ children, ...props }: any) => (
    <button {...props} className="px-4 py-2 rounded-lg border border-aethelos-border text-aethelos-text text-sm font-medium hover:bg-aethelos-card transition-all disabled:opacity-50">{children}</button>
  );
  const Badge = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
      active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    }`}>{children}</span>
  );

  const inputClass = "w-full font-mono text-xs";

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your agency platform</p>
        </div>
      </div>

      <div className="px-6 pb-6 max-w-4xl">

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-aethelos-crimson border border-aethelos-crimson/20'
        }`}>{message.text}</div>
      )}

      <div className="flex gap-1 mb-6 p-1 bg-aethelos-surface rounded-xl overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-aethelos-card text-aethelos-text shadow-lg' : 'text-aethelos-muted hover:text-aethelos-text'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-bold text-aethelos-text">Agency Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Agency Name</label>
                <input type="text" className="w-full" defaultValue="COAI Demo Agency" />
              </div>
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Domain</label>
                <input type="text" className="w-full" defaultValue="demo.coaibakersfield.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Default Timezone</label>
                <select className="w-full" defaultValue="America/Los_Angeles">
                  <option>America/New_York</option>
                  <option>America/Chicago</option>
                  <option>America/Denver</option>
                  <option>America/Los_Angeles</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Default Currency</label>
                <select className="w-full" defaultValue="USD">
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <Btn>Save Settings</Btn>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-bold text-aethelos-text">White-Label Branding</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Primary Color</label>
                <input type="color" className="w-full h-10 cursor-pointer" defaultValue="#DC143C" />
              </div>
              <div>
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Secondary Color</label>
                <input type="color" className="w-full h-10 cursor-pointer" defaultValue="#E63946" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Logo URL</label>
                <input type="text" className="w-full" placeholder="https://your-logo-url.com/logo.png" />
              </div>
            </div>
            <Btn>Update Branding</Btn>
          </div>
        )}

        {activeTab === 'carriers' && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-aethelos-text">Insurance Carriers</h2>
            {['Progressive', 'Travelers', 'Nationwide', 'Prudential', 'MetLife'].map((c) => (
              <div key={c} className="flex items-center justify-between p-3 rounded-lg bg-aethelos-card/50">
                <span className="font-medium text-aethelos-text">{c}</span>
                <Badge active>Connected</Badge>
              </div>
            ))}
            <Btn2>+ Add Carrier</Btn2>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-aethelos-text">Team Members</h2>
              <Btn>+ Invite</Btn>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Jason M.', email: 'jasonm@coaibakersfield.com', role: 'admin' },
              ].map((m) => (
                <div key={m.email} className="flex items-center justify-between p-3 rounded-lg bg-aethelos-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aethelos-crimson to-aethelos-red flex items-center justify-center text-white text-xs font-bold">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-aethelos-text text-sm">{m.name}</p>
                      <p className="text-xs text-aethelos-muted">{m.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-bold text-aethelos-text">API Keys</h2>
              <p className="text-sm text-aethelos-muted mt-1">Configure your own API keys for AI, SMS, and email services. Keys are encrypted at rest.</p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-aethelos-muted">Loading API keys...</div>
            ) : (
              <>
                <div className="p-5 rounded-xl border border-aethelos-border space-y-4 bg-aethelos-card/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-aethelos-text">OpenAI</h3>
                      <p className="text-xs text-aethelos-muted">AI-powered assessment insights and agent intelligence</p>
                    </div>
                    <Badge active={!!apiKeys['openai']?.is_configured}>
                      {apiKeys['openai']?.is_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">API Key</label>
                    <div className="flex gap-2">
                      <input type="password" className={inputClass + " flex-1"} placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
                      <Btn onClick={() => saveApiKey('openai', { api_key: openaiKey })} disabled={saving === 'openai' || !openaiKey}>
                        {saving === 'openai' ? 'Saving...' : 'Save'}
                      </Btn>
                      {apiKeys['openai']?.is_configured && (
                        <button className="px-3 py-2 rounded-lg text-sm font-medium text-aethelos-crimson hover:bg-aethelos-crimson/10 transition-all" onClick={() => deleteApiKey('openai')}>Clear</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-aethelos-border space-y-4 bg-aethelos-card/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-aethelos-text">Twilio</h3>
                      <p className="text-xs text-aethelos-muted">SMS and voice outreach for appointment reminders and follow-ups</p>
                    </div>
                    <Badge active={!!apiKeys['twilio']?.is_configured}>
                      {apiKeys['twilio']?.is_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Account SID</label>
                      <input type="password" className={inputClass} placeholder="AC..." value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Auth Token</label>
                      <input type="password" className={inputClass} placeholder="••••••••" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">Phone Number</label>
                      <input type="text" className={inputClass} placeholder="+12025551234" value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Btn onClick={() => saveApiKey('twilio', { api_key: twilioSid, api_secret: twilioToken, config_json: { phone_number: twilioPhone } })} disabled={saving === 'twilio' || !twilioSid || !twilioToken}>
                      {saving === 'twilio' ? 'Saving...' : 'Save'}
                    </Btn>
                    {apiKeys['twilio']?.is_configured && (
                      <button className="px-3 py-2 rounded-lg text-sm font-medium text-aethelos-crimson hover:bg-aethelos-crimson/10 transition-all" onClick={() => deleteApiKey('twilio')}>Clear</button>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-aethelos-border space-y-4 bg-aethelos-card/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-aethelos-text">Email Service</h3>
                      <p className="text-xs text-aethelos-muted">Transactional email (Resend, Postmark, or SendGrid) for X-Date campaigns</p>
                    </div>
                    <Badge active={!!apiKeys['email']?.is_configured}>
                      {apiKeys['email']?.is_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-aethelos-muted uppercase tracking-wider mb-2">API Key</label>
                    <div className="flex gap-2">
                      <input type="password" className={inputClass + " flex-1"} placeholder="re_... / ..." value={emailKey} onChange={(e) => setEmailKey(e.target.value)} />
                      <Btn onClick={() => saveApiKey('email', { api_key: emailKey })} disabled={saving === 'email' || !emailKey}>
                        {saving === 'email' ? 'Saving...' : 'Save'}
                      </Btn>
                      {apiKeys['email']?.is_configured && (
                        <button className="px-3 py-2 rounded-lg text-sm font-medium text-aethelos-crimson hover:bg-aethelos-crimson/10 transition-all" onClick={() => deleteApiKey('email')}>Clear</button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-bold text-aethelos-text">Third-Party Integrations</h2>
            <div className="space-y-3">
              {/* Google Calendar */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-aethelos-border bg-aethelos-card/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-lg">📅</div>
                  <div>
                    <p className="font-medium text-aethelos-text">Google Calendar</p>
                    <p className="text-xs text-aethelos-muted">Sync appointments and availability with Google Calendar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge active={googleConnected}>
                    {googleConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <button
                    onClick={handleGoogleAuth}
                    className="px-4 py-2 rounded-lg border border-aethelos-border text-aethelos-text text-sm font-medium hover:bg-aethelos-card transition-all"
                  >
                    {googleConnected ? 'Reconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {[
                { name: 'Webhook — New Contact', icon: '🔌', connected: false },
                { name: 'Webhook — Policy Renewal', icon: '🔌', connected: false },
                { name: 'DocuSign', icon: '✍️', connected: false },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border border-aethelos-border bg-aethelos-card/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-aethelos-card flex items-center justify-center text-lg">{int.icon}</div>
                    <span className="font-medium text-aethelos-text text-sm">{int.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge active={int.connected}>{int.connected ? 'Connected' : 'Disconnected'}</Badge>
                    <Btn2>{int.connected ? 'Configure' : 'Connect'}</Btn2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
