class OrganizationProfileSerializer < ActiveModel::Serializer
  attributes :id, :name, :initials, :organization_unique_identifier, :created_at, :analytics_user_profiles, :current_mrr, :current_subscription_name

  def initials
    object.initials
  end

  def analytics_user_profiles
    object.analytics_user_profiles.map do |user|
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        initials: user.initials,
        gravatar_url: user.gravatar_url,
      }
    end
  end

  def current_mrr
  end

  def current_subscription_name
  end
end