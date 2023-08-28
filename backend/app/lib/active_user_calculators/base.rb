module ActiveUserCalculators
  class Base
    class << self
      attr_accessor :sql_date_trunc_unit,
                      :filled_in_results_increment, 
                      :default_start_time, 
                      :default_end_time, 
                      :start_time_normalizer,
                      :end_time_normalizer,
                      :date_formatter
    end

    def initialize(analytics_or_swishjam_organization, start_time: self.class.default_start_time, end_time: self.class.default_end_time || Time.current)
      @organization = analytics_or_swishjam_organization
      @start_time = defined?(self.class.start_time_normalizer) ? self.class.start_time_normalizer.call(start_time.beginning_of_day) : start_time
      @end_time = defined?(self.class.end_time_normalizer) ? self.class.end_time_normalizer.call(end_time.end_of_day) : end_time
    end

    def current_value
      timeseries.last[:value]
    end

    def timeseries
      raise ArgumentError, "#{self.class.to_s} must define `sql_date_trunc_unit` (ie: `day`, `week`, `month`)" if !self.class.sql_date_trunc_unit.present?
      return @timeseries_data if @timeseries_data.present?
      if @organization.is_a?(Analytics::Organization)
        @timeseries_data = for_analytics_organization
      elsif @organization.is_a?(Workspace)
        @timeseries_data = for_swishjam_organization
      else
        raise ArgumentError, "`ActiveUserCalculators::Daily.for` expected `Analytics::Organization` or `Workspace`, got #{@organization.class}"
      end
    end

    private

    def for_analytics_organization
      sql = <<~SQL
        SELECT 
          DATE_TRUNC('#{self.class.sql_date_trunc_unit}', sessions.start_time) AS date,
          DATE_TRUNC('year', sessions.start_time) AS year,
          COUNT(
            DISTINCT 
              CASE 
                WHEN devices.analytics_user_id IS NOT NULL 
                THEN devices.analytics_user_id 
                ELSE devices.id
              END
          ) AS value
        FROM 
          analytics_sessions AS sessions
        JOIN
          analytics_devices AS devices ON sessions.analytics_device_id = devices.id
        WHERE 
          sessions.analytics_organization_id = '#{@organization.id}' AND
          sessions.start_time BETWEEN '#{@start_time}' AND '#{@end_time}'
        GROUP BY 
          year, date
        ORDER BY 
          year, date ASC;
      SQL
      results = ActiveRecord::Base.connection.execute(sql).to_a
      filled_in_results(results)
    end

    def for_swishjam_organization
      sql = <<~SQL
        SELECT 
          DATE_TRUNC('#{self.class.sql_date_trunc_unit}', sessions.start_time) AS date,
          DATE_TRUNC('year', sessions.start_time) AS year,
          COUNT(
            DISTINCT 
              CASE 
                WHEN devices.analytics_user_id IS NOT NULL 
                THEN devices.analytics_user_id 
                ELSE devices.id
              END
          ) AS value
        FROM 
          analytics_sessions AS sessions
        JOIN
          analytics_devices AS devices ON sessions.analytics_device_id = devices.id
        JOIN 
          swishjam_organizations AS organizations ON devices.swishjam_organization_id = organizations.id
        WHERE 
          organizations.id = '#{@organization.id}' AND
          sessions.start_time BETWEEN '#{@start_time}' AND '#{@end_time}'
        GROUP BY 
          year, date
        ORDER BY 
          year, date ASC;
      SQL
      results = ActiveRecord::Base.connection.execute(sql).to_a
      filled_in_results(results)
    end

    def filled_in_results(results)
      raise ArgumentError, "#{self.class.to_s} must define `filled_in_results_increment` (ie: `1.day`, `1.week`, `1.month`)" if !self.class.filled_in_results_increment.present?
      current_date = @start_time.to_date
      formatted_results = []
      while current_date <= @end_time.to_date
        result = results.find { |result| result['date'].to_date == current_date }
        formatted_results << { 
          date: defined?(self.class.date_formatter) ? self.class.date_formatter.call(current_date) : current_date, 
          value: (result || {})['value'] || 0 
        }
        current_date += self.class.filled_in_results_increment
      end
      formatted_results
    end
  end
end