import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  if (style === 'long') return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days away`;
  if (days < 30) return `${Math.floor(days / 7)} weeks away`;
  return `${Math.floor(days / 30)} months away`;
}

export function getInitials(first: string, last: string): string {
  return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
}

export function truncate(str: string, len = 50): string {
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    Lead: 'bg-blue-100 text-blue-800',
    'Active Prospect': 'bg-purple-100 text-purple-800',
    'Active Client': 'bg-green-100 text-green-800',
    Lost: 'bg-red-100 text-red-800',
    Bound: 'bg-green-100 text-green-800',
    Quoted: 'bg-yellow-100 text-yellow-800',
    Expired: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  Lead: 'text-blue-600 bg-blue-50',
  'Active Prospect': 'text-purple-600 bg-purple-50',
  'Active Client': 'text-green-600 bg-green-50',
  Lost: 'text-red-600 bg-red-50',
};
