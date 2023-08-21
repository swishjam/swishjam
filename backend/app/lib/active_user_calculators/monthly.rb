module ActiveUserCalculators
  class Monthly < Base
    self.sql_date_trunc_unit = 'month'
    self.filled_in_results_increment = 1.month
    self.default_start_time = 12.months.ago
    self.start_time_normalizer = ->(start_time) { start_time.beginning_of_month }
    self.end_time_normalizer = ->(end_time) { end_time.end_of_month }
    self.date_formatter = ->(date) { date.strftime('%B %Y') }
  end
end