create extension if not exists vector;

create schema if not exists edu_ai_memory;

set search_path to edu_ai_memory, public;

do $$
begin
  create type memory_bucket as enum ('academic', 'emotional', 'personal');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type vector_source_type as enum ('student_memory', 'content', 'conversation');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type vector_privacy_level as enum ('public', 'private', 'campus_local_only');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type vector_deployment_scope as enum ('controlled_cloud', 'campus_local');
exception
  when duplicate_object then null;
end $$;

create table if not exists student_memory_embeddings (
  id text primary key,
  tenant_id text not null,
  student_id text not null,
  source_id text not null,
  source_type vector_source_type not null default 'student_memory',
  summary_text text not null,
  embedding vector(1536) not null,
  memory_bucket memory_bucket not null,
  privacy_level vector_privacy_level not null,
  deployment_scope vector_deployment_scope not null,
  source_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  check (source_type = 'student_memory'),
  check (
    memory_bucket <> 'emotional'
    or (privacy_level = 'campus_local_only' and deployment_scope = 'campus_local')
  )
);

create table if not exists content_embeddings (
  id text primary key,
  tenant_id text not null,
  student_id text,
  source_id text not null,
  source_type vector_source_type not null default 'content',
  summary_text text not null,
  embedding vector(1536) not null,
  memory_bucket memory_bucket not null default 'academic',
  privacy_level vector_privacy_level not null default 'public',
  deployment_scope vector_deployment_scope not null default 'controlled_cloud',
  source_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  check (student_id is null),
  check (source_type = 'content'),
  check (memory_bucket = 'academic')
);

create table if not exists conversation_embeddings (
  id text primary key,
  tenant_id text not null,
  student_id text not null,
  source_id text not null,
  source_type vector_source_type not null default 'conversation',
  summary_text text not null,
  embedding vector(1536) not null,
  memory_bucket memory_bucket not null,
  privacy_level vector_privacy_level not null,
  deployment_scope vector_deployment_scope not null,
  source_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  check (source_type = 'conversation'),
  check (
    memory_bucket <> 'emotional'
    or (privacy_level = 'campus_local_only' and deployment_scope = 'campus_local')
  )
);

create index if not exists idx_student_memory_tenant_student_bucket
  on student_memory_embeddings (tenant_id, student_id, memory_bucket);

create index if not exists idx_student_memory_source
  on student_memory_embeddings (source_id);

create index if not exists idx_student_memory_embedding
  on student_memory_embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists idx_content_tenant_bucket
  on content_embeddings (tenant_id, memory_bucket);

create index if not exists idx_content_source
  on content_embeddings (source_id);

create index if not exists idx_content_embedding
  on content_embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists idx_conversation_tenant_student_bucket
  on conversation_embeddings (tenant_id, student_id, memory_bucket);

create index if not exists idx_conversation_source
  on conversation_embeddings (source_id);

create index if not exists idx_conversation_embedding
  on conversation_embeddings using hnsw (embedding vector_cosine_ops);
