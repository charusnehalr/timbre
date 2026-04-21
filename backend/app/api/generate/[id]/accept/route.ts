import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { acceptGeneration } from '@/services/feedback.service';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({
  spaceId: z.string().uuid(),
  finalDraft: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(req);
    const { spaceId, finalDraft } = Body.parse(await req.json());
    await acceptGeneration(user.id, spaceId, params.id, finalDraft);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toResponse(err);
  }
}
