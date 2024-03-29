class CreateCohortsTables < ActiveRecord::Migration[6.1]
  def change
    create_table :retention_cohorts, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.string :time_granularity, index: true
      t.date :time_period, index: true
      t.integer :num_users_in_cohort
      t.timestamps
    end

    create_table :retention_cohort_activity_periods, id: :uuid do |t|
      t.references :workspace, type: :uuid, null: false, foreign_key: true
      t.references :retention_cohort, type: :uuid, null: false, foreign_key: true
      t.integer :num_active_users
      t.integer :num_periods_after_cohort
      t.date :time_period, index: true
      t.timestamps
    end
  end
end
