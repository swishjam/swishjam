class AddIfStatementsToEventTriggers < ActiveRecord::Migration[6.1]
  def up
    add_column :event_triggers, :conditional_statements, :jsonb, default: []
    add_column :triggered_event_triggers, :event_uuid, :string, index: true
  end

  def down
    remove_column :event_triggers, :conditional_statements
    remove_column :triggered_event_triggers, :event_uuid
  end
end
