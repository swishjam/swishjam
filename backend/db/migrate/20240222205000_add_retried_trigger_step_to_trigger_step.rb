class AddRetriedTriggerStepToTriggerStep < ActiveRecord::Migration[6.1]
  def change
    add_reference :triggered_event_triggers, :retried_triggered_event_trigger, foreign_key: { to_table: :triggered_event_triggers }, type: :uuid, index: { name: 'idx_triggered_event_triggers_on_retried_triggered_event_trigger'}
  end
end
