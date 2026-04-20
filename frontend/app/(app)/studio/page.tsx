'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { useSpaceStore } from '@/lib/space-store';

export default function StudioPage() {
  const token = useAuthStore((s) => s.token)!;
  const spaceId = useSpaceStore((s) => s.activeSpaceId);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;
    apiClient
      .getProfile(token, spaceId)
      .then((data) => setProfile(data.profile.profile as Record<string, unknown>))
      .finally(() => setLoading(false));
  }, [token, spaceId]);

  if (!spaceId) return <div className="p-8">Select a space first.</div>;
  if (loading) return <div className="p-8">Loading voice profile…</div>;
  if (!profile) return <div className="p-8">No voice profile yet. Complete onboarding first.</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Voice Studio</h1>
      <pre className="bg-gray-50 border rounded p-4 text-sm overflow-auto whitespace-pre-wrap">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}
