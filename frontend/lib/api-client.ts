const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }
  return data;
}

export const apiClient = {
  signup: (email: string, password: string, displayName: string) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),

  getSpaces: (token: string) =>
    request<{ spaces: Array<{ id: string; name: string; description: string | null }> }>(
      '/api/spaces',
      { token },
    ),

  createSpace: (token: string, name: string, description?: string) =>
    request<{ space: { id: string; name: string } }>('/api/spaces', {
      method: 'POST',
      token,
      body: JSON.stringify({ name, description }),
    }),

  interviewTurn: (
    token: string,
    spaceId: string,
    history: Array<{ role: string; content: string }>,
  ) =>
    request<{ reply: string; captured_facts: string[] }>('/api/onboarding/interview', {
      method: 'POST',
      token,
      body: JSON.stringify({ spaceId, history }),
    }),

  getCorpusItems: (token: string, spaceId: string) =>
    request<{ items: Array<{ id: string; content: string; source: string }> }>(
      `/api/onboarding/corpus?spaceId=${spaceId}`,
      { token },
    ),

  addCorpus: (token: string, spaceId: string, content: string, source = 'import') =>
    request('/api/onboarding/corpus', {
      method: 'POST',
      token,
      body: JSON.stringify({ spaceId, content, source }),
    }),

  finalizeOnboarding: (token: string, spaceId: string) =>
    request('/api/onboarding/finalize', {
      method: 'POST',
      token,
      body: JSON.stringify({ spaceId }),
    }),

  getProfile: (token: string, spaceId: string) =>
    request<{ profile: Record<string, unknown> }>(`/api/profile/${spaceId}`, { token }),

  async *generateStream(
    token: string,
    spaceId: string,
    task: string,
    intent?: string,
  ): AsyncIterable<string> {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ spaceId, task, intent }),
    });
    if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  },

  transcribe: async (token: string, blob: Blob): Promise<string> => {
    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    const res = await fetch(`${BASE}/api/transcribe`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    return data.text;
  },
};
