module ClickHouseQueries
  module Users
    class Count
      def initialize(workspace)
        @workspace = workspace
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!).first
      end

      def sql
        <<~SQL
          SELECT 
            CAST(COUNT(DISTINCT swishjam_user_id) AS INT) AS total_count,
            CAST(COUNT(DISTINCT IF(isNotNull(user_unique_identifier), swishjam_user_id, NULL)) AS INT) AS identified_count
          FROM swishjam_user_profiles
          WHERE workspace_id = '#{@workspace.id}'
        SQL
      end
    end
  end
end