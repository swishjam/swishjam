class DataVisualizationSerializer < ActiveModel::Serializer
  attributes :id, :title, :subtitle, :config, :visualization_type, :created_by_user, :num_dashboards, :created_at, :updated_at

  # this gets overridden to '{}' somewhere if we don't define it here
  def config
    object.config
  end

  def num_dashboards
    object.dashboards.count
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