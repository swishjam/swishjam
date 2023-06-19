create table "public"."project_report_urls" (
    "id" uuid not null default uuid_generate_v4(),
    "project_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "full_url" text not null,
    "url_host" text not null,
    "url_path" text not null,
    "cadence" character varying,
    "enabled" boolean,
    "url_uniqueness_key" text,
    "data_type" character varying not null
);


alter table "public"."project_report_urls" enable row level security;

CREATE UNIQUE INDEX project_report_urls_pkey ON public.project_report_urls USING btree (id);

CREATE UNIQUE INDEX project_report_urls_url_uniqueness_key_key ON public.project_report_urls USING btree (url_uniqueness_key);

alter table "public"."project_report_urls" add constraint "project_report_urls_pkey" PRIMARY KEY using index "project_report_urls_pkey";

alter table "public"."project_report_urls" add constraint "project_report_urls_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."project_report_urls" validate constraint "project_report_urls_project_id_fkey";

alter table "public"."project_report_urls" add constraint "project_report_urls_url_uniqueness_key_key" UNIQUE using index "project_report_urls_url_uniqueness_key_key";

create policy "Enable delete for users based on user_id"
on "public"."project_report_urls"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."project_report_urls"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."project_report_urls"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users based on email"
on "public"."project_report_urls"
as permissive
for update
to authenticated
using (true)
with check (true);




