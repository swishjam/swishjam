alter table "public"."project_report_urls" drop constraint "project_report_urls_project_id_fkey";

alter table "public"."project_report_urls" add column "notification_destination" text;

alter table "public"."project_report_urls" add column "notification_type" text;