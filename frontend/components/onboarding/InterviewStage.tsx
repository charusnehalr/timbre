'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { Mic, ArrowRight } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Props { spaceId: string; onComplete: () => void; }

const QUESTIONS = [
  "Describe a recent thing you shipped — in the way you'd describe it to a friend.",
  "What's a piece of advice you'd give your 22-year-old self?",
  "Tell me about someone you'd recommend for a job, and why.",
];

function historyKey(spaceId: string) { return `timbre:onboarding:${spaceId}:history`; }

export function InterviewStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [history, setHistory] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(historyKey(spaceId)) ?? '[]'); } catch { return []; }
  });
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const userAnswers = history.filter((m) => m.role === 'user');

  function saveHistory(next: Message[]) {
    setHistory(next);
    localStorage.setItem(historyKey(spaceId), JSON.stringify(next));
  }

  async function handleNext() {
    if (!answer.trim()) return;
    const userMsg: Message = { role: 'user', content: answer.trim() };
    const next = [...history, userMsg];
    saveHistory(next);
    setAnswer('');
    setLoading(true);
    try {
      const res = await apiClient.interviewTurn(token, spaceId, next);
      saveHistory([...next, { role: 'assistant', content: res.reply }]);
    } finally {
      setLoading(false);
    }
    if (qIdx < QUESTIONS.length - 1) setQIdx(qIdx + 1);
  }

  return (
    <div>
      <div className="t-label" style={{ marginBottom: 14 }}>Interview</div>
      <h1 style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14 }}>
        First, tell us how you talk.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-mute)', lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
        Answer three short questions out loud or in writing. We&apos;re not grading the answers — we&apos;re listening to the shape of them.
      </p>

      <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className="t-label">Question {qIdx + 1} of 3</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 20, height: 2, borderRadius: 2,
                  background: i <= qIdx ? 'var(--accent)' : 'var(--stroke)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.4, marginBottom: 20, fontWeight: 500 }}>
          {QUESTIONS[qIdx]}
        </div>

        <textarea
          className="field"
          placeholder="Type your answer, or click the mic to speak…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          style={{ minHeight: 140, fontSize: 15 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button className="btn-ghost">
            <Mic size={14} /> Record instead
          </button>
          <button
            className="btn-primary"
            disabled={!answer.trim() || loading}
            onClick={handleNext}
          >
            {loading ? '…' : qIdx < QUESTIONS.length - 1 ? 'Next question' : 'Continue'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <p className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
        Typical answer: 40–120 words. Longer is better.
      </p>

      {userAnswers.length >= QUESTIONS.length && (
        <button
          className="btn-primary"
          onClick={onComplete}
          style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
        >
          Continue to writing samples <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
