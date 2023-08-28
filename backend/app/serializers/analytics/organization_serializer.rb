module Analytics
  class OrganizationSerializer < ActiveModel::Serializer
    attributes :id, :name, :created_at, :analytics_user_profiles
  end
end