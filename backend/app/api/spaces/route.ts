import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db/client';
import { spaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const CreateBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const list = await db.select().from(spaces).where(eq(spaces.userId, user.id));
    return NextResponse.json({ spaces: list });
  } catch (err) {
    return toResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = CreateBody.parse(await req.json());
    const [space] = await db
      .insert(spaces)
      .values({ userId: user.id, name: body.name, description: body.description })
      .returning();
    return NextResponse.json({ space }, { status: 201 });
  } catch (err) {
    return toResponse(err);
  }
}
