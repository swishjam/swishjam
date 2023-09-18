class DashboardComponent < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_and_belongs_to_many :dashboards, join_table: :dashboards_dashboard_components

  attribute :configuration, :jsonb, default: {}
end