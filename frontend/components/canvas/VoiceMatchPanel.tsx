'use client';

import { TimbreFingerprint } from '@/components/ui/TimbreFingerprint';
import { useTweaksStore, ACCENT_PALETTES } from '@/lib/tweaks-store';

interface Props {
  score: number | null;
  streaming?: boolean;
  sentences?: number[];
}

function scoreLabel(s: number) {
  if (s >= 0.92) return 'Indistinguishable';
  if (s >= 0.85) return 'Very close';
  if (s >= 0.70) return 'Close, AI-ish in spots';
  return 'Needs rewrite';
}

const BREAKDOWN = [
  { k: 'Cadence',    v: 0.94 },
  { k: 'Vocabulary', v: 0.88 },
  { k: 'Openers',   v: 0.96 },
  { k: 'Pace',      v: 0.82 },
];

export function VoiceMatchPanel({ score, streaming = false, sentences = [] }: Props) {
  const accent = useTweaksStore((s) => s.accent);
  const accentHex = ACCENT_PALETTES[accent].accent;
  const pct = score !== null ? Math.round(score * 100) : null;

  return (
    <aside
      className="glass"
      style={{
        width: 280, padding: 20, display: 'flex', flexDirection: 'column',
        gap: 18, alignSelf: 'start', flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="t-label">Voice match</span>
        {score !== null && (
          <span className="t-label" style={{ color: 'var(--accent)' }}>LIVE</span>
        )}
      </div>

      {/* Fingerprint */}
      <div style={{ position: 'relative', height: 200, display: 'grid', placeItems: 'center' }}>
        <TimbreFingerprint
          size={200}
          score={score ?? 0.3}
          intensity={streaming ? 1.6 : 0.9}
          accentHex={accentHex}
        />
        <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
          <div
            className="mono"
            style={{
              fontSize: 36, fontWeight: 600, letterSpacing: '-0.04em',
              color: pct === null ? 'var(--text-dim)' : 'var(--text)',
            }}
          >
            {pct === null ? '—' : pct}
            {pct !== null && (
              <span style={{ fontSize: 16, color: 'var(--text-mute)', marginLeft: 2 }}>%</span>
            )}
          </div>
        </div>
      </div>

      {/* Label */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>
          {score === null ? '—' : scoreLabel(score)}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.5 }}>
          {score === null
            ? 'Generate a draft to see how well it matches your timbre.'
            : 'Based on 1,284 of your writing samples.'}
        </div>
      </div>

      {/* Breakdown */}
      {score !== null && (
        <div style={{ borderTop: '1px solid var(--stroke)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="t-label">Breakdown</span>
          {BREAKDOWN.map(({ k, v }) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-mute)', width: 72, flexShrink: 0 }}>{k}</span>
              <div style={{ flex: 1, height: 2, background: 'var(--stroke)', borderRadius: 2, position: 'relative' }}>
                <div
                  className="progress-bar-fill"
                  style={{ position: 'absolute', inset: 0, width: `${v * 100}%` }}
                />
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text)', width: 24, textAlign: 'right' }}>
                {Math.round(v * 100)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Per-sentence */}
      {sentences.length > 0 && (
        <div style={{ borderTop: '1px solid var(--stroke)', paddingTop: 14 }}>
          <span className="t-label" style={{ display: 'block', marginBottom: 8 }}>Per sentence</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sentences.slice(0, 5).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', width: 16 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, height: 3, background: 'var(--stroke)', borderRadius: 2, position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 2, opacity: 0.8,
                      width: `${s * 100}%`,
                      background: s > 0.85 ? 'var(--accent)' : s > 0.7 ? 'var(--warn)' : 'var(--danger)',
                    }}
                  />
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', width: 22, textAlign: 'right' }}>
                  {Math.round(s * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
