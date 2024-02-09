module ClickHouseQueries
  module Events
    module Count
      class Total
        include ClickHouseQueries::Helpers

        def initialize(public_keys, event:, start_time:, end_time:, distinct_count_property: 'uuid')
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @event = event
          @start_time = start_time
          @end_time = end_time
        end

        def get
          @count ||= Analytics::ClickHouseRecord.execute_sql(sql.squish!).first['count']
        end

        def sql
          <<~SQL
            SELECT CAST(COUNT(DISTINCT #{distinct_property_select_clause}) AS INT) AS count
            FROM events AS e
            #{join_statements}
            WHERE
              e.swishjam_api_key IN #{formatted_in_clause(@public_keys)} AND
              e.occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              e.name = '#{@event}'
          SQL
        end

        def distinct_property_select_clause
          if @distinct_count_property == 'users'
            <<~SQL
              IF(
                isNull(user_profiles.merged_into_swishjam_user_id),
                user_profiles.swishjam_user_id,
                user_profiles.merged_into_swishjam_user_id
              )
            SQL
          elsif @distinct_count_property.nil? || @distinct_count_property == 'uuid'
            'e.uuid'
          else
            "JSONExtractString(e.properties, '#{@distinct_count_property}')"
          end
        end

        def join_statements
          return '' if @distinct_count_property != 'users'
          # TODO: I think we need to do de-duplication here, should use/create a Common subquery
          <<~SQL
            LEFT JOIN swishjam_user_profiles AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id
          SQL
        end
      end
    end
  end
end