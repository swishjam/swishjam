class OrganizationProfileSerializer < ActiveModel::Serializer
  attributes :id, :name, :initials, :organization_unique_identifier, :created_at, :analytics_user_profiles, :current_mrr, :current_subscription_name

  def initials
    object.initials
  end

  def current_mrr
  end

  def current_subscription_name
  end
end