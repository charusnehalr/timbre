'use client';

import { useState } from 'react';
import { InterviewStage } from '@/components/onboarding/InterviewStage';
import { ImportStage } from '@/components/onboarding/ImportStage';
import { ProcessingStage } from '@/components/onboarding/ProcessingStage';
import { RevealStage } from '@/components/onboarding/RevealStage';
import { useSpaceStore } from '@/lib/space-store';

type Stage = 'interview' | 'import' | 'processing' | 'reveal';

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('interview');
  const spaceId = useSpaceStore((s) => s.activeSpaceId);

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
        <InterviewStage spaceId={spaceId} onComplete={() => setStage('import')} />
      )}
      {stage === 'import' && (
        <ImportStage spaceId={spaceId} onComplete={() => setStage('processing')} />
      )}
      {stage === 'processing' && (
        <ProcessingStage spaceId={spaceId} onComplete={() => setStage('reveal')} />
      )}
      {stage === 'reveal' && <RevealStage spaceId={spaceId} />}
    </div>
  );
}
