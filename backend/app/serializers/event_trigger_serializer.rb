class EventTriggerSerializer < ActiveModel::Serializer
  attributes :id, :event_name, :enabled, :created_at, :updated_at, :steps, :trigger_count_last_7_days

  def steps
    object.event_trigger_steps.map do |step|
      {
        id: step.id,
        type: step.type,
        config: step.config,
      }
    end
  end

  def trigger_count_last_7_days
    object.triggered_event_triggers.where('created_at > ?', 7.days.ago).count
  end
end