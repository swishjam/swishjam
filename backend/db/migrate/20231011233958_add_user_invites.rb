class AddUserInvites < ActiveRecord::Migration[6.1]
  def change
    create_table :workspace_invitations, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :invited_by_user, type: :uuid, null: false
      t.string :invite_token
      t.string :invited_email
      t.datetime :accepted_at
      t.datetime :expires_at
    end
  end
end
