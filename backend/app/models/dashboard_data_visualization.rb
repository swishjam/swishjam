class DashboardDataVisualization < Transactional
  belongs_to :dashboard
  belongs_to :data_visualization

  attribute :position_config, :jsonb, default: {}

  validate :has_valid_configuration

  private

  def has_valid_configuration
    errors.add(:position_config, "must have an `x` attribute.") if position_config['x'].blank?
    errors.add(:position_config, "must have an `y` attribute.") if position_config['y'].blank?
    errors.add(:position_config, "must have a `w` attribute.") if position_config['w'].blank?
    errors.add(:position_config, "must have an `h` attribute.") if position_config['h'].blank?
  end
end