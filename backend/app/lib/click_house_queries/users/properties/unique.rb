module ClickHouseQueries
  module Users
    module Properties
      class Unique
        def initialize(workspace_id, limit: 100)
          @workspace_id = workspace_id
          @limit = limit
        end

        def get
          byebug
          Analytics::ClickHouseRecord.execute_sql(sql.squish!).collect{ |u| u['property_name'] }
        end

        private

        def sql
          <<~SQL
            SELECT DISTINCT property_name
            FROM (#{ClickHouseQueries::Common::DeDupedUserProfilesQuery.sql(workspace_id: @workspace_id, columns: ['metadata'])})
            ARRAY JOIN JSONExtractKeys(metadata) AS property_name
            WHERE isValidJSON(metadata) = 1
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end