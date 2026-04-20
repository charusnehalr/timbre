import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCorpusItems } from '@/services/corpus.service';
import { toResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: { spaceId: string } },
) {
  try {
    const user = await requireAuth(req);
    const items = await getCorpusItems(user.id, params.spaceId);
    return NextResponse.json({ items });
  } catch (err) {
    return toResponse(err);
  }
}
