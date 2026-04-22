import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { aiClient } from '@/services/ai-client';
import { getLatestProfile } from '@/services/profile.service';
import { getCorpusItems } from '@/services/corpus.service';
import { db } from '@/db/client';
import { generations } from '@/db/schema';
import { toResponse, errors } from '@/lib/errors';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const Body = z.object({
  spaceId: z.string().uuid(),
  task: z.string().min(1),
  intent: z.string().optional(),
});

const INTENT_MAP: Record<string, string> = {
  email:    'cold_email',
  letter:   'cover_letter',
  linkedin: 'linkedin_post',
  essay:    'blog_post',
  reply:    'other',
  resume:   'resume_bullet',
  dm:       'other',
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());

    await checkRateLimit(user.id, 'generate', 100);

    const profileRow = await getLatestProfile(user.id, body.spaceId);
    if (!profileRow) throw errors.notFound('No voice profile — complete onboarding first');

    const corpusRows = await getCorpusItems(user.id, body.spaceId);
    const samples = corpusRows.slice(0, 10).map((r) => r.content);

    const displayName =
      user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullChunk = '';
          for await (const chunk of aiClient.generateStream({
            user_name: displayName,
            profile: profileRow.profile as never,
            task: body.task,
            intent: body.intent ? { intent: INTENT_MAP[body.intent] ?? 'other' } : undefined,
            retrieved_samples: samples,
            space_id: body.spaceId,
          })) {
            fullChunk += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Parse the SSE data line and persist
          const match = fullChunk.match(/^data: (.+)$/m);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]);
              await db.insert(generations).values({
                userId: user.id,
                spaceId: body.spaceId,
                intent: body.intent ?? parsed.attempts?.[0]?.intent?.intent ?? 'other',
                task: body.task,
                finalDraft: parsed.draft ?? null,
                voiceMatchScore: parsed.voice_match_score ?? null,
                attempts: parsed.attempts ?? [],
              });
            } catch {
              // DB persist failure must not abort the stream
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'generation failed';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return toResponse(err);
  }
}
