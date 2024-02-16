module ClickHouseQueries
  module Common
    class DeDupedUserProfilesFromClause
      def self.from_clause(workspace_id:, where: [], columns_to_return: ['email', 'metadata'])
        where = where.is_a?(Array) ? where : [where]
        columns_to_return.reject! { |column| column == 'swishjam_user_id' }
        columns_to_return << 'merged_into_swishjam_user_id' if !columns_to_return.include?('merged_into_swishjam_user_id')
        <<~SQL
          SELECT
            swishjam_user_id,
            #{columns_to_return.map { |column| "argMax(#{column}, updated_at) AS #{column}" }.join(', ')}
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