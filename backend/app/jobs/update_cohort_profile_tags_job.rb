class UpdateCohortProfileTagsJob
  include Sidekiq::Worker
  queue_as :default

  def perform(cohort_id = nil, emit_events = true)
    if cohort_id.present?
      cohort = Cohort.find(cohort_id)
      ProfileTags::CohortApplier.new(cohort, emit_events: emit_events).update_cohort_profile_tags!
    else
      Cohort.all.each do|cohort| 
        ProfileTags::CohortApplier.new(cohort, emit_events: emit_events).update_cohort_profile_tags!
      rescue => e
        Sentry.capture_exception(e)
      end
    end
  end
end