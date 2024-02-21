class ProfileTag < Transactional
  belongs_to :workspace
  belongs_to :profile, polymorphic: true
  belongs_to :applied_by_user, class_name: User.to_s, optional: true
  belongs_to :user_segment, optional: true

  validates :name, presence: true
  validate :only_one_active_tag_per_profile

  scope :applied_by_user_segment, -> { where.not(user_segment_id: nil) }
  scope :applied_by_swishjam_bot, -> { where(applied_by_user_id: nil) }
  scope :still_applied, -> { where(removed_at: nil) }
  scope :active, -> { still_applied }
  scope :removed, -> { where.not(removed_at: nil) }

  def remove!
    touch(:removed_at)
  end

  def removed?
    removed_at.present?
  end

  def active?
    !removed?
  end
  alias applied? active?
  alias still_applied? active?

  private

  def only_one_active_tag_per_profile
    if profile.profile_tags.active.where(name: name).where.not(id: id).any?
      errors.add(:base, "#{profile.class} #{profile_id} already has a #{name} tag applied to it.")
    end
  end
end