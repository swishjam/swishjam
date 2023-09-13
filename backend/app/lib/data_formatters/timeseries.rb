module DataFormatters
  class Timeseries
    attr_reader :data, :start_time, :end_time, :group_by
    
    def initialize(data, start_time:, end_time:, group_by:, value_method: :count, date_method: :occurred_at)
      @data = data
      @start_time = start_time
      @end_time = end_time
      @group_by = group_by
      @value_method = value_method
      @date_method = date_method
    end

    def raw_data
      data
    end

    def filled_in_data
      return @filled_in_data if @filled_in_data.present?
      current_time = start_time
      @filled_in_data = []
      while current_time <= end_time
        matching_result = data.find{ |result| result.send(@date_method).to_datetime == current_time.to_datetime }
        @filled_in_data <<  { date: current_time, value: matching_result&.send(@value_method) || 0 }
        current_time += 1.send(group_by)
      end
      @filled_in_data
    end
    alias formatted_data filled_in_data

    def current_value
      @current_value ||= filled_in_data.last[:value]
    end

    def summed_value
      @summed_value ||= filled_in_data.collect{ |h| h[:value] }.sum
    end
  end
end