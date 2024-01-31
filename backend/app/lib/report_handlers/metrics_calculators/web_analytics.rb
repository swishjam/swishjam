module ReportHandlers
  module MetricsCalculators
    class WebAnalytics < Base
      def num_sessions_for_period
        @marketing_sessions_for_period ||= count_for_this_period(ClickHouseQueries::Sessions::Count)
      end

      def num_sessions_for_previous_period
        @marketing_sessions_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Sessions::Count)
      end

      def num_page_views_for_period
        @marketing_page_views_for_period ||= count_for_this_period(ClickHouseQueries::PageViews::Count)
      end

      def num_page_views_for_previous_period
        @marketing_page_views_for_previous_period ||= count_for_previous_period(ClickHouseQueries::PageViews::Count)
      end

      def num_unique_users_for_previous_period
        @marketing_unique_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::Active::Count)
      end

      def num_unique_users_for_period
        @marketing_unique_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::Active::Count)
      end
    end
  end
end