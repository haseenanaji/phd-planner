-- PhD Planner Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  university text,
  department text,
  year integer,
  advisor_name text,
  created_at timestamptz default now() not null
);

-- Papers
create table if not exists public.papers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  venue text,
  status text not null default 'idea' check (status in ('idea', 'writing', 'submitted', 'under_review', 'published', 'rejected')),
  deadline date,
  co_authors text,
  notes text,
  created_at timestamptz default now() not null
);

-- Literature
create table if not exists public.literature (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  authors text,
  doi_link text,
  status text not null default 'to-read' check (status in ('to-read', 'reading', 'done')),
  tags text,
  notes text,
  created_at timestamptz default now() not null
);

-- Experiments
create table if not exists public.experiments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  hypothesis text,
  method text,
  status text not null default 'planned' check (status in ('planned', 'running', 'done', 'failed')),
  outcome text,
  date date,
  created_at timestamptz default now() not null
);

-- Deadlines
create table if not exists public.deadlines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text,
  deadline_date date not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Meetings (Advisor Hub)
create table if not exists public.meetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  agenda text,
  action_items text,
  notes text,
  created_at timestamptz default now() not null
);

-- Focus Blocks (Deep Work Planner)
create table if not exists public.focus_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  label text not null,
  created_at timestamptz default now() not null
);

-- Wins
create table if not exists public.wins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null,
  date date not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Rejections
create table if not exists public.rejections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null,
  date date not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Ideas
create table if not exists public.ideas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  tags text,
  created_at timestamptz default now() not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.papers enable row level security;
alter table public.literature enable row level security;
alter table public.experiments enable row level security;
alter table public.deadlines enable row level security;
alter table public.meetings enable row level security;
alter table public.focus_blocks enable row level security;
alter table public.wins enable row level security;
alter table public.rejections enable row level security;
alter table public.ideas enable row level security;

-- RLS Policies: users can only access their own data

-- Profiles
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Papers
create policy "Users can read own papers" on public.papers for select using (auth.uid() = user_id);
create policy "Users can insert own papers" on public.papers for insert with check (auth.uid() = user_id);
create policy "Users can update own papers" on public.papers for update using (auth.uid() = user_id);
create policy "Users can delete own papers" on public.papers for delete using (auth.uid() = user_id);

-- Literature
create policy "Users can read own literature" on public.literature for select using (auth.uid() = user_id);
create policy "Users can insert own literature" on public.literature for insert with check (auth.uid() = user_id);
create policy "Users can update own literature" on public.literature for update using (auth.uid() = user_id);
create policy "Users can delete own literature" on public.literature for delete using (auth.uid() = user_id);

-- Experiments
create policy "Users can read own experiments" on public.experiments for select using (auth.uid() = user_id);
create policy "Users can insert own experiments" on public.experiments for insert with check (auth.uid() = user_id);
create policy "Users can update own experiments" on public.experiments for update using (auth.uid() = user_id);
create policy "Users can delete own experiments" on public.experiments for delete using (auth.uid() = user_id);

-- Deadlines
create policy "Users can read own deadlines" on public.deadlines for select using (auth.uid() = user_id);
create policy "Users can insert own deadlines" on public.deadlines for insert with check (auth.uid() = user_id);
create policy "Users can update own deadlines" on public.deadlines for update using (auth.uid() = user_id);
create policy "Users can delete own deadlines" on public.deadlines for delete using (auth.uid() = user_id);

-- Meetings
create policy "Users can read own meetings" on public.meetings for select using (auth.uid() = user_id);
create policy "Users can insert own meetings" on public.meetings for insert with check (auth.uid() = user_id);
create policy "Users can update own meetings" on public.meetings for update using (auth.uid() = user_id);
create policy "Users can delete own meetings" on public.meetings for delete using (auth.uid() = user_id);

-- Focus blocks
create policy "Users can read own focus_blocks" on public.focus_blocks for select using (auth.uid() = user_id);
create policy "Users can insert own focus_blocks" on public.focus_blocks for insert with check (auth.uid() = user_id);
create policy "Users can update own focus_blocks" on public.focus_blocks for update using (auth.uid() = user_id);
create policy "Users can delete own focus_blocks" on public.focus_blocks for delete using (auth.uid() = user_id);

-- Wins
create policy "Users can read own wins" on public.wins for select using (auth.uid() = user_id);
create policy "Users can insert own wins" on public.wins for insert with check (auth.uid() = user_id);
create policy "Users can update own wins" on public.wins for update using (auth.uid() = user_id);
create policy "Users can delete own wins" on public.wins for delete using (auth.uid() = user_id);

-- Rejections
create policy "Users can read own rejections" on public.rejections for select using (auth.uid() = user_id);
create policy "Users can insert own rejections" on public.rejections for insert with check (auth.uid() = user_id);
create policy "Users can update own rejections" on public.rejections for update using (auth.uid() = user_id);
create policy "Users can delete own rejections" on public.rejections for delete using (auth.uid() = user_id);

-- Ideas
create policy "Users can read own ideas" on public.ideas for select using (auth.uid() = user_id);
create policy "Users can insert own ideas" on public.ideas for insert with check (auth.uid() = user_id);
create policy "Users can update own ideas" on public.ideas for update using (auth.uid() = user_id);
create policy "Users can delete own ideas" on public.ideas for delete using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists papers_user_id_idx on public.papers(user_id);
create index if not exists literature_user_id_idx on public.literature(user_id);
create index if not exists experiments_user_id_idx on public.experiments(user_id);
create index if not exists deadlines_user_id_deadline_idx on public.deadlines(user_id, deadline_date);
create index if not exists meetings_user_id_date_idx on public.meetings(user_id, date);
create index if not exists focus_blocks_user_id_idx on public.focus_blocks(user_id);
create index if not exists wins_user_id_idx on public.wins(user_id);
create index if not exists rejections_user_id_idx on public.rejections(user_id);
create index if not exists ideas_user_id_idx on public.ideas(user_id);
