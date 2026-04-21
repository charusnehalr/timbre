import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export const errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Not logged in', 401),
  notFound: (msg = 'Not found') => new AppError('NOT_FOUND', msg, 404),
  badRequest: (msg: string) => new AppError('BAD_REQUEST', msg, 400),
  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests', 429),
  internal: (msg = 'Internal server error') => new AppError('INTERNAL', msg, 500),
};

export function toResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  console.error(err);
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Internal server error' } },
    { status: 500 },
  );
}
