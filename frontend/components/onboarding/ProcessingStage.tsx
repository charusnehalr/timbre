'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

interface Props {
  spaceId: string;
  onComplete: () => void;
}

export function ProcessingStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [status, setStatus] = useState<'processing' | 'done' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function run() {
      try {
        await apiClient.finalizeOnboarding(token, spaceId);
        setStatus('done');
        setTimeout(onComplete, 800);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Analysis failed';
        setErrorMsg(msg);
        setStatus('error');
      }
    }
    run();
  }, [token, spaceId, onComplete]);

  return (
    <div className="space-y-4 text-center py-12">
      {status === 'processing' && (
        <>
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Analyzing your voice fingerprint…</p>
          <p className="text-sm text-gray-400">This takes 30–60 seconds.</p>
        </>
      )}
      {status === 'done' && (
        <p className="text-green-600 font-medium">Done! Revealing your profile…</p>
      )}
      {status === 'error' && (
        <div className="space-y-2">
          <p className="text-red-600 font-medium">Analysis failed</p>
          {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
          <button
            onClick={() => { setStatus('processing'); setErrorMsg(''); }}
            className="mt-2 text-sm text-brand-600 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
