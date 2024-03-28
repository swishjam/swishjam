class UserSegment < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s, optional: true
  has_many :data_syncs, as: :synced_object, dependent: :destroy
  has_many :profile_tags, dependent: :destroy
  has_many :query_filter_groups, as: :filterable, dependent: :destroy
  has_many :query_filters, through: :query_filter_groups
  accepts_nested_attributes_for :query_filter_groups, allow_destroy: true

  validates :workspace_id, presence: true
  validate :only_one_active_user_segment, on: :create

  attr_accessor :query_filter_group_attrs_before_update, :query_filter_attrs_before_update
  before_save if: :persisted? do
    self.query_filter_group_attrs_before_update = query_filter_groups.map(&:as_json)
    self.query_filter_attrs_before_update = query_filters.map(&:as_json)
  end

  after_update do
    query_filter_groups_changed = query_filter_groups.reload.map(&:as_json).sort_by(&:to_s) != query_filter_group_attrs_before_update.sort_by(&:to_s)
    query_filters_changed = query_filters.reload.map(&:as_json).sort_by(&:to_s) != query_filter_attrs_before_update.sort_by(&:to_s)
    if query_filter_groups_changed || query_filters_changed
      profile_tags.delete_all
      self.enqueue_user_segment_sync_job
    end
    self.query_filter_group_attrs_before_update = nil
    self.query_filter_attrs_before_update = nil
  end
  after_create :enqueue_user_segment_sync_job

  ACTIVE_USERS_SEGMENT_NAME = "Active Users".freeze
  
  def self.ACTIVE_USERS_SEGMENT
    where("lower(name) = ?", self.class::ACTIVE_USERS_SEGMENT_NAME.downcase).limit(1).first
  end

  def self.create_default_for_workspace(workspace)
    [
      { name: "Identified Users", description: "Users who have been identified within your application.", operator: "is_defined" },
      { name: "Anonymous Users", description: "Users who have not yet been identified within your application.", operator: "is_not_defined" },
    ].map do |segment_attrs|
      UserSegment.create!(
        workspace: workspace,
        name: segment_attrs[:name],
        description: segment_attrs[:description],
        query_filter_groups_attributes: [
          {
            sequence_index: 0,
            query_filters_attributes: [
              {
                type: QueryFilters::UserProperty.to_s,
                sequence_index: 0,
                config: { property_name: "user_unique_identifier", operator: segment_attrs[:operator] }
              }
            ]
          }
        ]
      )
    end
  end

  def most_recent_data_sync
    data_syncs.completed.order(completed_at: :desc).first
  end

  def profile_tag_name
    name.singularize
  end

  private

  def enqueue_user_segment_sync_job
    # (user_segment_id, emit_events)
    UpdateUserSegmentProfileTagsJob.perform_async(self.id, false)
  end

  def only_one_active_user_segment
    if name == self.class::ACTIVE_USERS_SEGMENT_NAME && workspace.user_segments.where("lower(name) = ?", self.class::ACTIVE_USERS_SEGMENT_NAME.downcase).exists?
      errors.add(:base, "#{self.class::ACTIVE_USERS_SEGMENT_NAME} is a reserved segment name which already exists. Please choose a different name.")
    end
  end
end