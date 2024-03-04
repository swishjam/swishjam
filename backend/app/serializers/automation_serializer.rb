class AutomationSerializer < ActiveModel::Serializer
  attributes :id, :name, :entry_point_event_name, :enabled, :created_at, :updated_at

  has_many :automation_steps, serializer: AutomationStepSerializer
end