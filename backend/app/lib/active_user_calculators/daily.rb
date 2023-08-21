module ActiveUserCalculators
  class Daily < Base
    self.sql_date_trunc_unit = 'day'
    self.filled_in_results_increment = 1.day
    self.default_start_time = 3.months.ago
    self.start_time_normalizer = ->(start_time) { start_time.beginning_of_day }
    self.end_time_normalizer = ->(end_time) { end_time.end_of_day }
    self.date_formatter = ->(date) { date.strftime('%a, %b %-d') }
  end
end