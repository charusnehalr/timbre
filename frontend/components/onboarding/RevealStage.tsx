'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

interface Props {
  spaceId: string;
}

export function RevealStage({ spaceId }: Props) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token)!;
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    apiClient
      .getProfile(token, spaceId)
      .then((data) => setProfile(data.profile.profile as Record<string, unknown>));
  }, [token, spaceId]);

  if (!profile) return <div className="py-12 text-center">Loading your voice…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">That's your voice.</h2>
        <p className="text-gray-600 mt-1">
          Here's how Timbre sees you. Edit anything that feels off.
        </p>
      </div>
      <div className="grid gap-4">
        <Card title="Tone" value={String(profile.tone)} />
        <Card title="Quirks" value={(profile.quirks as string[])?.join(', ')} />
        <Card title="Values" value={(profile.values as string[])?.join(', ')} />
        <Card title="Expertise" value={(profile.domain_expertise as string[])?.join(', ')} />
      </div>
      <button
        onClick={() => router.push('/canvas')}
        className="w-full bg-brand-600 text-white rounded px-4 py-3 font-medium"
      >
        Write my first draft →
      </button>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  );
}
