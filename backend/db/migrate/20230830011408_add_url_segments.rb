class AddUrlSegments < ActiveRecord::Migration[6.1]
  def up
    create_table :url_segments, id: :uuid do |t|
      t.references :workspace, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.string :url_host, null: false
      t.timestamps
    end
  end
end
