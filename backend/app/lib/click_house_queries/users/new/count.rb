module ClickHouseQueries
  module Users
    module New
      class Count
        include ClickHouseQueries::Helpers

        def initialize(public_keys, workspace_id: nil, start_time:, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @workspace_id = workspace_id
          @start_time = start_time 
          @end_time = end_time 
        end

        def count 
          Analytics::Event.find_by_sql(sql.squish!).first['count']
        end

        def sql
          <<~SQL
            SELECT CAST(COUNT() AS INT) AS count
            FROM swishjam_user_profiles
            WHERE 
              swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND 
              created_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}'
          SQL
        end
      end
    end
  end
end