class ExecutedAutomationListItemSerializer < ActiveModel::Serializer
  attributes :id, :started_at, :completed_at, :event_json, :status, :is_test_execution, :automation_id

  belongs_to :executed_on_user_profile do
    {
      id: object.executed_on_user_profile_id,
      email: object.executed_on_user_profile&.email,
      metadata: object.executed_on_user_profile&.metadata
    }
  end
end