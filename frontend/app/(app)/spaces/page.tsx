'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { useSpaceStore } from '@/lib/space-store';

interface Space {
  id: string;
  name: string;
  description: string | null;
}

const STEPS = [
  {
    step: '1',
    title: 'Create a Space',
    desc: 'A Space holds your voice profile. Think of it as a persona — one for work, one for personal writing, etc.',
    icon: '🗂️',
  },
  {
    step: '2',
    title: 'Run Onboarding',
    desc: 'Answer a short interview and paste writing samples. Timbre builds your voice fingerprint in ~60 seconds.',
    icon: '🎙️',
  },
  {
    step: '3',
    title: 'Generate on Canvas',
    desc: 'Describe what you want to write. Timbre drafts it in your voice and scores how closely it matches.',
    icon: '✍️',
  },
];

export default function SpacesPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token)!;
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpaceId);
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .getSpaces(token)
      .then((data) => setSpaces(data.spaces))
      .catch(() => setError('Failed to load spaces. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [token]);

  async function createSpace() {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const data = await apiClient.createSpace(token, newName.trim());
      const created = data.space as Space;
      setSpaces((s) => [...s, created]);
      setActiveSpace(created.id);
      setNewName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create space');
    } finally {
      setCreating(false);
    }
  }

  function selectAndGo(id: string) {
    setActiveSpace(id);
    router.push('/onboarding');
  }

  const isNew = !loading && spaces.length === 0;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Your Spaces</h1>
      <p className="text-sm text-gray-500 mb-8">Each Space has its own voice profile and generation history.</p>

      {/* New-user guide — only shown when no spaces exist */}
      {isNew && (
        <div className="mb-8 rounded-xl border border-brand-200 bg-brand-50 p-6">
          <p className="text-sm font-semibold text-brand-700 mb-4 uppercase tracking-wide">Getting started</p>
          <div className="space-y-4">
            {STEPS.map(({ step, title, desc, icon }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-sm">{icon} {title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-700 mt-5 font-medium">👇 Start by creating your first Space below</p>
        </div>
      )}

      {/* Create input */}
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={isNew ? 'e.g. Work, Personal, Job Hunt…' : 'New space name'}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createSpace()}
        />
        <button
          onClick={createSpace}
          disabled={creating || !newName.trim()}
          className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-brand-700 transition-colors"
        >
          {creating ? 'Creating…' : 'Create'}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Space list */}
      {loading ? (
        <p className="text-sm text-gray-400 mt-6">Loading…</p>
      ) : (
        <ul className="space-y-2 mt-6">
          {spaces.map((s) => (
            <li
              key={s.id}
              className={`border rounded-lg p-4 cursor-pointer hover:border-brand-500 transition-colors ${
                activeSpaceId === s.id ? 'border-brand-500 bg-brand-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div onClick={() => setActiveSpace(s.id)}>
                  <p className="font-medium text-sm">{s.name}</p>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  {activeSpaceId === s.id && (
                    <span className="text-xs text-brand-600 font-medium mt-1 block">Active</span>
                  )}
                </div>
                <button
                  onClick={() => selectAndGo(s.id)}
                  className="text-xs text-brand-600 border border-brand-300 rounded px-3 py-1 hover:bg-brand-50 transition-colors ml-4 shrink-0"
                >
                  {activeSpaceId === s.id ? 'Go to Onboarding →' : 'Select & Onboard →'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
