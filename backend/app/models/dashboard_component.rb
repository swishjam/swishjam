class DashboardComponent < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_and_belongs_to_many :dashboards, join_table: :dashboards_dashboard_components

  attribute :configuration, :jsonb, default: {}

  validate :has_valid_configuration

  private

  def has_valid_configuration
    errors.add(:configuration, "configuration must have an `x` attribute.") if configuration['x'].blank?
    errors.add(:configuration, "configuration must have an `y` attribute.") if configuration['y'].blank?
    errors.add(:configuration, "configuration must have an `w` attribute.") if configuration['w'].blank?
    errors.add(:configuration, "configuration must have an `h` attribute.") if configuration['h'].blank?
  end
end