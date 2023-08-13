module Analytics
  class OrganizationSerializer < ActiveModel::Serializer
    attributes :id, :name, :created_at
  end
end