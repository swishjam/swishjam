class AddOrganizationPropertiesToEvents < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL
      ALTER TABLE events ADD COLUMN organization_properties String
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE events DROP COLUMN organization_properties
    SQL
  end
end
