'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="w-48 border-r flex flex-col gap-1 p-4 shrink-0">
        <Link href="/canvas" className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">
          Canvas
        </Link>
        <Link href="/onboarding" className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">
          Onboarding
        </Link>
        <Link href="/studio" className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">
          Voice Studio
        </Link>
        <Link href="/spaces" className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">
          Spaces
        </Link>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
