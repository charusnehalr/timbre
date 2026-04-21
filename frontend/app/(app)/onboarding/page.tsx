'use client';

import { useState, useEffect } from 'react';
import { InterviewStage } from '@/components/onboarding/InterviewStage';
import { ImportStage } from '@/components/onboarding/ImportStage';
import { ProcessingStage } from '@/components/onboarding/ProcessingStage';
import { RevealStage } from '@/components/onboarding/RevealStage';
import { useSpaceStore } from '@/lib/space-store';

type Stage = 'interview' | 'import' | 'processing' | 'reveal';

function stageKey(spaceId: string) {
  return `timbre:onboarding:${spaceId}:stage`;
}

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('interview');
  const spaceId = useSpaceStore((s) => s.activeSpaceId);

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
      <div className="p-8 text-center">
        <p className="text-gray-600">Create a space first to begin onboarding.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {stage === 'interview' && (
        <InterviewStage spaceId={spaceId} onComplete={() => goToStage('import')} />
      )}
      {stage === 'import' && (
        <ImportStage spaceId={spaceId} onComplete={() => goToStage('processing')} />
      )}
      {stage === 'processing' && (
        <ProcessingStage spaceId={spaceId} onComplete={() => goToStage('reveal')} />
      )}
      {stage === 'reveal' && <RevealStage spaceId={spaceId} />}
    </div>
  );
}
