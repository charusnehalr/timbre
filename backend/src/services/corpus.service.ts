import { db } from '../db/client';
import { corpusItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { aiClient } from './ai-client';
import { logger } from '../lib/logger';

export async function addCorpusItem(
  userId: string,
  spaceId: string,
  content: string,
  source: 'interview' | 'import' | 'draft' | 'edit',
  metadata?: Record<string, unknown>,
) {
  logger.info({ userId, spaceId, source, words: content.split(/\s+/).length }, '[corpus] addCorpusItem start');

  let embedding: number[] | null = null;
  try {
    embedding = await aiClient.embed(content);
    logger.info({ dims: embedding.length }, '[corpus] embedding OK');
  } catch (err) {
    logger.warn({ err }, '[corpus] embedding failed — saving without vector');
  }

  logger.info({ spaceId, hasEmbedding: !!embedding }, '[corpus] inserting into DB');
  try {
    const [item] = await db
      .insert(corpusItems)
      .values({
        userId,
        spaceId,
        source,
        content,
        embedding: embedding as unknown as string | null,
        metadata: metadata ?? null,
      })
      .returning();
    logger.info({ id: item.id }, '[corpus] DB insert OK');
    return item;
  } catch (err) {
    logger.error({ err }, '[corpus] DB insert FAILED');
    throw err;
  }
}

export async function getCorpusItems(userId: string, spaceId: string) {
  logger.info({ userId, spaceId }, '[corpus] getCorpusItems');
  try {
    const items = await db
      .select()
      .from(corpusItems)
      .where(and(eq(corpusItems.userId, userId), eq(corpusItems.spaceId, spaceId)));
    logger.info({ count: items.length }, '[corpus] getCorpusItems OK');
    return items;
  } catch (err) {
    logger.error({ err }, '[corpus] getCorpusItems FAILED');
    throw err;
  }
}

export async function deleteCorpusItem(userId: string, itemId: string) {
  logger.info({ userId, itemId }, '[corpus] deleteCorpusItem');
  return db
    .delete(corpusItems)
    .where(and(eq(corpusItems.id, itemId), eq(corpusItems.userId, userId)));
}
