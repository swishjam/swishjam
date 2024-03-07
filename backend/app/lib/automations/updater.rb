module Automations
  class Updater
    def self.update_automation!(automation, name:, automation_steps:, next_automation_step_conditions:, enabled: true)
      client_id_to_step_id_map = {}

      automation.name = name
      automation.enabled = enabled
      automation.save! if automation.changed?

      pre_existing_automation_steps = automation.automation_steps

      new_or_updated_automation_steps = automation_steps.map do |step_params|
        if step_params[:is_new]
          step = automation.automation_steps.create!(
            type: step_params[:type],
            config: step_params[:config],
            sequence_index: 0,
          )
          client_id_to_step_id_map[step_params[:client_id]] = step.id
          step
        else
          step = automation.automation_steps.find(step_params[:id])
          step.update!(
            type: step_params[:type],
            config: step_params[:config],
          )
          client_id_to_step_id_map[step_params[:client_id]] = step.id
          step
        end
      end

      pre_existing_automation_steps.each do |pre_existing_automation_step|
        unless new_or_updated_automation_steps.any? { |step| step.id == pre_existing_automation_step.id }
          pre_existing_automation_step.destroy!
        end
      end

      pre_existing_next_automation_step_conditions = automation.next_automation_step_conditions

      new_or_updated_next_automation_step_conditions = next_automation_step_conditions.map do |condition_params|
        step_id = client_id_to_step_id_map[condition_params[:automation_step_client_id]]
        next_automation_step_id = client_id_to_step_id_map[condition_params[:next_automation_step_client_id]]
        if condition_params[:is_new]
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
        else
          condition = automation.next_automation_step_conditions.find(condition_params[:id])
          condition.update!(
            automation_step_id: step_id,
            next_automation_step_id: next_automation_step_id,
          )
          condition.next_automation_step_condition_rules.each do |rule|
            rule.destroy!
          end
          (condition_params[:next_automation_step_condition_rules] || []).map do |rule_params|
            condition.next_automation_step_condition_rules.create!(type: rule_params[:type], config: rule_params[:config])
          end
          condition
        end
      end

      pre_existing_next_automation_step_conditions.each do |pre_existing_next_automation_step_condition|
        unless new_or_updated_next_automation_step_conditions.any? { |condition| condition.id == pre_existing_next_automation_step_condition.id }
          pre_existing_next_automation_step_condition.destroy!
        end
      end

      automation.reload
    end
  end
end