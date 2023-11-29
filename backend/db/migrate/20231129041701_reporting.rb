class Reporting < ActiveRecord::Migration[6.1]
  def change
    create_table :reports, id: :uuid do |t|
      t.references :workspace, type: :uuid
      t.boolean :enabled
      t.string :name
      t.jsonb :config
      t.string :type
      t.timestamps
    end

    create_table :triggered_reports, id: :uuid do |t|
      t.references :report, type: :uuid
      t.references :workspace, type: :uuid
      t.jsonb :payload
      t.timestamps
    end

  end
end
