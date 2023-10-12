class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :email, :initials, :full_name, :first_name, :last_name, :metadata, :created_at, :organizations, :enrichment_data

  def organizations
    object.analytics_organization_profiles
  end
end