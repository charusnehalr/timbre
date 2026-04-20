import { db } from '../db/client';
import { corpusItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { aiClient } from './ai-client';

export async function addCorpusItem(
  userId: string,
  spaceId: string,
  content: string,
  source: 'interview' | 'import' | 'draft' | 'edit',
  metadata?: Record<string, unknown>,
) {
  const embedding = await aiClient.embed(content);

  const [item] = await db
    .insert(corpusItems)
    .values({
      userId,
      spaceId,
      source,
      content,
      embedding: embedding as unknown as string, // drizzle vector type
      metadata: metadata ?? null,
    })
    .returning();

  return item;
}

export async function getCorpusItems(userId: string, spaceId: string) {
  return db
    .select()
    .from(corpusItems)
    .where(and(eq(corpusItems.userId, userId), eq(corpusItems.spaceId, spaceId)));
}

export async function deleteCorpusItem(userId: string, itemId: string) {
  return db
    .delete(corpusItems)
    .where(and(eq(corpusItems.id, itemId), eq(corpusItems.userId, userId)));
}
