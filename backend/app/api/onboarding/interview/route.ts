import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { aiClient } from '@/services/ai-client';
import { embedQueue } from '@/queue';
import { toResponse } from '@/lib/errors';
import { z } from 'zod';

const Body = z.object({
  spaceId: z.string().uuid(),
  history: z.array(z.object({ role: z.string(), content: z.string() })),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = Body.parse(await req.json());

    const { reply, captured_facts } = await aiClient.interviewTurn(body.history);

    // Queue embedding of any new user answers
    const lastUserMsg = body.history.findLast((m) => m.role === 'user');
    if (lastUserMsg) {
      await embedQueue.add('embed', {
        userId: user.id,
        spaceId: body.spaceId,
        content: lastUserMsg.content,
        source: 'interview',
      });
    }

    return NextResponse.json({ reply, captured_facts });
  } catch (err) {
    return toResponse(err);
  }
}
