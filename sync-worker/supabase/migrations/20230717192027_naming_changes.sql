alter table "public"."data_destination_options" drop constraint "data_destination_options_slug_key";

alter table "public"."data_destinations" drop constraint "data_destinations_data_destination_option_id_fkey";

alter table "public"."data_source_options" drop constraint "data_source_options_slug_key";

alter table "public"."data_sources" drop constraint "data_sources_data_source_option_id_fkey";

alter table "public"."data_destination_options" drop constraint "data_destination_options_pkey";

alter table "public"."data_source_options" drop constraint "data_source_options_pkey";

drop index if exists "public"."data_destination_options_pkey";

drop index if exists "public"."data_destination_options_slug_key";

drop index if exists "public"."data_source_options_pkey";

drop index if exists "public"."data_source_options_slug_key";

drop table "public"."data_destination_options";

drop table "public"."data_source_options";

create table "public"."destination_options" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying not null,
    "slug" character varying not null,
    "type" character varying not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."destination_options" enable row level security;

create table "public"."source_options" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying not null,
    "slug" character varying not null,
    "type" character varying not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."source_options" enable row level security;

alter table "public"."data_destinations" drop column "data_destination_option_id";

alter table "public"."data_destinations" add column "destination_option_id" uuid not null;

alter table "public"."data_sources" drop column "data_source_option_id";

alter table "public"."data_sources" add column "source_option_id" uuid not null;

CREATE UNIQUE INDEX data_destination_options_pkey ON public.destination_options USING btree (id);

CREATE UNIQUE INDEX data_destination_options_slug_key ON public.destination_options USING btree (slug);

CREATE UNIQUE INDEX data_source_options_pkey ON public.source_options USING btree (id);

CREATE UNIQUE INDEX data_source_options_slug_key ON public.source_options USING btree (slug);

alter table "public"."destination_options" add constraint "data_destination_options_pkey" PRIMARY KEY using index "data_destination_options_pkey";

alter table "public"."source_options" add constraint "data_source_options_pkey" PRIMARY KEY using index "data_source_options_pkey";

alter table "public"."data_destinations" add constraint "data_destinations_destination_option_id_fkey" FOREIGN KEY (destination_option_id) REFERENCES destination_options(id) not valid;

alter table "public"."data_destinations" validate constraint "data_destinations_destination_option_id_fkey";

alter table "public"."data_sources" add constraint "data_sources_source_option_id_fkey" FOREIGN KEY (source_option_id) REFERENCES source_options(id) not valid;

alter table "public"."data_sources" validate constraint "data_sources_source_option_id_fkey";

alter table "public"."destination_options" add constraint "data_destination_options_slug_key" UNIQUE using index "data_destination_options_slug_key";

alter table "public"."source_options" add constraint "data_source_options_slug_key" UNIQUE using index "data_source_options_slug_key";


