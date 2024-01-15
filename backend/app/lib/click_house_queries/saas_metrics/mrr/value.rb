module ClickHouseQueries
  module SaasMetrics
    module Mrr
      class Value
        include ClickHouseQueries::Helpers

        def initialize(public_keys, point_in_time:)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @point_in_time = point_in_time
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql).first['movement_amount']
        end

        def sql
          <<~SQL
              SELECT CAST(SUM(JSONExtractFloat(properties, 'movement_amount')) AS INT) AS movement_amount
              FROM events
              WHERE
                name = '#{Analytics::Event::ReservedNames.MRR_MOVEMENT}' AND
                occurred_at <= '#{formatted_time(@point_in_time)}' AND
                swishjam_api_key IN #{formatted_in_clause(@public_keys)}
          SQL
        end
      end
    end
  end
end