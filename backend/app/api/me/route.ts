import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db/client';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, user.id));
    return NextResponse.json({ user: { id: user.id, email: user.email, profile } });
  } catch (err) {
    return toResponse(err);
  }
}
