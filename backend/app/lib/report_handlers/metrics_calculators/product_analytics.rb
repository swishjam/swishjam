module ReportHandlers
  module MetricsCalculators
    class ProductAnalytics < Base
      def num_unique_active_users_for_period
        @num_unique_active_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::Active::Count)
      end
      
      def num_unique_active_users_for_previous_period
        @num_unique_active_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::Active::Count)
      end

      def num_sessions_for_period
        @sessions_for_period ||= count_for_this_period(ClickHouseQueries::Sessions::Count)
      end

      def num_sessions_for_previous_period
        @sessions_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Sessions::Count)
      end

      def num_new_users_for_period
        @new_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::New::Count)
      end

      def num_new_users_for_previous_period
        @new_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::New::Count)
      end
    end
  end
end