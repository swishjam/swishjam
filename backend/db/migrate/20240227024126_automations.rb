class Automations < ActiveRecord::Migration[6.1]
  def change
    create_table :automations, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :created_by_user, type: :uuid, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.text :description
      t.string :entry_point_event_name, null: false
      t.boolean :enabled
      t.timestamps
    end

    create_table :executed_automations, id: :uuid do |t|
      t.references :automation, type: :uuid, null: false, foreign_key: true
      t.references :retried_from_executed_automation, type: :uuid, foreign_key: { to_table: :executed_automations }, index: { name: 'idx_executed_automations_on_retried_from_executed_automation_id' }
      t.jsonb :event_json, null: false, default: {}
      t.string :event_uuid, null: false, index: { unique: true }
      t.float :seconds_from_occurred_at_to_executed
      t.datetime :started_at
      t.datetime :completed_at
    end

    create_table :automation_steps, id: :uuid do |t|
      t.references :automation, type: :uuid, null: false, foreign_key: true
      t.string :type, null: false
      t.integer :sequence_index, null: false
      t.jsonb :config, null: false, default: {}
      t.timestamps
    end

    create_table :executed_automation_steps, id: :uuid do |t|
      t.references :executed_automation, type: :uuid, null: false, foreign_key: true
      t.references :automation_step, type: :uuid, null: false, foreign_key: true
      t.jsonb :config, null: false, default: {}
      t.string :error_message
      t.datetime :started_at
      t.datetime :completed_at
    end

    create_table :next_automation_step_conditions, id: :uuid do |t|
      t.references :automation_step, type: :uuid, null: false, foreign_key: true
      t.references :next_automation_step, type: :uuid, null: false, foreign_key: { to_table: :automation_steps }, index: { name: 'idx_next_automation_step_conditions_on_next_automation_step_id' }
      t.string :type, null: false
      t.jsonb :config, null: false, default: {}
      t.timestamps
    end
  end
end
