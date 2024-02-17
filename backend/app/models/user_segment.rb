class UserSegment < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :profile_tags, dependent: :nullify
  has_many :user_segment_filters, dependent: :destroy
  accepts_nested_attributes_for :user_segment_filters, allow_destroy: true

  validates :workspace_id, presence: true
  validate :only_one_active_user_segment, on: :create

  after_create :enqueue_user_segment_sync_job

  ACTIVE_USERS_SEGMENT_NAME = "Active Users".freeze
  
  def self.ACTIVE_USERS_SEGMENT
    where(name: ACTIVE_USERS_SEGMENT_NAME).limit(1).first
  end

  def profile_tag_name
    name.singularize
  end

  private

  def enqueue_user_segment_sync_job
    UpdateUserSegmentProfileTagsJob.perform_async(self.id)
  end

  def only_one_active_user_segment
    if name == self.class::ACTIVE_USERS_SEGMENT_NAME && workspace.user_segments.where(name: self.class::ACTIVE_USERS_SEGMENT_NAME).exists?
      errors.add(:base, "#{self.class::ACTIVE_USERS_SEGMENT_NAME} is a reserved segment name which already exists. Please choose a different name.")
    end
  end
end