class MakeEnrichmentDataFlexible < ActiveRecord::Migration[6.1]
  def change
    create_table :enrichment_attempts, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, index: true
      t.references :enrichable, polymorphic: true, null: false, index: true
      t.references :enriched_data, type: :uuid, null: true, index: true
      t.string :enrichment_service, null: false
      t.jsonb :attempted_payload, default: {}
      t.datetime :attempted_at, default: -> { 'now()' }
      t.boolean :successful, default: false
      t.string :error_message
    end

    create_table :enriched_data, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, index: true
      t.references :enrichable, polymorphic: true, null: false, index: true
      t.jsonb :data, default: {}
    end
  end
end
