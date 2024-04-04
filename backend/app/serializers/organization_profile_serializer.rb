class OrganizationProfileSerializer < ActiveModel::Serializer
  attributes :id, :name, :domain, :initials, :metadata, :tags, :organization_unique_identifier, :created_at, :enriched_data, :current_mrr, :current_subscription_name

  def initials
    object.initials
  end

  has_many :analytics_user_profiles do
    object.analytics_user_profiles.map do |user|
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        initials: user.initials,
        user_unique_identifier: user.user_unique_identifier,
        gravatar_url: user.gravatar_url,
      }
    end
  end

  def enriched_data
    return {} if object.enriched_data.nil?
    object.enriched_data.data
  end

  def tags
    # if there are two 'Active User' tags (at least one has to be removed), we only want the most recently applied one
    subquery = object.tags.group(:name).maximum(:applied_at)
    most_recent_tags_by_name = object.tags.where(name: subquery.keys, applied_at: subquery.values)
    most_recent_tags_by_name.map do |tag|
      {
        id: tag.id,
        name: tag.name,
        applied_at: tag.applied_at,
        applied_by_user_email: tag.applied_by_user&.email,
        cohort_id: tag.cohort&.id,
        cohort_name: tag.cohort&.name,
        cohort_description: tag.cohort&.description,
        removed_at: tag.removed_at,
      }
    end
  end

  def current_mrr
  end

  def current_subscription_name
  end
end