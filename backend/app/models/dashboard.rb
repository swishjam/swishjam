class Dashboard < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_and_belongs_to_many :dashboard_components, join_table: :dashboards_dashboard_components
  accepts_nested_attributes_for :dashboard_components
end