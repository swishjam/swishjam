class UrlSegmentsToAnalyticsFamilyConfiguration < ActiveRecord::Migration[6.1]
  def up
    execute('DROP TABLE IF EXISTS url_segments')
    
    create_table :analytics_family_configurations do |t|
      t.references :workspace, null: false, foreign_key: true, type: :uuid
      t.string :type, null: false
      t.string :url_regex, null: false
      t.text :description
      t.integer :priority
      t.timestamps
    end
  end

  def down
    drop_table :analytics_family_configurations
  end
end
