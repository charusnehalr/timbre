'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';
import { useSpaceStore } from '@/lib/space-store';
import { TimbreFingerprint } from '@/components/ui/TimbreFingerprint';
import { useTweaksStore, ACCENT_PALETTES } from '@/lib/tweaks-store';
import { RefreshCw, Sparkles } from 'lucide-react';

interface Trait {
  id: string;
  label: string;
  value: number;
  pos: { x: number; y: number };
  desc: string;
  floatClass: string;
}

const TRAITS: Trait[] = [
  { id: 'cadence',    label: 'Cadence',    value: 0.94, pos: { x: 20, y: 18 }, desc: 'Short → long → short. You front-load with punch, unfurl, then land crisp.', floatClass: 'float-a' },
  { id: 'vocabulary', label: 'Vocabulary', value: 0.88, pos: { x: 78, y: 22 }, desc: 'Plain verbs, specific nouns. Avoids "utilize", "leverage", "synergy".', floatClass: 'float-b' },
  { id: 'openers',   label: 'Openers',    value: 0.96, pos: { x: 12, y: 52 }, desc: 'You tend to open with a named person or a concrete scene, not an abstraction.', floatClass: 'float-c' },
  { id: 'pace',      label: 'Pace',       value: 0.82, pos: { x: 82, y: 58 }, desc: 'Faster than average. Comma-light, period-heavy.', floatClass: 'float-a' },
  { id: 'hedging',   label: 'Hedging',    value: 0.91, pos: { x: 25, y: 80 }, desc: 'Low. You commit to claims. "I think" shows up 40% less than your cohort.', floatClass: 'float-b' },
  { id: 'humor',     label: 'Humor',      value: 0.74, pos: { x: 72, y: 82 }, desc: 'Dry, parenthetical. Rarely punchlines; often in asides.', floatClass: 'float-c' },
];

const SIGNATURE = [
  { label: 'Sentence length',  value: '14.2 words avg',          note: 'P25 · short' },
  { label: 'Paragraph density',value: '2.1 sentences',           note: 'airy' },
  { label: 'First-person',     value: '8.4% of words',           note: 'present but measured' },
  { label: 'Em dashes',        value: '1 per 120 words',         note: '3× median' },
  { label: 'Favorite verbs',   value: 'ship · notice · land',    note: 'tracked over 1,284 samples' },
  { label: 'Banned list',      value: 'delve · tapestry · utilize', note: '0 hits this month' },
];

export default function StudioPage() {
  const token = useAuthStore((s) => s.token)!;
  const spaceId = useSpaceStore((s) => s.activeSpaceId);
  const accent = useTweaksStore((s) => s.accent);
  const accentHex = ACCENT_PALETTES[accent].accent;
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);

  useEffect(() => {
    if (!spaceId) return;
    apiClient
      .getProfile(token, spaceId)
      .then((data) => setProfile(data.profile.profile as Record<string, unknown>))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [token, spaceId]);

  if (!spaceId) {
    return (
      <div style={{ padding: 40, color: 'var(--text-mute)' }}>
        Select a space first.
      </div>
    );
  }
  if (loading) {
    return (
      <div style={{ padding: 40, color: 'var(--text-mute)' }}>
        Loading voice profile…
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div className="t-label" style={{ marginBottom: 10 }}>Voice studio</div>
            <h1 style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--text)' }}>
              Your timbre.
            </h1>
            <p style={{ color: 'var(--text-mute)', fontSize: 14, marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              {profile && Object.keys(profile).length > 0
                ? `Tone: ${String(profile.tone ?? '—')}`
                : 'A fingerprint of how you write. Refined from 1,284 samples across email, messages, and documents you shared.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost"><RefreshCw size={14} /> Retrain</button>
            <button className="btn-primary"><Sparkles size={14} /> Export profile</button>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Constellation panel */}
          <div
            className="glass"
            style={{ padding: 28, position: 'relative', aspectRatio: '1.2 / 1', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="t-label">Signature</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>rev. 12 · updated today</span>
            </div>

            {/* Trait dots + SVG lines */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}>
                {TRAITS.map((t) => (
                  <line
                    key={t.id}
                    x1="50%" y1="50%"
                    x2={`${t.pos.x}%`} y2={`${t.pos.y}%`}
                    stroke="var(--accent)" strokeWidth={0.5} strokeDasharray="2 4"
                  />
                ))}
              </svg>
              {TRAITS.map((t) => (
                <div
                  key={t.id}
                  style={{
                    position: 'absolute',
                    left: `${t.pos.x}%`, top: `${t.pos.y}%`,
                    width: 6 + t.value * 6, height: 6 + t.value * 6,
                    borderRadius: 999,
                    background: 'var(--accent)',
                    boxShadow: `0 0 ${10 + t.value * 14}px var(--accent-glow)`,
                    opacity: 0.5 + t.value * 0.5,
                    transform: 'translate(-50%, -50%)',
                    animation: `${t.floatClass} ${4 + t.value * 3}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>

            {/* Center fingerprint */}
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', position: 'relative', zIndex: 2 }}>
              <TimbreFingerprint size={280} score={0.94} intensity={0.9} accentHex={accentHex} />
            </div>

            {/* Trait chip labels */}
            {TRAITS.map((t) => (
              <button
                key={t.id + '-l'}
                className={`chip${selectedTrait?.id === t.id ? ' active' : ''}`}
                onClick={() => setSelectedTrait(selectedTrait?.id === t.id ? null : t)}
                onMouseEnter={() => setSelectedTrait(t)}
                style={{
                  position: 'absolute',
                  left: `${t.pos.x}%`, top: `${t.pos.y}%`,
                  transform: t.pos.x > 50
                    ? 'translate(14px, -50%)'
                    : 'translate(calc(-100% - 14px), -50%)',
                  zIndex: 3,
                }}
              >
                {t.label}
                <span style={{ color: 'var(--text-dim)', marginLeft: 4 }}>{Math.round(t.value * 100)}</span>
              </button>
            ))}
          </div>

          {/* Right: trait detail + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass" style={{ padding: 22, minHeight: 180 }}>
              <span className="t-label">{selectedTrait ? 'Trait' : 'Hover the constellation'}</span>
              {selectedTrait ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{selectedTrait.label}</h3>
                    <span className="mono" style={{ fontSize: 22, color: 'var(--accent)' }}>{Math.round(selectedTrait.value * 100)}%</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6 }}>{selectedTrait.desc}</p>
                </div>
              ) : (
                <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  Each dot is a dimension of your voice. The constellation drifts because your voice does.
                </p>
              )}
            </div>

            <div className="glass" style={{ padding: 22, flex: 1 }}>
              <span className="t-label">Signature stats</span>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {SIGNATURE.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 0',
                      borderBottom: i < SIGNATURE.length - 2 ? '1px solid var(--stroke)' : 'none',
                    }}
                  >
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text)', letterSpacing: '-0.005em', marginBottom: 2 }}>{s.value}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>{s.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Annotated sample */}
        <div className="glass" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="t-label">Your own words — annotated</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>from onboarding interview · 04/12</span>
          </div>
          <blockquote style={{ fontSize: 20, lineHeight: 1.6, letterSpacing: '-0.01em', maxWidth: 760 }}>
            <span style={{ background: 'rgba(180,242,78,0.1)', borderBottom: '1px dashed var(--accent)', padding: '1px 3px' }}>
              The honest answer
            </span>
            {' '}is that{' '}
            <span style={{ background: 'rgba(242,193,78,0.1)', borderBottom: '1px dashed var(--warn)', padding: '1px 3px' }}>
              I didn&apos;t know what I was doing
            </span>
            {' '}for the first six months. I faked it.{' '}
            <span style={{ background: 'rgba(180,242,78,0.1)', borderBottom: '1px dashed var(--accent)', padding: '1px 3px' }}>
              Badly, at first — then less badly
            </span>
            . And somewhere in there — I still couldn&apos;t tell you exactly when — it stopped being faking.
          </blockquote>
          <div style={{ display: 'flex', gap: 20, marginTop: 18, fontSize: 11, color: 'var(--text-mute)' }}>
            <span className="mono">
              <span style={{ display: 'inline-block', width: 8, height: 2, background: 'var(--accent)', marginRight: 6, verticalAlign: 'middle' }} />
              distinctive opener
            </span>
            <span className="mono">
              <span style={{ display: 'inline-block', width: 8, height: 2, background: 'var(--warn)', marginRight: 6, verticalAlign: 'middle' }} />
              self-deprecation pattern
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
