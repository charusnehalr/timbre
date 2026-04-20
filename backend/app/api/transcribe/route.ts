import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { aiClient } from '@/services/ai-client';
import { toResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const form = await req.formData();
    const file = form.get('file') as File;
    if (!file) throw new Error('No file uploaded');

    const text = await aiClient.transcribe(file, file.name);
    return NextResponse.json({ text });
  } catch (err) {
    return toResponse(err);
  }
}
