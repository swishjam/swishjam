class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :user_unique_identifier, :email, :initials, :full_name, :first_name, :last_name, :metadata, :created_at, :organizations, :enrichment_data

  def organizations
    object.analytics_organization_profiles
  end

  def enrichment_data
    object.enrichment_data || {}
  end
end