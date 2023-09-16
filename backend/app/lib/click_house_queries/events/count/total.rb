module ClickHouseQueries
  module Events
    module Count
      class Total
        include ClickHouseQueries::Helpers

        def initialize(public_key, event_name:, start_time:, end_time:)
          @public_key = public_key
          @event_name = event_name
          @start_time = start_time
          @end_time = end_time
          # @comparison_start_time = comparison_start_time
          # @comparison_end_time = comparison_end_time
        end

        def get
          Analytics::Event.find_by_sql(sql.squish!).first&.count || 0
        end

        def sql
          <<~SQL
            SELECT CAST(COUNT(*) AS int) AS count
            FROM events
            WHERE
              swishjam_api_key = '#{@public_key}' AND
              occurred_at BETWEEN '#{formatted_time(@start_time)}' AND '#{formatted_time(@end_time)}' AND
              name = '#{@event_name}'
          SQL
        end
      end
    end
  end
end