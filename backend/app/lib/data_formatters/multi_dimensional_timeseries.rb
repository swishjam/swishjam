module DataFormatters
  class MultiDimensionalTimeseries
    attr_reader :data, :start_time, :end_time, :group_by
    
    def initialize(data, start_time:, end_time:, group_by:, value_methods:, date_method: :occurred_at, use_previous_value_for_missing_data: false)
      @data = data
      @start_time = start_time
      @end_time = end_time
      @group_by = group_by
      @value_methods = value_methods
      @date_method = date_method
      @use_previous_value_for_missing_data = use_previous_value_for_missing_data
    end

    def raw_data
      data
    end

    def filled_in_data
      return @filled_in_data if @filled_in_data.present?
      current_time = start_time
      @filled_in_data = []
      most_recent_values = nil
      while current_time <= end_time
        matching_result = data.find{ |result| evaluate_on_record(result, @date_method)&.to_datetime == current_time.to_datetime }
        if matching_result.present?
          d = { date: current_time }.merge(evaluate_on_record(matching_result, @value_methods))
          @value_methods.each do |value_method|
            next if d[value_method].present?
            if @use_previous_value_for_missing_data && most_recent_values.present?
              d[value_method] = most_recent_values[value_method] || 0
            else
              d[value_method] = 0
            end
          end
          @filled_in_data << d
          most_recent_values = evaluate_on_record(matching_result, @value_methods)
        elsif @use_previous_value_for_missing_data
          d = { date: current_time }
          if most_recent_values.present?
            d.merge!(most_recent_values)
          else
            @value_methods.each do |value_method|
              d[value_method] = 0
            end
          end
          @filled_in_data << d
        else
          d = { date: current_time }
          @value_methods.each do |value_method|
            d[value_method] = 0
          end
          @filled_in_data << d
        end
        current_time += 1.send(group_by)
      end
      @filled_in_data
    end
    alias formatted_data filled_in_data

    private

    def evaluate_on_record(record, methods_or_keys)
      if methods_or_keys.is_a?(Array)
        Hash.new.tap do |hash|
          methods_or_keys.each do |method_or_key|
            hash[method_or_key] = record.is_a?(Hash) ? record.with_indifferent_access[method_or_key] : record.send(method_or_key)
          end
        end
      else
        record.is_a?(Hash) ? record.with_indifferent_access[methods_or_keys] : record.send(methods_or_keys)
      end
    end
  end
end