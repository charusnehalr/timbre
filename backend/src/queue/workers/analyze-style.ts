import { Worker } from 'bullmq';
import { Redis } from '@upstash/redis';
import { getCorpusItems } from '../../services/corpus.service';
import { saveProfile } from '../../services/profile.service';
import { aiClient } from '../../services/ai-client';
import { supabaseAdmin } from '../../services/supabase';

const connection = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const styleWorker = new Worker(
  'analyze-style',
  async (job) => {
    const { userId, spaceId } = job.data;

    const items = await getCorpusItems(userId, spaceId);
    const samples = items.map((i) => i.content);

    const profile = await aiClient.analyzeStyle(samples);
    await saveProfile(userId, spaceId, profile, samples.length, 0.8);

    // Notify frontend via Supabase Realtime
    await supabaseAdmin
      .channel(`space:${spaceId}`)
      .send({
        type: 'broadcast',
        event: 'profile_ready',
        payload: { spaceId },
      });
  },
  { connection },
);
