class AutomationStepSerializer < ActiveModel::Serializer
  attributes :id, :sequence_index, :type, :config, :created_at, :updated_at

  # for some reason returns an empty Hash without explicitly defining it here
  def config
    object.config
  end

  has_many :next_automation_step_conditions do
    object.next_automation_step_conditions.map do |condition|
      {
        id: condition.id,
        next_automation_step: {
          id: condition.next_automation_step.id,
          sequence_index: condition.next_automation_step.sequence_index,
          type: condition.next_automation_step.type,
          config: condition.next_automation_step.config,
        },
        next_automation_step_condition_rules: condition.next_automation_step_condition_rules.map do |rule|
          {
            id: rule.id,
            type: rule.type,
            config: rule.config,
            description: rule.plain_english_description,
          }
        end
      }
    end
  end
end