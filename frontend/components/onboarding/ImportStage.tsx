'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

interface Sample {
  preview: string;
  wordCount: number;
}

interface Props {
  spaceId: string;
  onComplete: () => void;
}

export function ImportStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [text, setText] = useState('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getCorpusItems(token, spaceId).then(({ items }) => {
      const loaded = items
        .filter((it) => it.source === 'import')
        .map((it) => ({
          preview: it.content.slice(0, 120),
          wordCount: it.content.trim().split(/\s+/).length,
        }));
      setSamples(loaded);
    }).catch(() => {});
  }, [token, spaceId]);

  const totalWords = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const canAnalyze = samples.length >= 3 && totalWords >= 500;

  async function addSample() {
    const words = text.trim().split(/\s+/).length;
    if (words < 50) {
      setError('Too short — paste at least 50 words.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.addCorpus(token, spaceId, text.trim());
      setSamples((s) => [...s, { preview: text.trim().slice(0, 120), wordCount: words }]);
      setText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save sample');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Add writing samples</h2>
        <p className="text-gray-500 text-sm mt-1">
          Paste LinkedIn posts, emails, essays — anything you've written. Need 3+ samples, 500+ words total.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{samples.length}/3 samples</span>
          <span>{totalWords}/500 words</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${Math.min((totalWords / 500) * 100, 100)}%` }}
          />
        </div>
        {canAnalyze && (
          <p className="text-xs text-green-600 font-medium">✓ Ready to analyze</p>
        )}
      </div>

      {/* Saved samples list */}
      {samples.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saved samples</p>
          {samples.map((s, i) => (
            <div key={i} className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-500 font-bold text-sm shrink-0">✓</span>
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-medium mb-0.5">
                  Sample {i + 1} — {s.wordCount} words saved
                </p>
                <p className="text-sm text-gray-600 truncate">{s.preview}…</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm min-h-36 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Paste a writing sample here…"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {text.trim() ? `${text.trim().split(/\s+/).length} words` : '0 words'}
          </span>
          <button
            onClick={addSample}
            disabled={loading || !text.trim()}
            className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            {loading ? 'Saving…' : 'Add sample'}
          </button>
        </div>
      </div>

      {canAnalyze && (
        <button
          onClick={onComplete}
          className="w-full bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Analyze my voice →
        </button>
      )}
    </div>
  );
}
