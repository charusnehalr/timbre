import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db/client';
import { spaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { toResponse, errors } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const [space] = await db
      .select()
      .from(spaces)
      .where(and(eq(spaces.id, params.id), eq(spaces.userId, user.id)));
    if (!space) throw errors.notFound('Space not found');
    return NextResponse.json({ space });
  } catch (err) {
    return toResponse(err);
  }
}
