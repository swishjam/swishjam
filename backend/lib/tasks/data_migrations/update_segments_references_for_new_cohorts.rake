namespace :data_migrations do
  task update_segments_references_for_new_cohorts: :environment do
    ActiveRecord::Base.logger.silence do
      puts "\n"
      cohort_count = Cohort.where(type: nil).update_all(type: 'Cohorts::UserCohort')
      puts "Updated #{cohort_count} Cohorts to Cohorts::UserCohort".colorize(:green)

      filter_groups = QueryFilterGroup.where(filterable_type: 'UserSegment').update_all(filterable_type: 'Cohort')
      puts "Updated #{filter_groups} QueryFilterGroups to Cohort".colorize(:green)

      data_syncs = DataSync.where(synced_object_type: 'UserSegment').update_all(synced_object_type: 'Cohort')
      puts "Updated #{data_syncs} DataSyncs to Cohort".colorize(:green)

      event_count_query_filters = QueryFilter.where(type: 'QueryFilters::EventCountForUserOverTimePeriod').map do |query_filter|
        puts ".".colorize(:yellow)
        query_filter.config['profile_type'] = 'user'
        query_filter.type = QueryFilters::EventCountForProfileOverTimePeriod.to_s
        query_filter.save!
      end
      puts "Updated #{event_count_query_filters.count} QueryFilters::EventCountForUserOverTimePeriod to QueryFilters::EventCountForProfileOverTimePeriod".colorize(:green)

      profile_property_query_filters = QueryFilter.where(type: 'QueryFilters::UserProperty').map do |query_filter|
        puts ".".colorize(:yellow)
        query_filter.config['profile_type'] = 'user'
        query_filter.type = QueryFilters::EventCountForProfileOverTimePeriod.to_s
        query_filter.save!
      end
      puts "Updated #{profile_property_query_filters.count} QueryFilters::UserProperty to QueryFilters::ProfileProperty".colorize(:green)


      puts "\n"
    end
  end
end