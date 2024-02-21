class UpdateUserSegmentProfileTagsJob
  include Sidekiq::Worker
  queue_as :default

  def perform(user_segment_id = nil, emit_events = true)
    if user_segment_id.present?
      user_segment = UserSegment.find(user_segment_id)
      ProfileTags::UserSegmentApplier.new(user_segment, emit_events: emit_events).update_user_segment_profile_tags!
    else
      UserSegment.all.each{ |user_segment| ProfileTags::UserSegmentApplier.new(user_segment, emit_events: emit_events).update_user_segment_profile_tags! }
    end
  end
end