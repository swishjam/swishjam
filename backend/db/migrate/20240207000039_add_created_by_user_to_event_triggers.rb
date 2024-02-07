class AddCreatedByUserToEventTriggers < ActiveRecord::Migration[6.1]
  def change
    add_reference :event_triggers, :created_by_user, type: :uuid

    create_table :triggered_event_trigger_steps, id: :uuid do |t|
      t.references :event_trigger_step, type: :uuid, null: false, foreign_key: true
      t.jsonb :triggered_payload
      t.jsonb :triggered_event_json
      t.string :error_message
      t.datetime :started_at, null: false
      t.datetime :completed_at
    end
  end
end
