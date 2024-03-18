class CreateAutomationLogs < ActiveRecord::Migration[6.1]
  def change
    create_table :logs, id: :uuid do |t|
      t.references :parent, polymorphic: true, type: :uuid
      t.string :level
      t.text :message
      t.jsonb :metadata, default: {}
      t.timestamp :timestamp
    end

    add_column :executed_automation_steps, :response_data, :jsonb, default: {}
  end
end
