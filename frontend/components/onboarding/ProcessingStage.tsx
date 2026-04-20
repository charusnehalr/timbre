'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { createClient } from '@supabase/supabase-js';

interface Props {
  spaceId: string;
  onComplete: () => void;
}

export function ProcessingStage({ spaceId, onComplete }: Props) {
  const token = useAuthStore((s) => s.token)!;
  const [status, setStatus] = useState<'starting' | 'processing' | 'done' | 'error'>('starting');

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;

    async function start() {
      try {
        await apiClient.finalizeOnboarding(token, spaceId);
        setStatus('processing');

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        channel = supabase.channel(`space:${spaceId}`);
        channel.on('broadcast', { event: 'profile_ready' }, () => {
          setStatus('done');
          onComplete();
        });
        channel.subscribe();
      } catch {
        setStatus('error');
      }
    }

    start();
    return () => {
      channel?.unsubscribe();
    };
  }, [token, spaceId, onComplete]);

  return (
    <div className="space-y-4 text-center py-12">
      {status === 'starting' && <p className="text-gray-600">Starting analysis…</p>}
      {status === 'processing' && (
        <>
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Analyzing your voice fingerprint…</p>
          <p className="text-sm text-gray-400">This takes 30–60 seconds.</p>
        </>
      )}
      {status === 'done' && <p className="text-green-600 font-medium">Done! Revealing your profile…</p>}
      {status === 'error' && (
        <p className="text-red-600">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
