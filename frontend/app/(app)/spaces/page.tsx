'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { useSpaceStore } from '@/lib/space-store';

interface Space {
  id: string;
  name: string;
  description: string | null;
}

export default function SpacesPage() {
  const token = useAuthStore((s) => s.token)!;
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpaceId);
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getSpaces(token)
      .then((data) => setSpaces(data.spaces))
      .finally(() => setLoading(false));
  }, [token]);

  async function createSpace() {
    if (!newName.trim()) return;
    const data = await apiClient.createSpace(token, newName.trim());
    setSpaces((s) => [...s, data.space]);
    setNewName('');
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Your Spaces</h1>
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="New space name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createSpace()}
        />
        <button
          onClick={createSpace}
          className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Create
        </button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul className="space-y-2">
          {spaces.map((s) => (
            <li
              key={s.id}
              onClick={() => setActiveSpace(s.id)}
              className={`border rounded p-3 cursor-pointer hover:border-brand-500 ${
                activeSpaceId === s.id ? 'border-brand-500 bg-brand-50' : ''
              }`}
            >
              <p className="font-medium">{s.name}</p>
              {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
