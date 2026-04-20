-- Run this once against your Supabase project after migrations.
-- Supabase Auth populates auth.uid() automatically.

-- user_profiles
alter table user_profiles enable row level security;
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);

-- spaces
alter table spaces enable row level security;
create policy "Users can view own spaces" on spaces for select using (auth.uid() = user_id);
create policy "Users can create own spaces" on spaces for insert with check (auth.uid() = user_id);
create policy "Users can update own spaces" on spaces for update using (auth.uid() = user_id);
create policy "Users can delete own spaces" on spaces for delete using (auth.uid() = user_id);

-- voice_profiles
alter table voice_profiles enable row level security;
create policy "Users can view own voice profiles" on voice_profiles for select using (auth.uid() = user_id);
create policy "Users can create own voice profiles" on voice_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own voice profiles" on voice_profiles for update using (auth.uid() = user_id);
create policy "Users can delete own voice profiles" on voice_profiles for delete using (auth.uid() = user_id);

-- corpus_items
alter table corpus_items enable row level security;
create policy "Users can view own corpus items" on corpus_items for select using (auth.uid() = user_id);
create policy "Users can create own corpus items" on corpus_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own corpus items" on corpus_items for delete using (auth.uid() = user_id);

-- generations
alter table generations enable row level security;
create policy "Users can view own generations" on generations for select using (auth.uid() = user_id);
create policy "Users can create own generations" on generations for insert with check (auth.uid() = user_id);
create policy "Users can update own generations" on generations for update using (auth.uid() = user_id);

-- edits
alter table edits enable row level security;
create policy "Users can view own edits" on edits for select using (auth.uid() = user_id);
create policy "Users can create own edits" on edits for insert with check (auth.uid() = user_id);
