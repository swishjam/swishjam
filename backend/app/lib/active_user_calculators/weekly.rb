module ActiveUserCalculators
  class Weekly < Base
    self.sql_date_trunc_unit = 'week'
    self.filled_in_results_increment = 1.week
    self.default_start_time = 6.months.ago
    self.start_time_normalizer = ->(start_time) { start_time.beginning_of_week }
    self.end_time_normalizer = ->(end_time) { end_time.end_of_week }
    self.date_formatter = ->(date) { date.strftime('Week of %b %-d') }
  end
end