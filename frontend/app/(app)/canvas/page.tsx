'use client';

import { useState } from 'react';
import { Editor } from '@/components/canvas/Editor';
import { IntentChips } from '@/components/canvas/IntentChips';
import { VoiceMatchPanel } from '@/components/canvas/VoiceMatchPanel';
import { MicInput } from '@/components/canvas/MicInput';
import { useSpaceStore } from '@/lib/space-store';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

export default function CanvasPage() {
  const token = useAuthStore((s) => s.token)!;
  const spaceId = useSpaceStore((s) => s.activeSpaceId);
  const [task, setTask] = useState('');
  const [draft, setDraft] = useState('');
  const [voiceScore, setVoiceScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState('');

  async function handleGenerate() {
    if (!spaceId || !task.trim()) return;
    setLoading(true);
    setDraft('');
    setVoiceScore(null);
    try {
      for await (const chunk of apiClient.generateStream(token, spaceId, task, selectedIntent)) {
        if (chunk.startsWith('data:')) {
          try {
            const parsed = JSON.parse(chunk.slice(5).trim());
            setDraft(parsed.draft ?? '');
            setVoiceScore(parsed.voice_match_score ?? null);
          } catch {
            setDraft((d) => d + chunk);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full gap-4 p-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="What do you want to write? e.g. LinkedIn post about shipping fast"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <MicInput onTranscript={(t) => setTask(t)} token={token} />
          <button
            onClick={handleGenerate}
            disabled={loading || !spaceId || !task.trim()}
            className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
        <IntentChips selected={selectedIntent} onSelect={setSelectedIntent} />
        <Editor content={draft} onChange={setDraft} />
      </div>
      <VoiceMatchPanel score={voiceScore} />
    </div>
  );
}
