module ClickHouseQueries
  module Users
    module Attributes
      class List
        include ClickHouseQueries::Helpers

        def initialize(workspace_id, start_time: 6.months.ago)
          @workspace_id = workspace_id
          @start_time = start_time
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        end

        def sql
          <<~SQL
            SELECT DISTINCT property_name
            FROM swishjam_user_profiles
            ARRAY JOIN JSONExtractKeys(metadata) AS property_name
            WHERE
              workspace_id = '#{@workspace_id}' AND
              created_at >= '#{formatted_time(@start_time)}'
          SQL
          columns = [
            'current_subscription_plan_name',
            'monthly_recurring_revenue_in_cents',
            'lifetime_value_in_cents',
            'enrichment_industry',
            'enrichment_company_size',
            'enrichment_company_name',
            'enrichment_company_website',
            'enrichment_job_title',
            'enrichment_year_company_founded',
            'enrichment_company_location_metro'
          ]

          queries = columns.map do |column|
            <<~SQL
              SELECT 
                '#{column}' AS column_name,
                #{column} AS column_value
              FROM swishjam_user_profiles as user_profiles
              WHERE 
                workspace_id = '#{@workspace_id}' AND
                created_at >= '#{formatted_time(@start_time)}'
            SQL
          end

          combined_query = queries.join(' UNION DISTINCT ')

          combined_query
        end
      end
    end
  end
end