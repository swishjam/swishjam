alter table "public"."project_report_urls" add constraint "project_report_urls_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."project_report_urls" validate constraint "project_report_urls_project_id_fkey";


