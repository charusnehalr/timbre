'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { useTweaksStore, ACCENT_PALETTES, AccentKey } from '@/lib/tweaks-store';
import { Cursor } from '@/components/ui/Cursor';
import { MeshBackground } from '@/components/ui/MeshBackground';
import {
  AlignLeft, Target, ArrowUpToLine, LayoutGrid, SlidersHorizontal, Sparkles, LogIn,
} from 'lucide-react';

const NAV = [
  { href: '/canvas',     label: 'Canvas',     Icon: AlignLeft },
  { href: '/studio',     label: 'Studio',      Icon: Target },
  { href: '/onboarding', label: 'Onboarding',  Icon: ArrowUpToLine },
  { href: '/spaces',     label: 'Spaces',      Icon: LayoutGrid },
];

const CRUMBS: Record<string, [string, string, string]> = {
  '/canvas':     ['timbre', 'personal', 'canvas'],
  '/studio':     ['timbre', 'personal', 'studio'],
  '/onboarding': ['timbre', 'setup',    'onboarding'],
  '/spaces':     ['timbre', 'manage',   'spaces'],
};

// ── Accent applier ──────────────────────────────────────────────
function AccentApplier() {
  const accent = useTweaksStore((s) => s.accent);
  useEffect(() => {
    const pal = ACCENT_PALETTES[accent];
    const root = document.documentElement;
    root.style.setProperty('--accent', pal.accent);
    root.style.setProperty('--accent-dim', pal.dim);
    root.style.setProperty('--accent-glow', pal.glow);
  }, [accent]);
  return null;
}

// ── Login modal ─────────────────────────────────────────────────
function LoginModal({ onClose }: { onClose: () => void }) {
  const setToken = useAuthStore((s) => s.setToken);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await apiClient.signup(email, password, name);
        setMode('login');
        setError('Account created — sign in now.');
      } else {
        const data = await apiClient.login(email, password);
        setToken(data.accessToken);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-start p-4"
      onClick={onClose}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div
        className="glass"
        style={{ width: 300, padding: 20, marginBottom: 8, marginLeft: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 999,
                background: mode === m ? 'var(--accent)' : 'var(--glass)',
                color: mode === m ? '#0B0B0B' : 'var(--text-mute)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '1px solid ' + (mode === m ? 'var(--accent)' : 'var(--stroke)'),
                transition: 'all 0.25s var(--ease)',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'signup' && (
            <input className="field" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          {error && (
            <p className="mono" style={{ fontSize: 11, color: error.startsWith('Account') ? 'var(--accent)' : 'var(--danger)' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center' }}>
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Tweaks panel ────────────────────────────────────────────────
function TweaksPanel({ open }: { open: boolean }) {
  const { accent, cursorEnabled, showMesh, setAccent, setCursorEnabled, setShowMesh } = useTweaksStore();

  if (!open) return null;

  return (
    <div
      className="glass screen-enter"
      style={{
        position: 'fixed', right: 20, bottom: 20, width: 280, padding: 16, zIndex: 100,
        border: '1px solid var(--stroke-hi)', borderRadius: 22,
      }}
    >
      <div className="t-label" style={{ marginBottom: 12 }}>Tweaks</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
        <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>Accent</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(Object.entries(ACCENT_PALETTES) as [AccentKey, typeof ACCENT_PALETTES[AccentKey]][]).map(([key, val]) => (
            <button
              key={key}
              title={key}
              className="swatch-btn"
              onClick={() => setAccent(key)}
              style={{
                width: 22, height: 22, borderRadius: 999,
                background: val.accent, cursor: 'pointer',
                border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {[
        { label: 'Mesh background', value: showMesh, set: setShowMesh },
        { label: 'Custom cursor', value: cursorEnabled, set: setCursorEnabled },
      ].map(({ label, value, set }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>{label}</span>
          <button
            className="chip"
            onClick={() => set(!value)}
            style={{ padding: '4px 10px', fontSize: 11 }}
          >
            {value ? 'on' : 'off'}
          </button>
        </div>
      ))}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--stroke)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        <span className="mono">timbre · prototype</span>
      </div>
    </div>
  );
}

// ── Main layout ─────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);
  const { cursorEnabled, showMesh } = useTweaksStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const crumbs = CRUMBS[pathname] ?? ['timbre', '—', '—'];
  const activeHref = NAV.find((n) => pathname.startsWith(n.href))?.href;

  return (
    <>
      <AccentApplier />
      <MeshBackground visible={showMesh} />
      {cursorEnabled && <Cursor />}

      {loginOpen && !token && <LoginModal onClose={() => setLoginOpen(false)} />}
      <TweaksPanel open={tweaksOpen} />

      {/* App shell: 72px sidebar + main */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          height: '100vh', display: 'grid', gridTemplateColumns: '72px 1fr', overflow: 'hidden',
        }}
      >
        {/* ── Sidebar ── */}
        <aside
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '22px 0', gap: 18,
            borderRight: '1px solid var(--stroke)',
            background: 'rgba(10,10,12,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--accent)', color: '#0B0B0B',
                fontFamily: 'var(--font-geist-mono)', fontSize: 18, fontWeight: 700,
                letterSpacing: '-0.04em',
                display: 'grid', placeItems: 'center',
              }}
            >
              t
            </div>
            <div
              style={{
                position: 'absolute', inset: -4, borderRadius: 14, zIndex: -1,
                background: 'radial-gradient(circle at center, var(--accent-glow), transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 18 }}>
            {NAV.map(({ href, label, Icon }) => (
              <Link key={href} href={href as never} title={label}>
                <div className={`nav-btn${activeHref === href ? ' active' : ''}`}>
                  <Icon size={18} />
                </div>
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Tweaks */}
          <button
            className="nav-btn"
            title="Tweaks"
            onClick={() => setTweaksOpen((o) => !o)}
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Auth */}
          {token ? (
            <button
              className="nav-btn"
              title="Sign out"
              onClick={clearToken}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'linear-gradient(135deg, var(--accent), #4EE2F2)',
                }}
              />
            </button>
          ) : (
            <button className="nav-btn" title="Sign in" onClick={() => setLoginOpen(true)}>
              <LogIn size={18} />
            </button>
          )}

          {/* Version label */}
          <div
            className="mono"
            style={{
              writingMode: 'vertical-rl', fontSize: 9, color: 'var(--text-dim)',
              letterSpacing: '0.22em', marginTop: 10, userSelect: 'none',
            }}
          >
            TIMBRE · 0.4
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Topbar */}
          <header
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', height: 56, flexShrink: 0,
              borderBottom: '1px solid var(--stroke)',
              background: 'rgba(10,10,12,0.4)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Breadcrumbs */}
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-mute)' }}>
              <span>{crumbs[0]}</span>
              <span style={{ color: 'var(--text-dim)' }}>/</span>
              <span>{crumbs[1]}</span>
              <span style={{ color: 'var(--text-dim)' }}>/</span>
              <span style={{ color: 'var(--text)' }}>{crumbs[2]}</span>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="pulse-dot" />
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>voice model · v12</span>
              </div>
              <div style={{ width: 1, height: 18, background: 'var(--stroke)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), #4EE2F2)' }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  {token ? 'signed in' : 'guest'}
                </span>
              </div>
            </div>
          </header>

          {/* Screen content */}
          <div key={pathname} className="screen-enter" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
