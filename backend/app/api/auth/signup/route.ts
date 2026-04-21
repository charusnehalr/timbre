import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabase';
import { db } from '@/db/client';
import { userProfiles } from '@/db/schema';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);

    await db.insert(userProfiles).values({
      id: data.user.id,
      displayName: body.displayName,
    });

    return NextResponse.json({ userId: data.user.id }, { status: 201 });
  } catch (err) {
    return toResponse(err);
  }
}
