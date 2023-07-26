require_relative 'base'

module Loaders
  class Log < Base
    def self.load!(destination_credentials:, table_name:, record:)
      puts "Loading record #{record['id']} into #{table_name}...."
      puts record
    end
  end
end