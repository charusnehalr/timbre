import { Worker } from 'bullmq';
import { Redis } from '@upstash/redis';
import { addCorpusItem } from '../../services/corpus.service';

const connection = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const embedWorker = new Worker(
  'embed-writing',
  async (job) => {
    const { userId, spaceId, content, source, metadata } = job.data;
    await addCorpusItem(userId, spaceId, content, source, metadata);
  },
  { connection },
);
