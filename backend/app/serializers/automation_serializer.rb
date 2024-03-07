class AutomationSerializer < ActiveModel::Serializer
  attributes :id, :name, :enabled, :created_at, :updated_at

  has_many :automation_steps, serializer: AutomationStepSerializer
end