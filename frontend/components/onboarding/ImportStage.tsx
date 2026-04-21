'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Sample { preview: string; wordCount: number; }
interface Props { spaceId: string; onComplete: () => void; onBack: () => void; }

const SOURCES = [
  { id: 'email',    label: 'Email',            count: '~3 years',  icon: '@' },
  { id: 'docs',     label: 'Docs & Drive',      count: 'last 500',  icon: '⊡' },
  { id: 'slack',    label: 'Slack DMs',         count: 'opted-in',  icon: '#' },
  { id: 'linkedin', label: 'LinkedIn posts',    count: 'all',       icon: 'in' },
  { id: 'notion',   label: 'Notion',            count: 'pages',     icon: 'N' },
  { id: 'upload',   label: 'Upload .txt / .pdf', count: 'manual',   icon: '↑' },
];

export function ImportStage({ spaceId, onComplete, onBack }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [text, setText] = useState('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(['email']));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getCorpusItems(token, spaceId).then(({ items }) => {
      const loaded = items
        .filter((it) => it.source === 'import')
        .map((it) => ({ preview: it.content.slice(0, 120), wordCount: it.content.trim().split(/\s+/).length }));
      setSamples(loaded);
    }).catch(() => {});
  }, [token, spaceId]);

  const totalWords = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const canAnalyze = samples.length >= 3 && totalWords >= 500;

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  async function addSample() {
    const words = text.trim().split(/\s+/).length;
    if (words < 50) { setError('Too short — paste at least 50 words.'); return; }
    setError(''); setLoading(true);
    try {
      await apiClient.addCorpus(token, spaceId, text.trim());
      setSamples((s) => [...s, { preview: text.trim().slice(0, 120), wordCount: words }]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sample');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="t-label" style={{ marginBottom: 14 }}>Import</div>
      <h1 style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14 }}>
        Let us learn from what you&apos;ve already written.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-mute)', lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
        Pick one or more. Nothing leaves your machine in raw form — we hash and summarize on-device, then only send statistical features to train your profile.
      </p>

      {/* Source cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
        {SOURCES.map((src) => {
          const isSelected = selected.has(src.id);
          return (
            <button
              key={src.id}
              onClick={() => toggle(src.id)}
              style={{
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
                padding: 18, borderRadius: 22, cursor: 'pointer',
                background: isSelected ? 'rgba(180,242,78,0.06)' : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
                border: `1px solid ${isSelected ? 'rgba(180,242,78,0.5)' : 'var(--stroke)'}`,
                backdropFilter: 'blur(28px)',
                transition: 'all 0.3s var(--ease)',
              }}
            >
              <div
                className="mono"
                style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.3)',
                  color: isSelected ? '#0B0B0B' : 'var(--text-mute)',
                  display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 600,
                  transition: 'all 0.3s',
                }}
              >
                {src.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, color: 'var(--text)' }}>{src.label}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{src.count}</div>
              </div>
              <div
                style={{
                  width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                  border: isSelected ? '5px solid var(--accent)' : '1.5px solid var(--stroke-hi)',
                  transition: 'all 0.3s',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Paste sample */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span className="t-label">Paste a writing sample</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            {text.trim() ? `${text.trim().split(/\s+/).length} words` : '0 words'}
          </span>
        </div>
        <textarea
          className="field"
          placeholder="Paste a LinkedIn post, email, essay…"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          rows={5}
          style={{ minHeight: 120 }}
        />
        {error && <p className="mono" style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>{error}</p>}

        {/* Progress */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{samples.length}/3 samples</span>
            </div>
            <div style={{ height: 2, background: 'var(--stroke)', borderRadius: 2 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min((samples.length / 3) * 100, 100)}%` }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{totalWords}/500 words</span>
            </div>
            <div style={{ height: 2, background: 'var(--stroke)', borderRadius: 2 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min((totalWords / 500) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn-primary" onClick={addSample} disabled={loading || !text.trim()}>
            {loading ? 'Saving…' : 'Add sample'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <button
          className="btn-primary"
          onClick={onComplete}
          disabled={!canAnalyze && selected.size === 0}
        >
          Analyze {selected.size} source{selected.size !== 1 ? 's' : ''}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
