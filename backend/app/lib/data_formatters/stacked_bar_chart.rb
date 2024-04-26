module DataFormatters
  class StackedBarChart
    class InvalidFormat < StandardError; end;
    attr_reader :start_time, :end_time, :group_by
    
    def initialize(data, start_time:, end_time:, group_by:, key_method:, value_method: :count, date_method: :occurred_at)
      @data = data
      @start_time = start_time
      @end_time = end_time
      @group_by = group_by
      @key_method = key_method
      @value_method = value_method
      @date_method = date_method
    end

    def raw_data
      @data
    end

    def filled_in_data
      return @filled_in_data if @filled_in_data.present?
      current_time = start_time
      @filled_in_data = []
      while current_time <= end_time
        results_for_date = raw_data.find_all{ |result| result.send(@date_method).to_datetime == current_time.to_datetime }

        hash_for_date = Hash.new.tap do |hash|
          hash[:date] = current_time
          results_for_date.each do |result|
            hash[result.send(@key_method)] = result.send(@value_method)
            # hash[@key_method] = result.send(@value_method)
          end
        end

        @filled_in_data << hash_for_date
        current_time += 1.send(group_by)
      end
      @filled_in_data
    end
    alias formatted_data filled_in_data
  end
end