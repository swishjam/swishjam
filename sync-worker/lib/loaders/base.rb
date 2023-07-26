module Loaders
  class Base
    def self.load!(destination_credentials:, table_name:, record:)
      raise "Subclass (#{self.class.to_s}) must implement #load! method."
    end
  end
end