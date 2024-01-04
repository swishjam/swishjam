class AddDoNotEnrichTables < ActiveRecord::Migration[6.1]
  def change
    create_table :do_not_enrich_user_profile_rules, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, index: true
      t.string :email_domain, null: false
      t.timestamps
    end

    add_column :workspace_settings, :enrichment_provider, :string
    add_column :workspace_settings, :should_enrich_organization_profile_data, :boolean, default: false
  end
end
