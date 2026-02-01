-- Community tables for Gridiron Encyclopedia
-- Run against your Supabase project when ready to enable community features.

-- ============================================================================
-- PROFILES
-- ============================================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  avatar_url text,
  bio text not null default '',
  role text not null default 'registered' check (role in ('registered', 'contributor', 'editor', 'admin')),
  reputation integer not null default 0,
  joined_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  favorite_team text,
  coaching_level text
);

create index idx_profiles_username on profiles(username);
create index idx_profiles_reputation on profiles(reputation desc);

-- ============================================================================
-- REPUTATION EVENTS
-- ============================================================================

create table if not exists reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null check (action in (
    'edit_approved', 'edit_rejected', 'play_shared', 'play_upvoted',
    'play_featured', 'discussion_created', 'comment_upvoted', 'report_confirmed'
  )),
  points integer not null,
  reference_type text,
  reference_id text,
  created_at timestamptz not null default now()
);

create index idx_reputation_events_user on reputation_events(user_id, created_at desc);

-- ============================================================================
-- ARTICLE VERSIONS (wiki edits)
-- ============================================================================

create table if not exists article_versions (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  author_id uuid not null references profiles(id) on delete cascade,
  author_name text not null,
  title text not null,
  content text not null,
  summary text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index idx_article_versions_slug on article_versions(article_slug, created_at desc);
create index idx_article_versions_status on article_versions(status) where status = 'pending';
create index idx_article_versions_author on article_versions(author_id);

-- ============================================================================
-- PLAYBOOKS
-- ============================================================================

create table if not exists playbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  is_public boolean not null default false,
  play_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_playbooks_user on playbooks(user_id, updated_at desc);

-- ============================================================================
-- COMMUNITY PLAYS
-- ============================================================================

create table if not exists community_plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  author_name text not null,
  title text not null,
  description text not null default '',
  diagram_data text not null,
  playbook_id uuid references playbooks(id) on delete set null,
  is_public boolean not null default false,
  tags text[] not null default '{}',
  upvotes integer not null default 0,
  favorites integer not null default 0,
  fork_count integer not null default 0,
  forked_from_id uuid references community_plays(id) on delete set null,
  submitted_to_encyclopedia boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_community_plays_user on community_plays(user_id, updated_at desc);
create index idx_community_plays_public on community_plays(is_public, created_at desc) where is_public = true;
create index idx_community_plays_popular on community_plays(upvotes desc) where is_public = true;
create index idx_community_plays_tags on community_plays using gin(tags);

-- ============================================================================
-- PLAY VOTES
-- ============================================================================

create table if not exists play_votes (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references community_plays(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('upvote', 'favorite')),
  created_at timestamptz not null default now(),
  unique(play_id, user_id, type)
);

create index idx_play_votes_play on play_votes(play_id);

-- ============================================================================
-- DISCUSSIONS
-- ============================================================================

create table if not exists discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  author_name text not null,
  title text not null,
  content text not null,
  category text not null check (category in (
    'general', 'offense', 'defense', 'special-teams', 'strategy', 'coaching', 'film-study'
  )),
  article_slug text,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  comment_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_discussions_category on discussions(category, last_activity_at desc);
create index idx_discussions_article on discussions(article_slug, last_activity_at desc) where article_slug is not null;
create index idx_discussions_pinned on discussions(is_pinned desc, last_activity_at desc);

-- ============================================================================
-- COMMENTS
-- ============================================================================

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references discussions(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  author_name text not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  upvotes integer not null default 0,
  depth integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_comments_discussion on comments(discussion_id, created_at);
create index idx_comments_parent on comments(parent_id);

-- ============================================================================
-- COMMENT VOTES
-- ============================================================================

create table if not exists comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(comment_id, user_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in (
    'edit_approved', 'edit_rejected', 'comment_reply', 'discussion_reply',
    'play_upvoted', 'play_forked', 'moderation_action', 'reputation_milestone'
  )),
  title text not null,
  message text not null,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

-- ============================================================================
-- MODERATION REPORTS
-- ============================================================================

create table if not exists moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('comment', 'discussion', 'play', 'article_version')),
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'offensive', 'misinformation', 'plagiarism', 'off-topic', 'other')),
  details text not null default '',
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_moderation_reports_status on moderation_reports(status, created_at desc) where status = 'pending';

-- ============================================================================
-- MODERATION ACTIONS
-- ============================================================================

create table if not exists moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  action text not null check (action in ('warn', 'mute', 'ban', 'remove_content', 'restore_content')),
  reason text not null,
  report_id uuid references moderation_reports(id),
  created_at timestamptz not null default now()
);

create index idx_moderation_actions_target on moderation_actions(target_user_id, created_at desc);

-- ============================================================================
-- HELPER FUNCTIONS (used by communityData.ts via .rpc())
-- ============================================================================

create or replace function increment_play_count(play_id uuid, col_name text)
returns void as $$
begin
  execute format('update community_plays set %I = %I + 1 where id = $1', col_name, col_name)
  using play_id;
end;
$$ language plpgsql security definer;

create or replace function decrement_play_count(play_id uuid, col_name text)
returns void as $$
begin
  execute format('update community_plays set %I = greatest(%I - 1, 0) where id = $1', col_name, col_name)
  using play_id;
end;
$$ language plpgsql security definer;

create or replace function increment_comment_count(disc_id uuid)
returns void as $$
begin
  update discussions
  set comment_count = comment_count + 1,
      last_activity_at = now()
  where id = disc_id;
end;
$$ language plpgsql security definer;

create or replace function increment_comment_upvotes(cmt_id uuid)
returns void as $$
begin
  update comments set upvotes = upvotes + 1 where id = cmt_id;
end;
$$ language plpgsql security definer;

create or replace function decrement_comment_upvotes(cmt_id uuid)
returns void as $$
begin
  update comments set upvotes = greatest(upvotes - 1, 0) where id = cmt_id;
end;
$$ language plpgsql security definer;

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user-' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table reputation_events enable row level security;
alter table article_versions enable row level security;
alter table playbooks enable row level security;
alter table community_plays enable row level security;
alter table play_votes enable row level security;
alter table discussions enable row level security;
alter table comments enable row level security;
alter table comment_votes enable row level security;
alter table notifications enable row level security;
alter table moderation_reports enable row level security;
alter table moderation_actions enable row level security;

-- Profiles: anyone can read, only own profile can update
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Reputation events: anyone can read, insert via server only (security definer functions)
create policy "reputation_events_select" on reputation_events for select using (true);

-- Article versions: anyone can read, authenticated users can insert their own
create policy "article_versions_select" on article_versions for select using (true);
create policy "article_versions_insert" on article_versions for insert with check (auth.uid() = author_id);
create policy "article_versions_update" on article_versions for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);

-- Playbooks: own playbooks or public ones
create policy "playbooks_select" on playbooks for select using (
  user_id = auth.uid() or is_public = true
);
create policy "playbooks_insert" on playbooks for insert with check (auth.uid() = user_id);
create policy "playbooks_update" on playbooks for update using (auth.uid() = user_id);
create policy "playbooks_delete" on playbooks for delete using (auth.uid() = user_id);

-- Community plays: own plays or public ones
create policy "community_plays_select" on community_plays for select using (
  user_id = auth.uid() or is_public = true
);
create policy "community_plays_insert" on community_plays for insert with check (auth.uid() = user_id);
create policy "community_plays_update" on community_plays for update using (auth.uid() = user_id);
create policy "community_plays_delete" on community_plays for delete using (auth.uid() = user_id);

-- Play votes: own votes
create policy "play_votes_select" on play_votes for select using (true);
create policy "play_votes_insert" on play_votes for insert with check (auth.uid() = user_id);
create policy "play_votes_delete" on play_votes for delete using (auth.uid() = user_id);

-- Discussions: anyone can read, authenticated can insert
create policy "discussions_select" on discussions for select using (true);
create policy "discussions_insert" on discussions for insert with check (auth.uid() = author_id);
create policy "discussions_update" on discussions for update using (
  auth.uid() = author_id or
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);

-- Comments: anyone can read, authenticated can insert
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = author_id);
create policy "comments_update" on comments for update using (auth.uid() = author_id);
create policy "comments_delete" on comments for delete using (
  auth.uid() = author_id or
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);

-- Comment votes: own votes
create policy "comment_votes_select" on comment_votes for select using (true);
create policy "comment_votes_insert" on comment_votes for insert with check (auth.uid() = user_id);
create policy "comment_votes_delete" on comment_votes for delete using (auth.uid() = user_id);

-- Notifications: own notifications only
create policy "notifications_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update" on notifications for update using (auth.uid() = user_id);

-- Moderation reports: authenticated can insert, editors/admins can read all
create policy "moderation_reports_insert" on moderation_reports for insert with check (auth.uid() = reporter_id);
create policy "moderation_reports_select" on moderation_reports for select using (
  auth.uid() = reporter_id or
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);
create policy "moderation_reports_update" on moderation_reports for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);

-- Moderation actions: editors/admins only
create policy "moderation_actions_select" on moderation_actions for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);
create policy "moderation_actions_insert" on moderation_actions for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('editor', 'admin'))
);
