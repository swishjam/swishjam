module Analytics
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :email, :full_name, :first_name, :last_name, :created_at, :organizations
  end
end