'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  service: string;
  api_key: string;
  api_secret?: string;
  is_configured: boolean;
  config_json?: Record<string, any>;
}

interface ApiKeyForm {
  api_key?: string;
  api_secret?: string;
  config_json?: Record<string, any>;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Key form state
  const [openaiKey, setOpenaiKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [emailKey, setEmailKey] = useState('');

  useEffect(() => {
    loadApiKeys();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fsos_token') : null;
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  };

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/api-keys', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load API keys');
      const data = await res.json();
      const keys: Record<string, ApiKey> = {};
      (data as ApiKey[]).forEach((k: ApiKey) => { keys[k.service] = k; });
      setApiKeys(keys);

      // Populate form fields with masked values
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
    } finally {
      setLoading(false);
    }
  };

  const isMasked = (val: string) => val.includes('••••••••');

  const saveApiKey = async (service: string, form: ApiKeyForm) => {
    try {
      setSaving(service);
      setMessage(null);
      // Don't send masked placeholder values — they'd overwrite the real key
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
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(clean),
      });
      if (!res.ok) throw new Error('Save failed');
      await loadApiKeys();
      setMessage({ type: 'success', text: `${service.toUpperCase()} API key saved` });
    } catch {
      setMessage({ type: 'error', text: `Failed to save ${service.toUpperCase()} API key` });
    } finally {
      setSaving(null);
    }
  };

  const deleteApiKey = async (service: string) => {
    try {
      setSaving(service);
      setMessage(null);
      const res = await fetch(`/api/v1/api-keys/${service}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await loadApiKeys();
      setMessage({ type: 'success', text: `${service.toUpperCase()} API key removed` });
    } catch {
      setMessage({ type: 'error', text: `Failed to delete ${service.toUpperCase()} API key` });
    } finally {
      setSaving(null);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'branding', label: 'Branding' },
    { id: 'carriers', label: 'Carriers' },
    { id: 'team', label: 'Team' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your agency platform</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Agency Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Agency Name</label>
                <input type="text" className="input-field" defaultValue="COAI Demo Agency" />
              </div>
              <div>
                <label className="label">Domain</label>
                <input type="text" className="input-field" defaultValue="demo.coaibakersfield.com" />
              </div>
              <div>
                <label className="label">Default Timezone</label>
                <select className="input-field" defaultValue="America/Los_Angeles">
                  <option>America/New_York</option>
                  <option>America/Chicago</option>
                  <option>America/Denver</option>
                  <option>America/Los_Angeles</option>
                </select>
              </div>
              <div>
                <label className="label">Default Currency</label>
                <select className="input-field" defaultValue="USD">
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <button className="btn-primary">Save Settings</button>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">White-Label Branding</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Color</label>
                <input type="color" className="input-field h-10" defaultValue="#2563EB" />
              </div>
              <div>
                <label className="label">Secondary Color</label>
                <input type="color" className="input-field h-10" defaultValue="#7C3AED" />
              </div>
              <div className="col-span-2">
                <label className="label">Logo URL</label>
                <input type="text" className="input-field" placeholder="https://your-logo-url.com/logo.png" />
              </div>
            </div>
            <button className="btn-primary">Update Branding</button>
          </div>
        )}

        {activeTab === 'carriers' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Insurance Carriers</h2>
            {['Progressive', 'Travelers', 'Nationwide', 'Prudential', 'MetLife'].map((c) => (
              <div key={c} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{c}</span>
                <span className="badge bg-green-50 text-green-700">Connected</span>
              </div>
            ))}
            <button className="btn-secondary">+ Add Carrier</button>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
              <button className="btn-primary">+ Invite</button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Jason Miller', email: 'jasonm@coaibakersfield.com', role: 'admin' },
              ].map((m) => (
                <div key={m.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fsos-400 to-brand-500 flex items-center justify-center text-white text-xs font-bold">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <span className="badge bg-purple-50 text-purple-700 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
            <p className="text-sm text-gray-500 -mt-4">
              Configure your own API keys for AI, SMS, and email services. Keys are encrypted at rest.
              The platform falls back to environment defaults when no tenant key is set.
            </p>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading API keys...</div>
            ) : (
              <>
                {/* OpenAI */}
                <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">OpenAI</h3>
                      <p className="text-xs text-gray-500">AI-powered assessment insights and agent intelligence</p>
                    </div>
                    <span className={`badge ${apiKeys['openai']?.is_configured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {apiKeys['openai']?.is_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div>
                    <label className="label text-xs">API Key</label>
                    <div className="flex gap-2">
                      <input type="password" className="input-field flex-1 font-mono text-xs"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)} />
                      <button className="btn-primary text-xs px-3" disabled={saving === 'openai' || !openaiKey}
                        onClick={() => saveApiKey('openai', { api_key: openaiKey })}>
                        {saving === 'openai' ? 'Saving...' : 'Save'}
                      </button>
                      {apiKeys['openai']?.is_configured && (
                        <button className="btn-ghost text-xs px-3 text-red-500"
                          onClick={() => deleteApiKey('openai')}>
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Twilio */}
                <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Twilio</h3>
                      <p className="text-xs text-gray-500">SMS and voice outreach for appointment reminders and follow-ups</p>
                    </div>
                    <span className={`badge ${apiKeys['twilio']?.is_configured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {apiKeys['twilio']?.is_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Account SID</label>
                      <input type="password" className="input-field font-mono text-xs"
                        placeholder="AC..."
                        value={twilioSid}
                        onChange={(e) => setTwilioSid(e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Auth Token</label>
                      <input type="password" className="input-field font-mono text-xs"
                        placeholder="••••••••"
                        value={twilioToken}
                        onChange={(e) => setTwilioToken(e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Phone Number</label>
                      <input type="text" className="input-field font-mono text-xs"
                        placeholder="+12025551234"
                        value={twilioPhone}
                        onChange={(e) => setTwilioPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-xs px-3"
                      disabled={saving === 'twilio' || !twilioSid || !twilioToken}
                      onClick={() => saveApiKey('twilio', {
                        api_key: twilioSid,
                        api_secret: twilioToken,
                        config_json: { phone_number: twilioPhone },
                      })}>
                      {saving === 'twilio' ? 'Saving...' : 'Save'}
                    </button>
                    {apiKeys['twilio']?.is_configured && (
                      <button className="btn-ghost text-xs px-3 text-red-500"
                        onClick={() => deleteApiKey('twilio')}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Service</h3>
                      <p className="text-xs text-gray-500">Transactional email (Resend, Postmark, or SendGrid) for X-Date campaigns and notifications</p>
                    </div>
                    <span className={`badge ${apiKeys['email']?.is_configured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {apiKeys['email']?.is_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div>
                    <label className="label text-xs">API Key</label>
                    <div className="flex gap-2">
                      <input type="password" className="input-field flex-1 font-mono text-xs"
                        placeholder="re_... / ..."
                        value={emailKey}
                        onChange={(e) => setEmailKey(e.target.value)} />
                      <button className="btn-primary text-xs px-3" disabled={saving === 'email' || !emailKey}
                        onClick={() => saveApiKey('email', { api_key: emailKey })}>
                        {saving === 'email' ? 'Saving...' : 'Save'}
                      </button>
                      {apiKeys['email']?.is_configured && (
                        <button className="btn-ghost text-xs px-3 text-red-500"
                          onClick={() => deleteApiKey('email')}>
                          Clear
                        </button>
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
            <h2 className="text-lg font-bold text-gray-900">Third-Party Integrations</h2>
            <div className="space-y-3">
              {[
                { name: 'Webhook — New Contact', icon: '🔌', connected: false },
                { name: 'Webhook — Policy Renewal', icon: '🔌', connected: false },
                { name: 'Google Calendar', icon: '📅', connected: false },
                { name: 'DocuSign', icon: '✍️', connected: false },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{int.icon}</span>
                    <span className="font-medium text-gray-900 text-sm">{int.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${int.connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {int.connected ? 'Connected' : 'Disconnected'}
                    </span>
                    <button className="btn-ghost text-xs">{int.connected ? 'Configure' : 'Connect'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
