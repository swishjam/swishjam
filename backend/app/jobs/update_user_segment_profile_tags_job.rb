class UpdateUserSegmentProfileTagsJob
  include Sidekiq::Worker
  queue_as :default

  def perform
    UserSegment.all.each do |user_segment|
      sync = DataSync.create!(workspace: user_segment.workspace, provider: "user_segment_profile_tags", started_at: Time.current)
      ProfileTags::UserSegmentApplier.new(user_segment).update_user_segment_profile_tags!
      sync.completed!
    end
  end
end