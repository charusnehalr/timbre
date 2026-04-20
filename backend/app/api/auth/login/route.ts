import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({
      accessToken: data.session!.access_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err) {
    return toResponse(err);
  }
}
