import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteCorpusItem } from '@/services/corpus.service';
import { toResponse } from '@/lib/errors';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    await deleteCorpusItem(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toResponse(err);
  }
}
