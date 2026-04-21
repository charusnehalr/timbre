import { z } from 'zod';
import { logger } from '../lib/logger';

const VoiceProfileSchema = z.object({
  tone: z.string(),
  sentence_rhythm: z.object({
    avg_length: z.number(),
    variance: z.enum(['low', 'medium', 'high']),
    signature_move: z.string(),
  }),
  vocabulary: z.object({
    favorites: z.array(z.string()),
    avoid: z.array(z.string()),
    fillers: z.array(z.string()),
  }),
  structure: z.object({
    opening_move: z.string(),
    closing_move: z.string(),
    paragraphing: z.enum(['short', 'medium', 'long']),
  }),
  values: z.array(z.string()),
  domain_expertise: z.array(z.string()),
  forbidden: z.object({
    corporate_speak: z.boolean(),
    excessive_punctuation: z.boolean(),
    emoji: z.enum(['never', 'sparingly', 'freely']),
  }),
  quirks: z.array(z.string()),
});

export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;

export interface GenerateInput {
  user_name: string;
  profile: VoiceProfile;
  task: string;
  intent?: object;
  retrieved_samples: string[];
  space_id: string;
}

class AiClient {
  constructor(
    private baseUrl: string,
    private secret: string,
  ) {}

  private headers(extra?: Record<string, string>) {
    return {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.secret,
      ...extra,
    };
  }

  async analyzeStyle(samples: string[]): Promise<VoiceProfile> {
    logger.info({ samples: samples.length }, '[ai-client] analyzeStyle →');
    const t = Date.now();
    const res = await fetch(`${this.baseUrl}/analyze/style`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ samples }),
    });
    if (!res.ok) {
      logger.error({ status: res.status }, '[ai-client] analyzeStyle FAILED');
      throw new Error(`ai-core /analyze/style error: ${res.status}`);
    }
    logger.info({ ms: Date.now() - t }, '[ai-client] analyzeStyle ✓');
    return VoiceProfileSchema.parse(await res.json());
  }

  async interviewTurn(
    history: Array<{ role: string; content: string }>,
  ): Promise<{ reply: string; captured_facts: string[] }> {
    logger.info({ turns: history.length }, '[ai-client] interviewTurn →');
    const t = Date.now();
    const res = await fetch(`${this.baseUrl}/interview/turn`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ history }),
    });
    if (!res.ok) {
      logger.error({ status: res.status }, '[ai-client] interviewTurn FAILED');
      throw new Error(`ai-core /interview/turn error: ${res.status}`);
    }
    logger.info({ ms: Date.now() - t }, '[ai-client] interviewTurn ✓');
    return res.json();
  }

  async *generateStream(input: GenerateInput): AsyncIterable<string> {
    logger.info({ spaceId: input.space_id }, '[ai-client] generateStream →');
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: this.headers({ Accept: 'text/event-stream' }),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.error({ status: res.status, body }, '[ai-client] generateStream FAILED');
      throw new Error(`ai-core /generate error: ${res.status} — ${body}`);
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  }

  async embed(text: string): Promise<number[]> {
    logger.info({ chars: text.length }, '[ai-client] embed →');
    const t = Date.now();
    const res = await fetch(`${this.baseUrl}/embed`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, '[ai-client] embed FAILED');
      throw new Error(`ai-core /embed error: ${res.status}`);
    }
    logger.info({ ms: Date.now() - t }, '[ai-client] embed ✓');
    const data = await res.json();
    return data.embedding;
  }

  async transcribe(audioBlob: Blob, filename: string): Promise<string> {
    logger.info({ bytes: audioBlob.size }, '[ai-client] transcribe →');
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    const res = await fetch(`${this.baseUrl}/transcribe`, {
      method: 'POST',
      headers: { 'X-Internal-Secret': this.secret },
      body: formData,
    });
    if (!res.ok) {
      logger.error({ status: res.status }, '[ai-client] transcribe FAILED');
      throw new Error(`ai-core /transcribe error: ${res.status}`);
    }
    return (await res.json()).text;
  }

  async health(): Promise<{ status: string; providers_ready: string[] }> {
    return fetch(`${this.baseUrl}/health`).then((r) => r.json());
  }
}

export const aiClient = new AiClient(
  process.env.AI_CORE_URL!,
  process.env.AI_CORE_SECRET!,
);
