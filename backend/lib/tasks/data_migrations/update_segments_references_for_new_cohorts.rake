namespace :data_migrations do
  task update_segments_references_for_new_cohorts: :environment do
    Cohort.where(type: nil).update_all(type: 'Cohorts::UserCohort')
    QueryFilterGroup.where(filterable_type: 'UserSegment').update_all(filterable_type: 'Cohort')
    DataSync.where(synced_object_type: 'UserSegment').update_all(synced_object_type: 'Cohort')
  end
end