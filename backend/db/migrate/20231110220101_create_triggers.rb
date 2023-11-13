class CreateTriggers < ActiveRecord::Migration[6.1]
  def change
    create_table :event_triggers, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.boolean :enabled
      t.string :title
      t.string :event_name
      t.timestamps
    end

    create_table :event_trigger_steps, id: :uuid do |t|
      t.references :event_trigger, type: :uuid
      t.string :type
      t.jsonb :config
    end

    create_table :triggered_event_triggers, id: :uuid do |t|
      t.references :event_trigger, type: :uuid
      t.references :workspace, type: :uuid
      t.jsonb :event_json
      t.float :seconds_from_occurred_at_to_triggered
      t.timestamps
    end

    create_table :slack_connections, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.string :access_token
      t.timestamps
    end
  end
end
