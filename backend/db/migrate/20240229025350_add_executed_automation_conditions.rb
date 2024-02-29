class AddExecutedAutomationConditions < ActiveRecord::Migration[6.1]
  def change
    create_table :satisfied_next_automation_step_conditions, id: :uuid do |t|
      t.references :executed_automation_step, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_satisfied_next_automation_step_conditions_on_eas_id' }
      t.references :next_automation_step_condition, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_satisfied_next_automation_step_conditions_on_nasc_id' }
      t.timestamps
    end

    add_column :executed_automations, :is_test_execution, :boolean, default: false, null: false
  end
end
