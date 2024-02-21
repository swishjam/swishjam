module ClickHouseQueries
  module Common
    class DeDupedUserProfilesQuery
      def self.sql(workspace_id:, where: [], columns: ['email', 'metadata'])
        where = where.is_a?(Array) ? where : [where]
        columns.reject! { |column| column == 'swishjam_user_id' }
        columns << 'merged_into_swishjam_user_id' if !columns.include?('merged_into_swishjam_user_id')
        <<~SQL
          SELECT
            swishjam_user_id,
            #{columns.map { |column| "argMax(#{column}, updated_at) AS #{column}" }.join(', ')}
          FROM swishjam_user_profiles
          WHERE
            workspace_id = '#{workspace_id}'
            #{where.empty? ? '' : 'AND '}
            #{where.join(' AND ')}
          GROUP BY swishjam_user_id
        SQL
      end
    end
  end
end