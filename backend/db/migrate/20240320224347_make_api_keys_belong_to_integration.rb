class MakeApiKeysBelongToIntegration < ActiveRecord::Migration[6.1]
  def change
    add_reference :api_keys, :integration, foreign_key: true, type: :uuid, null: true
  end
end
