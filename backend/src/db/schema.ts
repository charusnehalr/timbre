import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  real,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';

// Supabase Auth manages users; this is the app-specific profile extension
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const spaces = pgTable('spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const voiceProfiles = pgTable('voice_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spaces.id),
  version: integer('version').notNull().default(1),
  profile: jsonb('profile').notNull(),
  confidence: real('confidence').notNull().default(0),
  sampleCount: integer('sample_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Gemini text-embedding-004 produces 768-dimensional vectors
export const corpusItems = pgTable(
  'corpus_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    spaceId: uuid('space_id').references(() => spaces.id),
    source: text('source').notNull(), // 'interview' | 'import' | 'draft' | 'edit'
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    embeddingIdx: index('corpus_embedding_idx').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
  }),
);

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spaces.id),
  intent: text('intent').notNull(),
  task: text('task').notNull(),
  finalDraft: text('final_draft'),
  voiceMatchScore: real('voice_match_score'),
  attempts: jsonb('attempts').notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const edits = pgTable('edits', {
  id: uuid('id').primaryKey().defaultRandom(),
  generationId: uuid('generation_id')
    .notNull()
    .references(() => generations.id),
  userId: uuid('user_id').notNull(),
  before: text('before').notNull(),
  after: text('after').notNull(),
  diff: jsonb('diff').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
