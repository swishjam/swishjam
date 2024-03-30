module ClickHouseQueries
  module Organizations
    module Properties
      class Unique
        def initialize(workspace_id, limit: 100)
          @workspace_id = workspace_id
          @limit = limit
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql.squish!).collect{ |u| u['property_name'] }
        end

        private

        def sql
          <<~SQL
            SELECT DISTINCT property_name
            FROM swishjam_organization_profiles
            ARRAY JOIN JSONExtractKeys(metadata) AS property_name
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end