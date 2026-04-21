import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { recordEdit } from '@/services/feedback.service';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({ before: z.string(), after: z.string() });

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(req);
    const { before, after } = Body.parse(await req.json());
    const edit = await recordEdit(user.id, params.id, before, after);
    return NextResponse.json({ edit }, { status: 201 });
  } catch (err) {
    return toResponse(err);
  }
}
