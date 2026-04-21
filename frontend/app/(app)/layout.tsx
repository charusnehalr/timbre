'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';

const NAV = [
  { href: '/canvas', label: 'Canvas', icon: '✍️' },
  { href: '/onboarding', label: 'Onboarding', icon: '🎙️' },
  { href: '/studio', label: 'Voice Studio', icon: '🧬' },
  { href: '/spaces', label: 'Spaces', icon: '🗂️' },
];

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
    <div className="fixed inset-0 z-50 flex items-end justify-start p-4" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-2xl p-5 w-80 mb-2 ml-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${mode === 'login' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${mode === 'signup' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            minLength={8}
            required
          />
          {error && (
            <p className={`text-xs ${error.startsWith('Account') ? 'text-green-600' : 'text-red-500'}`}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function UserButton() {
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);
  const [open, setOpen] = useState(false);

  if (token) {
    return (
      <div className="relative">
        {open && (
          <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-44">
            <button
              onClick={() => { clearToken(); setOpen(false); }}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-red-500"
            >
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
            U
          </span>
          <span className="text-xs text-gray-500">Signed in</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {open && <LoginModal onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-500 transition-colors"
      >
        <span className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center">
          ?
        </span>
        <span className="text-xs">Sign in</span>
      </button>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <nav className="w-52 bg-white border-r flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b">
          <span className="font-bold text-lg text-brand-600 tracking-tight">timbre</span>
        </div>

        {/* Nav links */}
        <div className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* User button — bottom of sidebar like GPT */}
        <div className="p-2 border-t">
          <UserButton />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
