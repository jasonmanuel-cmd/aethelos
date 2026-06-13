'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">Live on Vercel</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight leading-tight">
              Financial Services
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Operating System
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              AI-native platform to track leads, automate outreach, manage policies, and grow your book of business.
              Built for financial professionals who demand world-class tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="xl" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-sm text-stone-500 mb-4">Integrated with</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-xs font-semibold text-stone-400">VERCEL</div>
              <div className="text-xs font-semibold text-stone-400">Next.js</div>
              <div className="text-xs font-semibold text-stone-400">TypeScript</div>
              <div className="text-xs font-semibold text-stone-400">Tailwind</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Everything You Need</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Comprehensive tools to manage your financial services business end-to-end.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                AI-powered lead qualification and tracking system to never miss a prospect.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">AI Integration</Badge>
                <Badge variant="secondary" size="sm">Smart Routing</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <span className="text-2xl">📅</span>
              </div>
              <CardTitle>Scheduling System</CardTitle>
              <CardDescription>
                Automated appointment scheduling with AI-powered calendar integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">AI Optimization</Badge>
                <Badge variant="secondary" size="sm">Real-time Sync</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle>Pipeline Analytics</CardTitle>
              <CardDescription>
                Real-time pipeline visualization and conversion analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">Live Data</Badge>
                <Badge variant="secondary" size="sm">Custom Reports</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle>Automated Workflows</CardTitle>
              <CardDescription>
                No-code automation builder for repetitive tasks and processes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">Drag & Drop</Badge>
                <Badge variant="secondary" size="sm">Quick Setup</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>
                Custom AI agents for lead scoring, follow-ups, and customer engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">Smart Routing</Badge>
                <Badge variant="secondary" size="sm">Continuous Learning</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <span className="text-2xl">📈</span>
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Real-time analytics and KPI tracking for your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="primary" size="sm">Live Metrics</Badge>
                <Badge variant="secondary" size="sm">Custom Views</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Seamless Integration</h2>
              <p className="text-lg text-stone-600">
                Connect your existing tools and workflows with our universal API.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">Universal API</h3>
                  <p className="text-sm text-stone-600">Connect to any system with our RESTful API and webhooks.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔄</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">Real-time Sync</h3>
                  <p className="text-sm text-stone-600">Instant data synchronization across all your devices and platforms.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">Enterprise Security</h3>
                  <p className="text-sm text-stone-900">Bank-grade security with JWT authentication and role-based access control.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl transform rotate-3" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-stone-200">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-900">Connection Status</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full w-[85%]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900">AI Agent</div>
                      <div className="text-xs text-stone-500">Lead qualification active</div>
                    </div>
                    <Badge variant="primary" size="sm">Online</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900">Pipeline</div>
                      <div className="text-xs text-stone-500">85% conversion rate</div>
                    </div>
                    <Badge variant="success" size="sm">Excellent</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  <div className="text-xs text-stone-500 mb-2">System Health</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">99.9%</div>
                      <div className="text-xs text-stone-500">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">500ms</div>
                      <div className="text-xs text-stone-500">Latency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">24/7</div>
                      <div className="text-xs text-stone-500">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Business?</h2>
              <p className="text-lg text-blue-100">
                Join thousands of financial professionals using FSOS to automate their operations and focus on growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}