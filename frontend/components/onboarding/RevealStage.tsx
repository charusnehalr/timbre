'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { TimbreFingerprint } from '@/components/ui/TimbreFingerprint';
import { useTweaksStore, ACCENT_PALETTES } from '@/lib/tweaks-store';
import { Sparkles } from 'lucide-react';

interface Props { spaceId: string; }

const NOTICES = [
  'You open with scenes, not abstractions',
  'You almost never hedge — 40% less than your cohort',
  'You end paragraphs short. Like this.',
];

export function RevealStage({ spaceId }: Props) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token)!;
  const accent = useTweaksStore((s) => s.accent);
  const accentHex = ACCENT_PALETTES[accent].accent;
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    apiClient.getProfile(token, spaceId).then((data) =>
      setProfile(data.profile.profile as Record<string, unknown>)
    );
  }, [token, spaceId]);

  if (!profile) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>Loading your voice…</div>;
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      {/* Fingerprint with score overlay */}
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 32, position: 'relative' }}>
        <TimbreFingerprint size={300} score={0.94} intensity={0.9} accentHex={accentHex} />
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
          }}
        >
          <div className="mono" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>94</div>
          <div className="t-label" style={{ color: 'var(--text-mute)', marginTop: 4 }}>similarity</div>
        </div>
      </div>

      <div className="t-label" style={{ marginBottom: 10, color: 'var(--accent)' }}>✓ ready</div>
      <h1 style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 14 }}>
        Meet your timbre.
      </h1>
      <p style={{ color: 'var(--text-mute)', fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 20px' }}>
        When you generate with timbre, this fingerprint shapes every sentence. The model isn&apos;t guessing how you sound — it&apos;s matching this.
      </p>

      {/* What we noticed */}
      <div className="glass" style={{ padding: 20, maxWidth: 540, margin: '0 auto 32px', textAlign: 'left' }}>
        <span className="t-label" style={{ display: 'block', marginBottom: 8 }}>What we noticed</span>
        {NOTICES.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 12, padding: '10px 0', alignItems: 'flex-start',
              borderTop: i > 0 ? '1px solid var(--stroke)' : 'none',
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text)', letterSpacing: '-0.005em' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Profile highlights if available */}
      {Boolean(profile.tone) && (
        <div className="glass" style={{ padding: 16, maxWidth: 540, margin: '0 auto 32px', textAlign: 'left' }}>
          <span className="t-label" style={{ display: 'block', marginBottom: 8 }}>Your profile</span>
          {(['tone', 'quirks', 'values'] as const).filter((k) => profile[k]).map((k) => {
            const val = profile[k];
            const display = Array.isArray(val) ? (val as string[]).join(', ') : String(val ?? '');
            return (
              <div key={k} style={{ padding: '8px 0', borderTop: '1px solid var(--stroke)', display: 'flex', gap: 12 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0, paddingTop: 2 }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.5 }}>{display}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn-ghost" onClick={() => router.push('/onboarding')}>Restart</button>
        <button className="btn-primary" onClick={() => router.push('/canvas')}>
          <Sparkles size={14} /> Open the canvas
        </button>
      </div>
    </div>
  );
}
