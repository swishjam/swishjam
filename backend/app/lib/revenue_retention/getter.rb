module RevenueRetention
  class Getter
    def initialize(workspace_id, starting_cohort_date: 8.months.ago)
      @workspace_id = workspace_id
      @starting_cohort_date = starting_cohort_date.beginning_of_month
    end

    def get
      results = ClickHouseQueries::SaasMetrics::RevenueRetention.new(@workspace_id, starting_cohort_date: @starting_cohort_date).get
      formatted_results = {}
      results.each do |result|
        formatted_results[result['cohort_date'].to_date] ||= { 
          starting_mrr_in_cents: result['cohort_starting_mrr_in_cents'], 
          starting_num_subscriptions: result['cohort_starting_num_subscriptions'],
          retention_periods: []
        }
        formatted_results[result['cohort_date'].to_date][:retention_periods] << { 
          retention_date: result['retention_period_date'].to_date,
          mrr_in_cents: result['retention_period_mrr_in_cents']
        }
      end
      formatted_results.each do |cohort_date, cohort_data|
        cohort_data[:retention_periods].sort_by! { |retention_period| retention_period[:retention_date] }
      end
      formatted_results
    end
  end
end