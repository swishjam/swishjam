module ClickHouseQueries
  module Common
    class DeDupedUserProfilesQuery
      def self.sql(workspace_id:, where: [], columns: ['email', 'metadata'], table_alias: 'u')
        where = where.is_a?(Array) ? where : [where]
        columns = columns.reject { |column| column == 'swishjam_user_id' }
        columns << 'merged_into_swishjam_user_id' if !columns.include?('merged_into_swishjam_user_id')
        <<~SQL
          SELECT
            #{table_alias}.swishjam_user_id,
            #{columns.map { |column| "argMax(#{table_alias}.#{column}, #{table_alias}.last_updated_from_transactional_db_at) AS #{column}" }.join(', ')}
          FROM swishjam_user_profiles AS #{table_alias}
          WHERE
            #{table_alias}.workspace_id = '#{workspace_id}'
            #{where.empty? ? '' : 'AND '}
            #{where.join(' AND ')}
          GROUP BY #{table_alias}.swishjam_user_id
        SQL
      end
    end
  end
end