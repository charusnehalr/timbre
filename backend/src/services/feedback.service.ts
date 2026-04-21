import { db } from '../db/client';
import { edits, generations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { addCorpusItem } from './corpus.service';

export async function recordEdit(
  userId: string,
  generationId: string,
  before: string,
  after: string,
) {
  const diff = computeDiff(before, after);
  const [edit] = await db
    .insert(edits)
    .values({ generationId, userId, before, after, diff })
    .returning();
  return edit;
}

export async function acceptGeneration(
  userId: string,
  spaceId: string,
  generationId: string,
  finalDraft: string,
) {
  await db
    .update(generations)
    .set({ finalDraft })
    .where(and(eq(generations.id, generationId), eq(generations.userId, userId)));

  // Accepted drafts feed back into the corpus
  await addCorpusItem(userId, spaceId, finalDraft, 'draft');
}

function computeDiff(before: string, after: string) {
  return { before_length: before.length, after_length: after.length };
}
