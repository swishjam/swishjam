create table "public"."data_connections" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying not null,
    "data_source_id" uuid not null,
    "data_destination_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."data_connections" enable row level security;

create table "public"."data_destination_options" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying not null,
    "slug" character varying not null,
    "type" character varying not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."data_destination_options" enable row level security;

create table "public"."data_destinations" (
    "id" uuid not null default gen_random_uuid(),
    "data_destination_option_id" uuid not null,
    "name" character varying not null,
    "auth_credentials" json not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."data_destinations" enable row level security;

create table "public"."data_source_options" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying not null,
    "slug" character varying not null,
    "type" character varying not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."data_source_options" enable row level security;

create table "public"."data_sources" (
    "id" uuid not null default gen_random_uuid(),
    "data_source_option_id" uuid not null,
    "name" character varying not null,
    "auth_credentials" json not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."data_sources" enable row level security;

CREATE UNIQUE INDEX data_connections_pkey ON public.data_connections USING btree (id);

CREATE UNIQUE INDEX data_destination_options_pkey ON public.data_destination_options USING btree (id);

CREATE UNIQUE INDEX data_destination_options_slug_key ON public.data_destination_options USING btree (slug);

CREATE UNIQUE INDEX data_destinations_pkey ON public.data_destinations USING btree (id);

CREATE UNIQUE INDEX data_source_options_pkey ON public.data_source_options USING btree (id);

CREATE UNIQUE INDEX data_source_options_slug_key ON public.data_source_options USING btree (slug);

CREATE UNIQUE INDEX data_sources_pkey ON public.data_sources USING btree (id);

alter table "public"."data_connections" add constraint "data_connections_pkey" PRIMARY KEY using index "data_connections_pkey";

alter table "public"."data_destination_options" add constraint "data_destination_options_pkey" PRIMARY KEY using index "data_destination_options_pkey";

alter table "public"."data_destinations" add constraint "data_destinations_pkey" PRIMARY KEY using index "data_destinations_pkey";

alter table "public"."data_source_options" add constraint "data_source_options_pkey" PRIMARY KEY using index "data_source_options_pkey";

alter table "public"."data_sources" add constraint "data_sources_pkey" PRIMARY KEY using index "data_sources_pkey";

alter table "public"."data_connections" add constraint "data_connections_data_destination_id_fkey" FOREIGN KEY (data_destination_id) REFERENCES data_destinations(id) not valid;

alter table "public"."data_connections" validate constraint "data_connections_data_destination_id_fkey";

alter table "public"."data_connections" add constraint "data_connections_data_source_id_fkey" FOREIGN KEY (data_source_id) REFERENCES data_sources(id) not valid;

alter table "public"."data_connections" validate constraint "data_connections_data_source_id_fkey";

alter table "public"."data_destination_options" add constraint "data_destination_options_slug_key" UNIQUE using index "data_destination_options_slug_key";

alter table "public"."data_destinations" add constraint "data_destinations_data_destination_option_id_fkey" FOREIGN KEY (data_destination_option_id) REFERENCES data_destination_options(id) not valid;

alter table "public"."data_destinations" validate constraint "data_destinations_data_destination_option_id_fkey";

alter table "public"."data_source_options" add constraint "data_source_options_slug_key" UNIQUE using index "data_source_options_slug_key";

alter table "public"."data_sources" add constraint "data_sources_data_source_option_id_fkey" FOREIGN KEY (data_source_option_id) REFERENCES data_source_options(id) not valid;

alter table "public"."data_sources" validate constraint "data_sources_data_source_option_id_fkey";


