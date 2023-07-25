module Transformers
  class Base
    def self.map_record_to_destination_format!(record, data_source)
      raise "Subclass (#{self.class.to_s}) must implement #map_record_to_destination_format! method."
    end
  end
end