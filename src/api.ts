import { content, type Account, type Draft, type Report } from './content';

const api = import.meta.env.VITE_PLANNER_API?.replace(/\/$/, '');
export const isDemo = !api;
export const accountUrl = import.meta.env.VITE_ACCOUNT_URL;
export const membershipUrl = import.meta.env.VITE_MEMBERSHIP_URL;
const storageKey = 'syllapass-topic-demo-v1';
type Demo = { session?: boolean; day?: string; used?: number; reports?: Report[] };
const today = () => new Date().toDateString();

function read(): Demo {
  try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}'); }
  catch { return {}; }
}
function write(value: Demo) { localStorage.setItem(storageKey, JSON.stringify(value)); }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(api + path, { credentials: 'include', ...init });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? 'Something went wrong. Please try again.');
  }
  return response.json();
}

export async function loadAccount(): Promise<Account | null> {
  if (api) return request('/session');
  const state = read();
  return state.session ? { dailyLimit: 2, remaining: Math.max(0, 2 - (state.day === today() ? state.used ?? 0 : 0)) } : null;
}

export async function startDemo() {
  write({ ...read(), session: true });
  return loadAccount();
}

export async function listReports(): Promise<Report[]> {
  if (api) return request('/reports');
  return (read().reports ?? []).filter(report => Date.parse(report.expiresAt) > Date.now());
}

export function sampleReport(draft: Draft): Report {
  const config = content[draft.assessment];
  return { id: 'sample', title: draft.mode === 'refine' ? 'Sample question refinement' : 'Sample topic plan', createdAt: '', expiresAt: '',
    directions: draft.mode === 'refine' ? [config.sample[0]] : config.sample };
}

export async function submitDraft(draft: Draft): Promise<{ report: Report; account: Account }> {
  if (api) return request('/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
  const account = await loadAccount();
  if (!account?.remaining) throw new Error('You’ve reached today’s topic plan limit.');
  const sample = sampleReport(draft);
  const report: Report = { ...sample, id: crypto.randomUUID(), title: draft.assessment.toUpperCase() + ' · ' + draft.subject,
    createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 15 * 86400000).toISOString() };
  const reports = await listReports();
  write({ session: true, day: today(), used: account.dailyLimit - account.remaining + 1, reports: [report, ...reports] });
  return { report, account: { ...account, remaining: account.remaining - 1 } };
}
