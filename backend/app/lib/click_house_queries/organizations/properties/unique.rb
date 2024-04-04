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
            FROM (#{ClickHouseQueries::Common::DeDupedOrganizationProfilesQuery.sql(workspace_id: @workspace_id, columns: ['metadata'])}) AS organization_profiles
            ARRAY JOIN JSONExtractKeys(organization_profiles.metadata) AS property_name
            LIMIT #{@limit}
          SQL
        end
      end
    end
  end
end