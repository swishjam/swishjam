module DataMigrators
  class MigrateOldOrganizationProfilesIntoNewTable
    def self.run!
      execute <<~SQL
        INSERT INTO swishjam_organization_profiles (
          workspace_id,
          swishjam_organization_id,
          organization_unique_identifier,
          name,
          domain,
          metadata,
          last_updated_from_transactional_db_at,
          created_at,
          updated_at
        ) 
        SELECT
          workspace_id,
          swishjam_organization_id,
          organization_unique_identifier,
          name,
          NULL AS domain,
          metadata,
          last_updated_from_transactional_db_at,
          created_at,
          updated_at
        FROM old_swishjam_organization_profiles
      SQL
      puts "Migrating old organization profiles into new orgazniations table...".colorize(:yellow)
      Analytics::ClickHouseRecord.execute_sql(sql, format: nil)
      puts "Success!".colorize(:green)
    end
  end
end