class WorkspaceMemberSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :user

  def user
    {
      id: object.user_id,
      email: object.user.email,
      first_name: object.user.first_name,
      last_name: object.user.last_name,
    }
  end
end