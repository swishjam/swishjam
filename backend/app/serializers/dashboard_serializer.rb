class DashboardSerializer < ActiveModel::Serializer
  attributes :id, :name, :created_at, :updated_at, :created_by_user

  def created_by_user
    {
      id: object.created_by_user.id,
      email: object.created_by_user.email,
      full_name: object.created_by_user.full_name,
    }
  end
end