# DEPRECATED IN FAVOR OF DashboardVisualization
class DashboardDashboardComponent < Transactional
  self.table_name = :dashboards_dashboard_components
  belongs_to :dashboard
  belongs_to :dashboard_component

  attribute :position_config, :jsonb, default: {}

  validate :has_valid_configuration

  private

  def has_valid_configuration
    errors.add(:position_config, "configuration must have an `x` attribute.") if position_config['x'].blank?
    errors.add(:position_config, "configuration must have an `y` attribute.") if position_config['y'].blank?
    errors.add(:position_config, "configuration must have an `w` attribute.") if position_config['w'].blank?
    errors.add(:position_config, "configuration must have an `h` attribute.") if position_config['h'].blank?
  end
end