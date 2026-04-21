import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getLatestProfile, updateProfile } from '@/services/profile.service';
import { toResponse, errors } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { spaceId: string } }) {
  try {
    const user = await requireAuth(req);
    const profile = await getLatestProfile(user.id, params.spaceId);
    if (!profile) throw errors.notFound('No voice profile found for this space');
    return NextResponse.json({ profile });
  } catch (err) {
    return toResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { spaceId: string } }) {
  try {
    const user = await requireAuth(req);
    const patch = await req.json();
    const updated = await updateProfile(user.id, params.spaceId, patch);
    return NextResponse.json({ profile: updated });
  } catch (err) {
    return toResponse(err);
  }
}
