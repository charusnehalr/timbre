'use client';

import { useState, useEffect } from 'react';
import { InterviewStage } from '@/components/onboarding/InterviewStage';
import { ImportStage } from '@/components/onboarding/ImportStage';
import { ProcessingStage } from '@/components/onboarding/ProcessingStage';
import { RevealStage } from '@/components/onboarding/RevealStage';
import { useSpaceStore } from '@/lib/space-store';

type Stage = 'interview' | 'import' | 'processing' | 'reveal';
const STAGES: Stage[] = ['interview', 'import', 'processing', 'reveal'];
const STAGE_LABELS = ['01 · interview', '02 · import', '03 · processing', '04 · reveal'];

function stageKey(spaceId: string) {
  return `timbre:onboarding:${spaceId}:stage`;
}

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('interview');
  const spaceId = useSpaceStore((s) => s.activeSpaceId);
  const idx = STAGES.indexOf(stage);

  useEffect(() => {
    if (!spaceId) return;
    const saved = localStorage.getItem(stageKey(spaceId)) as Stage | null;
    if (saved) setStage(saved);
  }, [spaceId]);

  function goToStage(next: Stage) {
    setStage(next);
    if (spaceId) localStorage.setItem(stageKey(spaceId), next);
  }

  if (!spaceId) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
        Create a space first to begin onboarding.
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Progress rail */}
      <div style={{ padding: '24px 40px 0', borderBottom: '1px solid var(--stroke)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="t-label">Step {idx + 1} of 4</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>~4 min remaining</span>
        </div>
        <div style={{ display: 'flex', gap: 12, paddingBottom: 20 }}>
          {STAGES.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  height: 2,
                  background: i <= idx ? 'var(--accent)' : 'var(--stroke)',
                  boxShadow: i === idx ? '0 0 10px var(--accent-glow)' : 'none',
                  transition: 'all 0.5s var(--ease)',
                  borderRadius: 2,
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: i === idx ? 'var(--text)' : i < idx ? 'var(--text-mute)' : 'var(--text-dim)',
                  transition: 'color 0.3s',
                }}
              >
                {STAGE_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '40px 40px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {stage === 'interview' && (
            <InterviewStage spaceId={spaceId} onComplete={() => goToStage('import')} />
          )}
          {stage === 'import' && (
            <ImportStage
              spaceId={spaceId}
              onComplete={() => goToStage('processing')}
              onBack={() => goToStage('interview')}
            />
          )}
          {stage === 'processing' && (
            <ProcessingStage spaceId={spaceId} onComplete={() => goToStage('reveal')} />
          )}
          {stage === 'reveal' && <RevealStage spaceId={spaceId} />}
        </div>
      </div>
    </div>
  );
}
