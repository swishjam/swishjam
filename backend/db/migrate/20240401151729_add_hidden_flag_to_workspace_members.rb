class AddHiddenFlagToWorkspaceMembers < ActiveRecord::Migration[6.1]
  def change
    add_column :workspace_members, :is_hidden, :boolean, default: false
  end
end
