class DashboardComponentSerializer < ActiveModel::Serializer
  attributes :id, :i, :configuration, :created_by_user, :created_at, :updated_at

  # needed for react-grid-layout
  def i
    object.id
  end

  def created_by_user
    {
      id: object.created_by_user.id,
      first_name: object.created_by_user.first_name,
      last_name: object.created_by_user.last_name,
      email: object.created_by_user.email
    }
  end
end