module ClickHouseQueries
  module Common
    class WhereClauseForUserSegmentEventFilter
      def self.where_clause_statement(filter_config, events_table_alias: 'events')
        num_lookback_minutes = filter_config['num_lookback_days'] * 24 * 60
        <<~SQL
          (
            SELECT CAST(count(DISTINCT uuid) AS INT)
            FROM #{events_table_alias}
            WHERE 
              #{events_table_alias}.name = '#{filter_config['event_name']}' AND
              date_diff('minute', #{events_table_alias}.occurred_at, now(), 'UTC') <= #{num_lookback_minutes}
          ) >= #{filter_config['num_event_occurrences']}
        SQL
      end
    end
  end
end