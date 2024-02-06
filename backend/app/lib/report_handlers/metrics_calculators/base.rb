module ReportHandlers
  module MetricsCalculators
    class Base
      attr_reader :public_key, :current_period_start_date, :current_period_end_date, :previous_period_start_date, :previous_period_end_date

      def initialize(public_key, workspace_id: nil, current_period_start_date:, current_period_end_date:, previous_period_start_date:, previous_period_end_date:)
        @public_key = public_key
        @workspace_id = workspace_id
        @current_period_start_date = current_period_start_date
        @current_period_end_date = current_period_end_date
        @previous_period_start_date = previous_period_start_date
        @previous_period_end_date = previous_period_end_date
      end

      def count_for_this_period(query_class)
        query_class.new(public_key, workspace_id: @workspace_id, start_time: current_period_start_date, end_time: current_period_end_date).count
      end

      def count_for_previous_period(query_class)
        query_class.new(public_key, workspace_id: @workspace_id, start_time: previous_period_start_date, end_time: previous_period_end_date).count
      end

      def sum_property_for_this_period(event_name, property_name)
        ClickHouseQueries::Events::Properties::Sum.new(
          public_key, 
          event_name: event_name, 
          property_name: property_name, 
          start_time: current_period_start_date, 
          end_time: current_period_end_date
        ).get
      end

      def sum_property_for_previous_period(event_name, property_name)
        ClickHouseQueries::Events::Properties::Sum.new(
          public_key,
          event_name: event_name,
          property_name: property_name,
          start_time: previous_period_start_date,
          end_time: previous_period_end_date
        ).get
      end

      def event_count_for_this_period(event_name)
        ClickHouseQueries::Events::Count::Total.new(
          public_key, 
          event: event_name, 
          start_time: current_period_start_date, 
          end_time: current_period_end_date
        ).get
      end

      def event_count_for_previous_period(event_name)
        ClickHouseQueries::Events::Count::Total.new(
          public_key,
          event: event_name,
          start_time: previous_period_start_date,
          end_time: previous_period_end_date
        ).get
      end

      def as_json
        Hash.new.tap do |hash|
          self.class.instance_methods(false).each do |method_name|
            hash[method_name] = send(method_name)
          rescue => e
          end
        end
      end
    end
  end
end