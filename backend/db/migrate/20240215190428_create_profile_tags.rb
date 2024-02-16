class CreateProfileTags < ActiveRecord::Migration[6.1]
  def change
    create_table :profile_tags, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :profile, polymorphic: true, type: :uuid, null: false
      t.references :applied_by_user, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.references :user_segment, type: :uuid, null: true, foreign_key: true
      t.string :name, null: false, index: true
      t.datetime :applied_at, default: -> { 'now()' }
      t.datetime :removed_at
    end
  end
end
