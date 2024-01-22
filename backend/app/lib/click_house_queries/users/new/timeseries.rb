module ClickHouseQueries
  module Users
    module New
      class Timeseries
        include ClickHouseQueries::Helpers
        include TimeseriesHelper

        def initialize(workspace_id, start_time:, end_time:, group_by: nil)
          @workspace_id = workspace_id
          @group_by = group_by || derived_group_by(start_ts: start_time, end_ts: end_time)
          @start_time, @end_time = rounded_timestamps(start_ts: start_time, end_ts: end_time, group_by: @group_by)
        end

        def get
          return @filled_in_results if defined?(@filled_in_results)
          data = Analytics::SwishjamUserProfile.find_by_sql(sql.squish!)
          DataFormatters::Timeseries.new(
            data, 
            start_time: @start_time, 
            end_time: @end_time, 
            group_by: @group_by, 
            value_method: :count, 
            date_method: :date,
          )
        end

        def sql
          <<~SQL
            SELECT 
              CAST(
                COUNT(DISTINCT 
                  IF(
                    isNull(merged_into_swishjam_user_id),
                    swishjam_user_id,
                    merged_into_swishjam_user_id
                  )
                )
              AS INT) AS count,
              DATE_TRUNC('#{@group_by}', created_at) AS date,
              DATE_TRUNC('year', created_at) AS year
            FROM (
              SELECT
                swishjam_user_id,
                argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
                argMax(created_at, updated_at) AS created_at
              FROM swishjam_user_profiles
              WHERE workspace_id = '#{@workspace_id}'
              GROUP BY swishjam_user_id
            )
            WHERE created_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
            GROUP BY date, year
            ORDER BY date, year ASC
          SQL
        end
      end
    end
  end
end