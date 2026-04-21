// Queue is stubbed out — BullMQ requires ioredis which isn't compatible with Upstash REST.
// Jobs are silently dropped in dev; wire up a real ioredis connection for production.
const noop = { add: async () => null };

export const embedQueue = noop;
export const styleQueue = noop;
export const refineQueue = noop;
