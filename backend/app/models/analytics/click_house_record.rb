module Analytics
  class ClickHouseRecord < ApplicationRecord
    self.abstract_class = true
    connects_to database: { writing: :clickhouse, reading: :clickhouse }

    scope :by_public_key, -> (public_key) { where(swishjam_api_key: public_key) }
    scope :for_public_key, -> (public_key) { by_public_key(public_key) }

    def self.formatted_time(time)
      time.strftime('%Y-%m-%d %H:%M:%S')
    end

    def self.execute_sql(sql)
      result = Analytics::ClickHouseRecord.connected_to(role: :reading) do
        Analytics::ClickHouseRecord.connection.execute(sql)
      end

      result['data'].map do |row|
        row.each_with_index.with_object({}) do |(value, index), hash|
          column_name = result['meta'][index]['name']
          hash[column_name] = value
        end
      end
    end
  end
end