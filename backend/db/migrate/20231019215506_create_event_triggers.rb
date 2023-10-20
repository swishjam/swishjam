class CreateEventTriggers < ActiveRecord::Migration[6.1]
  def up
    create_table :event_trigger_definitions, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.references :created_by_user, type: :uuid
      t.references :event_trigger_step_definition_entry_point, type: :uuid, index: { name: :index_etd_on_etsd_entry_point_id }
      t.string :event_name
      t.jsonb :config
      t.timestamps
    end

    create_table :event_trigger_step_definitions, id: :uuid do |t|
      t.references :event_trigger_definition, type: :uuid, index: { name: :index_etsd_on_etd_id }
      t.references :previous_event_trigger_step_definition, type: :uuid, index: { name: :index_petsd_on_etsd_id }
      t.references :next_event_trigger_step_definition, type: :uuid, index: { name: :index_netsd_on_etsd_id }
      t.string :type
      t.string :name
      t.string :description
      t.jsonb :config
      t.timestamps
    end

    create_table :event_trigger_executions do |t|
      t.references :workspace, type: :uuid
      t.references :event_trigger_definition, type: :uuid
      t.string :error_message
      t.jsonb :event_payload
      t.timestamp :began_at
      t.timestamp :completed_at
    end

    create_table :event_trigger_step_executions do |t|
      t.references :workspace, type: :uuid
      t.references :event_trigger_step_definition, type: :uuid, index: { name: :index_etsd_on_etse_id }
      t.references :event_trigger_execution, type: :uuid, index: { name: :index_ete_on_etse_id }
      t.references :previous_event_trigger_step_execution, type: :uuid, index: { name: :index_petse_on_etse_id }
      t.jsonb :response_payload
      t.string :error_message
      t.timestamp :began_at
      t.timestamp :completed_at
    end
  end

  def down
    drop_table :event_trigger_definitions
    drop_table :event_trigger_step_definitions
    drop_table :event_trigger_executions
    drop_table :event_trigger_step_executions
  end
end
