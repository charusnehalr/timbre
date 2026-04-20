import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { embedQueue } from '@/queue';
import { toResponse, errors } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({
  spaceId: z.string().uuid(),
  content: z.string().min(50),
  source: z.enum(['import', 'interview', 'draft', 'edit']).default('import'),
});

const MIN_WORD_COUNT = 50;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());

    const wordCount = body.content.trim().split(/\s+/).length;
    if (wordCount < MIN_WORD_COUNT) {
      throw errors.badRequest(`Sample too short — need at least ${MIN_WORD_COUNT} words`);
    }

    await embedQueue.add('embed', {
      userId: user.id,
      spaceId: body.spaceId,
      content: body.content,
      source: body.source,
    });

    return NextResponse.json({ queued: true }, { status: 202 });
  } catch (err) {
    return toResponse(err);
  }
}
