'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

interface Props {
  spaceId: string;
  onComplete: () => void;
}

export function ImportStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function addSample() {
    if (text.trim().split(/\s+/).length < 50) {
      setMsg('Paste at least 50 words.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.addCorpus(token, spaceId, text.trim());
      setCount((c) => c + 1);
      setText('');
      setMsg(`Sample ${count + 1} added.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Add writing samples</h2>
      <p className="text-gray-600 text-sm">
        Paste LinkedIn posts, essays, emails, or any writing. Minimum 3 samples, 500 words total.
      </p>
      <textarea
        className="w-full border rounded px-3 py-2 text-sm min-h-40 resize-y"
        placeholder="Paste a writing sample here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <div className="flex gap-2">
        <button
          onClick={addSample}
          disabled={loading || !text.trim()}
          className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add sample'}
        </button>
        <span className="text-sm text-gray-500 self-center">{count} sample(s) added</span>
      </div>
      {count >= 3 && (
        <button
          onClick={onComplete}
          className="w-full border border-brand-600 text-brand-600 rounded px-4 py-2 text-sm font-medium hover:bg-brand-50"
        >
          Analyze my voice →
        </button>
      )}
    </div>
  );
}
