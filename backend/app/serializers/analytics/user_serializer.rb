module Analytics
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :email, :initials, :full_name, :first_name, :last_name, :metadata, :created_at, :analytics_organization_profiles
  end
end