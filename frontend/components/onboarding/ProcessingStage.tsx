'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { TimbreFingerprint } from '@/components/ui/TimbreFingerprint';
import { useTweaksStore, ACCENT_PALETTES } from '@/lib/tweaks-store';

interface Props { spaceId: string; onComplete: () => void; }

const STEPS = [
  'Reading samples',
  'Extracting n-grams',
  'Measuring cadence',
  'Mapping vocabulary',
  'Finding signature moves',
  'Building fingerprint',
];

export function ProcessingStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const accent = useTweaksStore((s) => s.accent);
  const accentHex = ACCENT_PALETTES[accent].accent;
  const [step, setStep] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Kick off API call immediately
  useEffect(() => {
    apiClient.finalizeOnboarding(token, spaceId)
      .then(() => setApiDone(true))
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Analysis failed'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate steps
  useEffect(() => {
    if (step >= STEPS.length) {
      if (apiDone) setTimeout(onComplete, 600);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 750 + Math.random() * 400);
    return () => clearTimeout(t);
  }, [step, apiDone, onComplete]);

  const score = Math.min(0.95, 0.3 + step * 0.11);

  if (errorMsg) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ color: 'var(--danger)', marginBottom: 12 }}>Analysis failed</p>
        <p className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24 }}>{errorMsg}</p>
        <button className="btn-ghost" onClick={() => { setErrorMsg(''); setStep(0); setApiDone(false); }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 36 }}>
        <TimbreFingerprint size={260} score={score} intensity={1.8} accentHex={accentHex} />
      </div>

      <div className="t-label" style={{ marginBottom: 10 }}>Training</div>
      <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 14 }}>
        Listening to your voice…
      </h2>
      <p style={{ color: 'var(--text-mute)', fontSize: 14, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 36px' }}>
        This usually takes a minute. We&apos;re not training on your data — we&apos;re training a tiny adapter on top of the base model.
      </p>

      <div className="glass" style={{ padding: 22, textAlign: 'left', maxWidth: 440, margin: '0 auto' }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
              color: i < step ? 'var(--text-mute)' : i === step ? 'var(--text)' : 'var(--text-dim)',
              transition: 'color 0.3s',
            }}
          >
            <div
              style={{
                width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                border: `1.5px solid ${i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'var(--stroke-hi)'}`,
                background: i < step ? 'var(--accent)' : 'transparent',
                boxShadow: i === step ? '0 0 10px var(--accent-glow)' : 'none',
                animation: i === step ? 'pulse-glow 1.2s ease-in-out infinite' : 'none',
                transition: 'all 0.3s',
              }}
            />
            <span className="mono" style={{ fontSize: 12, letterSpacing: '0.02em', flex: 1 }}>{s}</span>
            {i < step && (
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>done</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
