require_relative 'base'

module Loaders
  class Postgres < Base
    def self.load!(destination_credentials:, table_name:, record:)
      connect(destination_credentials)
      write_record_to_table(table_name, record)
    end

    private

    def self.connect(credentials)

    end

    def self.write_record_to_table(table_name, record)
    end
  end
end