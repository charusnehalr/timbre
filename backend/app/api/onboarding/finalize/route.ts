import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { aiClient } from '@/services/ai-client';
import { supabaseAdmin } from '@/services/supabase';
import { getCorpusItems } from '@/services/corpus.service';
import { saveProfile } from '@/services/profile.service';
import { toResponse, errors } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const MIN_TOTAL_WORDS = 500;
const MIN_SAMPLES = 3;

const Body = z.object({ spaceId: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());
    logger.info({ userId: user.id, spaceId: body.spaceId }, '[finalize] POST start');

    const items = await getCorpusItems(user.id, body.spaceId);
    logger.info({ count: items.length }, '[finalize] corpus items fetched');

    if (items.length < MIN_SAMPLES) {
      logger.warn({ count: items.length, need: MIN_SAMPLES }, '[finalize] not enough samples');
      throw errors.badRequest(`Need at least ${MIN_SAMPLES} writing samples`);
    }
    const totalWords = items.reduce((sum, i) => sum + i.content.trim().split(/\s+/).length, 0);
    logger.info({ totalWords }, '[finalize] word count');
    if (totalWords < MIN_TOTAL_WORDS) {
      logger.warn({ totalWords, need: MIN_TOTAL_WORDS }, '[finalize] not enough words');
      throw errors.badRequest(`Need at least ${MIN_TOTAL_WORDS} words total`);
    }

    logger.info('[finalize] calling analyzeStyle →');
    const samples = items.map((i) => i.content);
    const profile = await aiClient.analyzeStyle(samples);
    logger.info({ tone: profile.tone }, '[finalize] analyzeStyle ✓');

    logger.info('[finalize] saving profile to DB →');
    await saveProfile(user.id, body.spaceId, profile, items.length, 0.9);
    logger.info('[finalize] profile saved ✓');

    logger.info('[finalize] broadcasting profile_ready →');
    await supabaseAdmin.channel(`space:${body.spaceId}`).send({
      type: 'broadcast',
      event: 'profile_ready',
      payload: {},
    });
    logger.info('[finalize] broadcast sent ✓');

    return NextResponse.json({ status: 'done' }, { status: 200 });
  } catch (err) {
    logger.error({ err }, '[finalize] POST error');
    return toResponse(err);
  }
}
