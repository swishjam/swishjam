module ClickHouseQueries
  module Users
    module New
      class Count

        include ClickHouseQueries::Helpers

        def initialize(public_keys, start_time:, end_time: Time.current)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @start_time = start_time 
          @end_time = end_time 
        end

        def count 
          Analytics::Event.find_by_sql(sql.squish!).count
        end

        def sql
          <<~SQL
          SELECT COUNT()
            FROM swishjam_user_profiles
            WHERE swishjam_api_key IN #{formatted_in_clause(@public_keys)}
              AND created_at > '#{formatted_time(@start_time)}'
          SQL
        end

      end
    end
  end
end