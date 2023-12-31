class AddConnectedByToSlackConnection < ActiveRecord::Migration[6.1]
  def change
    add_reference :slack_connections, :connected_by_user, foreign_key: { to_table: :users }, null: true, type: :uuid
  end
end
