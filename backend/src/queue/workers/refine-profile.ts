import { Worker } from 'bullmq';
import { Redis } from '@upstash/redis';
import { getLatestProfile, saveProfile } from '../../services/profile.service';
import { aiClient } from '../../services/ai-client';
import type { VoiceProfile } from '../../services/ai-client';

const connection = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const refineWorker = new Worker(
  'refine-profile',
  async (job) => {
    const { userId, spaceId, newSamples } = job.data as {
      userId: string;
      spaceId: string;
      newSamples: string[];
    };

    const existing = await getLatestProfile(userId, spaceId);
    const allSamples = existing
      ? [JSON.stringify(existing.profile), ...newSamples]
      : newSamples;

    const updated = await aiClient.analyzeStyle(allSamples);
    await saveProfile(userId, spaceId, updated, (existing?.sampleCount ?? 0) + newSamples.length, 0.85);
  },
  { connection },
);
