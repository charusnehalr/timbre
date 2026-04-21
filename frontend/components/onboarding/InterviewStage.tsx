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

function historyKey(spaceId: string) {
  return `timbre:onboarding:${spaceId}:history`;
}

export function InterviewStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [history, setHistory] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(historyKey(spaceId));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const userAnswers = history.filter((m) => m.role === 'user');
  const turnCount = userAnswers.length;

  function saveHistory(next: Message[]) {
    setHistory(next);
    localStorage.setItem(historyKey(spaceId), JSON.stringify(next));
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const nextHistory = [...history, userMsg];
    saveHistory(nextHistory);
    setInput('');
    setLoading(true);
    try {
      const res = await apiClient.interviewTurn(token, spaceId, nextHistory);
      saveHistory([...nextHistory, { role: 'assistant', content: res.reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Let's start with a conversation</h2>
        {userAnswers.length > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            {userAnswers.length} answer{userAnswers.length > 1 ? 's' : ''} captured
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm">
        I'll ask you 8-10 questions to understand how you think and write.
      </p>

      {/* Chat */}
      <div className="border rounded-lg p-4 space-y-3 min-h-48 max-h-80 overflow-y-auto bg-gray-50">
        {history.length === 0 && (
          <p className="text-gray-400 text-sm">Type a message or click Send to begin.</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`rounded-lg px-3 py-2 text-sm max-w-sm ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white border'
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <p className="bg-white border rounded-lg px-3 py-2 text-sm text-gray-400">Thinking…</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Your answer…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {/* Saved answers summary */}
      {userAnswers.length > 0 && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200 space-y-2">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            ✓ Answers captured this session
          </p>
          {userAnswers.map((m, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-green-500 font-bold shrink-0">Q{i + 1}</span>
              <p className="text-gray-700 line-clamp-2">{m.content}</p>
            </div>
          ))}
        </div>
      )}

      {turnCount >= 5 && (
        <button
          onClick={onComplete}
          className="w-full bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Continue to writing samples →
        </button>
      )}
    </div>
  );
}
