class UpdateUserSegmentProfileTagsJob
  include Sidekiq::Worker
  queue_as :default

  def perform(user_segment_id = nil)
    if user_segment_id.present?
      user_segment = UserSegment.find(user_segment_id)
      sync_user_segment(user_segment)
    else
      UserSegment.all.each{ |user_segment| sync_user_segment(user_segment) }
    end
  end

  private

  def sync_user_segment(user_segment)
    sync = DataSync.create!(workspace: user_segment.workspace, provider: "user_segment_profile_tags", started_at: Time.current)
    ProfileTags::UserSegmentApplier.new(user_segment).update_user_segment_profile_tags!
    sync.completed!
  end
end