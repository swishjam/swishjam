class CreateUserOrganizationDeviceIdentifiersTable < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      CREATE TABLE user_organization_device_identifiers (
        `swishjam_api_key` String,
        `organization_device_identifier` String,
        `user_device_identifier` String,
        `created_at` DateTime
      ) ENGINE = ReplacingMergeTree()
      PRIMARY KEY (swishjam_api_key, organization_device_identifier, user_device_identifier)
    SQL
  end

  def down
    execute <<~SQL
      DROP TABLE IF EXISTS user_organization_device_identifiers
    SQL
  end
end
