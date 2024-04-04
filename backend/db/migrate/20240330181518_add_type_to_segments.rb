class AddTypeToSegments < ActiveRecord::Migration[6.1]
  def change
    add_column :user_segments, :type, :string
  end
end
