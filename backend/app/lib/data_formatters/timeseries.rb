module DataFormatters
  class Timeseries
    attr_reader :data, :start_time, :end_time, :group_by
    
    def initialize(data, start_time:, end_time:, group_by:, value_method: :count, date_method: :occurred_at, use_previous_value_for_missing_data: false, fill_in_missing_values: true)
      @data = data
      @start_time = start_time
      @end_time = end_time
      @group_by = group_by
      @value_method = value_method
      @date_method = date_method
      @use_previous_value_for_missing_data = use_previous_value_for_missing_data
      @fill_in_missing_values = fill_in_missing_values
    end

    def raw_data
      data
    end

    def filled_in_data
      return @filled_in_data if @filled_in_data.present?
      current_time = start_time
      @filled_in_data = []
      most_recent_value = nil
      while current_time <= end_time
        matching_result = data.find{ |result| evaluate_on_record(result, @date_method)&.to_datetime == current_time.to_datetime }
        if matching_result.present? && evaluate_on_record(matching_result, @value_method).present?
          @filled_in_data << { date: current_time, value: evaluate_on_record(matching_result, @value_method) }
          most_recent_value = evaluate_on_record(matching_result, @value_method)
        elsif @use_previous_value_for_missing_data
          @filled_in_data << { date: current_time, value: most_recent_value || 0 }
        elsif @fill_in_missing_values
          @filled_in_data << { date: current_time, value: 0 }
        end
        current_time += 1.send(group_by)
      end
      @filled_in_data
    end
    alias formatted_data filled_in_data

    def current_value
      @current_value ||= (filled_in_data.last || {})[:value]
    end
    alias most_recent_value current_value

    def summed_value
      @summed_value ||= filled_in_data.collect{ |h| h[:value] }.sum
    end

    private

    def evaluate_on_record(record, method_or_key)
      record.is_a?(Hash) ? record.with_indifferent_access[method_or_key] : record.send(method_or_key)
    end
  end
end