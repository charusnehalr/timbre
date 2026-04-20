import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { styleQueue } from '@/queue';
import { getCorpusItems } from '@/services/corpus.service';
import { toResponse, errors } from '@/lib/errors';
import { z } from 'zod';

const MIN_TOTAL_WORDS = 500;
const MIN_SAMPLES = 3;

const Body = z.object({ spaceId: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());

    const items = await getCorpusItems(user.id, body.spaceId);
    if (items.length < MIN_SAMPLES) {
      throw errors.badRequest(`Need at least ${MIN_SAMPLES} writing samples`);
    }
    const totalWords = items.reduce(
      (sum, i) => sum + i.content.trim().split(/\s+/).length,
      0,
    );
    if (totalWords < MIN_TOTAL_WORDS) {
      throw errors.badRequest(`Need at least ${MIN_TOTAL_WORDS} words total`);
    }

    const job = await styleQueue.add('analyze', {
      userId: user.id,
      spaceId: body.spaceId,
    });

    return NextResponse.json({ jobId: job.id, status: 'queued' }, { status: 202 });
  } catch (err) {
    return toResponse(err);
  }
}
