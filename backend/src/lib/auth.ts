import { createServerClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { errors } from './errors';

export async function requireAuth(req: NextRequest) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined } },
  );

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw errors.unauthorized();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw errors.unauthorized();

  return data.user;
}
