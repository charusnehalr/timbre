import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addCorpusItem, getCorpusItems } from '@/services/corpus.service';
import { toResponse, errors } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const Body = z.object({
  spaceId: z.string().uuid(),
  content: z.string().min(50),
  source: z.enum(['import', 'interview', 'draft', 'edit']).default('import'),
});

const MIN_WORD_COUNT = 50;

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const spaceId = req.nextUrl.searchParams.get('spaceId');
    logger.info({ userId: user.id, spaceId }, '[corpus route] GET');
    if (!spaceId) throw errors.badRequest('spaceId required');
    const items = await getCorpusItems(user.id, spaceId);
    logger.info({ count: items.length }, '[corpus route] GET OK');
    return NextResponse.json({ items });
  } catch (err) {
    logger.error({ err }, '[corpus route] GET error');
    return toResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());
    const wordCount = body.content.trim().split(/\s+/).length;
    logger.info({ userId: user.id, spaceId: body.spaceId, wordCount, source: body.source }, '[corpus route] POST');

    if (wordCount < MIN_WORD_COUNT) {
      throw errors.badRequest(`Sample too short — need at least ${MIN_WORD_COUNT} words`);
    }

    const item = await addCorpusItem(user.id, body.spaceId, body.content, body.source);
    logger.info({ id: item.id }, '[corpus route] POST OK');
    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (err) {
    logger.error({ err }, '[corpus route] POST error');
    return toResponse(err);
  }
}
