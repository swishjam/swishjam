class UpdatedOrganizationMembersTable < ActiveRecord::Migration[6.1]
  def up
    execute('RENAME TABLE swishjam_organization_members TO old_swishjam_organization_members')
    execute <<~SQL
      CREATE TABLE swishjam_organization_members (
        `workspace_id` LowCardinality(String),
        `swishjam_organization_id` String,
        `swishjam_user_id` String,
        `created_at` DateTime
      ) 
      ENGINE = MergeTree()
      PRIMARY KEY (workspace_id, swishjam_organization_id)
    SQL
    execute <<~SQL
      INSERT INTO swishjam_organization_members (workspace_id, swishjam_organization_id, swishjam_user_id, created_at)
      SELECT workspace_id, swishjam_organization_id, swishjam_user_id, created_at
      FROM old_swishjam_organization_members
    SQL
  end

  def down
    execute('DROP TABLE swishjam_organization_members')
    execute('RENAME TABLE old_swishjam_organization_members TO swishjam_organization_members')
  end
end
