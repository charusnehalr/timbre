import { db } from '../db/client';
import { voiceProfiles } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { VoiceProfile } from './ai-client';

export async function getLatestProfile(userId: string, spaceId: string) {
  const [profile] = await db
    .select()
    .from(voiceProfiles)
    .where(and(eq(voiceProfiles.userId, userId), eq(voiceProfiles.spaceId, spaceId)))
    .orderBy(desc(voiceProfiles.version))
    .limit(1);
  return profile ?? null;
}

export async function saveProfile(
  userId: string,
  spaceId: string,
  profile: VoiceProfile,
  sampleCount: number,
  confidence: number,
) {
  const existing = await getLatestProfile(userId, spaceId);
  const version = existing ? existing.version + 1 : 1;

  const [saved] = await db
    .insert(voiceProfiles)
    .values({
      userId,
      spaceId,
      version,
      profile,
      sampleCount,
      confidence,
    })
    .returning();

  return saved;
}

export async function updateProfile(
  userId: string,
  spaceId: string,
  patch: Partial<VoiceProfile>,
) {
  const existing = await getLatestProfile(userId, spaceId);
  if (!existing) throw new Error('No profile found');

  const merged = { ...(existing.profile as VoiceProfile), ...patch };
  return saveProfile(userId, spaceId, merged, existing.sampleCount, existing.confidence);
}
