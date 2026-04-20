'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  spaceId: string;
  onComplete: () => void;
}

export function InterviewStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.interviewTurn(token, spaceId, nextHistory);
      setHistory([...nextHistory, { role: 'assistant', content: res.reply }]);
      setTurnCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Let's start with a conversation</h2>
      <p className="text-gray-600 text-sm">
        I'll ask you 8-10 questions to understand how you think and write.
      </p>
      <div className="border rounded p-4 space-y-3 min-h-48 max-h-80 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-gray-400 text-sm">Click "Start" or type a message to begin.</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`rounded-lg px-3 py-2 text-sm max-w-sm ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100'
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm">Thinking…</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Your answer…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {turnCount >= 5 && (
        <button
          onClick={onComplete}
          className="w-full border border-brand-600 text-brand-600 rounded px-4 py-2 text-sm font-medium hover:bg-brand-50"
        >
          Continue to writing samples →
        </button>
      )}
    </div>
  );
}
