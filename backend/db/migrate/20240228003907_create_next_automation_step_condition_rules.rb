class CreateNextAutomationStepConditionRules < ActiveRecord::Migration[6.1]
  def change
    create_table :next_automation_step_condition_rules, id: :uuid do |t|
      t.references :next_automation_step_condition, null: false, foreign_key: true, type: :uuid, index: { name: 'idx_nasc_rules_on_next_automation_step_condition_id '}
      t.string :type
      t.jsonb :config, default: {}
      t.timestamps
    end

    remove_column :next_automation_step_conditions, :config, :jsonb
    remove_column :next_automation_step_conditions, :type, :string
  end
end
