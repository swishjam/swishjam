module ClickHouseQueries
  module Users
    class Search
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, query:, limit: 10, columns: ['swishjam_user_id', 'email', 'created_at'])
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @query = query.downcase
        @limit = limit
        @columns = columns
      end

      def get
        Analytics::ClickHouseRecord.execute_sql(sql.squish!)
      end

      def sql
        <<~SQL
          SELECT #{@columns.map{ |column| "argMax(#{column}, updated_at) AS #{column}" }.join(', ')}
          FROM swishjam_user_profiles as user_profiles
          WHERE 
            workspace_id = '#{@workspace_id}' AND
            (LOWER(user_profiles.email) LIKE '%#{@query}%' OR LOWER(user_profiles.full_name) LIKE '%#{@query}%')
          GROUP BY user_profiles.workspace_id, user_profiles.swishjam_user_id
          ORDER BY created_at DESC
          LIMIT #{@limit}
        SQL
      end
    end
  end
end