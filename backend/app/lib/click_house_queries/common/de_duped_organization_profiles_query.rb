module ClickHouseQueries
  module Common
    class DeDupedOrganizationProfilesQuery
      def self.sql(workspace_id:, where: [], columns: ['name', 'metadata'])
        where = where.is_a?(Array) ? where : [where]
        columns = columns.reject{ |column| column == 'swishjam_organization_id' }
        <<~SQL
          SELECT
            swishjam_organization_id,
            #{columns.map { |column| "argMax(swishjam_organization_profiles.#{column}, swishjam_organization_profiles.last_updated_from_transactional_db_at) AS #{column}" }.join(', ')}
          FROM swishjam_organization_profiles
          WHERE
            workspace_id = '#{workspace_id}'
            #{where.empty? ? '' : 'AND '}
            #{where.join(' AND ')}
          GROUP BY swishjam_organization_id
        SQL
      end
    end
  end
end