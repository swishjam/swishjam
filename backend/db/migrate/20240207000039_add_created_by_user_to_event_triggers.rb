class AddCreatedByUserToEventTriggers < ActiveRecord::Migration[6.1]
  def change
    add_reference :event_triggers, :created_by_user, type: :uuid
  end
end
