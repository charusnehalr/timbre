import { NextRequest } from 'next/server';

// DEV MODE: auth bypassed — all requests use a fixed dev user
export async function requireAuth(_req: NextRequest) {
  return { id: '00000000-0000-0000-0000-000000000001', email: 'dev@timbre.local' };
}
