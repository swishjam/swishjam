module Automations
  class Creator
    def self.create_automation!(workspace:, name:, automation_steps:, next_automation_step_conditions:, created_by_user:, enabled: true)
      client_id_to_step_id_map = {}
      automation = workspace.automations.create!(
        name: name,
        entry_point_event_name: "stubbed!",
        enabled: enabled,
        created_by_user: created_by_user,
      )
      automation_steps = automation_steps.map do |step_params|
        step = automation.automation_steps.create!(
          automation: automation,
          type: step_params[:type],
          config: step_params[:config],
          sequence_index: 0,
        )
        client_id_to_step_id_map[step_params[:client_id]] = step.id
        step
      end
      next_automation_step_conditions = next_automation_step_conditions.map do |condition_params|
        step_id = client_id_to_step_id_map[condition_params[:automation_step_client_id]]
        next_automation_step_id = client_id_to_step_id_map[condition_params[:next_automation_step_client_id]]
        NextAutomationStepCondition.create!(
          automation_step_id: step_id, 
          next_automation_step_id: next_automation_step_id,
          next_automation_step_condition_rules_attributes: (condition_params[:next_automation_step_condition_rules] || []).map do |rule_params|
            {
              type: rule_params[:type],
              config: rule_params[:config],
            }
          end,
        )
      end
      automation
    end
  end
end