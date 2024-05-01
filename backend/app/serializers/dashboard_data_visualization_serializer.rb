class DashboardDataVisualizationSerializer < ActiveModel::Serializer
  attributes :id, :i, :dashboard_id, :data_visualization_id, :position_config

  def i
    object.id
  end

  belongs_to :dashboard
  belongs_to :data_visualization
end