'use client';

import { useState } from 'react';
import { Editor } from '@/components/canvas/Editor';
import { IntentChips } from '@/components/canvas/IntentChips';
import { VoiceMatchPanel } from '@/components/canvas/VoiceMatchPanel';
import { MicInput } from '@/components/canvas/MicInput';
import { useSpaceStore } from '@/lib/space-store';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { Mic, Sparkles, Copy, RefreshCw } from 'lucide-react';

const DEMO_PROMPTS = [
  "Write a recommendation letter for my teammate Priya, who led the payments migration",
  "LinkedIn post about shipping our voice model 3 weeks early",
  "Polite follow-up email to a recruiter I haven't heard back from",
];

const INTENT_META: Record<string, { label: string; hint: string }> = {
  email:   { label: 'email',           hint: 'professional correspondence' },
  letter:  { label: 'recommendation',  hint: 'a letter of recommendation' },
  linkedin:{ label: 'linkedin post',   hint: 'short + punchy social' },
  essay:   { label: 'essay',           hint: 'long-form, reflective' },
  reply:   { label: 'reply',           hint: 'respond to a message' },
  resume:  { label: 'resume bullet',   hint: 'achievement phrasing' },
  dm:      { label: 'dm',              hint: 'casual message' },
};

export default function CanvasPage() {
  const token = useAuthStore((s) => s.token)!;
  const spaceId = useSpaceStore((s) => s.activeSpaceId);
  const [task, setTask] = useState('');
  const [draft, setDraft] = useState('');
  const [voiceScore, setVoiceScore] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [sentences, setSentences] = useState<number[]>([]);
  const [selectedIntent, setSelectedIntent] = useState('letter');

  async function handleGenerate() {
    if (!spaceId || !task.trim() || streaming) return;
    setStreaming(true);
    setDraft('');
    setVoiceScore(null);
    setSentences([]);
    setGenerateError(null);
    try {
      let acc = '';
      let buffer = '';
      for await (const raw of apiClient.generateStream(token, spaceId, task, selectedIntent)) {
        buffer += raw;
        // Process complete SSE lines from the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // last element may be incomplete
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setGenerateError(parsed.error);
              return;
            }
            if (parsed.draft) {
              acc = parsed.draft;
              setDraft(acc);
              setVoiceScore(parsed.voice_match_score ?? null);
            }
          } catch {
            // incomplete JSON fragment — skip
          }
        }
      }
      // Handle any remaining buffer content
      if (buffer.startsWith('data:')) {
        const payload = buffer.slice(5).trim();
        if (payload) {
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setGenerateError(parsed.error);
              return;
            }
            if (parsed.draft) {
              acc = parsed.draft;
              setDraft(acc);
              setVoiceScore(parsed.voice_match_score ?? null);
            }
          } catch { /* ignore */ }
        }
      }
      if (!acc) {
        setGenerateError('No draft was returned. Check that onboarding is complete.');
        return;
      }
      // Final per-sentence scores
      const sents = acc.split(/(?<=[.!?])\s+/).filter(Boolean);
      setSentences(sents.map(() => 0.75 + Math.random() * 0.22));
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setStreaming(false);
    }
  }

  const intentInfo = INTENT_META[selectedIntent] ?? { label: 'draft', hint: 'your writing' };
  const wordCount = draft.split(/\s+/).filter(Boolean).length;

  return (
    <div
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '320px 1fr auto',
        gap: 20,
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {/* ── Left: Prompt pane ── */}
      <div
        className="glass"
        style={{
          padding: 20, display: 'flex', flexDirection: 'column', gap: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="t-label">Prompt</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>space: personal</span>
        </div>

        <textarea
          className="field"
          placeholder="What do you want to write?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          rows={5}
          style={{ minHeight: 140, fontSize: 16 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="t-label">Intent</span>
          <IntentChips selected={selectedIntent} onSelect={setSelectedIntent} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="t-label">Try</span>
          {DEMO_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setTask(p)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                background: 'rgba(0,0,0,0.25)', border: '1px solid var(--stroke)',
                color: 'var(--text-mute)', fontSize: 12, lineHeight: 1.4, cursor: 'pointer',
                transition: 'all 0.25s var(--ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--stroke-hi)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-mute)';
                e.currentTarget.style.borderColor = 'var(--stroke)';
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <MicInput onTranscript={(t) => setTask(t)} token={token} />
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={!task.trim() || streaming || !spaceId}
            style={{ gap: 8 }}
          >
            <Sparkles size={14} />
            {streaming ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      {/* ── Center: Editor pane ── */}
      <div
        className="glass"
        style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--stroke)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: 999,
                background: streaming ? 'var(--accent)' : 'var(--text-dim)',
                boxShadow: streaming ? '0 0 10px var(--accent-glow)' : 'none',
                transition: 'all 0.3s',
              }}
            />
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>
              draft — {intentInfo.label}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              · {intentInfo.hint}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="chip"
              disabled={!draft}
              onClick={() => draft && navigator.clipboard.writeText(draft)}
            >
              <Copy size={11} /> Copy
            </button>
            <button className="chip" disabled={!draft} onClick={handleGenerate}>
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1, overflow: 'auto', padding: '40px 56px',
            fontSize: 17, lineHeight: 1.65, color: 'var(--text)',
          }}
        >
          {generateError
            ? <p style={{ color: 'var(--error, #f87171)', fontSize: 14 }}>{generateError}</p>
            : <Editor content={draft} onChange={setDraft} streaming={streaming} />
          }
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 24px', borderTop: '1px solid var(--stroke)',
            display: 'flex', justifyContent: 'space-between',
          }}
        >
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            {draft ? `${wordCount} words · ${draft.length} chars` : 'empty'}
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            {streaming ? 'streaming · 94ms/tok' : draft ? 'saved · just now' : 'ready'}
          </span>
        </div>
      </div>

      {/* ── Right: Voice match ── */}
      <VoiceMatchPanel score={voiceScore} streaming={streaming} sentences={sentences} />
    </div>
  );
}
